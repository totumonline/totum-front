(function (window, $) {
    $.extend(App.pcTableMain.prototype, {
        _orderSaveBtn: undefined,
        row_actions_add: function () {
            let pcTable = this;

            pcTable._table.on('click', '.DataRow .id', function () {
                if (pcTable.isMobile) {
                    pcTable.row_actions_panel_show.call(pcTable, $(this))
                }
            });

            pcTable._table.on('click', '.DataRow .id button.dropdown', function () {
                pcTable.row_dropdown.call(pcTable, $(this))
            });
            pcTable._table.on('click', '.DataRow .id .btn.chbox', function (event) {
                pcTable._row_actions_checkbox_click.call(pcTable, $(this).closest('tr'), event.shiftKey);
                return false;
            });
            pcTable._table.on('mouseleave', function () {
                $(this).blur();
                return false;
            });
            pcTable._table.on('click', '.DataRow .id button.edit', function () {
                pcTable.rows_edit.call(pcTable, $(this).closest('tr'))
            });

            /*dropdown Панель на id строки*/

            pcTable._container.on('click', '.row_delete, .row_restore, .row_duplicate, .row_refresh, .cycle_refresh', function () {
                let self = $(this);
                if (self.is('.row_delete'))
                    pcTable.rows_delete.call(pcTable, $(this).data('tr'));
                else if (self.is('.row_restore'))
                    pcTable.rows_restore.call(pcTable, $(this).data('tr'));
                else if (self.is('.row_duplicate'))
                    pcTable.row_duplicate.call(pcTable, $(this).data('tr'));
                else if (self.is('.row_refresh'))
                    pcTable.row_refresh.call(pcTable, $(this).data('tr'));
                else if (self.is('.cycle_refresh') && pcTable.isCreatorView && pcTable.tableRow.type === 'cycles') {
                    pcTable.cycle_refresh.call(pcTable, $(this).data('tr'))
                }
            });

        },
        _idCheckButton: $('<button class="btn btn-xxs chbox btn-default" data-action="checkbox"><span class="fa fa-square-o"></span></button>')
        ,
        _checkStatusBar: $('<div class="check-status-bar"><span class="check-mark">✓ </span><span data-name="count_checked_rows">0</span><span class="from-mark"> из </span><span data-name="count_visible_rows">0</span></div>')
        ,
        _headCellIdButtonsState: function () {
            "use strict";
            let pcTable = this;

            let checkedRows = this.row_actions_get_checkedIds();

            if (checkedRows.length > 0) {
                $('table.pcTable-table').addClass('with-checks')
            } else {
                $('table.pcTable-table').removeClass('with-checks');
            }

            if (this.dataSortedVisible.filter((v) => typeof v !== 'object' || v.row).length !== this.__checkedRows.length) {
                pcTable._idCheckButton.html('<span class="fa fa-square-o"></span>');
            } else {
                pcTable._idCheckButton.html('<span class="fa fa-check"></span>');
            }

            this._refreshCheckedStatus();
            pcTable.ScrollClasterized.reloadScrollHead.call(pcTable.ScrollClasterized)
        }
        ,
        _addCellId: function (item, $row) {
            let $tdId = $('<td class="id"><span class="nm">' + item['id'] + '</span></td>');
            $tdId.appendTo($row);
            this.row_actions_icons_add($tdId);

            if (item.$checked === true) {
                // this.row_actions_icons_add($tdId);
                this.row_actions_check(item, true);
            }
            return $tdId;
        },
        _addCellNo: function (item, $row) {
            let $tdNo = $('<td class="No">--</td>');
            $tdNo.appendTo($row);
            return $tdNo;
        }
        ,
        row_actions_uncheck_all: function () {
            "use strict";
            let pcTable = this;

            let checkedIds = this.row_actions_get_checkedIds();
            for (let i = 0; i < checkedIds.length; i++) {
                let item = pcTable._getItemById(checkedIds[i]);
                pcTable.row_actions_uncheck.call(pcTable, item, true);
            }
            this.__checkedRows = [];

            this._headCellIdButtonsState();
        }
        ,
        _refreshCheckedStatus: function () {
            this._checkStatusBar.find('[data-name="count_checked_rows"]:first').text(this.__checkedRows.length);
            this._checkStatusBar.find('[data-name="count_visible_rows"]:first').text(this.dataSortedVisible.filter((v) => typeof v !== 'object' || v.row).length);
        }
        ,

        _row_actions_checkbox_click: function ($tdId, shiftKey) {
            let pcTable = this;
            let $tr = $tdId.closest('tr');
            let item = this._getItemByTr($tr);
            let LastCheckAction = $.extend({}, (pcTable._lastcheckAction || {}));
            pcTable._lastcheckAction = {id: item.id, isCheck: !item.$checked};


            if (shiftKey) {

                const findIndex = (checkI) => {
                    return (i) => {
                        if (typeof i !== 'object') return i.toString() === checkI.toString()
                    }
                }

                let idsToCheck = [];

                let lastInd;

                if (LastCheckAction.id && (!item.$checked) === LastCheckAction.isCheck && (lastInd = pcTable.dataSortedVisible.findIndex(findIndex(LastCheckAction.id))) !== -1) {
                    let nowInd = pcTable.dataSortedVisible.findIndex(findIndex(item.id));
                    if (lastInd < nowInd) {
                        idsToCheck = pcTable.dataSortedVisible.slice(lastInd + 1, nowInd + 1);
                    } else {
                        idsToCheck = pcTable.dataSortedVisible.slice(nowInd, lastInd);
                    }
                } else {
                    pcTable.dataSortedVisible.some(function (id) {
                        if (typeof id !== 'object') {
                            if (pcTable.data[id].$checked) idsToCheck = [];
                            else {
                                idsToCheck.push(id);
                            }
                            if (id == item.id) {
                                return true;
                            }
                        }
                    });
                }
                if (!item.$checked) {

                    idsToCheck.forEach(function (id) {
                        if (typeof id !== 'object') {
                            pcTable.__checkedRows.push(id);
                            pcTable.row_actions_check(pcTable.data[id], true);
                        }
                    });
                } else {
                    idsToCheck.forEach(function (id) {
                        if (typeof id !== 'object') {
                            pcTable.__checkedRows.splice(pcTable.__checkedRows.indexOf(id), 1);
                            pcTable.row_actions_uncheck(pcTable.data[id], true);
                        }
                    });
                }
                this._headCellIdButtonsState();

            } else {
                if (!item.$checked)
                    this.row_actions_check(item);
                else
                    this.row_actions_uncheck(item);
            }


        }
        ,
        row_actions_get_checkedIds: function () {

            return this.__checkedRows;
        }
        ,
        row_actions_check: function (item, isGroupAction) {

            item.$checked = true;

            if (item.$tr) {
                let $tdId = item.$tr.find('.id:first');
                /*if ($tdId.find('button:first').length === 0) {
                    this.row_actions_icons_add($tdId);
                }
                $tdId.find('.chbox').html('<i class="fa fa-check"></i>');
                if (!$tdId.is(':hover')) {
                    this.row_actions_icons_hide(item.$tr);
                }*/
                $tdId.addClass('checked');

            }

            if (!isGroupAction) {
                this.__checkedRows.push(item.id);
                this._headCellIdButtonsState();
            }

        }
        ,
        row_actions_uncheck: function (item, $isGroupOperation) {
            if (!item.$checked) return;

            item.$checked = false;
            if (item.$tr) {
                $tdId = item.$tr.find('.id');
                $tdId.removeClass('checked');
                $tdId.find('.chbox i').attr('class', 'fa fa-square-o');
            }

            if (!$isGroupOperation) {
                this.__checkedRows.splice(this.__checkedRows.indexOf(item.id), 1);
                this._headCellIdButtonsState();
            }
        }
        ,
        row_actions_icons_add: function ($tdId) {
            "use strict";
            let $editButton, $dropDownButton;
            let pcTable = this;


            if (this.tableRow.panel) {
                $editButton = $('<button class="btn btn-default edit"><i class="fa fa-th-large"></i></button>')
                    .on('mouseleave', function () {
                        $(this).blur();
                        return false;
                    }).css('margin-left', 2);
            } else {
                $editButton = $();
            }

            if (this.control.editing) {
                $dropDownButton = $('<button class="btn btn-default btn-xxs dropdown"  tabindex="-1" style=" margin-left: 2px;">' +
                    '<i class="fa fa-caret-down" style="font-size: 10px; width: 7px;"></i></button>');

            }
            let $checkbox = $('<button class="btn btn-default btn-xxs chbox"><i class="fa fa-square-o"></i></button>')

            let $btngroup = $('<span class="btn-group-xxs">');
            $tdId.append($btngroup)
                .append(' ')
                .append($checkbox);

            if ($dropDownButton) {
                $btngroup
                    .append($dropDownButton)
            }
            if ($editButton) {
                $btngroup
                    .append($editButton)
            }

        }
        ,
        row_actions_panel_show: function ($tdId) {
            let $tr = $tdId.closest('tr');
            let item = this._getItemByTr($tr);
            let trId = item['id'];
            const pcTable = this;

            let text = $('<div id="row-mobile-panel"></div>');

            if (this.tableRow.panel !== true) {
                text.append($('<div class="menu-item"><i class="fa fa-th-large"></i> Открыть панель</div>').css('color', 'gray'));
            } else {
                text.append($('<div class="menu-item row_panel"><i class="fa fa-th-large"></i> Открыть панель</div>').attr('data-tr', trId));
            }

            if (this.control.duplicating !== true || this.f.blockduplicate || item.f.blockduplicate) {
                text.append($('<div class="menu-item"><i class="fa fa-clone"></i> Дублировать</div>').css('color', 'gray'));
            } else {
                text.append($('<div class="menu-item row_duplicate"><i class="fa fa-clone"></i> Дублировать</div>').attr('data-tr', trId));
            }

            if (['calcs', 'globcalcs'].indexOf(this.tableRow.type) !== -1) {
                text.append($('<div class="menu-item"><i class="fa fa-refresh"></i> Пересчитать</div>').css('color', 'gray'));
            } else {
                text.append($('<div class="menu-item row_refresh"><i class="fa fa-refresh"></i> Пересчитать</div>').attr('data-tr', trId));
            }

            if (!this.control.deleting || this.f.blockdelete || (item.f && (item.f.block || item.f.blockdelete))) {
                text.append($('<div class="menu-item"><i class="fa fa-times"></i> Удалить</div>').css('color', 'gray'));
            } else {
                text.append($('<div class="menu-item row_delete"><i class="fa fa-times"></i> Удалить</div>').attr('data-tr', trId));
            }

            let dialog = App.mobilePanel(item[this.mainFieldName].v || 'id: ' + trId, text);

            text.on('click', '.row_delete, .row_duplicate, .row_refresh, .row_panel', function () {
                let self = $(this);
                if (self.is('.row_delete'))
                    pcTable.rows_delete.call(pcTable, trId);
                else if (self.is('.row_duplicate'))
                    pcTable.row_duplicate.call(pcTable, trId);
                else if (self.is('.row_refresh'))
                    pcTable.row_refresh.call(pcTable, trId);
                else if (self.is('.row_panel'))
                    pcTable.rows_edit.call(pcTable, $tr);
                dialog.close();
            });
        }
        ,

        table_modify: function (json, $trIdBefore, editedObj) {//$trIdBefore - это для вставки дублированных строк
            "use strict";
            let pcTable = this;
            let insertIndex = 0;
            let insertVisibleIndex = 0;
            let editFieldName = editedObj ? editedObj.data('field') : undefined;


            if (pcTable.isPanel) {
                delete json.chdata.params;
            }

            if ($trIdBefore) {
                insertIndex = pcTable.dataSorted.indexOf($trIdBefore) + 1;
                insertVisibleIndex = pcTable.dataSortedVisible.indexOf($trIdBefore) + 1;

            }

            if (json.chdata) {
                let deleted = json.chdata.deleted || [];
                let addedRows = [];

                if (json.chdata.rows) {
                    if (json.refresh && json.chdata.rows) {
                        Object.keys(pcTable.data).forEach(function (id) {
                            if (json.chdata.rows[id] === undefined) {
                                deleted.push(parseInt(id));
                            }
                        });
                    }

                    if (json.chdata.tree) {
                        let ids = {};
                        json.chdata.tree.forEach((tv, i) => {
                            this.getTreeBranch(tv, i);
                            ids[tv.v] = true;
                        })

                        if (json.refresh) {
                            Object.keys(this.treeIndex).forEach((id) => {
                                if (id && !ids[id]) {
                                    this.removeTreeBranch(id);
                                    this.treeRefresh = true;
                                }
                            })
                        }
                    }


                    $.each(json.chdata.rows, function (k, v) {
                        let item = pcTable._getItemById(v.id);
                        if (item === undefined) {
                            addedRows.push(v);
                        } else {

                            pcTable.refreshRow(item.$tr, item, v);
                        }
                    });
                    if (addedRows.length) {
                        if (App.isEmpty(pcTable.data) && pcTable._content) {
                            pcTable._content.find('.pcTable-noDataRow').remove();
                        }
                        let reorderRows = [];
                        $.each(addedRows, function (k, v) {
                            v.$visible = true;
                            v.$checked = false;
                            if (!insertIndex && pcTable.tableRow.with_order_field && !pcTable.tableRow.new_row_in_sort) {
                                v.__inserted = true;
                            }
                            pcTable.data[v.id] = v;

                            if (pcTable.isTreeView) {
                                pcTable.placeInTree(v, null, true)
                                this.treeRefresh = true;

                            } else {

                                let nowInsertIndex = insertIndex;
                                let nowInsertVisibleIndex = insertVisibleIndex;

                                if ((v.__after && (!$trIdBefore || $trIdBefore.id !== v.__after))) {
                                    nowInsertIndex = pcTable.dataSorted.indexOf(v.__after) + 1;
                                    nowInsertVisibleIndex = pcTable.dataSortedVisible.indexOf(v.__after) + 1;
                                } else if ('order' in json.chdata) {
                                    reorderRows.push(v.id)
                                }

                                pcTable.dataSorted.splice(nowInsertIndex, 0, v.id);
                                pcTable.dataSortedVisible.splice(nowInsertVisibleIndex, 0, v.id);

                                insertIndex++;
                                insertVisibleIndex++;

                            }

                        });

                        /*reorderRows.forEach(function (id) {
                            let place = json.chdata.order.indexOf(id);
                            let newPlace = 0;
                            let newPlaceVisible = 0;
                            if (place > 0) {
                                let beforeId = json.chdata.order[place - 1];
                                newPlace = pcTable.dataSorted.indexOf(beforeId) + 1
                                newPlaceVisible = pcTable.dataSortedVisible.indexOf(beforeId) + 1
                            }
                            let oldPlace = pcTable.dataSorted.indexOf(id);
                            let oldPlaceVisible = pcTable.dataSortedVisible.indexOf(id);
                            if (oldPlace !== newPlace) {
                                pcTable.dataSorted.splice(newPlace, 0, id);
                                let oldPlace = pcTable.dataSorted.indexOf(id);
                                pcTable.dataSorted.splice(oldPlace, 1);
                            }
                            if (oldPlaceVisible !== newPlaceVisible) {
                                pcTable.dataSortedVisible.splice(newPlaceVisible, 0, id);
                                let oldPlaceVisible = pcTable.dataSortedVisible.indexOf(id);
                                pcTable.dataSortedVisible.splice(oldPlaceVisible, 1);
                            }
                        })*/


                        if ($trIdBefore && !pcTable.isMobile) {
                            setTimeout(function () {
                                $.each(addedRows, function (k, v) {
                                    pcTable.row_actions_check(pcTable.data[v.id]);
                                })
                            }, 50);

                        }
                    }
                    if (pcTable.selectedCells) {
                        pcTable.selectedCells.summarizer.check();
                    }
                }

                if (deleted.length) {
                    $.each(deleted, function (k, v) {
                        pcTable._deleteItemById.call(pcTable, v);
                    });
                    if (App.isEmpty(pcTable.data) && pcTable._content && pcTable._content.find('.' + this.noDataRowClass).length === 0) {
                        pcTable._content.append(pcTable._createNoDataRow());
                    }
                }

                if (deleted.length || addedRows.length || (json.chdata.nsorted_ids && pcTable.nSorted && !Object.equals(json.chdata.nsorted_ids, pcTable.dataSorted))) {

                    if (json.chdata.nsorted_ids && pcTable.nSorted) {
                        let oldVisible = pcTable.dataSortedVisible;
                        pcTable.dataSorted = json.chdata.nsorted_ids;

                        if (oldVisible.length === pcTable.dataSorted.length)
                            pcTable.dataSortedVisible = pcTable.dataSorted
                        else {
                            pcTable.dataSortedVisible = [];
                            pcTable.dataSorted.forEach(function (id) {
                                if (oldVisible.indexOf(id) !== -1)
                                    pcTable.dataSortedVisible.push(id)
                            })
                        }
                    }

                    this._refreshContentTable(0, false, true);
                    this._container.getNiceScroll().resize();
                }

                if (json.chdata.order) {
                    this.dataSorted = json.chdata.order;
                    pcTable.dataSortedVisible = [];
                    pcTable.dataSorted.forEach((id) => {
                        if (this.data[id].$visible)
                            pcTable.dataSortedVisible.push(id)
                    })
                    this._refreshContentTable(0, false, true);
                }

                let paramsChanges = {};
                if (json.chdata.params) {
                    $.each(json.chdata.params, function (k, v) {
                        ['v', 'v_', 'f', 'e', 'h', 'c', 'ch'].forEach(function (part) {
                            if (pcTable.data_params[k] && (v[part] !== undefined || pcTable.data_params[k][part])) {
                                if (!Object.equals(pcTable.data_params[k][part], v[part]) || k === editFieldName) {
                                    paramsChanges[k] = part;
                                    pcTable.data_params[k][part] = v[part];
                                }
                            }
                        });
                    });
                }

                if (json.chdata.fields) {
                    $.each(json.chdata.fields, function (k, v) {
                        if (v.list && !Object.equals(pcTable.fields[k].list, v.list)) {
                            paramsChanges[k] = true;
                            $.extend(pcTable.fields[k], v);
                        }
                    });
                }
                if (json.chdata.params || json.chdata.fields) {
                    pcTable._refreshParamsBlock(paramsChanges, true);
                    pcTable._refreshFootersBlock(paramsChanges, true);

                    if (pcTable.f && pcTable.f.buttons && pcTable.f.buttons.some) {
                        pcTable.f.buttons.some((name) => {
                            pcTable._rowsButtons();
                            return true;
                        })
                    }
                }
                if (json.chdata.f) {
                    let newf = json.chdata.f;
                    ['blockadd', 'buttons', 'blockdelete', 'blockorder', 'background', 'blockduplicate', 'block', 'tabletitle', 'rowstitle', 'fieldtitle', 'tablecomment'].forEach(function (k) {
                        if (k in newf || k in pcTable.f) {
                            if (typeof newf[k] == "object") {
                                if (!Object.equals(newf[k], pcTable.f[k])) {
                                    let old = Object.assign({}, pcTable.f[k]);
                                    pcTable.f[k] = newf[k];
                                    if (pcTable.__formatFunctions[k]) {
                                        pcTable.__formatFunctions[k].call(pcTable, newf[k], old);
                                    }
                                }
                            } else if (newf[k] !== pcTable.f[k]) {
                                pcTable.f[k] = newf[k];
                                if (pcTable.__formatFunctions[k]) {
                                    pcTable.__formatFunctions[k].call(pcTable, newf[k]);
                                }
                            }
                        }
                    })
                }
                if (App.isEmpty(pcTable.data) && pcTable._content) {
                    pcTable._content.empty().append(this._createNoDataRow());
                }

                if (this.treeRefresh) {
                    this.treeApply();
                }
            }


            if (json.updated) {
                pcTable.model.tableData.updated = JSON.parse(json.updated);
                pcTable._refreshTitle();
            }
            if (!pcTable.isPanel) {
                if (json.filtersString) {
                    pcTable._refreshFiltersBlock.call(pcTable, json)
                }
                pcTable._headCellIdButtonsState();

                pcTable.ScrollClasterized.insertToDOM(null, true);
            }
        }
        ,
        rows_edit: function ($tr) {
            "use strict";
            let pcTable = this;
            let checkedRows = this.row_actions_get_checkedIds();

            if ($tr && (checkedRows.indexOf(pcTable._getItemByTr($tr).id) === -1)) {
                this.row_actions_check(pcTable._getItemByTr($tr));
                checkedRows = this.row_actions_get_checkedIds();
            }
            pcTable._row_edit.call(pcTable, checkedRows.slice());
            return false;
        }
        ,
        row_dropdown: function ($dropDownButton) {
            "use strict";

            let pcTable = this;
            let text = $('<div>');
            let item = pcTable._getItemByTr($dropDownButton.closest('tr'));
            let trId = item.id;


            if (this.control.duplicating !== true || pcTable.f.blockduplicate || item.f.blockduplicate) {
                text.append($('<div class="menu-item"><i class="fa fa-clone"></i> Дублировать</div>').css('color', 'gray'));
            } else {
                text.append($('<div class="menu-item row_duplicate"><i class="fa fa-clone"></i> Дублировать</div>').attr('data-tr', trId));
            }

            if (['calcs', 'globcalcs'].indexOf(pcTable.tableRow.type) !== -1) {
                text.append($('<div class="menu-item"><i class="fa fa-refresh"></i> Пересчитать</div>').css('color', 'gray'));
            } else {
                text.append($('<div class="menu-item row_refresh"><i class="fa fa-refresh"></i> Пересчитать</div>').attr('data-tr', trId));
            }

            if (pcTable.isCreatorView && pcTable.tableRow.type === 'cycles') {
                text.append($('<div class="menu-item cycle_refresh color-danger"><i class="fa fa-refresh"></i> Пересчитать цикл</div>').attr('data-tr', trId));
            }


            if (this.isRestoreView) {
                text.append($('<div class="menu-item row_restore"><i class="fa fa-recycle"></i> Восстановить</div>').attr('data-tr', trId));
            } else {
                if (!this.control.deleting || this.f.blockdelete || (item.f && (item.f.block || item.f.blockdelete))) {
                    text.append($('<div class="menu-item"><i class="fa fa-times"></i> Удалить</div>').css('color', 'gray'));
                } else {
                    text.append($('<div class="menu-item row_delete"><i class="fa fa-times"></i> Удалить</div>').attr('data-tr', trId));
                }
            }

            let popoverId = App.popNotify({
                isParams: true,
                $text: text,
                element: $dropDownButton,
                container: this._container,
                trigger: 'manual',
                placement: 'bottom'
            });

            $('#' + popoverId).position({
                my: "left top",
                at: "left-3px bottom+10px",
                of: $dropDownButton
            }).off().on('mouseleave', function () {
                text.remove();
            }).find('.arrow').css('left', '11px').end()
                .find('.popover-content').css('padding', '5px');


            return false;
        }
        ,
        __getCheckedRowsIds: function (trId, checkBlockedRows, elseblockparam) {
            "use strict";
            let pcTable = this;
            let checkedRows = this.row_actions_get_checkedIds();
            if (trId && (checkedRows.indexOf(trId) === -1)) {
                let item = pcTable.data[trId];
                this.row_actions_check(item);
                checkedRows = this.row_actions_get_checkedIds();
            }
            if (checkBlockedRows) {
                let isBlockedRow = false;
                checkedRows.some(function (id) {
                    if (pcTable.data[id].f && (pcTable.data[id].f.block || pcTable.data[id].f[elseblockparam])) {
                        isBlockedRow = pcTable.data[id];
                        return true;
                    }
                });

                if (isBlockedRow) {
                    let mainBlockField = '';

                    if (pcTable.mainFieldName !== 'id') {
                        if (isBlockedRow[pcTable.mainFieldName]._v) {
                            mainBlockField = isBlockedRow[pcTable.mainFieldName]._v;
                        } else {
                            mainBlockField = isBlockedRow[pcTable.mainFieldName].v;
                        }
                        mainBlockField = ' "' + mainBlockField + '"';
                    }
                    let $ntf = $("<span>").html('Строка <b>id ' + isBlockedRow.id + '</b>');
                    if (mainBlockField !== '') {
                        let b = $ntf.find('b');
                        b.text(b.text() + mainBlockField);
                    }
                    $ntf.append(' заблокирована');
                    App.notify($ntf, 'Действие не выполнено');

                    return false;
                }
            }
            return checkedRows;

        },
        getRowTitle(item) {
            if (this.mainFieldName !== 'id') {
                if (item[this.mainFieldName]._v) {
                    return item[this.mainFieldName]._v;
                } else {
                    return item[this.mainFieldName].v;
                }

            }
            return item.id;
        }
        ,
        row_refresh: function (trId) {
            "use strict";
            let pcTable = this;
            let checkedRows = this.__getCheckedRowsIds(trId, false);
            let checkedOneId = checkedRows.length === 1 ? checkedRows[0] : null;
            if (checkedRows && checkedRows.length) {
                let buttons = [
                    {
                        label: 'Пересчитать',
                        action: function (dialogRef) {
                            pcTable.model.refresh_rows(checkedRows).then(function (json) {
                                pcTable.table_modify.call(pcTable, json);
                                dialogRef.close();
                                pcTable.row_actions_uncheck_all();
                            });

                        }
                    },
                    {
                        label: 'Отмена',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }

                    }
                ];

                BootstrapDialog.show({
                    message: 'Точно пересчитать ' + checkedRows.length + ' строк?',
                    title: 'Пересчет',
                    buttons: buttons,
                    onhidden: function () {
                        if (checkedRows.length === 1 && checkedRows[0] == checkedOneId) {
                            pcTable.row_actions_uncheck_all();
                        }
                    },
                    draggable: true
                })
            }
        },
        cycle_refresh: function (trId) {
            "use strict";
            let pcTable = this;
            let checkedRows = this.__getCheckedRowsIds(trId, false);
            if (checkedRows && checkedRows.length) {
                let buttons = [
                    {
                        label: 'Пересчитать',
                        action: function (dialogRef) {
                            pcTable.model.refresh_cycles(checkedRows).then(function (json) {
                                pcTable.table_modify.call(pcTable, json);
                                dialogRef.close();
                                pcTable.row_actions_uncheck_all();
                            });

                        }
                    },
                    {
                        label: 'Отмена',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }

                    }
                ];

                BootstrapDialog.show({
                    message: 'Точно пересчитать ' + checkedRows.length + ' циклов?',
                    title: 'Пересчет',
                    buttons: buttons,
                    draggable: true
                })
            }
        }
        ,
        row_duplicate: function (trId) {
            "use strict";

            let pcTable = this;
            let checkedRows = this.__getCheckedRowsIds(trId, false);
            if (checkedRows && checkedRows.length) {
                let buttons = [
                    {
                        label: 'Дублировать',
                        cssClass: 'btn-danger',
                        action: function (dialogRef_main) {
                            let unic_replaces = {};
                            let unic_fields = [];

                            let newCheckedRows = [];

                            pcTable.dataSortedVisible.forEach(function (idObj) {
                                let id = parseInt(idObj);
                                if (typeof idObj === 'object' && idObj.row) {
                                    id = parseInt(idObj.row.id)
                                }
                                if (checkedRows.indexOf(id) !== -1) {
                                    newCheckedRows.push(id);
                                }
                            });

                            const duplicate = function (dialogRef) {
                                pcTable.model.duplicate(newCheckedRows, unic_replaces, trId).then(function (json) {
                                    pcTable.table_modify.call(pcTable, json, trId);
                                    if (dialogRef)
                                        dialogRef.close();
                                    dialogRef_main.close();
                                    pcTable.row_actions_uncheck_all();
                                });
                            };

                            for (let i in pcTable.fieldCategories.column) {
                                let field = pcTable.fieldCategories.column[i];
                                if (field.type === 'unic') {
                                    unic_fields.push(field.name);
                                }
                            }

                            //Замена значений уникальных полей
                            if (unic_fields.length) {
                                let $uniqTable = $('<table class="simpleTable"><thead><tr><td class="id">id</td></tr></thead><tbody></tbody></table>');
                                let $head = $uniqTable.find('thead tr');
                                let $body = $uniqTable.find('tbody');
                                let mainField;
                                if (pcTable.mainFieldName !== 'id') {
                                    mainField = pcTable.fields[pcTable.mainFieldName];
                                    if (mainField.type !== 'unic') {
                                        $head.append($('<td></td>').text(mainField.title));
                                    } else {
                                        mainField = null;
                                    }
                                }
                                for (let i in unic_fields) {
                                    let field = pcTable.fields[unic_fields[i]];
                                    $head.append($('<td></td>').text(field.title));
                                }

                                for (let i in newCheckedRows) {
                                    let id = newCheckedRows[i];
                                    let row = pcTable.data[id];
                                    let tr = $('<tr>');

                                    unic_replaces[id] = {};

                                    tr.append($('<td class="id"></td>').text(id));
                                    if (mainField) {
                                        tr.append($('<td></td>').text(row[mainField.name]['v']));
                                    }
                                    for (let i in unic_fields) {
                                        let field = pcTable.fields[unic_fields[i]];
                                        let tdInput = $('<td class="input"></td>');
                                        let input = $('<input>').val(row[field.name].v);
                                        unic_replaces[id][field.name] = row[field.name].v;
                                        let timeoutObject;

                                        input.on('keyup', function () {
                                            let val = $(this).val();

                                            unic_replaces[id][field.name] = val;

                                            if (timeoutObject) {
                                                clearTimeout(timeoutObject);
                                                timeoutObject = null;
                                            }

                                            if (val === '') {
                                                if (field.required) {
                                                    tdInput.removeClass('ok');
                                                } else {
                                                    tdInput.addClass('ok');
                                                }
                                                return;
                                            } else {
                                                timeoutObject = setTimeout(function () {
                                                    pcTable.model.checkUnic(field.name, val).then(function (json) {
                                                        if (json.ok) tdInput.addClass('ok');
                                                        else {
                                                            tdInput.removeClass('ok');
                                                        }
                                                    });
                                                }, 300)
                                            }

                                        });

                                        tdInput.html(input);
                                        tr.append(tdInput);
                                    }
                                    $body.append(tr);
                                }


                                let buttons = [
                                    {
                                        label: 'Дублировать',
                                        cssClass: 'btn-m btn-warning',
                                        action: function (dialogRef) {
                                            duplicate(dialogRef);
                                        }
                                    },
                                    {
                                        label: 'Отмена',
                                        action: function (dialog2) {
                                            dialog2.close();
                                            dialogRef_main.close();
                                        }
                                    }
                                ];


                                BootstrapDialog.show({
                                    message: $uniqTable,
                                    title: 'Заполните значения для уникальных полей',
                                    buttons: buttons,
                                    draggable: true
                                })
                            } else {
                                duplicate();
                            }
                        }
                    }, {
                        label: 'Отмена',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }

                    }
                ];

                BootstrapDialog.show({
                    message: 'Точно дублировать ' + checkedRows.length + ' строк?',
                    title: 'Дублирование',
                    buttons: buttons,
                    draggable: true
                })
            }
        }
        ,
        rows_delete: function (trId) {
            let pcTable = this;
            let checkedRows = this.__getCheckedRowsIds(trId, true, 'blockdelete');
            let checkedOneId = checkedRows.length === 1 ? checkedRows[0] : null;
            if (checkedRows && checkedRows.length) {

                let $message = 'Точно удалить ' + checkedRows.length + ' строк?';
                let $messageTimer = 'Удаление ' + checkedRows.length + ' строк?';
                if (checkedRows.length == 1) {
                    let item = 'id-' + checkedRows[0];
                    if (pcTable.mainFieldName != 'id') {
                        item = pcTable.data[checkedRows[0]][pcTable.mainFieldName];
                        item = 'id-' + checkedRows[0] + ' "' + (item.v_ && item.v_[0] ? item.v_[0] : item.v) + '"';
                    }
                    $message = 'Точно удалить строку ' + item + '?';
                    $messageTimer = 'Удаление строки ' + item + '?';
                }


                let buttons = [
                    {
                        label: 'Удалить',
                        cssClass: 'btn-danger',
                        action: function (dialogRef) {
                            dialogRef.close();

                            const deleteIt = function () {
                                pcTable.model.delete(checkedRows).then(function (json) {
                                    pcTable.table_modify.call(pcTable, json);
                                });
                            };
                            if (pcTable.tableRow.delete_timer > 0) {
                                App.panelTimer($messageTimer, pcTable.tableRow.delete_timer, deleteIt)
                            } else {
                                deleteIt();
                            }
                        }
                    }, {
                        label: 'Отмена',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }

                    }
                ];


                BootstrapDialog.show({
                    message: $message,
                    title: 'Удаление',
                    buttons: buttons,
                    onhidden: function () {
                        if (checkedRows.length === 1 && checkedRows[0] == checkedOneId) {
                            pcTable.row_actions_uncheck_all();
                        }
                    },
                    draggable: true
                })
            }
        },
        rows_restore: function (trId) {
            let pcTable = this;
            let checkedRows = this.__getCheckedRowsIds(trId);
            let checkedOneId = checkedRows.length === 1 ? checkedRows[0] : null;
            if (checkedRows && checkedRows.length) {

                let $message = 'Точно восстановить ' + checkedRows.length + ' строк?';
                if (checkedRows.length == 1) {
                    let item = 'id-' + checkedRows[0];
                    if (pcTable.mainFieldName != 'id') {
                        item = pcTable.data[checkedRows[0]][pcTable.mainFieldName];
                        item = 'id-' + checkedRows[0] + ' "' + (item.v_ && item.v_[0] ? item.v_[0] : item.v) + '"';
                    }
                    $message = 'Точно восстановить строку ' + item + '?';
                }


                let buttons = [
                    {
                        label: 'Восстановить',
                        cssClass: 'btn-danger',
                        action: function (dialogRef) {
                            dialogRef.close();

                            pcTable.model.restore(checkedRows).then(function (json) {
                                pcTable.table_modify.call(pcTable, json);
                            });
                        }
                    }, {
                        label: 'Отмена',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }

                    }
                ];


                BootstrapDialog.show({
                    message: $message,
                    title: 'Восстановление',
                    buttons: buttons,
                    onhidden: function () {
                        if (checkedRows.length === 1 && checkedRows[0] == checkedOneId) {
                            pcTable.row_actions_uncheck_all();
                        }
                    },
                    draggable: true
                })
            }
        }
    });
})
(window, jQuery);
