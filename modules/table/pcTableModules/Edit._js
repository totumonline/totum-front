$.extend(App.pcTableMain.prototype, {
    _addEditable: function () {
        var pcTable = this;

        let arias = this._container;

        pcTable.actionOnClick = function (cell, field) {
            let newcell = cell.clone(true).insertAfter(cell);
            cell.hide();

            field = field || this._getFieldBytd(cell);
            newcell.html('<span class="cell-value blocked" style="height: ' + newcell.height() + '">' + App.translate('Running') + '</span>');

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
                blockFunc(cell, App.translate('Deleted'))
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

                        blockFunc(cell, App.translate('Blocked'))

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
        if ($td.data('clicked')) return Promise.resolve();

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
                let $spinner = $('<div class="text-center"><i class="fa fa-spinner"></i></div>');
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
                            } else if (field.openContextPanel) {
                                $td.trigger("contextmenu")
                            }
                            field.btnOK($td, item);
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
                        'OK': function (panel) {
                            panel.close();
                            func();
                        }, [App.translate('Cancel')]: function (panel) {
                            panel.close();
                        }
                    };

                let dialog = App.confirmation((field.warningEditText || App.translate('Surely to change?')), buttons, App.translate('Confirmation'));

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
                        field.btnOK($cell, item);
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
                App.confirmation((field.warningEditText || App.translate('Surely to change?')), {
                    'OK': function (dialog) {
                        save(editVal, event, true);
                        dialog.close();
                    },
                    [App.translate("Cancel")]: function (dialog) {
                        revert();
                        dialog.close();
                    }
                }, App.translate('Change warning'));
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
            let isFromEnterPress = isFromButton === 'enter';
            if (isFromEnterPress) {
                isFromButton = false;
            }
            isFromButton = isFromButton || false;
            if (!isFromButton) {
                if (isGroupSelected) {
                    if (!isFromEnterPress && (field.type !== 'select' || field.multiple)) {
                        pcTable._removeEditCell();
                    }
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
        var $btn = $('<button class="btn btn-sm btn-default" data-save="true" data-name="' + App.translate('Save') + '"><i class="fa fa-save"></i></button>')
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


            $btn = $('<button class="btn btn-sm btn-warning" data-save="true" data-name="' + App.translate('Apply to selected') + '"><i class="fa fa-database" title="' + App.translate('Apply to selected') + '"></i></button>');

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
                        'OK': function (dialog) {
                            comboSave();
                            dialog.close();
                        },
                        [App.translate("Cancel")]: function (dialog) {
                            revert();
                            dialog.close();
                        }
                    }, App.translate('Change warning'));
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
                    $btn = $('<button class="btn btn-sm btn-warning" data-name="' + App.translate('Fix the selected') + '"><i class="fa fa-hand-rock-o" title="' + App.translate('Fix the selected') + '"></i></button>');
                    $btn.data('click', function () {
                        onAction = true;
                        let selectedTd = pcTable._container.find('td.selected');
                        pcTable._setTdSaving(selectedTd);
                        pcTable.selectedCells.getEditedData(null, true).then((editedData) => {
                            pcTable._saveEdited.call(pcTable, selectedTd.closest('tr'), editedData, false);
                        });

                    });
                    editCellsBlock.append($btn);
                }
                if (Object.keys(pcTable.selectedCells.ids).some((field) => {
                    return pcTable.selectedCells.ids[field].some((id) => {
                        return pcTable.data[id][field].h;
                    })
                })) {
                    $btn = $('<button class="btn btn-sm btn-danger" data-name="' + App.translate('Reset manuals') + '"><i class="fa fa-eraser" title="' + App.translate('Reset manuals') + '"></i></button>');
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
            $btn = $('<button class="btn btn-sm btn-danger" data-name="' + App.translate('Reset manual') + '"><i class="fa fa-eraser" title="' + App.translate('Reset manual') + '"></i></button>');
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
            $btn = $('<button class="btn btn-sm btn-default" data-name="' + App.translate('Pin') + '"><i class="fa fa-hand-rock-o" title="' + App.translate('Pin') + '"></i></button>');
            $btn.data('click', function () {
                onAction = true;
                td.html('<div class="text-center"><i class="fa fa-spinner"></i></div>');
                let editedData = {};
                if (!parseInt(itemId)) itemId = 'params';
                editedData[itemId] = {};
                let item;
                item = itemId === 'params' ? pcTable.data_params : pcTable.data[itemId];

                editedData[itemId][field.name] = item[field.name]['v'];

                if (pcTable.fields[field.name].getValue) {
                    pcTable.fields[field.name].getValue(editedData[itemId][field.name], item, true).then((json) => {
                        editedData[itemId][field.name] = json.value;
                        pcTable._saveEdited.call(pcTable, td, editedData, false);
                    })
                } else {
                    pcTable._saveEdited.call(pcTable, td, editedData, false);
                }
            });
            editCellsBlock.append($btn)
        }

        if (field.changeSelectTable && field.type === 'select')
            (() => {
                let itemLocal = $.extend(true, {}, item);
                let sourceBtnClick = function () {
                    onAction = true;
                    sourcePanelOpened = true;
                    setTimeout(() => {
                        input.click();
                    }, 3)

                    let isAdd = $(this).data('add-button');

                    field.sourceButtonClick(itemLocal, isAdd).then((data) => {
                        if (!data) return;
                        let isAdded = (data && data.method === 'insert' && data.json && data.json.chdata && data.json.chdata.rows);
                        let inputOld = input;
                        delete field.list;
                        if (inputOld.data('input').data('LISTs')) {
                            inputOld.data('input').data('LISTs').isListForLoad = true;
                        }
                        if (isAdded) {
                            let addVal;
                            if (field.selectTableBaseField) {
                                addVal = data.json.chdata.rows[Object.keys(data.json.chdata.rows)[0]][field.selectTableBaseField].v;
                            } else {
                                addVal = Object.keys(data.json.chdata.rows)[0];
                            }

                            if (field.multiple) {
                                itemLocal[field.name].v = field.getEditVal(input);
                                itemLocal[field.name].v.push(addVal);
                            } else {
                                itemLocal[field.name].v = addVal;
                            }

                        } else if (field.selectTableBaseField) {
                            if (!field.multiple && data.json.chdata.rows[Object.keys(data.json.chdata.rows)[0]] && data.json.chdata.rows[Object.keys(data.json.chdata.rows)[0]][field.selectTableBaseField]) {
                                itemLocal[field.name].v = data.json.chdata.rows[Object.keys(data.json.chdata.rows)[0]][field.selectTableBaseField].v;
                            }
                        }

                        if (!isAdded && field.category === 'column') {
                            pcTable.model.refresh(function (json) {
                                pcTable.table_modify.call(pcTable, json);
                            });
                        }
                        itemLocal[field.name].replaceViewValue = function (viewArray) {
                            if (field.category != 'column') {
                                pcTable.data_params[field.name].v_ = viewArray;
                            }
                        };

                        inputOld.replaceWith(input = field.getEditElement(inputOld, itemLocal[field.name], itemLocal, saveClbck, escClbck, blurClbck));
                        onAction = false;
                    })
                    return false;
                };

                if (itemLocal[field.name].v && (!field.multiple || itemLocal[field.name].v.length)) {
                    $btn = $('<button class="btn btn-sm btn-primary"><i class="fa fa-edit" title="' + App.translate('Change in source table') + '"></i></button>');
                    $btn.on('click', sourceBtnClick);
                    editCellsBlock.append($btn);
                }
                if (field.changeSelectTable === 2) {
                    $btn = $('<button class="btn btn-sm btn-primary" data-add-button="true"><i class="fa fa-plus" title="' + App.translate('Add to source table') + '"></i></button>');
                    editCellsBlock.append($btn);
                    $btn.on('click', sourceBtnClick);
                }
            })();
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
    },
    editSingleFieldInPanel: function (field, id) {
        return new Promise((resolve, reject) => {
            let val = id ? this.data[id][field.name] : this.data_params[field.name];
            let format = this.getElementFormat(field, id);
            let td = $('<div>');
            let item = id ? this.data[id] : this.data_params;
            let special, editVal;

            let Dialog, input;

            let btns = [
                {
                    action: (dialog) => {
                        save();
                    },
                    cssClass: 'btn-warning btn-save',
                    label: App.translate('Save')
                }
            ];
            if (field.code && !field.codeOnlyInAdd) {
                if (val.h) {
                    btns.push({
                        action: (dialog) => {
                            special = 'setValuesToDefaults';
                            editVal = null;
                            save();
                        },
                        cssClass: 'btn-warning btn-save',
                        label: '<i class="fa fa-eraser"></i>'
                    })
                } else {
                    btns.push({
                        action: (dialog) => {
                            editVal = val.v;
                            save();
                        },
                        cssClass: 'btn-warning btn-save',
                        label: '<i class="fa fa-hand-rock-o"></i>'
                    })
                }

            }


            btns.push({
                action: (dialog) => {
                    dialog.close();
                },
                cssClass: '',
                label: '<i class="fa fa-times"></i>'
            })


            const save = (confirmed) => {
                if (editVal === undefined) {
                    try {
                        editVal = field.getEditVal(input);
                    } catch (error) {
                        let notify = $('#' + App.popNotify(error, td, 'default'));
                        notify.css('z-index', 1000);
                        return;
                    }
                    if (!field.isDataModified(editVal, val.v)) {
                        Dialog.close();
                        return;
                    }
                }
                if (!confirmed && (field.warningEditPanel) && field.checkEditRegExp.call(field, editVal)) {
                    App.confirmation((field.warningEditText || App.translate('Surely to change?')), {
                        'OK': function (_dialog) {
                            save(true);
                            _dialog.close();
                        },
                        [App.translate("Cancel")]: function (_dialog) {
                            revert();
                            _dialog.close();
                        }
                    }, App.translate('Change warning'));
                    return;
                }

                App.fullScreenProcesses.showCog();
                let editedData = {};
                editedData[field.name] = editVal;

                let EdData = {};
                if (!item.id) {
                    EdData['params'] = editedData;
                } else {
                    EdData[item.id] = editedData;
                }
                if (special) {
                    EdData[special] = true;
                }
                this.model.save(EdData)
                    .then(
                        (json) => {
                            resolve(json)
                            Dialog.close();
                        }
                    ).always(() => {
                    App.fullScreenProcesses.hideCog();
                });
            };

            const dialogShow = () => {
                Dialog = window.top.BootstrapDialog.show({
                    message: td,
                    type: null,
                    title: format.title || field.title,
                    cssClass: 'one-column-panel',
                    draggable: true,
                    buttons: btns,
                    onhidden: () => {
                        resolve();
                    }
                });
            };

            switch (field.type) {
                case 'tree':
                case 'text':
                case 'file':
                case 'comments':
                case 'listRow':
                    /*Показать широкое окно*/

                    input = field.getEditElement(td, val, id ? this.data[id] : this.data_params, () => {
                        save()
                    }, () => {
                    }, () => {
                    }, 1, true);
                    td.append(input);

                    setTimeout(() => {
                        Dialog = input.data('Dialog');
                        let saveBtn = Dialog.getButtons()[0].action;
                        btns[0].action = (dialog, event, notEnter) => {
                            saveBtn(dialog, event, notEnter);
                            save();
                        }

                        Dialog.setButtons(btns)

                    }, 2)

                    break;
                default:
                    /*Показать окно с полем*/

                    input = field.getEditElement(td, val, id ? this.data[id] : this.data_params, () => {
                        //save()
                    }, () => {
                    }, () => {
                    });
                    td.append(input);

                    dialogShow();
                    setTimeout(()=>input.focus(), 21);
                    break;
            }
        })
    }

});