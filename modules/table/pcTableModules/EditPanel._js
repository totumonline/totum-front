let panelId = 0;
window.EditPanel = function (pcTable, dialogType, inData, isElseItems, insertChangesCalcsFields = {}) {

    if (window.top !== window) return window.top.EditPanel.call(window.top, pcTable, dialogType, inData, isElseItems, insertChangesCalcsFields);
    let data = $.extend(true, {}, inData);

    let EditPanelFunc = this;
    EditPanelFunc.pcTable = pcTable;
    EditPanelFunc.panelId = 'panel' + (panelId++);

    let isEditFieldPanel = pcTable === 2 || (typeof pcTable === 'object' && pcTable.tableRow.id === 2);

    let $d = $.Deferred();

    this.$panel = $('<div class="InsertPanel">');
    this.isNewPanel = true;
    this.blockedFields = {};
    this.bootstrapPanel = null;


    let checkMethod = data.id ? 'checkEditRow' : 'checkInsertRow';
    let saveMethod = data.id ? 'saveEditRow' : 'add';
    this.panelType = data.id ? 'edit' : 'insert';
    this.editItem = data || {};
    $('body').trigger('pctable-opened', {'type': 'panel'});

    EditPanelFunc.resolved = false;
    EditPanelFunc.error = {};

    let firstLoad = {};


    this.checkRow = async function (val, isFirstLoad) {
        let self = this;
        const Check = () => {
            return new Promise(function (resolve, reject) {
                EditPanelFunc.pcTable.model[checkMethod](self.getDataForPost(val), Object.keys(insertChangesCalcsFields)).then(function (json) {
                    if (EditPanelFunc.panelType == 'edit' && isFirstLoad) {
                        firstLoad = $.extend(true, {}, json.row);
                    }
                    EditPanelFunc.editRow.call(EditPanelFunc, json);
                    resolve(EditPanelFunc);
                }).fail(reject);
            })
        }
        if (EditPanelFunc.beforeSave && !isFirstLoad) {
            if (val = await EditPanelFunc.beforeSave(val)) {
                return Check();
            }
        }
        return Check();
    };
    this.saveRow = function (panel, btn) {
        let postData = this.getDataForPost();
        EditPanelFunc.pcTable.model[saveMethod](postData)
            .then(function (json) {
                if (isEditFieldPanel) {
                    let mainTable = $('#table').data(pcTable_DATA_KEY);
                    if (mainTable && mainTable.tableRow.id == EditPanelFunc.editItem.table_id.v && postData.data_src.v && postData.data_src.v.width) {
                        mainTable.setColumnWidth(EditPanelFunc.editItem.name.v, postData.data_src.v.width.Val)
                    }
                }

                $d.resolve(json);
                EditPanelFunc.resolved = true;
                $(window.top.document.body).trigger('pctable-closed', {
                    'type': 'panel',
                    json: json,
                    method: EditPanelFunc.panelType,
                    tableId: EditPanelFunc.pcTable.tableRow.id
                });
                EditPanelFunc.bootstrapPanel.close();
            }).fail(function () {
            if (btn.length && btn.isAttached()) {
                let btn = panel.$modal.find('.btn-save').prop('disabled', false);
            }
        })
    };

    this.editRow = function (json) {

        "use strict";
        let isAnyEditableFields = false;
        EditPanelFunc.pcTable.f = json.f || {};
        EditPanelFunc.editItem.f = json.row.f || {};

        let column1 = this.$panel.find('>div:first'), column2 = this.$panel.find('>div:eq(2)'),
            column3 = this.$panel.find('>div:eq(3)'), columns = [];
        let allKoeffs = 0, nowKoeffs = 0, fCount = 0;
        const getKoeff = function (field) {
            return ['text', 'comments', 'file', 'listRow'].indexOf(field.type) !== -1 || field.multiple ? 1.5 : 1
        };

        if (!column1.length) {
            EditPanelFunc.pcTable.fieldCategories.panel_fields.forEach(function (field, index) {
                if (field.name === 'n') return;
                let format = $.extend({}, (EditPanelFunc.pcTable.f || {}), (EditPanelFunc.editItem.f || {}), (json.row[field.name].f || {}));
                if (format.hide && format.hide.extpanel) {
                    return;
                }
                allKoeffs += getKoeff(field);
                fCount++
            });
            allKoeffs /= 2;
            column1 = $('<div>').appendTo(this.$panel);
            columns['column1'] = column1;
            if (isEditFieldPanel) {
                column2 = $('<div>').appendTo(this.$panel);
                column3 = $('<div>').appendTo(this.$panel);
                columns['column2'] = column2;
                columns['column3'] = column3;
            } else if (fCount > 6) {
                column2 = $('<div>').appendTo(this.$panel);
                columns['column2'] = column2;
            } else {
                this.$panel.css('grid-template-columns', 'minmax(0, 1fr)');
            }

        }


        EditPanelFunc.pcTable.fieldCategories.panel_fields.forEach(function (field, index) {

            let cell = EditPanelFunc.$panel.find('div.cell[data-field-name="' + field.name + '"]');

            let Oldval = EditPanelFunc.editItem[field.name];
            EditPanelFunc.editItem[field.name] = json.row[field.name];

            if (EditPanelFunc.isEditable(field)) isAnyEditableFields = true;

            let format = $.extend({}, (EditPanelFunc.pcTable.f || {}), (EditPanelFunc.editItem.f || {}), (EditPanelFunc.editItem[field.name].f || {}));

            if (format.hide && format.hide.extpanel) {
                return;
            }

            if (cell.length) {
                if (cell.data('input') && !format.block) {
                    if (!Oldval || field.isDataModified(EditPanelFunc.editItem[field.name].v, Oldval.v) || field.codeSelectIndividual || (EditPanelFunc.panelType == 'insert' && field.code && !field.codeOnlyInAdd) || field.type === 'fieldParams') {

                        EditPanelFunc.createCell.call(EditPanelFunc, cell, field, index, format);
                    }
                } else {
                    EditPanelFunc.createCell.call(EditPanelFunc, cell, field, index, format)
                }
            } else {
                let divWrapper = $('<div class="cell-wrapper" style="position: relative">');


                let label = $('<label>').text(field.title || field.name).prependTo(divWrapper);
                if (field.unitType) {
                    label.text(label.text() + ', ' + field.unitType);
                }
                $('<div class="btns pull-right">').prependTo(divWrapper);


                let thisKoeff = getKoeff(field);
                divWrapper.attr('data-koeff', thisKoeff);

                if (field.type === 'fieldParams') {
                    this.$panel.append(divWrapper);
                    divWrapper.width('100%')
                    divWrapper.attr('data-name', field.name);
                    divWrapper.css({
                        'grid-column-start': 1,
                        'grid-column-end': 4
                    })
                    cell = EditPanelFunc.createCell.call(EditPanelFunc, cell, field, index, format, divWrapper);
                } else {
                    let clmn;
                    if (isEditFieldPanel) {
                        if (index === 0) {
                            this.$panel.prepend(divWrapper.css({
                                'grid-column-start': 1,
                                'grid-column-end': 4
                            }));

                        } else {
                            let cln = (Math.floor((index + 1) / 2));
                            if (index === 7)
                                cln = 3
                            clmn = columns['column' + cln];
                        }
                    } else if (nowKoeffs < allKoeffs && (nowKoeffs + thisKoeff) > allKoeffs) {
                        clmn = column1
                    } else if ((nowKoeffs + thisKoeff) <= allKoeffs) {
                        clmn = column1
                    } else if (!column2.length) {
                        clmn = column1
                    } else {
                        clmn = column2
                    }
                    if (clmn)
                        clmn.append(divWrapper);

                    nowKoeffs += thisKoeff;
                    cell = EditPanelFunc.createCell.call(EditPanelFunc, cell, field, index, format, divWrapper);
                }


                setTimeout(() => {
                    let cellWidth = divWrapper.find('.btns').width();
                    if (cellWidth > 0) {
                        cellWidth += 3;
                    }
                    label.css('max-width', 'calc(100% -  ' + cellWidth + 'px)');

                }, 2);

                if (field.linkToSelectTable) {
                    divWrapper.append('<div class="source-link"><a href="' + field.linkToSelectTable.link + '" style="font-size: 12px" target="_blank">' + field.linkToSelectTable.title + '</a></div>')
                }
            }


            if (format.hide && format.hide.panel) {
                cell.parent().css('display', 'none');
            } else {
                cell.parent().css('display', '');
            }
            cell.attr('data-field-name', field.name);
            cell.attr('data-field-type', field.type);

            if (EditPanelFunc.panelType === 'edit') {

                let testEdited = EditPanelFunc.editItem[field.name].v;
                let eq;
                if (field.type === 'fieldParams') {
                    eq = true;

                } else {
                    eq = Object.equals(firstLoad[field.name].v, testEdited);
                }


                if (!eq || firstLoad[field.name].h != EditPanelFunc.editItem[field.name].h) {
                    if (field.type === 'comments') {
                        if (typeof EditPanelFunc.editItem[field.name].v === 'string' && EditPanelFunc.editItem[field.name].v.length) {
                            cell.parent().addClass('edited');
                        } else {
                            cell.parent().removeClass('edited');
                        }
                    } else {

                        cell.parent().addClass('edited');
                    }
                } else {
                    cell.parent().removeClass('edited');
                }

                if (field.code && !field.codeOnlyInAdd) {
                    let button = cell.parent().find('.btns button.handled');
                    if (!button.length) {
                        button = $('<button class="btn btn-sm btn-default handled" tabindex="' + (index * 2 + 2) + '"></button>');
                        cell.parent().find('.btns').prepend(button);
                        if (EditPanelFunc.isEditable(field)) {
                            button.on('click', function () {
                                if (EditPanelFunc.editItem[field.name].h === true) {
                                    EditPanelFunc.editItem[field.name].h = false;
                                } else {
                                    EditPanelFunc.editItem[field.name].h = true;
                                }
                                EditPanelFunc.checkRow();
                            });
                            button.prop('disabled', false);
                        } else {
                            button.prop('disabled', 'disabled');
                            if (!EditPanelFunc.editItem[field.name].h) {
                                button.remove();
                            }

                        }
                    }
                    button.removeClass('btn-warning').addClass('btn-default');

                    button.html('<i class="fa fa-hand-grab-o"></i>');
                    if (EditPanelFunc.editItem[field.name].h) {
                        button.addClass('btn-warning').removeClass('btn-default');
                        if (Object.keys(EditPanelFunc.editItem[field.name]).indexOf('c') !== -1 && EditPanelFunc.editItem[field.name].c !== EditPanelFunc.editItem[field.name].v) {
                            button.html('<i class="fa fa-hand-paper-o"></i>');
                        }
                    }
                }
            } else if (field.code && !field.codeOnlyInAdd) {
                let btns = cell.parent().find('.btns');
                let hand = btns.find('.handled');

                if (insertChangesCalcsFields[field.name] && EditPanelFunc.editItem[field.name].h) {
                    if (hand.length === 0) {
                        hand = $('<button class="btn btn-sm btn-warning handled" tabindex="' + (index * 2 + 2) + '"><i class="fa fa-hand-paper-o pull-right"></button>').on('click', () => {
                            delete insertChangesCalcsFields[field.name];
                            EditPanelFunc.checkRow();
                        });
                        btns.prepend(hand);
                    }
                } else {
                    if (hand.length === 1) {
                        hand.remove();
                    }
                }
            }

        }, EditPanelFunc);

        if (EditPanelFunc.isNewPanel) {


            let title = '';
            if (this.panelType === 'edit') {
                let itemName;
                switch (EditPanelFunc.pcTable.tableRow.id) {
                    case 1:
                        if (EditPanelFunc.pcTable.tableRow.main_field && EditPanelFunc.pcTable.fields[EditPanelFunc.pcTable.tableRow.main_field]) {
                            let fieldName = EditPanelFunc.pcTable.tableRow.main_field;
                            itemName = (EditPanelFunc.editItem[fieldName] || json.row[fieldName]);
                            if (itemName) itemName = itemName.v;
                            itemName = ' "' + itemName + '"';
                        }
                        if (!itemName) {
                            itemName = 'id ' + (EditPanelFunc.editItem['id'] || json.row.id);
                        } else {
                            itemName = 'id ' + (EditPanelFunc.editItem['id'] || json.row.id) + ' ' + itemName;
                        }

                        if (!EditPanelFunc.pcTable.control.editing || (json.row.f.block && !isAnyEditableFields)) {
                            title = 'Просмотр настроек таблицы <b> ' + itemName + '</b>';
                        } else {
                            title = 'Редактирование настроек таблицы <b> ' + itemName + '</b>';
                        }
                        ;
                        break;
                    case 2:
                        if (EditPanelFunc.pcTable.tableRow.main_field && EditPanelFunc.pcTable.fields[EditPanelFunc.pcTable.tableRow.main_field]) {
                            let fieldName = EditPanelFunc.pcTable.tableRow.main_field;
                            itemName = (EditPanelFunc.editItem[fieldName] || json.row[fieldName]);
                            if (itemName) itemName = itemName.v;
                            itemName = ' "' + itemName + '"';
                        }
                        if (!itemName) {
                            itemName = 'id ' + (EditPanelFunc.editItem['id'] || json.row.id);
                        } else {
                            itemName = 'id ' + (EditPanelFunc.editItem['id'] || json.row.id) + ' ' + itemName;
                        }

                        if (!EditPanelFunc.pcTable.control.editing || (json.row.f.block && !isAnyEditableFields)) {
                            title = 'Просмотр поля таблицы ' + EditPanelFunc.editItem.table_name.v + '<b> ' + itemName + '</b>';
                        } else {
                            title = 'Редактирование поля таблицы ' + EditPanelFunc.editItem.table_name.v + ' <b> ' + itemName + '</b>';
                        }
                        ;
                        break;
                    default:
                        if (EditPanelFunc.pcTable.tableRow.main_field && EditPanelFunc.pcTable.fields[EditPanelFunc.pcTable.tableRow.main_field]) {
                            let fieldName = EditPanelFunc.pcTable.tableRow.main_field;
                            itemName = (EditPanelFunc.editItem[fieldName] || json.row[fieldName]);
                            if (itemName) itemName = itemName.v;
                            itemName = ' "' + itemName + '"';
                        }
                        if (!itemName) {
                            itemName = 'id ' + (EditPanelFunc.editItem['id'] || json.row.id);
                        } else {
                            itemName = 'id ' + (EditPanelFunc.editItem['id'] || json.row.id) + ' ' + itemName;
                        }

                        if (!EditPanelFunc.pcTable.control.editing || (json.row.f.block && !isAnyEditableFields)) {
                            title = 'Просмотр <b> ' + itemName + '</b> таблицы <b>' + EditPanelFunc.pcTable.tableRow.title + '</b>';
                        } else {
                            title = 'Редактирование <b> ' + itemName + '</b> таблицы <b>' + EditPanelFunc.pcTable.tableRow.title + '</b>';
                        }
                        ;
                }


            } else {
                switch (EditPanelFunc.pcTable.tableRow.id) {
                    case 1:
                        title = 'Добавление таблицы';
                        break;
                    case 2:
                        title = 'Добавление поля';
                        break;
                    default:
                        title = 'Добавление строки в таблицу <b>' + EditPanelFunc.pcTable.tableRow.title + '</b>';
                }

            }

            EditPanelFunc.cleateBootstrapPanel.call(EditPanelFunc, title, dialogType, (EditPanelFunc.type === 'insert' || isAnyEditableFields), fCount < 7 ? 'one-column-panel' : '');
            EditPanelFunc.isNewPanel = false;

        }

    };


    this.cleateBootstrapPanel = function (title, type, isEditable, cssClass) {
        let EditPanel = this;
        let buttons = [];
        let save;
        if (isEditable) {
            save = function (panel, event) {
                "use strict";
                if (Object.keys(EditPanelFunc.error).length) {
                    let fName = Object.keys(EditPanelFunc.error)[0];
                    let _error = EditPanelFunc.error[fName];

                    App.notify(_error, $('<div>Ошибка в поле </div>').append(' в поле ').append($('<span>').text(EditPanelFunc.pcTable.fields[fName].title)));
                    return false;
                }
                let btn = panel.$modal.find('.btn-save').prop('disabled', 'disabled');
                if (EditPanelFunc.beforeSave) {
                    EditPanelFunc.beforeSave();
                }
                setTimeout(function () {
                    EditPanelFunc.pcTable.model.doAfterProcesses(function () {
                        EditPanel.saveRow.call(EditPanel, panel, btn);
                    });
                }, 250)
            };
            buttons.push({
                action: save,
                cssClass: 'btn-warning btn-save',
                label: 'Cохранить'
            });
        }

        if (!isElseItems) {

            EditPanel.close = function () {
                EditPanel.bootstrapPanel.close();
            }

            buttons.push({
                action: EditPanel.close,
                'label': null,
                icon: 'fa fa-times',
                cssClass: 'btn-m btn-default btn-empty-with-icon',
            });


        } else {

            EditPanel.close = function () {
                $d.resolve(undefined, /*next*/true);
                $(window.top.document.body).trigger('pctable-closed', {'type': 'panel'});
                EditPanelFunc.resolved = true;
                EditPanel.bootstrapPanel.close();
            }

            buttons.push({
                action: EditPanel.close,
                'label': null,
                icon: 'fa fa-' + (isElseItems === true ? 'arrow-right' : 'times'),
                cssClass: 'btn-m btn-default btn-empty-with-icon',
            });


        }

        let eventName = 'ctrlS.EditPanel';

        EditPanel.bootstrapPanel = BootstrapDialog.show({
            type: type || null,
            size: BootstrapDialog.SIZE_WIDE,
            message: EditPanel.$panel,
            cssClass: 'edit-row-panel ' + (isEditFieldPanel ? 'edit-field-panel' : cssClass || ''),
            title: title,
            buttons: buttons,
            draggable: true,
            onhidden: function () {
                $('body').off(eventName);
                $d.resolve();
                if (!EditPanelFunc.resolved) {
                    $(window.top.document.body).trigger('pctable-closed', {'type': 'panel'});
                }
                $(window.top.document.body).off('.' + EditPanelFunc.panelId);
            },
            onshown: function (dialog) {
                "use strict";

                if (save) {
                    $('body').on(eventName, function (event) {
                        if ($('.bootstrap-dialog').length === 1) {
                            $(document.activeElement).blur();
                            save(dialog)
                        }
                    })
                }
                dialog.indexedButtons[Object.keys(dialog.indexedButtons)[0]].attr('tabindex', 500);
                if (Object.keys(dialog.indexedButtons).length === 2) {
                    dialog.indexedButtons[Object.keys(dialog.indexedButtons)[1]].attr('tabindex', 501);
                }
            }

        })
        if (EditPanel.bootstrapPanel.$modalFooter.find('.btn-save').length)
            EditPanel.saveButton = EditPanel.bootstrapPanel.$modalFooter.find('.btn-save');

    };

    this.createCell = function (cell, field, fieldIndex, format, divWrapper) {
        let item = EditPanelFunc.editItem || {};
        item[field.name] = item[field.name] || {};
        cell.removeClass('error');
        if (cell.length === 0) {
            cell = $("<div data-name='" + field.name + "' class='cell'>").appendTo(divWrapper);

            if (field.code) {
                cell.addClass('with-code');
            }
        } else {
            divWrapper = cell.parent();
        }

        let btns = divWrapper.find('.btns');
        btns.find('.select-btns').remove();

        if (!this.isEditable(field)) {
            EditPanelFunc.blockedFields[field.name] = true;

            let span = $('<div class="' + (field.type === 'button' ? 'link' : '') + ' ttm--panel-data">');
            if (field.type !== "button" && format.text) {
                span.text(format.text);
            } else {
                if (EditPanelFunc.editItem[field.name].v || field.type === 'button') {
                    span.append(field.getCellTextInPanel(EditPanelFunc.editItem[field.name].v, cell, EditPanelFunc.editItem, firstLoad));
                }
            }
            if (field.type !== "button") {
                if (format.comment) {
                    let i;
                    i = $('<i class="cell-icon fa fa-info"></i>');
                    span.prepend(i);
                    i.attr('title', format.comment)
                } else if (format.icon) {
                    span.prepend('<i class="cell-icon fa fa-' + format.icon + '"></i>');
                }
            }

            if (field.unitType) {
                span.append(' ' + field.unitType);
            }

            if (field.type === 'button' && EditPanelFunc.pcTable) {
                cell.on('click', function () {
                    EditPanelFunc.pcTable._buttonClick(cell, field, item).then(()=>{
                        if(field.closeIframeAfterClick){
                            EditPanelFunc.close();
                        }
                    });
                });
            } else {
                if (field.CodeActionOnClick && !divWrapper.find('.edit-btn').length) {
                    divWrapper.append($('<button class="btn btn-sm btn-default edit-btn" style="width: 100%"><i class="fa fa-hand-pointer-o"></i></button>').on('click', () => {
                        EditPanelFunc.pcTable.model.refresh = () => {
                            window.location.reload();
                        }
                        EditPanelFunc.pcTable.model.dblClick(item.id, field.name).then((json) => {
                        })
                    }))
                }
            }

            cell.html(span).data('input', null);

            return cell;
        }


        EditPanelFunc.blockedFields[field.name] = false;

        let getEditVal = async function ($input) {
            let editVal;
            try {
                editVal = field.getEditVal($input);
                cell.removeClass('error');
                delete EditPanelFunc.error[field.name];
            } catch (error) {
                if (field.name === 'name' && isEditFieldPanel) {
                    delete insertChangesCalcsFields['name'];
                    let editF = await EditPanelFunc.checkRow();
                    return editF.editItem['name'].v;

                } else {
                    EditPanelFunc.error[field.name] = error;
                    cell.addClass('error');

                    App.popNotify(error, $input, 'default');
                    return null;
                }
            }
            return editVal;
        };

        let onAction = false;

        let inFocus = cell.find('input,button').is(':focus');


        let saveClbck = async function ($input, event, onBlur) {
            onAction = true;
            let editValResult = await getEditVal($input);
            if (editValResult === null) {
                if (!Object.keys(EditPanelFunc.error).length)
                    EditPanelFunc.FocusIt.call(EditPanelFunc, fieldIndex);

            } else {
                if (!onBlur) {

                    EditPanelFunc.FocusIt.call(EditPanelFunc, fieldIndex + 1);
                }
                if (field.isDataModified(editValResult, EditPanelFunc.editItem[field.name].v)) {
                    let val = {};
                    val[field.name] = {
                        v: editValResult
                    };
                    if (field.code && !field.codeOnlyInAdd) {
                        val[field.name].h = true;
                    }
                    if (field.code && EditPanelFunc.panelType === 'insert') {
                        insertChangesCalcsFields[field.name] = true;
                    }
                    if (isEditFieldPanel) {
                        switch (field.name) {
                            case 'table_id':
                                delete insertChangesCalcsFields['version'];
                                break;
                        }
                    }
                    EditPanelFunc.checkRow(val);
                }
            }
            onAction = false;
        };
        let blurClbck = function ($input, event) {
            setTimeout(function () {
                if ($input && $input.length && $input.isAttached()) {
                    if (onAction) {
                        onAction = false;
                    } else {
                        saveClbck($input, event, true);
                    }
                }

            }, 40);
            return false;
        };
        let escClbck = function ($input, event) {

            saveClbck($input, event);
        };


        cell.data('firstLoad', firstLoad);
        let input = field.getEditElement(cell.data('input'), EditPanelFunc.editItem[field.name], EditPanelFunc.editItem, saveClbck, escClbck, blurClbck, 50 + fieldIndex, false, cell);

        if (isEditFieldPanel && field.type === 'fieldParams') {
            EditPanelFunc.beforeSave = async function (val) {
                let editValResult = await getEditVal(input);
                EditPanelFunc.editItem[field.name] = {
                    v: editValResult
                };
                if (val) {
                    val[field.name] = {
                        v: editValResult
                    }
                    return val;
                }
            }
        }

        if (!input.isAttached()) {
            cell.html(input)
        }
        cell.data('input', input);

        /* if (inFocus) {
             field.focusElement(input);
         }*/

        if (field['type'] === 'select' && field.changeSelectTable) {

            let sourseBtnClick = function () {
                let ee = EditPanelFunc.getDataForPost();
                let isAdd = $(this).is('.source-add');
                if (isAdd) {
                    ee[field.name] = null;
                }
                let opened = 0;
                $(window.top.document.body)
                    .on('pctable-opened.select-' + EditPanelFunc.panelId, function () {
                        opened++;
                    })
                    .on('pctable-closed.select-' + EditPanelFunc.panelId, function (event, data) {
                        opened--;
                        let isAdded = (data && /*data.tableId === field.selectTableId &&*/ data.method === 'insert' && data.json && data.json.chdata && data.json.chdata.rows);
                        const refreshInputAndPage = function () {
                            if (opened === 0 || isAdded) {
                                let inputOld = input;
                                delete field.list;
                                if (inputOld.data('input').data('LISTs')) {
                                    inputOld.data('input').data('LISTs').isListForLoad = true;
                                }
                                if (isAdded) {
                                    if (field.multiple) {
                                        EditPanelFunc.editItem[field.name].v.push(Object.keys(data.json.chdata.rows)[0]);
                                    } else {
                                        EditPanelFunc.editItem[field.name].v = Object.keys(data.json.chdata.rows)[0];
                                    }
                                }

                                inputOld.replaceWith(input = field.getEditElement(null, EditPanelFunc.editItem[field.name], EditPanelFunc.editItem, saveClbck, escClbck, blurClbck));
                                cell.data('input', input);
                                EditPanelFunc.checkRow();


                                if (!isAdd && EditPanelFunc.pcTable.isMain) {
                                    EditPanelFunc.pcTable.model.refresh(function (json) {
                                        EditPanelFunc.pcTable.table_modify.call(EditPanelFunc.pcTable, json);
                                    })
                                }
                                $('body').off('.select-' + EditPanelFunc.panelId);
                            }
                        };
                        setTimeout(refreshInputAndPage, 100);//Чтобы успело открыться окошко слещующей панели, если оно есть
                    });
                EditPanelFunc.pcTable.model.selectSourceTableAction(field.name, ee)
            };

            let selectBtns = $('<span class="select-btns">').appendTo(btns);
            let btn = $('<button class="btn btn-default-primary btn-sm"><i class="fa fa-edit"></i></button>');
            selectBtns.append(btn);
            btn.on('click', sourseBtnClick);

            if (field.changeSelectTable === 2) {
                let btn = $('<button class="btn btn-default-primary btn-sm source-add"><i class="fa fa-plus"></i></button>');
                selectBtns.append(btn);
                btn.on('click', sourseBtnClick);
            }
        }


        let preview;
        if (field.getEditPanelText && (preview = field.getEditPanelText(EditPanelFunc.editItem[field.name], EditPanelFunc.editItem, firstLoad))) {
            let textDiv = cell.find('.ttm--panel-data');
            if (!textDiv.length)
                textDiv = $('<div class="ttm--panel-data"/>').prependTo(cell);
            textDiv.html(preview);
            if (field.type === 'comments') {
                setTimeout(() => {
                    textDiv.scrollTop(20000);
                })
            }
        }

        return cell;
    };
    this.getDataForPost = function (val = {}) {
        let data = {};
        if (EditPanelFunc.editItem.id) {
            data.id = EditPanelFunc.editItem.id;
        }
        EditPanelFunc.pcTable.fieldCategories.panel_fields.forEach(function (f) {
            let editItem = val[f.name] || EditPanelFunc.editItem[f.name];

            if (f.type == 'comments') {
                if (editItem && typeof editItem.v !== 'string')
                    editItem.v = null;
            }

            if (editItem && EditPanelFunc.isEditable(f)) {
                data[f.name] = {};
                if (EditPanelFunc.panelType === 'edit') {
                    data[f.name].v = editItem.v;
                    if (f.code && !f.codeOnlyInAdd) {
                        data[f.name].h = editItem.h || false;
                    }
                    data[f.name].v = f.getPanelVal.call(f, data[f.name].v, EditPanelFunc.$panel.find('div.cell[data-field-name="' + f.name + '"]').data('input'));
                } else {
                    data[f.name] = editItem.v;
                    data[f.name] = f.getPanelVal.call(f, data[f.name], EditPanelFunc.$panel.find('div.cell[data-field-name="' + f.name + '"]').data('input'));
                }

            } else if (inData[f.name]) {
                if (EditPanelFunc.panelType === 'insert') {
                    data[f.name] = inData[f.name].v;
                }
            }
        });
        return data;
    };
    this.isEditable = function (field) {

        if (!EditPanelFunc.pcTable.control.editing) return false;
        let format = $.extend({}
            , (EditPanelFunc.pcTable.f || {})
            , (EditPanelFunc.editItem.f || {})
            , (EditPanelFunc.editItem[field.name].f || {})
        );

        if (format.block === true) return false;
        if (this.panelType === 'insert') return field.insertable;

        return field.editable;
    };

    let focusTimer;

    this.FocusIt = function (focusIndex) {
        return false;
        if (focusTimer) clearTimeout(focusTimer);
        focusTimer = setTimeout(function () {

            let isLastCell = true;

            if (!EditPanelFunc.$panel || !EditPanelFunc.$panel.length) return false;

            EditPanelFunc.pcTable.fieldCategories.panel_fields.forEach(function (field, index) {
                if (focusIndex === index) {
                    if (!EditPanelFunc.isEditable(field)) {
                        ++focusIndex;
                        return;
                    } else {
                        let input = EditPanelFunc.$panel.find('.cell[data-name="' + field.name + '"]').data('input');
                        if (input) {
                            field.focusElement(input);
                        }
                    }
                    isLastCell = false;
                    return false;
                }
            });
            if (isLastCell) {

                let buttonSave = EditPanelFunc.bootstrapPanel.indexedButtons[Object.keys(EditPanelFunc.bootstrapPanel.indexedButtons)[0]];
                buttonSave.focus();
            }
        }, 50);
    };


    const _refreshContentTable = () => {

    };

    if (typeof EditPanelFunc.pcTable !== 'object') {
        App.getPcTableById(EditPanelFunc.pcTable).then(function (pcTable) {
            EditPanelFunc.pcTable = pcTable;

            pcTable.isPanel = true;
            pcTable._refreshContentTable = _refreshContentTable;
            EditPanelFunc.checkRow({}, true);

            if (EditPanelFunc.editItem.id) {
                pcTable.model.setLoadedTableData({[EditPanelFunc.editItem.id]: {}});
            }
        });
    } else if (EditPanelFunc.pcTable[0]) {
        App.getPcTableById(EditPanelFunc.pcTable[0], {sess_hash: EditPanelFunc.pcTable[1]}).then(function (pcTable) {
            if (EditPanelFunc.pcTable[2]) {
                pcTable.model.setLoadedTableData(EditPanelFunc.pcTable[2]);
            }
            EditPanelFunc.pcTable = pcTable;
            pcTable.isPanel = true;
            pcTable._refreshContentTable = _refreshContentTable;
            EditPanelFunc.checkRow({}, true);
        });
    } else {
        EditPanelFunc.checkRow({}, true);
    }


    return $d.promise();
};