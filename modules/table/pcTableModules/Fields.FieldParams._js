fieldTypes.fieldParams = $.extend({}, fieldTypes.json, {
    icon: 'fa-code',
    isPanelField: true,
    isDataModified: function (newVal, oldVal) {
        return !Object.equals(oldVal, newVal);
    },
    getEditVal: function (input) {
        if (input.data('checkVal')) {
            input.data('checkVal')();
        }
        return input.data('val');
    },
    getEditElement: function ($oldInput, oldValueParam, item, enterClbk, escClbk, blurClbk, tabindex, editNow, cell) {

        let field = this;
        let div = $('<div>');
        let dialog = $('<div>').css('min-height', 200);
        let form = $('<div class="jsonForm">').appendTo(dialog);
        if ($oldInput) {
            div = $oldInput;
            form = div.find('.jsonForm')
        }
        let buttons;

        div.data('form', form);
        div.data('field', this);

        let saved = false;
        let clback = function () {
            form.trigger('change');
        };


        App.tableTypes = App.tableTypes || {};

        let formFill = async function (oldValueParam) {
            if (!App.tableTypes[item['table_id']['v']]) {
                let type;
                if (item['table_id']['v'] != $('#table').data('pctable').tableRow.id) {
                    if (!field.pcTable.model.getTableParam) {
                        field.pcTable.model.getTableParam = function (tableId, type) {
                            return this.__ajax('post', {
                                method: 'getTableParam',
                                tableId: tableId,
                                param: type
                            })
                        }
                    }
                    let json = await field.pcTable.model.getTableParam(item['table_id']['v'], 'type')
                    type = json.type;
                } else {
                    type = $('#table').data('pctable').tableRow.type;
                }
                App.tableTypes[item['table_id']['v']] = type;
            }


            let jsonFields = field.jsonFields;
            let left, right;
            field.getValue(oldValueParam, item, !editNow).then(function (json) {
                    let oldValue = json.value;

                    if (typeof oldValue === 'string') oldValue = JSON.parse(oldValue);
                    let oldValueTmp = $.extend({}, oldValue);


                    let addInput = function (fName, fieldsList, fieldsLevelFuncs) {

                        let fieldSettings = jsonFields.fieldSettings[fName];
                        if (!fieldSettings) return false;

                        if (fieldSettings['categories']) {
                            if (fieldSettings['categories'].indexOf(item['category']['v']) === -1) return false;
                        }
                        if (fieldSettings['names']) {
                            if (fieldSettings['names'].indexOf(item['name']['v']) === -1) return false;
                        }
                        if (fieldSettings['tables']) {
                            if (fieldSettings['tables'].indexOf(App.tableTypes[item['table_id']['v']]) === -1) return false;
                        }


                        let thisValue = {};
                        if (oldValueTmp[fName] === undefined || oldValueTmp[fName].isOn === undefined) {
                            thisValue.isOn = oldValueTmp[fName] !== undefined;
                            thisValue.Val = oldValueTmp[fName];
                            if (thisValue.Val === undefined) {
                                thisValue.Val = fieldSettings.default;
                            }
                            if (!fieldSettings.parent && fieldSettings.type === 'checkbox' && thisValue.Val === true) {
                                thisValue.isOn = true;
                            }
                            oldValueTmp[fName] = thisValue;
                        } else {
                            thisValue = oldValueTmp[fName];
                        }


                        switch (fName) {
                            case 'codeSelect':
                                let treeSelectDefault = '=: selectRowListForTree(table: \'\'; field: \'\'; order: \'\' asc; where:  \'\' = ; parent: \'\'; disabled:)';
                                if (form.find('div[data-name="type"] select').val() === "tree") {
                                    if (thisValue.Val === fieldSettings.default)
                                        thisValue.Val = treeSelectDefault;
                                } else {
                                    if (thisValue.Val === treeSelectDefault)
                                        thisValue.Val = fieldSettings.default;
                                }
                                break;
                        }


                        let isHidden = false;

                        let parentSettings = jsonFields.fieldSettings[fieldSettings.parent];
                        let parentValue = oldValueTmp[fieldSettings.parent];


                        if (fieldSettings.parent && fieldsList.indexOf(fieldSettings.parent) !== -1) {
                            if (!parentValue || parentValue.isOnCheck !== true) {
                                isHidden = true;
                            }
                        }
                        thisValue.changed = function () {
                            "use strict";
                            if (this.isOnCheck === true) {
                                form.find('[data-parent="' + fName.toLowerCase() + '"]').show();
                            } else {
                                form.find('[data-parent="' + fName.toLowerCase() + '"]').hide().find('input[type="checkbox"]').prop('checked', false).trigger('change');
                            }
                        };


                        let divInput = field.__addInput.call(field, fName, fieldSettings, thisValue, item, clback, form);

                        if ((fieldSettings.align || 'center') !== 'center') {
                            if (!left) {
                                let middle = $('<div class="fParams-grid">');
                                left = $('<div>').appendTo(middle);
                                right = $('<div>').appendTo(middle);
                                form.append(middle)
                            }
                            if (fieldSettings.align === 'left') {
                                left.append(divInput);
                            } else {
                                right.append(divInput);
                            }
                        } else {
                            form.append(divInput);
                            left = right = null;
                        }

                        if (fieldSettings.parent) {
                            divInput.attr('data-parent', fieldSettings.parent.toLowerCase());
                            if (isHidden) {
                                divInput.hide();
                            }
                        }

                        let level = fieldsLevelFuncs[fName]();

                        divInput.css('padding-left', level * 19);


                        if (item['id'] && item['category']['v'] === 'column' && ['simple', 'cycles'].indexOf(App.tableTypes[item['table_id']['v']]) !== -1) {
                            if (fName === 'type' && oldValue.type.Val !== form.find('div[data-name="type"] select').val()) {
                                divInput.append('<div class="code-checkboxes-active-warning"><div class="code-checkboxes-warning-panel">' + App.translate('Recalculate all table rows after changing the field type') + '</div></div>');
                            } else if (fName === 'multiple') {
                                divInput.find('input[type="checkbox"]').on("change", () => {
                                    if (oldValue.multiple.Val !== form.find('div[data-name="multiple"] input').is(':checked')) {
                                        divInput.append('<div class="code-checkboxes-active-warning"><div class="code-checkboxes-warning-panel">' + App.translate('Recalculate all table rows after changing the field type') + '</div></div>');
                                    } else {
                                        divInput.find('.code-checkboxes-active-warning').remove()
                                    }

                                })
                            }
                        }

                        return divInput;
                    };


                    let fieldType = 'string';
                    if (oldValueTmp.type) {
                        fieldType = oldValueTmp.type.Val || oldValueTmp.type;
                    }

                    let editorsRefresh = function () {
                        dialog.find('.codeEditor, .HTMLEditor').each(function () {
                            if ($(this).data('editor') && $(this).data('editor').refresh) {
                                $(this).data('editor').refresh();
                            }
                        });
                    };

                    async function addfields(fieldType) {
                        let fieldsList;
                        form.empty();
                        if (item.table_id.v === '2' && (item.name.v === 'data_src' || item.name.v === 'data')) {
                            if (item.name.v === 'data') {
                                fieldsList = ['width', 'showInWeb'];
                            } else {
                                fieldsList = ['width', 'jsonFields', 'showInWeb', 'editable', 'insertable', 'required', 'logging', 'default', 'copyOnDuplicate'];
                            }
                            fieldType = 'fieldParams';
                        } else if (item.table_name && item.table_name.v === 'tables_vidgets' && (item.name.v === 'data_src' || item.name.v === 'data')) {
                            if (item.name.v === 'data') {
                                fieldsList = ['width', 'showInWeb'];
                            } else {
                                fieldsList = ['width', 'jsonFields', 'showInWeb', 'editable', 'insertable', 'required', 'logging', 'default', 'copyOnDuplicate'];
                            }
                            fieldType = 'fieldParams';
                        } else {
                            fieldsList = jsonFields.fieldListParams[fieldType];
                        }
                        if (fieldType === 'chart') {
                            if (!field.pcTable.chartTypes) {
                                field.pcTable.chartTypes = (await field.pcTable.model.getChartTypes())['chartTypes'];
                            }
                            jsonFields.fieldSettings['chartType'].values = {};
                            field.pcTable.chartTypes.map((type) => {
                                jsonFields.fieldSettings['chartType'].values[type.type] = type.title;
                            })

                        }


                        let fieldsLevelFuncs = {
                            type: function () {
                                return 0;
                            }
                        };
                        fieldsList.forEach(function (fieldName) {
                            let fSettings = jsonFields.fieldSettings[fieldName];
                            if (!fSettings.parent || fieldsList.indexOf(fSettings.parent) === -1) {
                                fieldsLevelFuncs[fieldName] = function () {
                                    return 0;
                                };
                            } else {
                                fieldsLevelFuncs[fieldName] = function () {
                                    return fieldsLevelFuncs[fSettings.parent]() + 1;
                                };
                            }

                        });

                        oldValueTmp['type'] = {
                            isOn: true,
                            Val: fieldType
                        };


                        let input = addInput('type', fieldsList, fieldsLevelFuncs);
                        let typeInput = input.find('select');

                        let beforeType = typeInput.val();
                        let isChanged = false;
                        typeInput.on('change', function () {
                            /*  if (beforeType !== $(this).val()) {

                                  let buttons = [
                                      {
                                          action: (dialog) => {
                                              isChanged = true;
                                              dialog.close();
                                              addfields($(this).val())
                                          },
                                          label: App.translate('Change')
                                      },
                                      {
                                          action: (dialog) => {
                                              dialog.close();
                                          },
                                          label: App.translate('Cancel')
                                      }

                                  ];

                                  window.top.BootstrapDialog.show({
                                      message: App.translate('On type change all field setting will be reset to ' + (item.id ? 'default' : 'saved') + '. If you want to save this changes — save field and change it\'s type after that'),
                                      type: null,
                                      title: App.translate('Warning'),
                                      buttons: buttons,
                                      onhidden: () => {
                                          if (!isChanged) {
                                              typeInput.val(beforeType)
                                              typeInput.trigger('change')
                                          }
                                      },
                                      draggable: true
                                  })
                              }*/

                            addfields($(this).val())
                        });

                        fieldsList.forEach(function (fName) {
                            let t = addInput(fName, fieldsList, fieldsLevelFuncs);
                        });

                        editorsRefresh();

                    }

                    addfields(fieldType);
                }
            )
        };


        const save = function (dialog) {

            /*Чтобы не дергать сохранение, когда открыт диалог*/
            if (!(dialog && dialog.close) && editNow) {
                return;
            }
            var obj = {};
            var fullJSONEditor = form.find('.fullJSONEditor');
            if (fullJSONEditor.length === 1) {
                obj = fullJSONEditor.data('editor').get();
            } else {

                form.find('input, select, textarea, .JSONEditor, .HTMLEditor, .codeEditor').not('.JSONEditor *').not('.HTMLEditor *').not('.codeEditor *').not('input[data-type="switcher"]').each(function () {
                    var element = $(this);
                    let val;
                    let field = element.closest('.field')
                    var nameField = field.data('name');
                    switch (element.closest('.field').data('type')) {
                        case 'code':
                            val = element.data('editor').getValue();
                            break;
                        case "json":
                            try {
                                val = element.data('editor').get();
                                if (typeof val !== "object") {
                                    throw App.translate('Field structure error');
                                }
                            } catch (err) {
                                App.notify(App.translate('Field %s structure error', nameField));
                                throw App.translate('Field structure error');
                            }
                            break;
                        case "html":
                            val = element.data('editor').getValue();
                            break;
                        case "checkbox":
                            val = !!element.is(':checked');
                            break;
                        case "integer":
                            val = parseInt(element.val());
                            break;
                        default:
                            val = element.val();
                            break;
                    }

                    let isOn;
                    isOnCheckbox = field.find('input[data-type="switcher"]');
                    if (isOnCheckbox.length === 0) {
                        isOn = element.is(':visible');
                    } else {
                        isOn = isOnCheckbox.is(':checked');
                    }
                    obj[nameField] = {
                        isOn: isOn,
                        Val: val
                    }
                });
            }
            div.data('val', obj);
            saved = true;
            if (dialog && dialog.close) {
                enterClbk(div, event);
                dialog.close();
            }
        };

        if (
            !editNow
        ) {
            div.data('checkVal', save);
        }

        buttons = [
            {
                'label': App.translate('Save') + ' Alt+S',
                cssClass: 'btn-m btn-warning',
                action: save
            }, {
                'label': null,
                icon: 'fa fa-times',
                cssClass: 'btn-m btn-default btn-empty-with-icon',
                'action': function (dialog) {
                    dialog.close();
                }
            }
        ];

        let eventName = 'ctrlS.FieldParams';


        if (editNow) {
            window.top.BootstrapDialog.show({
                message: dialog,
                type: BootstrapDialog.TYPE_DANGER,
                title: App.translate('Field <b>%s</b> parameters', item.title.v),
                buttons: buttons,
                cssClass: 'fieldparams-edit-panel',
                draggable: true,
                onhide: function (event) {
                    if (!saved) {
                        escClbk(div, event);
                    }
                    $('body').off(eventName);
                },
                onshown: function (dialog) {
                    formFill(oldValueParam.v);
                    dialog.$modalContent.position({
                        of: $('body'),
                        my: 'top+50px',
                        at: 'top'
                    })
                },
                onshow: function (dialog) {
                    dialog.$modalHeader.css('cursor', 'pointer')
                    $('body').on(eventName, function (event) {
                        setTimeout(() => {
                            save(dialog)
                        }, 10);
                        return false;
                    });
                }

            });


            div.text(App.translate('Editing in the form')).addClass('edit-in-form');
            setTimeout(() => {
                div.closest('td').css('background-color', '#ffddb4')
            })
        } else {
            formFill(oldValueParam.v)

            div.append(form)
            div.addClass('fieldparams-edit-panel')
            setTimeout(() => {
                let blocked = false;
                let insertPanel = div.closest('.InsertPanel');
                let versionVal = insertPanel.find('div[data-name="version"] select').val();
                insertPanel.on('keyup.jsonFormEvent change.jsonFormEvent', '.cell:not([data-name="data_src"]) input, .cell:not([data-name="data_src"]) select', function (event) {
                    if (!blocked) {
                        if ($(this).closest('[data-name="version"]').length && versionVal === $(this).val()) {
                            return;
                        }
                        blocked = true;
                        div.find('.jsonForm').prepend('<div id="fieldParamsLocker"><i class="fa fa-lock"></i><div class="unlock-click">' + App.translate('Click hear to unlock') + '</div></div>')
                        $('.jsonForm #fieldParamsLocker').one('click', () => {
                            $('.jsonForm #fieldParamsLocker').remove();
                            blocked = false;
                        });
                    }
                })
                div.find('.jsonForm').on('remove', () => {
                    insertPanel.off('jsonFormEvent')
                })

            })
        }

        return div.data('val', oldValueParam.v).data('input', form);//.attr('data-category', category).attr('data-category', category);

    },
    __addInput: function (fName, f, Val, item, callback, form) {

        let field = this;
        var f = f || {};
        var type = f.type;
        let oldValue;
        let isOn;

        oldValue = Val.Val;
        isOn = Val.isOn;


        var input = $('<div class="field form-group">').attr('data-name', fName);


        var element;
        let title = $('<span>').text(f.title ? f.title : fName);

        switch (type) {
            case 'code':

                element = $('<div class="codeEditor">');
                element.data('editor', true);
                setTimeout(() => {
                    var el = $('<div>').appendTo(element);
                    var editor = CodeMirror(el.get(0), {
                        value: (oldValue ? oldValue : (f.default ? f.default : "")),
                        mode: "totum",
                        height: '150px',
                        readOnly: false,
                        theme: 'eclipse',
                        lineNumbers: true,
                        gutter: false,
                        indentWithTabs: true
                    });
                    editor.on('blur', () => {
                        callback()
                    });
                    element.data('editor', editor);
                    editor.getScrollerElement().style.minHeight = '150px';

                    editor.table = item.table_name && item.table_name.v ? item.table_name.v : null;
                    editor.codeType = fName;
                    editor.cycle_id = field.pcTable.tableRow.cycle_id;

                    App.CodemirrorFocusBlur(editor)

                    if (fName == 'codeAction' && form.find('div[data-name="type"] select').val() !== 'button') {
                        if (!input.data('checking')) {
                            input.append('<div class="code-checkboxes-warning-panel">' + App.translate('There is no any active trigger.') + '</div>');
                            const checkWarningFunction = () => {
                                if (!input.is('.disabled') && input.next().find(':checked').length === 0) {
                                    input.addClass('code-checkboxes-active-warning')
                                } else {
                                    input.removeClass('code-checkboxes-active-warning')
                                }
                            }
                            checkWarningFunction();

                            input.data('checking', true)
                            input.parent().on('change', '[data-name="codeAction"] input,[data-name="CodeActionOnAdd"] input,[data-name="CodeActionOnChange"] input,[data-name="CodeActionOnDelete"] input,[data-name="CodeActionOnClick"] input', checkWarningFunction)
                        }
                    }

                })


                break;

            case 'string':
                element = $('<input>').val(oldValue !== undefined ? oldValue : (f.default ? f.default : ''));

                break;
            case 'json':
                element = $('<div class="JSONEditor">').height(500).on('blur', callback);
                var editor = new JSONEditor(element.get(0), {});
                var btn = $('<a href="#" style="padding-top: 5px; display: inline-block; padding-left: 20px;">' + App.translate('Manually') + '</a>').on('click', function () {
                    var div = $('<div>');
                    var textarea = $('<textarea class="form-control" style="height: 250px;">').val(JSON.stringify(editor.get(), null, 2)).appendTo(div);


                    BootstrapDialog.show({
                        message: div,
                        type: null,
                        title: App.translate('Manually changing the json field'),
                        buttons: [
                            {
                                'label': App.translate('Save'),
                                cssClass: 'btn-m btn-warning',
                                action: function (dialog) {
                                    try {
                                        editor.setText(textarea.val());
                                        dialog.close();
                                    } catch (e) {
                                        window.top.App.modal(App.translate('JSON format error'))
                                    }
                                }
                            }, {
                                'label': null,
                                icon: 'fa fa-times',
                                cssClass: 'btn-m btn-default btn-empty-with-icon',
                                'action': function (dialog) {
                                    dialog.close();
                                }
                            }
                        ],
                        cssClass: 'fieldparams-edit-panel',
                        draggable: true,
                        onhide: function (event) {
                            // escClbk(div, event);
                        },
                        onshown: function (dialog) {
                            dialog.$modalContent.position({
                                of: window
                            });
                        },
                        onshow: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer')
                            dialog.$modalContent.css({
                                width: 500
                            });
                        }

                    });
                    return false;
                });
                element.find('.jsoneditor-menu').append(btn);

                if (fName === 'chartOptions') {
                    let btn2 = $('<a href="#" style="padding-top: 5px; display: inline-block; padding-left: 20px;">' + App.translate('Fill in by the default settings') + '</a>');
                    btn2.on('click', () => {
                        let vl = $('div[data-name="chartType"] select').val();

                        field.pcTable.chartTypes.some((type) => {
                            if (type.type == vl) {
                                editor.setText(JSON.stringify(type.default_options));
                                return true
                            }
                        })

                        return false;
                    })
                    element.find('.jsoneditor-menu').append(btn2);
                }


                element.data('editor', editor);
                let ov = (typeof oldValue === 'string' ? JSON.parse(oldValue) : oldValue);
                editor.set(ov);
                break;
            case 'html':
                element = $('<div class="HTMLEditor">')
                element.data('editor', true);
                setTimeout(() => {
                    var el = $('<div>').appendTo(element);
                    var editor = CodeMirror(el.get(0), {
                        value: (oldValue ? oldValue : (f.default ? f.default : "")),
                        mode: "text/html",
                        height: '150px',
                        readOnly: false,
                        theme: 'eclipse',
                        lineNumbers: true,
                        indentWithTabs: true,
                        autoCloseTags: true
                    });
                    editor.on('blur', callback);
                    editor.getScrollerElement().style.minHeight = '150px',

                        element.data('editor', editor);
                });
                break;
            case 'integer':
                element = $('<input>').val(oldValue !== undefined ? oldValue : (f.default ? f.default : "")).attr('type', 'number');
                if (f.min !== undefined) element.attr('min', f.min);
                if (f.max !== undefined) element.attr('max', f.max);
                if (f.step !== undefined) element.attr('step', f.step);
                break;
            case 'checkbox':
                element = $('<input>').attr('type', 'checkbox').data('type', type);
                if (oldValue) element.prop('checked', true);
                //else if (oldValue === undefined) element.prop('checked', true);

                break;
            case 'select':
                element = $('<select>');
                if (f.values) {
                    let icons = f.valIcons || {};
                    let orders;
                    if (f.valuesOrder) {
                        orders = f.valuesOrder.slice(0);
                    }
                    if (fName === 'type') {
                        if (item.table_name && item.name && item.table_name.v === "tables_fields" && item.name.v === 'data_src') {
                            orders = ["fieldParams"]
                        }
                        $.each(orders, function (i, k) {
                            if (fieldTypes[k]) {
                                icons[k] = 'fa ' + fieldTypes[k].icon;
                            }
                        });
                    }

                    const addOption = function (k, v) {
                        let option = $('<option>').attr('value', k).text(v);
                        if (icons[k]) {
                            option.data('icon', icons[k]);
                        }
                        element.append(option);
                    };
                    if (orders) {
                        orders.forEach(function (valName) {
                            addOption(valName, f.values[valName])
                        })
                    } else {
                        $.each(f.values, addOption)

                    }

                }

                if (f.multiple) {
                    element.attr('multiple', 'multiple');
                    element.attr('size', '2');
                }
                element.css('visibility', 'hidden');
                element.outerHeight(34);

                let val = oldValue === undefined && f.default ? f.default : oldValue;

                setTimeout(function () {
                    element.selectpicker();
                    element.css('visibility', 'visible');
                }, 10);

                element.val(val);
                break;

        }
        let $switcher;
        Val.isOnCheck = true;


        if (type === 'checkbox') {
            input.prepend($('<label class="field-param-lable">').html(title)
                .addClass('form-check-label').prepend(element)
                .append('<a href="' + App.translate('PATH-TO-DOCUMENTATION') + 'fields#fields-settings-' + fName + '" target="_blank"><i class="fa fa-question-circle-o"></i></a>'));
            input.addClass('checkbox');
            $switcher = element;
            if (!element.is(':checked')) {
                Val.isOnCheck = false;
                input.addClass('disabled');
            }
        } else {
            input.prepend($('<label class="field-param-lable">').html(title)
                .append('<a href="' + App.translate('PATH-TO-DOCUMENTATION') + 'fields#fields-settings-' + fName + '" target="_blank"><i class="fa fa-question-circle-o"></i></a>'));

            if (element) {
                element.data('type', type);
                if (!element.data('editor')) {
                    element.addClass('form-control');
                    element.on('change', callback)
                }
                input.append(element);
            }


            if (f.required !== true) {
                $switcher = $('<input type="checkbox" data-type="switcher"/>');

                if (isOn) {
                    Val.isOnCheck = true;
                    $switcher.prop('checked', true);
                } else {
                    Val.isOnCheck = false;
                    input.addClass('disabled');
                }

                input.find('label').prepend($switcher).addClass("switcheble");
                input.addClass('checkbox');
            }
        }

        if ($switcher) {
            $switcher.on('change', function () {

                if ($(this).is(':checked')) {
                    if (Val.isOnCheck !== true) {
                        Val.isOnCheck = true;
                        input.removeClass('disabled');
                        Val.changed();
                        $(this).closest('div').find('.codeEditor, .HTMLEditor').each(function () {
                            if ($(this).data('editor')) {
                                $(this).data('editor').refresh();
                            }
                        });
                    }
                } else {
                    if (Val.isOnCheck !== false) {
                        Val.isOnCheck = false;
                        input.addClass('disabled');
                        Val.changed();
                    }
                }
                callback();
            });
        }


        input.data('type', type);
        return input;
    }
    ,
    getValue: function (value, item, isModulPanel) {
        "use strict";
        if (isModulPanel) {
            let def = $.Deferred();
            def.resolve({'value': (value || {})});
            return def;
        }
        let data = {'fieldName': this.name};
        if (item.id) {
            data['rowId'] = item.id;
        }
        return this.pcTable.model.getValue(data, this.table_id);
    }
    ,
    getPanelText: function (fieldvalue) {
        let data = {};
        return JSON.stringify(fieldvalue, null, 2);
        /*
        Object.keys(fieldvalue).forEach(function (k) {
            let v = fieldvalue[k];
            if (v.isOn) data[k] = v.Val;
        });
        return JSON.stringify(data, null, 2);*/
    }
    ,
    getCellText: function (fieldValue) {
        return App.translate('Field settings');
    }
})
;