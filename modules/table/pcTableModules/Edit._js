$.extend(App.pcTableMain.prototype, {
    _addEditable: function () {
        var pcTable = this;

        let arias = this._container;

        pcTable.actionOnClick = function (cell, field) {
            let newcell = cell.clone(true).insertAfter(cell);
            cell.hide();

            field = field || this._getFieldBytd(cell);
            newcell.html('<span class="cell-value blocked" style="height: ' + newcell.height() + '">Выполняется</span>');

            let item = cell.closest('.DataRow').length ? this._getItemBytd(cell) : {};

            this.model.dblClick(item.id, field.name).always((json) => {
                newcell.remove();
                cell.show();
                this.table_modify(json);
            })
            return false;
        };

        const blockFunc = (cell, title) => {
            let newcell = cell.clone(true).insertAfter(cell);
            cell.hide();
            newcell.html('<span class="cell-value blocked" style="height: ' + newcell.height() + '">' + title + '</span>');
            setTimeout(function () {
                newcell.remove();
                cell.show();
            }, 500);
        }


        arias.on('dblclick', 'td.val:not(.editing), td.edt:not(.editing), .dataRows tr:not(.treeRow) td:not(.editing,.id,.n)', function (event) {
            let cell = $(this);

            let tr = cell.closest('tr');
            if (tr.length && tr.is('.InsertRow')) return false; // || tr.closest('.pcTable-filtersTable').length === 1

            if (cell.is('.footer-name, .id, .footer-empty')) return false;


            if (tr.is('.DataRow') && pcTable.isRestoreView) {
                blockFunc(cell, 'Удалено')
            } else {
                if (cell.is('.edt')) {
                    pcTable._createEditCell.call(pcTable, cell, true)
                } else {

                    let field = pcTable._getFieldBytd.call(pcTable, cell);
                    if (field.CodeActionOnClick) {
                        pcTable.actionOnClick(cell, field);
                    } else {

                        if (tr.is('.DataRow') && pcTable.tableRow.type === 'cycles') {
                            pcTable.model.dblClick(pcTable._getItemBytd(cell)['id'], pcTable._getFieldBytd(cell).name);
                            return false;
                        }

                        blockFunc(cell, 'Заблокировано')

                    }
                }
            }

        }).on('click', '.editCellsBlock .btn, td.edt .ttm-edit, td .ttm-panel', function (event) {
            if ($(this).is('.ttm-edit')) {
                $(this).closest('td').trigger('dblclick');
                return false;
            }
            if ($(this).is('.ttm-panel')) {
                $(this).closest('td').trigger('contextmenu');
                return false;
            }
            $(this).data('click')(event);
        });

    },
    goToEditNextCell: function (goTo) {

        return next;
    },
    _buttonClick: function ($td, field, item) {
        if ($td.data('clicked')) return false;

        return new Promise((resolve, reject) => {
            const func = function () {
                "use strict";

                let id;
                let editedData = {};
                let tr = $td.parent();

                $td.data('clicked', true);

                if (field.category === 'column') {
                    item = item || pcTable._getItemBytd($td);
                    id = item.id;
                    editedData.item = id;
                    editedData.fieldName = field.name;
                } else {
                    item = item || pcTable.data_params;
                    editedData.item = 'params';
                    editedData.fieldName = field.name;
                }

                editedData.checked_ids = pcTable.row_actions_get_checkedIds();
                $td.height($td.height());
                $td.find('.cell-value, .ttm--panel-data').hide();
                let $spinner = $('<div class="text-center"><i class="fa fa-spinner" style="color: #000"></i></div>');
                $td.append($spinner);
                pcTable._saving = true;
                pcTable.model.click(editedData)
                    .then(
                        function (json) {
                            pcTable.table_modify.call(pcTable, json);

                            if ($td.length && $td.isAttached()) {
                                $spinner.remove();
                                $td.find('.cell-value, .ttm--panel-data').show();

                            } else {
                                if (field.category === 'column') {
                                    item = pcTable._getItemById(id)
                                } else {
                                    item = pcTable.data_params;
                                }
                            }
                            if (field.uncheckAfterClick) {
                                pcTable.row_actions_uncheck_all();
                            }
                            if (field.closeIframeAfterClick && window.closeMe) {
                                window.closeMe();
                            }
                            field.btnOK.call(field, $td, item);
                            resolve(json);
                        }
                    ).fail(function () {
                    if ($td.length && $td.isAttached()) {
                        $spinner.remove();
                        $td.find('.cell-value, .ttm--panel-data').show();
                        $td.removeData('clicked');

                    }
                }).always(function () {
                    pcTable._saving = false;
                });
            };

            let pcTable = this;
            if (field.warningEditPanel) {
                let buttons =
                    {
                        'Ок': function (panel) {
                            panel.close();
                            func();
                        }, 'Отмена': function (panel) {
                            panel.close();
                        }
                    };

                let dialog = App.confirmation((field.warningEditText || 'Точно изменить?'), buttons, 'Подтверждение');

            } else {
                func()
            }
        })
    },
    _saveEdited: function ($editObj, editedData, goTo) {
        let pcTable = this;
        if (pcTable._saving === true) return;
        pcTable._saving = true;

        this.model.save(editedData)
            .then(
                (json) => {

                    pcTable.table_modify.call(pcTable, json, undefined, $editObj);
                    /* if ($editObj.closest('table').length) {
                         if ($editObj.is('tr.DataRow')) {
                             pcTable.refreshRow($editObj);
                         }
                     }*/

                    if (goTo) {
                        goTo();
                    }
                }
            ).always(() => {

            pcTable._saving = false;

            if ($editObj.is('tr.DataRow') && $editObj.closest('table').length === 1 && $editObj.find('.editing').length) $editObj.each(() => {
                pcTable.refreshRow($(this))
            });
            else if ($editObj.is('td') && $editObj.find('.fa-spinner').length && $editObj.closest('body').length > 0) {
                $editObj.each(function () {
                    let $editObj = $(this);
                    let item = pcTable._getItemBytd($editObj);
                    let field = pcTable._getFieldBytd($editObj);
                    let $cell = pcTable._createCell(item, field);
                    if (field.type === 'button') {
                        field.btnOK.call(field, $cell, item);
                    }
                    $editObj.replaceWith($cell);
                })

            }


        });
    },
    _editFocusIndex: 0,
    _editItem: null,
    _editPanel: null,
    _row_edit: function (checkedList) {
        let pcTable = this;

        if (checkedList.length === 0) {
            return false;
        }
        let ItemId = checkedList.shift();

        (new EditPanel(pcTable, null, {id: ItemId}, (checkedList.length > 0))).then(function (json, isNextPressed) {
            if (json || isNextPressed) {
                if (json) {
                    pcTable.table_modify.call(pcTable, json);
                }
                pcTable._row_edit.call(pcTable, checkedList);
            }
        }).then(function () {
            if (checkedList.length === 0) {
                pcTable.row_actions_uncheck_all();
            }
        });
    },
    _currentEditCellIndex: 0,
    _removeEditing: function (td) {
        if (!td) td = this._content.find('td.editing');
        var td2 = this._createCell(this._getItemBytd(td), this._getFieldBytd(td));
        let checkVar;
        if (checkVar = td.attr('rowspan')) {
            td2.attr('rowspan', checkVar)
        }
        if (checkVar = td.data('field')) {
            td2.data('field', checkVar)
        }
        if (td.is('.val')) {
            td2.addClass('val')
        }
        td.replaceWith(td2);
        return td2;
    },
    _saveEditCell: function () {
        if (this._editCell && this._editCell.isAttached()) {
            if (this._editCell.is('.editCell') && this._editCell.data('SaveMe')) {
                this._editCell.data('SaveMe')();
            }
        }
    },
    _removeEditCell: function () {
        if (this._editCell && this._editCell.isAttached()) {
            if (this._editCell.is('.editCell')) {
                this._removeEditing(this._editCell);
            }
        }
        this._editCell = null;
    },
    _setEditCell: function (td) {
        this._saveEditCell();
        this._editCell = td;
        td.addClass('editCell');
    },
    _setTdSaving: function ($td) {
        $td.html('<div class="text-center"><i class="fa fa-spinner"></i></div>');
    },
    _createEditCell: function (td, editNow, item) {
        let pcTable = this;

        let field = this._getFieldBytd(td);
        this._setEditCell(td);
        let parent = td.parent();


        let tr = td.closest('tr');
        let columnIndex = pcTable._getColumnIndexByTd(td, tr);
        let goToFunc = function (direction) {
            if (!direction) return false;

            let next;
            switch (direction) {
                case 'right':
                    next = pcTable._getTdByColumnIndex.call(pcTable, tr, ++columnIndex);
                    while (next.length) {
                        let field = pcTable._getFieldBytd.call(pcTable, next);
                        if (field.editable === true) {
                            next.trigger('dblclick');
                            break;
                        } else {
                            next = next.next('td');
                        }
                    }
                    break;
                case 'down':
                    next = tr.next('tr');
                    while (next.length && next.is('.Blocked')) {
                        next = next.next('tr');
                    }
                    pcTable._getTdByColumnIndex.call(pcTable, next, columnIndex).trigger('dblclick');
            }
        };

        if (!field.editable) return false;

        item = item || this._getItemBytd(td);
        let itemId = item.id;
        let editCellsBlock = $('<div class="editCellsBlock">');

        td.addClass('editing');

        let oldval = item[field.name];

        let onAction = false;

        let escClbck = function ($input, eventIN, tdIN, noColorize) {

            let td = tdIN || $input.closest('td');
            let event = eventIN || {};

            if (!td.length || !td.closest('body').length) return false;
            var tdNew = pcTable._removeEditing.call(pcTable, td);
            if (!noColorize) {
                pcTable._colorizeElement(tdNew, pcTable_COLORS.blured);
                goToFunc(event && event.altKey ? 'right' : (event && event.shiftKey ? 'down' : false))
            }
        };
        let revert = function (goTo) {
            pcTable._removeEditing.call(pcTable, td);
            goToFunc(goTo)
        };

        let isGroupSelected, isMultiGroupSelected;

        if (pcTable.isSelected(field.name, item.id)) {
            if (Object.keys(pcTable.selectedCells.ids).length > 1) {
                isMultiGroupSelected = true;
                isGroupSelected = true;
            } else if (pcTable.selectedCells.ids[field.name].length > 1) {
                isGroupSelected = true;
            }
        } else {
            pcTable.selectedCells.empty();
        }


        let save = function (editVal, event, confirmed) {

            if (!confirmed && (field.warningEditPanel) && field.checkEditRegExp.call(field, editVal)) {
                App.confirmation((field.warningEditText || 'Точно изменить?'), {
                    'ОК': function (dialog) {
                        save(editVal, event, true);
                        dialog.close();
                    },
                    'Отменить': function (dialog) {
                        revert();
                        dialog.close();
                    }
                }, 'Предупреждение при изменении');
                return;
            }

            td.html('<div class="text-center"><i class="fa fa-spinner"></i></div>');
            let editedData = {};
            editedData[field.name] = editVal;

            let EdData = {};
            if (!item.id) {
                EdData['params'] = editedData;
            } else {
                EdData[item.id] = editedData;
            }

            if (false && field.category === 'filter') {
                let filterData = {};
                $.each(pcTable.fieldCategories.filter, function (k, v) {
                    filterData[v.name] = pcTable.data_params[v.name].v;
                });
                filterData[field.name] = editVal;

                pcTable.model.calculateFilters(filterData, field.name).then(function (json) {
                    pcTable._refreshFiltersBlock.call(pcTable, json)
                });
            } else {
                pcTable._saveEdited.call(pcTable, td, EdData, function () {
                    goToFunc(event && event.altKey ? 'right' : (event && event.shiftKey ? 'down' : false))
                });
            }
        };


        let blurClbck = function ($input, event) {
            setTimeout(function () {
                if (onAction) {
                    onAction = false;
                    return false;
                }
                saveClbck($input, event);

            }, 150)
        };

        let saveClbck = function ($input, event, isFromButton) {
            if (onAction && !isFromButton) return false;

            onAction = true;

            isFromButton = isFromButton || false;
            if (!isFromButton) {
                if (isGroupSelected) {
                    return false;
                }
            }

            let td = $input.closest('td');
            let editVal;
            try {
                editVal = field.getEditVal(input);
            } catch (error) {
                let notify = $('#' + App.popNotify(error, td, 'default'));
                notify.css('z-index', 1000);
                onAction = false;
                return;
            }

            let item = pcTable._getItemBytd(td);

            let goTo = event && event.altKey ? 'right' : (event && event.shiftKey ? 'down' : false);

            if (!field.name in item || !field.isDataModified(editVal, item[field.name].v)) {
                revert(goTo);
            } else {
                save(editVal, event);

            }

        };


        var input = field.getEditElement(undefined, oldval, item, saveClbck, escClbck, blurClbck, null, editNow);

        if (oldval.f && oldval.f.placeholder && field.addPlaceholder) {
            field.addPlaceholder(input, oldval.f.placeholder)
        }


        td.html(input);
        td.attr('data-fieldtype', field.type)
        td.data('SaveMe', function (event) {
            event = event || {};
            saveClbck(input, event);
        });

        td.data('input', input);

        var cdiv = $('<div class="cdiv">').css({height: 0, width: '100%', 'position': 'absolute', bottom: '0px'});
        td.append(cdiv);


//Сохранить
        var $btn = $('<button class="btn btn-sm btn-default" data-save="true" data-name="Сохранить"><i class="fa fa-save"></i></button>')
            .data('click', function (event) {
                onAction = true;
                saveClbck(input, event, true);
            });

        editCellsBlock.append($btn)
        //Отменить
        var $btn = $('<button class="btn btn-sm btn-default btn-empty-with-icon"><i class="fa fa-times"></i></button>')
            .data('click', function (event) {
                onAction = true;
                let goTo = event.altKey ? 'right' : (event.shiftKey ? 'down' : false);
                revert(goTo)
            });

        editCellsBlock.append($btn);

        if (isGroupSelected && (isMultiGroupSelected ? field.editGroupMultiColumns : field.editGroup)) {


            $btn = $('<button class="btn btn-sm btn-warning" data-save="true" data-name="Применить к выделенным"><i class="fa fa-database" title="Применить к выделенным"></i></button>');

            let comboSave = function () {

                onAction = true;
                let editVal;
                try {
                    editVal = field.getEditVal(input);
                } catch (error) {
                    App.popNotify(error, td, 'default');
                    return;
                }
                let selectedTd = pcTable._container.find('td.selected');
                pcTable._setTdSaving(selectedTd);
                let editedData = pcTable.selectedCells.getEditedData(editVal);
                pcTable._saveEdited.call(pcTable, selectedTd, editedData, false);
            };


            $btn.data('click', function () {
                if (field.warningEditPanel) {
                    App.confirmation(field.warningEditText, {
                        'ОК': function (dialog) {
                            comboSave();
                            dialog.close();
                        },
                        'Отменить': function (dialog) {
                            revert();
                            dialog.close();
                        }
                    }, 'Предупреждение при изменении');
                    return;
                }
                comboSave();

            });
            editCellsBlock.append($btn);

            if (field.code && !field.codeOnlyInAdd) {

                if (Object.keys(pcTable.selectedCells.ids).some((field) => {
                    return pcTable.selectedCells.ids[field].some((id) => {
                        return !pcTable.data[id][field].h;
                    })
                })) {
                    $btn = $('<button class="btn btn-sm btn-warning" data-name="Фиксировать выделенные"><i class="fa fa-hand-rock-o" title="Фиксировать"></i></button>');
                    $btn.data('click', function () {
                        onAction = true;
                        let selectedTd = pcTable._container.find('td.selected');
                        pcTable._setTdSaving(selectedTd);
                        let editedData = pcTable.selectedCells.getEditedData(null, true);
                        pcTable._saveEdited.call(pcTable, selectedTd.closest('tr'), editedData, false);
                    });
                    editCellsBlock.append($btn);
                }
                if (Object.keys(pcTable.selectedCells.ids).some((field) => {
                    return pcTable.selectedCells.ids[field].some((id) => {
                        return pcTable.data[id][field].h;
                    })
                })) {
                    $btn = $('<button class="btn btn-sm btn-danger" data-name="Сбросить ручные"><i class="fa fa-eraser" title="Сбросить ручные"></i></button>');
                    $btn.data('click', function () {
                        onAction = true;
                        let selectedTd = pcTable._container.find('td.selected');
                        pcTable._setTdSaving(selectedTd);
                        let editedData = pcTable.selectedCells.getEditedData('NULL');
                        editedData['setValuesToDefaults'] = true;
                        pcTable._saveEdited.call(pcTable, selectedTd.closest('tr'), editedData, false);
                    });
                    editCellsBlock.append($btn)
                }
            }

        } else if (item[field.name] && item[field.name].h == true) {
            $btn = $('<button class="btn btn-sm btn-danger" data-name="Сбросить ручное"><i class="fa fa-eraser" title="Сбросить ручное"></i></button>');
            $btn.data('click', function () {
                onAction = true;
                td.html('<div class="text-center"><i class="fa fa-spinner"></i></div>');
                let editedData = {};
                if (!parseInt(itemId)) itemId = 'params';
                editedData[itemId] = {};
                editedData[itemId][field.name] = 'NULL';

                editedData['setValuesToDefaults'] = true;
                pcTable._saveEdited.call(pcTable, td, editedData, false);
            });
            editCellsBlock.append($btn)
        } else if (field.code && !field.codeOnlyInAdd && field.category !== 'filter') {
            $btn = $('<button class="btn btn-sm btn-default" data-name="Фиксировать"><i class="fa fa-hand-rock-o" title="Фиксировать"></i></button>');
            $btn.data('click', function () {
                onAction = true;
                td.html('<div class="text-center"><i class="fa fa-spinner"></i></div>');
                let editedData = {};
                if (!parseInt(itemId)) itemId = 'params';
                editedData[itemId] = {};
                editedData[itemId][field.name] = itemId === 'params' ? pcTable.data_params[field.name]['v'] : pcTable.data[itemId][field.name]['v'];

                pcTable._saveEdited.call(pcTable, td, editedData, false);
            });
            editCellsBlock.append($btn)
        }

        if (field.changeSelectTable && field.type === 'select') {

            let sourceBtnClick = function () {
                onAction = true;
                sourcePanelOpened = true;
                setTimeout(() => {
                    input.click();
                }, 3)

                let isAdd = $(this).data('add-button');

                field.sourceButtonClick(item, isAdd).then((data) => {
                    let isAdded = (data && data.method === 'insert' && data.json && data.json.chdata && data.json.chdata.rows);
                    let inputOld = input;
                    delete field.list;
                    if (inputOld.data('input').data('LISTs')) {
                        inputOld.data('input').data('LISTs').isListForLoad = true;
                    }
                    item = $.extend(true, {}, item);
                    if (isAdded) {

                        if (field.multiple) {
                            item[field.name].v = field.getEditVal(input);
                            item[field.name].v.push(Object.keys(data.json.chdata.rows)[0]);
                        } else {
                            item[field.name].v = Object.keys(data.json.chdata.rows)[0];
                        }

                    }

                    if (!isAdded && field.category === 'column') {
                        pcTable.model.refresh(function (json) {
                            pcTable.table_modify.call(pcTable, json);
                        });
                    }
                    item[field.name].replaceViewValue = function (viewArray) {
                        if (field.category != 'column') {
                            pcTable.data_params[field.name].v_ = viewArray;
                        }
                    };
                    inputOld.replaceWith(input = field.getEditElement(inputOld, item[field.name], item, saveClbck, escClbck, blurClbck));
                    onAction = false;
                })
                return false;
            };

            $btn = $('<button class="btn btn-sm btn-primary"><i class="fa fa-edit" title="Изменить в таблице-источнике"></i></button>');
            $btn.on('click', sourceBtnClick);
            editCellsBlock.append($btn);
            if (field.changeSelectTable === 2) {
                $btn = $('<button class="btn btn-sm btn-primary" data-add-button="true"><i class="fa fa-plus" title="Добавить в таблицу-источник"></i></button>');
                editCellsBlock.append($btn);
                $btn.on('click', sourceBtnClick);
            }
        }
        let btnCount = editCellsBlock.find('button').length;
        editCellsBlock.width(btnCount * 31);


        //  let element = $('#' + App.popNotify(editCellsBlock, cdiv, null, this._container));
        let element = $('#' + App.popNotify({
            $text: editCellsBlock,
            element: cdiv,
            container: this._container,
            isParams: true,
            placement: 'bottom'
        }));

        let top = parseInt(element.css('top')) - 4;
        element.css('top', -10000000);
        setTimeout(function () {
            if (element.length && element.isAttached()) {
                element.css('top', top);
            }
        }, 3);
        field.focusElement(input);
    }
});