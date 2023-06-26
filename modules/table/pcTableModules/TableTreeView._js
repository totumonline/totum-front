(function () {

    App.pcTableMain.prototype._connectTreeView = function () {
        let pcTable = this;
        let timeout;

        this._content.on('click', '.treeRow', function (event) {
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
                recurcive: recurcive,
            }, null, null, this.filtersString || {})
        }

        this.reOrderRows = function (btnId, $direction) {
            let pcTable = this;
            btnId = btnId.toString();
            if (pcTable.tableRow.with_order_field && !pcTable.nSorted) {
                App.notify(App.translate('To operate the order field, reload the table'));
                return false;
            }

            if (pcTable.isRestoreView) {
                App.notify(App.translate('Rows restore mode. Sorting disabled'));
                return false;
            }

            if (this.nSortedTree !== undefined && this.data[btnId].tree.v != this.nSortedTree) {
                App.notify(App.translate('It is possible to sort only within a category'));
                return false;
            }
            if (this.nSortedTree === undefined) {
                this.nSortedTree = this.data[btnId].tree.v;
            }


            let treeIndexArr;

            if (this.fields.tree.treeViewType === 'self') {
                if (this.nSortedTree === null) {
                    treeIndexArr = this.treeSort
                } else {
                    treeIndexArr = this.treeIndex[this.nSortedTree]['trees'];
                }
            } else {
                treeIndexArr = this.treeIndex[this.nSortedTree]['sorted'];
            }

            let idInd;
            let orderingRowIds = [];
            if (this.row_actions_get_checkedIds().length === 0) {

                orderingRowIds.push(btnId);
                let btnIndex = treeIndexArr.indexOf(btnId);
                let indVisBtn = btnIndex + ($direction === 'after' ? 1 : -1);
                if (!(indVisBtn in treeIndexArr)) return;
                let idBeforeAfter = treeIndexArr[indVisBtn];

                if (this.data[idBeforeAfter].f && this.data[idBeforeAfter].f.blockorder) {
                    App.notify(App.translate('You cannot move the row %s', this.getRowTitle(this.data[idBeforeAfter])));
                    return;
                }
                treeIndexArr.splice(btnIndex, 1);
                idInd = treeIndexArr.indexOf(idBeforeAfter) + ($direction === 'after' ? 1 : 0);

            } else {
                if (pcTable.row_actions_get_checkedIds().indexOf(btnId) !== -1) {
                    App.notify(App.translate('The unchecked row should be selected as the anchor for the move'));
                    return false;
                }
                let idsLength = this.row_actions_get_checkedIds().length;


                this.dataSorted.some((id, ind) => {
                    if (idsLength === 0) return true;

                    if (typeof id === 'object') {
                        if (this.fields.tree.treeViewType === 'self') {
                            id = id.row.id;
                        } else if (id.row) {
                            if (id.row.$checked) {
                                this.nSortedTree = undefined;
                                App.notify(App.translate('Only nested rows can be moved'));
                                return true;
                            }
                            id = id.row.id;
                        } else {
                            return;
                        }
                    }

                    if (pcTable.data[id].$checked) {
                        if (pcTable.data[id].tree.v != this.nSortedTree) {
                            this.nSortedTree = undefined;
                            App.notify(App.translate('You can only move within one branch'));
                            return true;
                        }
                        orderingRowIds.push(id.toString());
                        --idsLength;
                    }
                });

                orderingRowIds.forEach(function (id) {
                    treeIndexArr.splice(treeIndexArr.indexOf(id), 1);
                });
                idInd = treeIndexArr.indexOf(btnId) + ($direction === 'after' ? 1 : 0)
            }
            treeIndexArr.splice(idInd, 0, ...orderingRowIds);
            this.ntreeSortedArr = treeIndexArr;

            if (pcTable.tableRow.with_order_field) {
                this.nReorderedTree = this.nSortedTree;
                $('table.pcTable-table').addClass('reordered');
                // pcTable._table.addClass('reordered');
            }

            pcTable.treeApply(true);
            pcTable.row_actions_uncheck_all();
        };

        this.setOrdersForRows = function (order) {
            if (this.fields.tree.treeViewType !== 'self') return;

            let newOrder = [];

            const getSortedList = (ids) => {
                let newids = [];
                order.forEach((id) => {
                    id = id.toString();
                    if (ids.indexOf(id) > -1) {
                        newids.push(id)
                    }
                })
                ids.forEach((id) => {
                    if (newids.indexOf(id.toString()) == -1) {
                        newids.push(id)
                    }
                })
                return newids;
            };

            this.treeSort = getSortedList(this.treeSort);

            const reOrderTreeBtranches = (id) => {
                this.treeIndex[id].trees = getSortedList(this.treeIndex[id].trees);
                this.treeIndex[id].trees.forEach(reOrderTreeBtranches)
            };
            this.treeSort.forEach(reOrderTreeBtranches)
        }

        this.reOrderRowsSave = function () {
            let pcTable = this;
            /*if (pcTable.notCorrectOrder) {
                App.notify('Поля выбраны с промежутками - выберите корректный фильтр');
                return;
            }*/
            pcTable._orderSaveBtn.prop('disabled', true).find('i').attr('class', 'fa fa-cog');


            this.model.saveOrder(this.ntreeSortedArr.map((id) => parseInt(id)))
                .then(function (json) {
                    pcTable.nSortedTree = undefined;
                    pcTable.nReorderedTree = false;
                    pcTable.table_modify(json);
                    pcTable._refreshContentTable(true);
                    pcTable._orderSaveBtn.prop('disabled', false).find('i').attr('class', 'fa fa-save');
                    $('table.pcTable-table').removeClass('reordered');

                });

        };

        const parentStatus = App.pcTableMain.prototype._refreshCheckedStatus;

        this._refreshCheckedStatus = function () {
            parentStatus.call(this);
            let oldTreeCat = this.nSortedTree;
            let oldBlock = !!this.nSortedTreeBlock;
            this.nSortedTreeBlock = false;

            if (!this.__checkedRows.length && !this.nReorderedTree) {
                this.nSortedTree = undefined;
            }

            this.__checkedRows.some((id) => {
                if (this.data[id].__tree && this.fields.tree.treeViewType === 'other') {
                    this.nSortedTreeBlock = true;
                    return true;
                } else if (this.nSortedTree !== undefined) {
                    if (this.data[id].tree.v !== this.nSortedTree) {
                        this.nSortedTreeBlock = true;
                        return true;
                    }
                } else {
                    this.nSortedTree = this.data[id].tree.v;
                }
            })

            if (oldTreeCat !== this.nSortedTree || oldBlock !== this.nSortedTreeBlock) {
                this.ScrollClasterized.insertToDOM(null, false, true)
            }

        }

        this._csvExport = function (type) {
            "use strict";
            let pcTable = this;

            let ids = [];
            pcTable.dataSortedVisible.forEach((branch) => {
                if (branch.row && branch.row.id) {
                    ids.push(branch.row.id)
                } else if (typeof branch === 'string') {
                    ids.push(branch)
                }
            })

            this.model.csvExport(ids, type, Object.keys(App.filter(pcTable.fields, (x, field) => !!field.showMeWidth))).then(function (json) {
                if (json.csv) {
                    let blob = new Blob([json.csv], {type: "text/csv;charset=utf-8"});
                    saveAs(blob, pcTable.tableRow.title + '.' + pcTable.model.tableData.updated.dt + '.csv');
                }
            })
        }
    }
    App.pcTableMain.prototype._treeFolderRowAddDropdown = function (span, row) {
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

        let OpenAll = $('<div class="menu-item"><i class="fa fa-arrows-v"></i> ' + (row.opened ? App.translate('Close all') : App.translate('Open all')) + '</div>').data('treeRow', row.v)
            .on('click', () => {
                this._actionTreeFolderRow(OpenAll, true)
            })
            .appendTo($divPopoverArrowDown)


        if (this.fields.tree.selectTable && row.v && !this.fields.tree.treeBfield) {
            $('<div class="menu-item"><i class="fa fa-edit"></i> ' + App.translate('Edit') + '</div>').on('click', () => {
                let obj = {id: row.v};
                new EditPanel(this.fields.tree.selectTable, null, obj).then(() => {
                    this.model.refresh();
                })
            }).appendTo($divPopoverArrowDown)


            $('<div class="menu-item"><i class="fa fa-th-large"></i> ' + App.translate('Add a branch') + '</div>')
                .on('click', () => {

                    let parentField = this.fields.tree.treeViewParentField || "tree";

                    let obj = {[parentField]: {v: row.v}};
                    new EditPanel(this.fields.tree.selectTable, null, obj, null, {tree: true}).then((json) => {
                        this.treeReloadRows.push(Object.keys(json.chdata.rows)[0]);
                        this.treeApply();
                    })
                }).appendTo($divPopoverArrowDown)
        }

        if (this.isInsertable() && this.fields.tree.treeViewType !== 'self' && this.fields.tree.insertable) {
            $('<div class="menu-item"><i class="fa fa-plus"></i> ' + App.translate('Add a row') + '</div>')
                .on('click', () => {
                    if (this.tableRow.type === 'cycles') {
                        this.model.add(null, {tree: row.v}).then(json => {
                            if (json.firstTableId) {
                                window.location.href = window.location.pathname + '/' + json.chdata.rows[0].id + '/' + json.firstTableId;
                            } else {
                                this.table_modify(json);
                            }
                        });
                    } else {
                        let obj = {tree: {v: row.v}};
                        new EditPanel(this, null, obj, null, {tree: true}).then((json) => {
                            this.table_modify(json);
                        })
                    }
                }).appendTo($divPopoverArrowDown)
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

            let td = $('<td colspan="' + (this.fieldCategories.visibleColumns.length) + '" class="tree-view-td" style="padding-left: ' + (7 + row.level * 22) + 'px"></td>');
            let span = $('<span class="tree-view">').append(folder);
            td.append(span)

            this._treeFolderRowAddDropdown(span, row)

            let treeRow = $('<span class="treeRow">').html($('<span>').text(row.t)).data('treeRow', row.v);
            if (row.opened && row.count) {
                this._treePagination(treeRow, row)
            }
            td.append(treeRow)

            tr.append(td)
            return row.tr = tr;
        }
    }

    App.pcTableMain.prototype.treePaginationLoadPageStack = function (row) {
        if (this.treePaginationLoadPageTimer) {
            clearTimeout(this.treePaginationLoadPageTimer);
        }
        this._treePaginationLoadPageStack = this._treePaginationLoadPageStack || [];
        this._treePaginationLoadPageStack.push(row);

        this.treePaginationLoadPageTimer = setTimeout(() => {
            let stack = this._treePaginationLoadPageStack;
            this._treePaginationLoadPageStack = null
            this.treePaginationLoadPage(stack)
        }, 20)
    }
    App.pcTableMain.prototype.treePaginationLoadPage = function (stack) {

        if (!this.treePaginationCountLimit) {
            let limit = this.tableRow.pagination.split('/');
            this.treePaginationCountLimit = (this.isMobile ? limit[1] : limit[0])
        }

        if (stack && stack.length) {
            let vs = [];
            stack.forEach((row) => {
                vs.push({v: row.v, p: row.PageData.page})
            })

            this.model.loadTreeRows = this.model.loadTreeRows || function (branches, count) {
                branches = JSON.stringify(branches);
                return this.__ajax('post', {
                    method: 'loadTreeRows',
                    branches: branches,
                    onPage: count
                }, null, null, this.filtersString || {})
            }

            this.model.loadTreeRows(vs, this.treePaginationCountLimit).then((json) => {
                json.deleted = [];
                stack.forEach((row) => {
                    if (this.treeIndex[row.v]) {
                        json.deleted.push(...this.treeIndex[row.v].sorted)
                    }
                })

                this.table_modify({'chdata': json});
                this.treeApply(true)
                stack.forEach((row) => {
                    this._treePagination(null, row)
                })
            })
        }
    }

    App.pcTableMain.prototype._treePagination = function (treeRow, row) {
        row.PageData = row.PageData || {}
        row.PageData.$block = row.PageData.$block || $('<span class="ttm-pagination"></span>')

        if (treeRow && !row.PageData.$block.parent().is(treeRow)) {
            row.PageData.$block.appendTo(treeRow)
        }
        let allPagesCount

        if (row.PageData.page === undefined) {
            row.PageData.$block.empty().append('<i class="fa fa-spinner"></i>');
            row.PageData.page = 0
            this.treePaginationLoadPageStack(row)
        } else if ((allPagesCount = Math.ceil(row.count / this.treePaginationCountLimit)) === 1) {
            row.PageData.$block.empty().append('');
        } else {
            let before = $('<button class="btn btn-default btn-sm"><i class="fa fa-hand-o-left"></i></button>');
            if (row.PageData.page === 0) {
                before.prop('disabled', true).on('click', () => {
                    return false
                });
            } else {
                before.on('click', () => {
                    row.PageData.$block.empty().append('<i class="fa fa-spinner"></i>');
                    row.PageData.page--;
                    this.treePaginationLoadPageStack(row)
                    return false;
                })
            }
            let after = $('<button class="btn btn-default btn-sm"><i class="fa fa-hand-o-right"></i></button>');

            if (row.PageData.page >= allPagesCount - 1) {
                after.prop('disabled', true).on('click', () => {
                    return false
                });
            } else {
                after.on('click', () => {
                    row.PageData.$block.empty().append('<i class="fa fa-spinner"></i>');
                    row.PageData.page++;
                    this.treePaginationLoadPageStack(row)
                    return false;
                })
            }
            let sigh = $('<span class="ttm-pages-arrows"><i class="fa fa-ellipsis-h"></i></span>');
            row.PageData.$block.empty().append(sigh).append($('<span class="ttm-pages-active">').append(before).append('<span class="ttm-pages">' + App.translate('%s from %s', [(row.PageData.page + 1), allPagesCount]) + '</span>').append(after));
        }
    }
    App.pcTableMain.prototype.treeApply = function (reCreateRows = false) {
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
            this.__applyFilters(true, reCreateRows);
            if (this.treeLoading) {
                this.treeLoading = false;
                this.ScrollClasterized.insertToDOM(null, true, true);
            }
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
            $(node).closest('td').html(App.translate('Loading'));
            this.treeLoading = true;
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
                if (json.rows && json.rows.length) {
                    this._treeApplyRows(json.rows);
                }
                if (!treeRowRecurcive || (recursiveCounter.counter-- < 1)) {
                    this.treeApply();
                }
            })
        }

    }
    App.pcTableMain.prototype._treeRefresh = function () {
        let levelsChangedRows = [];
        const expandTree = (treeList, level) => {
            level = level || 0
            treeList.forEach((v) => {
                if (this.treeIndex[v] && this.treeIndex[v].row && this.treeIndex[v].row.__tree && this.treeIndex[v].level != level) {
                    this.treeIndex[v].row.__tree.level = level
                    levelsChangedRows.push(v)
                }
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

        levelsChangedRows.forEach((id) => {
            if (this.treeIndex[id].tr && this.treeIndex[id].row) {
                let td = this.treeIndex[id].tr.find('.id').next();
                if (td.length) {
                    this._removeEditing(this.treeIndex[id].tr.find('.id').next())
                }
            }
        })
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
    App.pcTableMain.prototype.getElementInTree = function (treeVal) {
        return this.treeIndex[treeVal];
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
                } else if (!newData || newData.tree.v != oldItem.tree.v) {
                    let oldIndex = this.treeIndex[oldItem.tree.v][arr].indexOf(bOldVal.toString());
                    if (oldIndex !== -1) {
                        this.treeIndex[oldItem.tree.v][arr].splice(oldIndex, 1);
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
                        let done = false;
                        if (this.tableRow.with_order_field && this.data[bVal] && this.data[bVal].n) {
                            if (this.treeIndex[newTreeBranch][arr].length && this.data[this.treeIndex[newTreeBranch][arr][0]] && this.data[this.treeIndex[newTreeBranch][arr][0]].n > this.data[bVal].n) {
                                done = true;
                                this.treeIndex[newTreeBranch][arr].unshift(bVal)
                            } else {
                                this.treeIndex[newTreeBranch][arr].some((v, k) => {
                                    if (this.data[bVal].n > this.data[v].n && this.treeIndex[newTreeBranch][arr][k + 1] && this.treeIndex[newTreeBranch][arr][k + 1] && this.data[this.treeIndex[newTreeBranch][arr][k + 1]] && this.data[this.treeIndex[newTreeBranch][arr][k + 1]].n > this.data[bVal].n) {
                                        done = true;
                                        this.treeIndex[newTreeBranch][arr].splice(k + 1, 0, bVal)
                                    }
                                })
                            }
                        }
                        if (!done) {
                            this.treeIndex[newTreeBranch][arr].push(bVal.toString());
                        }
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