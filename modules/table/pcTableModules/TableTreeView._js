(function () {

    App.pcTableMain.prototype._connectTreeView = function () {
        let pcTable = this;
        let timeout;

        this._content.on('click', '.treeRow', function () {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null;
                pcTable._expandTreeFolderRow.call(pcTable, this, true)
                return;
            }
            if (pcTable.fields.tree.treeViewType === 'self') {
                pcTable._expandTreeFolderRow.call(pcTable, this)
            } else {
                timeout = setTimeout(() => {
                    timeout = null;
                    pcTable._expandTreeFolderRow.call(pcTable, this)
                }, 300)
            }
        })


        this.model.loadTreeBranches = function (branchIds, withParents) {
            return this.__ajax('post', {
                method: 'loadTreeBranches',
                branchIds: branchIds,
                withParents: withParents
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
            let tr = $tr || $('<tr class="treeRow"></tr>');
            tr.html('<td colspan="' + this.fieldCategories.column.length + '" style="padding-left: ' + (row.level * 10) + 'px">' +
                (!row.opened ? '<i class="fa fa-folder"></i>' : '<i class="fa fa-folder-open"></i>')
                + ' ' + row.t + '</td>')
            tr.data('treeRow', row);
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
    App.pcTableMain.prototype._expandTreeFolderRow = function (node, treeRowRecurcive, recursiveCounter) {
        let treeRow = typeof treeRowRecurcive === 'object' ? treeRowRecurcive : $(node).data('treeRow');

        if (node) {
            $(node).find('td:first').html('Загрузка');
        }


        if (treeRow.opened) {
            treeRow.opened = false;
            if (treeRowRecurcive) {
                this.treeIndex[treeRow.v].trees.forEach((row) => {
                    this._expandTreeFolderRow(false, this.treeIndex[row], {})
                })
                if (!recursiveCounter) {
                    treeRow.opened = true;
                    this.treeApply();
                }
            } else {
                this.treeApply();
            }
        } else {
            const expandRecursive = () => {
                if (treeRowRecurcive) {
                    if (!recursiveCounter) {
                        recursiveCounter = {counter: 0};

                        const checkCounter = () => {
                            if (recursiveCounter.counter > 0) {
                                setTimeout(checkCounter, 50)
                            } else {
                                this.treeApply();
                            }
                        }
                        let timeOut = setTimeout(checkCounter, 50)
                    } else {
                        recursiveCounter.counter--;
                    }
                    this.treeIndex[treeRow.v].trees.forEach((row) => {
                        recursiveCounter.counter++;
                        this._expandTreeFolderRow(false, this.treeIndex[row], recursiveCounter)
                    })
                }
            }


            if (treeRow.l) {
                treeRow.opened = true;

                expandRecursive();
                if (!treeRowRecurcive) {
                    this.treeApply();
                }

            } else {
                this.model.loadTreeBranches([treeRow.v]).then((json) => {
                    treeRow.opened = true;
                    treeRow.l = true;
                    if (json.tree) {
                        json.tree.forEach((tv, i) => {
                            let row = this.getTreeBranch(tv, i);
                        })
                        expandRecursive()
                    }
                    if (json.rows) {
                        this._treeApplyRows(json.rows);
                    }
                    if (!treeRowRecurcive) {
                        this.treeApply();
                    }

                })
            }
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