(function () {

    App.pcTableMain.prototype._connectTreeView = function () {
        let pcTable = this;
        let timeout;

        this._content.on('click', '.treeRow', function () {
            let node = $(this);
            if (node.is('.dbl')) {
                pcTable._actionTreeFolderRow.call(pcTable, node, true)
            } else {
                pcTable._actionTreeFolderRow.call(pcTable, node)
            }
        })

        this.model.loadTreeBranches = function (branchIds, withParents, recurcive) {
            return this.__ajax('post', {
                method: 'loadTreeBranches',
                branchIds: branchIds,
                withParents: withParents,
                recurcive: recurcive
            }, null, null, this.filtersString || {})
        }
    }
    App.pcTableMain.prototype._createTreeFolderRow = function (row, $tr) {
        if (row.row) {
            let tree = {...row};
            delete tree.row;
            row.row.__tree = tree;
            let tr = $tr || this._createRow(row.row);
            return row.tr = tr;
        } else {
            let tr = $tr || $('<tr></tr>');
            let span = $('<span>').css('padding-left', row.level * 10).append('<i class="fa fa-folder' + (row.opened ? '-open' : '') + '"></i>')
                .append($('<button class="btn btn-default btn-xxs treeRow"><i class="fa fa-hand-pointer-o"></i></button>').data('treeRow', row.v));

            span.append($('<button class="btn btn-default btn-xxs treeRow dbl"><i class="fa fa-arrows-v"></i></button>').data('treeRow', row.v));
            let td = $('<td colspan="' + (this.fieldCategories.column.length) + '" class="tree-view-td" style="padding-left: ' + (56 + row.level * 10) + 'px"></td>');
            td.append(span)
            td.append(row.t)
            tr.append(td)
            return row.tr = tr;
        }

    }
    App.pcTableMain.prototype.treeApply = function () {
        if (this.treeReloadRows.length) {
            this.model.loadTreeBranches(this.treeReloadRows, true).then((json) => {
                if (json.tree) {
                    json.tree.forEach((tv, i) => {
                        this.getTreeBranch(tv, i);
                    })
                }

                if (json.rows) {
                    this._treeApplyRows(json.rows);
                }

                this.treeReloadRows = [];
                this._treeRefresh();
                this.__applyFilters(true);
                this.ScrollClasterized.insertToDOM(null, true, true);
            })
        } else {
            this._treeRefresh();
            this.__applyFilters(true);
            this.ScrollClasterized.insertToDOM(null, true, true);
        }
    }

    App.pcTableMain.prototype._closeTreeFolderRow = function (treeRow, treeRowRecurcive, level) {
        treeRow.opened = false;
        level = level || 0
        if (treeRowRecurcive) {
            this.treeIndex[treeRow.v].trees.forEach((row) => {
                this._closeTreeFolderRow(this.treeIndex[row], true, level + 1)
            })
            if (!level) {
                this.treeApply();
            }
        } else {
            this.treeApply();
        }
    }
    App.pcTableMain.prototype._actionTreeFolderRow = function (node, treeRowRecurcive) {
        let treeRow = this.treeIndex[$(node).data('treeRow')];
        if (node) {
            $(node).closest('td').html('Загрузка');
        }
        if (!treeRow.opened) {
            this._expandTreeFolderRow(treeRow, treeRowRecurcive)
        } else {
            this._closeTreeFolderRow(treeRow, treeRowRecurcive)
        }

    }
    App.pcTableMain.prototype._expandTreeFolderRow = function (treeRow, treeRowRecurcive, recursiveCounter) {
        let inPointer = false;
        if (!recursiveCounter) {
            inPointer = true;
            recursiveCounter = {counter: 0};
        }


        const expandRecursive = () => {
            this.treeIndex[treeRow.v].trees.forEach((id) => {
                recursiveCounter.counter++;
                this._expandTreeFolderRow(this.treeIndex[id], true, recursiveCounter)
            })
        }


        if (treeRow.l) {
            treeRow.opened = true;
            if (treeRowRecurcive) {
                expandRecursive();

                if (recursiveCounter.counter < 1)
                    this.treeApply();
                else recursiveCounter.counter--;


            } else {
                this.treeApply();
            }


        } else {
            this.model.loadTreeBranches([treeRow.v], null, !!treeRowRecurcive).then((json) => {
                treeRow.opened = true;
                treeRow.l = true;
                if (json.tree) {
                    json.tree.forEach((tv, i) => {
                        let row = this.getTreeBranch(tv, i);
                    })
                }
                if (json.rows) {
                    this._treeApplyRows(json.rows);
                }
                if (!treeRowRecurcive || (recursiveCounter.counter-- < 1)) {
                    this.treeApply();
                }
            })
        }

    }
    App.pcTableMain.prototype._treeRefresh = function () {
        const expandTree = (treeList, level) => {
            level = level || 0
            treeList.forEach((v) => {
                this.treeIndex[v].level = level;
                if (level === 0 && !('opened' in this.treeIndex[v])) {
                    this.treeIndex[v].opened = true;
                }
                this.dataSorted.push(this.treeIndex[v]);
                if (this.treeIndex[v].opened) {
                    this.dataSorted.push(...this.treeIndex[v].sorted);
                    expandTree(this.treeIndex[v].trees, level + 1)
                }
            })
        }
        this.dataSorted = [];
        expandTree(this.treeSort)
    }
    App.pcTableMain.prototype._treeApplyRows = function (rows) {
        rows.map((item) => {
            if (this.fields.tree.treeViewType === 'self') {
                let tv = this.getTreeBranch({v: item.id});
                tv.row = item;
            } else {
                let ind = item.tree.v || "";
                if (!this.treeIndex[ind]) {
                    let tv = this.getTreeBranch({v: "", t: "----"});
                    this.treeSort.push(tv.v)
                    this.treeIndex[tv.v] = tv;
                }

                this.treeIndex[ind].sorted.push(item.id);
            }

            if (!(item.id in this.data)) {
                this.data[item.id] = item;
                this.data[item.id].$checked = -1 !== this.__checkedRows.indexOf(item.id);
            }
        }, this);
    }
    App.pcTableMain.prototype.placeInTree = function (newData, oldVal) {
        let arr = 'sorted';
        if (this.fields.tree.treeViewType === 'self') {
            arr = 'trees';
        }
        if (oldVal !== undefined) {
            if (oldVal === null)
                oldVal = ""

            if (oldVal in this.treeIndex) {
                let oldIndex = this.treeIndex[oldVal][arr].indexOf(newData.id);
                if (oldIndex !== -1) {
                    this.treeIndex[oldVal][arr].splice(oldIndex, 1);
                }
            }
        }
        let newTreeBranch = newData.tree.v || '';

        if (newTreeBranch in this.treeIndex && this.treeIndex[newTreeBranch].l) {
            this.treeIndex[newTreeBranch][arr].unshift(newData.id);
        } else {
            if (newTreeBranch) {
                this.treeReloadRows.push(newTreeBranch);
            }
        }

        this.treeRefresh = true;
    }
    App.pcTableMain.prototype.getTreeBranch = function (tv) {
        if (tv.v === null)
            tv.v = "";
        else {
            tv.v = tv.v.toString();
        }
        if (!this.treeIndex[tv.v]) {

            this.treeIndex[tv.v] = {...tv};
            this.treeIndex[tv.v].sorted = this.treeIndex[tv.v].sorted || [];
            this.treeIndex[tv.v].trees = this.treeIndex[tv.v].trees || [];
        }

        this.treeIndex[tv.v].l = 'l' in tv ? tv.l : 'l' in this.treeIndex[tv.v] ? this.treeIndex[tv.v].l : tv.v === "";
        this.treeIndex[tv.v].opened = 'opened' in tv ? tv.opened : 'opened' in this.treeIndex[tv.v] ? this.treeIndex[tv.v].opened : tv.v === "";

        if (tv.p !== undefined && this.treeIndex[tv.v].p != tv.p) {
            if (this.treeIndex[tv.v].p !== undefined && this.treeIndex[tv.v].p in this.treeIndex) {
                let index = this.treeIndex[this.treeIndex[tv.v].p].trees.indexOf(this.treeIndex[tv.v].v);
                if (index !== -1) {
                    this.treeIndex[this.treeIndex[tv.v].p].trees.splice(index, 1)
                }
            }
        }
        if (tv.p) {
            let parent = this.getTreeBranch({v: tv.p});
            if (parent.trees.indexOf(tv.v) === -1) {
                parent.trees.push(tv.v)
            }
        } else if (tv.t && this.treeSort.indexOf(tv.v) === -1) {
            this.treeSort.push(tv.v)
        }
        Object.keys(tv).forEach((key) => {
            this.treeIndex[tv.v][key] = tv[key];
        })
        return this.treeIndex[tv.v];
    }

})();