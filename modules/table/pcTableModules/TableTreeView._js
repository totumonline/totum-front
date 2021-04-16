(function () {

    App.pcTableMain.prototype._connectTreeView = function () {
        let pcTable = this;
        let timeout;

        this._content.on('click', '.treeRow', function () {
            let node = $(this);
            if (node.is('.dbl')) {
                pcTable._actionTreeFolderRow(node, true)
            } else if (node.is('.ins')) {
                pcTable._actionAddTreeFolderRow(node)
            } else {
                pcTable._actionTreeFolderRow(node)
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
        if (row.row && this.data[row.row.id]) {
            let tree = {...row};
            delete tree.row;
            row.row.__tree = tree;
            let tr = $tr || this._createRow(row.row);
            this.data[row.row.id].__tree = tree;
            return row.tr = this.data[row.row.id].$tr = tr;
        } else {
            let tr = $tr || $('<tr><td class="id"></td></tr>');

            let folder = $('<i class="fa fa-folder' + (row.opened ? '-open' : '') + ' treeRow"></i>').data('treeRow', row.v);

            let span = $('<span class="tree-view">').append(folder);

            let td = $('<td colspan="' + (this.fieldCategories.column.length - 1) + '" class="tree-view-td" style="padding-left: ' + (7 + row.level * 22) + 'px"></td>');
            td.append(span)

            /*actions*/
            let $divPopoverArrowDown = $('<div>')

            let popover;
            let dropdown = $('<button class="btn btn-default btn-xxs treeRow"><i class="fa fa-caret-down"></i></button>').popover({
                html: true,
                content: $divPopoverArrowDown,
                trigger: 'manual',
                container: this._container,
                placement: 'auto bottom'
            }).on('click', () => {
                $('body').trigger('click');
                dropdown.popover('show');
                popover = $('#' + dropdown.attr('aria-describedby'));
                setTimeout(() => {
                    this.closeCallbacks.push(() => {
                        if (dropdown && dropdown.length) dropdown.popover('hide');
                    })
                }, 200);
                return false;
            }).on('remove', () => {
                popover.remove();
            })
            span.append(dropdown);

            let OpenAll = $('<div class="menu-item"><i class="fa fa-arrows-v"></i> ' + (row.opened ? 'Закрыть' : 'Открыть') + ' все</div>').data('treeRow', row.v)
                .on('click', () => {
                    this._actionTreeFolderRow(OpenAll, true)
                })
                .appendTo($divPopoverArrowDown)


            if (this.fields.tree.selectTable && row.v && !this.fields.tree.treeBfield) {
                $('<div class="menu-item"><i class="fa fa-edit"></i> Редактировать</div>').on('click', () => {
                    let obj = {id: row.v};
                    new EditPanel(this.fields.tree.selectTable, null, obj).then(() => {
                        this.model.refresh();
                    })
                }).appendTo($divPopoverArrowDown)


                $('<div class="menu-item"><i class="fa fa-plus"></i> Добавить ветку</div>')
                    .on('click', () => {

                        let parentField=this.fields.tree.treeViewParentField || "tree";

                        let obj = {[parentField]: {v: row.v}};
                        new EditPanel(this.fields.tree.selectTable, null, obj, null, {tree: true}).then((json) => {
                            this.treeReloadRows.push(Object.keys(json.chdata.rows)[0]);
                            this.treeApply();
                        })
                    }).appendTo($divPopoverArrowDown)

                if (this.isInsertable()) {
                    $('<div class="menu-item"><i class="fa fa-th-large"></i> Добавить строку</div>')
                        .on('click', () => {


                            let obj = {tree: {v: row.v}};
                            new EditPanel(this, null, obj, null, {tree: true}).then(() => {
                                this.model.refresh();
                            })
                        }).appendTo($divPopoverArrowDown)
                }
            }

            td.append($('<span class="treeRow">').text(row.t).data('treeRow', row.v))


            tr.append(td)
            return row.tr = tr;
        }

    }
    App.pcTableMain.prototype.treeApply = function () {
        if (this.treeReloadRows.length) {
            this.model.loadTreeBranches(this.treeReloadRows, true).then((json) => {
                if (json.tree) {
                    json.tree.forEach((tv, i) => {
                        if (this.treeIndex[tv.v]) {
                            this.treeIndex[tv.v].trees = [];
                        }
                    })
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
    App.pcTableMain.prototype._actionAddTreeFolderRow = function (node, treeRowRecurcive) {
        if (this.fields.tree.treeViewType === 'self') {
            let obj = {tree: {v: this._getItemBytd(node.closest('td')).id}};
            new EditPanel(this, null, obj, null, {tree: true}).then((json) => {
                this.table_modify(json);
                this.reloaded();
            })
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

        let treeSortCopy = [...this.treeSort];
        if (treeSortCopy[0] == "" && this.treeIndex[""].sorted.length === 0) {
            delete treeSortCopy[0];
        }


        expandTree(treeSortCopy)
    }
    App.pcTableMain.prototype._treeApplyRows = function (rows) {
        rows.map((item) => {
            this.placeInTree(item);
            if (!(item.id in this.data)) {
                this.data[item.id] = item;
                this.data[item.id].$checked = -1 !== this.__checkedRows.indexOf(item.id);
            }
        }, this);
    }
    App.pcTableMain.prototype.removeTreeBranch = function (id) {
        if (id in this.treeIndex) {
            if (this.treeIndex[id].p) {
                let parentNode = this.treeIndex[this.treeIndex[id].p];
                //parentNode.trees.splice(parentNode.trees.indexOf(id), 1)
                this.treeReloadRows.push(parentNode.v)
            } else {
                delete this.treeIndex[id];
                this.treeRefresh();
            }
        }
    }
    App.pcTableMain.prototype.placeInTree = function (newData, oldItem, openIt) {
        let arr = 'sorted';

        const getBval = (newData) => {
            let bVal = newData.id;
            if (this.fields.tree.treeBfield && newData[this.fields.tree.treeBfield])
                bVal = newData[this.fields.tree.treeBfield].v
            return bVal;
        }

        if (this.fields.tree.treeViewType === 'self') {
            arr = 'trees';
        }
        if (oldItem) {
            /*if (newData) {
                if (!newData.tree || newData.tree.v === oldItem.tree.v) {
                    if (!newData.tree_category || newData.tree_category.v === oldItem.tree_category.v) {
                        return;
                    }
                }
            }*/


            let oldVal = oldItem ? oldItem.tree.v : undefined;
            if (oldVal === null) {
                oldVal = ""
            }


            if (this.fields.tree.treeViewType === 'other') {
                if (oldItem.tree_category && oldItem.tree_category.v
                    && this.treeIndex[oldItem.tree_category.v]
                    && this.treeIndex[oldItem.tree_category.v].row
                    && this.treeIndex[oldItem.tree_category.v].row.id === oldItem.id) {
                    delete this.treeIndex[oldItem.tree_category.v].row
                }
            }
            if (oldVal in this.treeIndex) {
                let bOldVal = getBval(oldItem);
                if (!newData || getBval(newData) != bOldVal) {
                    let oldIndex = this.treeIndex[oldVal][arr].indexOf(bOldVal.toString());
                    if (oldIndex !== -1) {
                        this.treeIndex[oldVal][arr].splice(oldIndex, 1);
                    }
                }
            } else {
                if (this.fields.tree.treeViewType === 'self' && (!newData || this.treeIndex[getBval(newData)].p != this.treeIndex[getBval(oldItem)].p)) {
                    let sortIndex = this.treeSort.indexOf(getBval(oldItem).toString());
                    if (sortIndex !== -1) {
                        this.treeSort.splice(sortIndex, 1);
                    }
                }
            }

            this.treeRefresh = true;
        }

        if (newData) {
            if (this.fields.tree.treeViewType === 'other' && newData.tree_category && newData.tree_category.v
                && this.treeIndex[newData.tree_category.v]) {
                this.treeIndex[newData.tree_category.v].row = newData
            } else {
                let newTreeBranch = newData.tree.v || '';

                let bVal = getBval(newData);

                if (this.fields.tree.treeViewType === 'self') {
                    if (bVal in this.treeIndex) {
                        this.treeIndex[bVal].row = newData
                    } else {
                        arr = 'sorted'
                    }
                }
                if (newTreeBranch in this.treeIndex && this.treeIndex[newTreeBranch].l) {
                    if (this.treeIndex[newTreeBranch][arr].indexOf(bVal.toString()) === -1) {
                        this.treeIndex[newTreeBranch][arr].push(bVal.toString());
                    }

                    if (openIt) {
                        this.openTreeWithParent(this.treeIndex[newTreeBranch]);
                    }
                } else {
                    if (newTreeBranch) {
                        this.treeReloadRows.push(newTreeBranch);
                    }
                }
            }
            this.treeRefresh = true;
        }

    }
    App.pcTableMain.prototype.openTreeWithParent = function (treeRow) {
        treeRow.opened = true;
        if (treeRow.p && this.treeIndex[treeRow.p]) {
            this.openTreeWithParent(this.treeIndex[treeRow.p]);
        }
    }
    App.pcTableMain.prototype.treeDeletingRow = function (id) {
        let row = this.data[id];
        if (row) {
            this.placeInTree(null, row)
        }
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
            let SortIndex = this.treeSort.indexOf(tv.v);
            if (SortIndex !== -1) {
                this.treeSort.splice(SortIndex, 1)
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