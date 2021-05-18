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

        let firstLoad;
        try {
            firstLoad = cell.data('firstLoad')['data_src']['v'];
        } catch (e) {
        }


        let formFill = function (oldValueParam) {

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
                    let divInput = field.__addInput.call(field, fName, fieldSettings, thisValue, item, clback);

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

                    return divInput;
                };


                let fieldType = 'string';
                if (oldValueTmp.type) {
                    fieldType = oldValueTmp.type.Val || oldValueTmp.type;
                }

                let editorsRefresh = function () {
                    dialog.find('.codeEditor, .HTMLEditor').each(function () {
                        if ($(this).data('editor')) {
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


                    let typeInput = addInput('type', fieldsList, fieldsLevelFuncs).find('select');

                    typeInput.on('change', function () {
                        addfields($(this).val())
                    });

                    fieldsList.forEach(function (fName) {
                        addInput(fName, fieldsList, fieldsLevelFuncs);
                    });

                    editorsRefresh();

                }

                addfields(fieldType);
            })
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
                                    throw 'Ошибка структуры поля';
                                }
                            } catch (err) {
                                App.notify('Ошибка структуры поля ' + nameField);
                                throw 'Ошибка структуры поля';
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

        if (!editNow) {
            div.data('checkVal', save);
        }

        buttons = [
            {
                'label': "Сохранить",
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
                title: 'Параметры поля <b>' + (item.title.v) + '</b>',
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


            div.text('Редактирование в форме').addClass('edit-in-form');
        } else {
            /*let clicked = false;
            div.on('focus click', 'button', function () {
                if (clicked) return;
                clicked = true;

                var div = $(this).closest('div');
                window.top.BootstrapDialog.show({
                    message: dialog,
                    type: BootstrapDialog.TYPE_DANGER,
                    cssClass: 'fieldparams-edit-panel',
                    title: 'Параметры поля <b>' + (item.title.v) + '</b>',
                    buttons: buttons,
                    draggable: true,
                    size: BootstrapDialog.SIZE_WIDE,
                    onhide: function (event) {
                        escClbk(div, event);
                        $('body').off(eventName);
                        clicked = false;
                    },
                    onshown: function (dialog) {
                        dialog.$modalDialog.width(1000);
                        dialog.$modalHeader.css('cursor', 'pointer')
                        formFill(oldValueParam.v);
                        $('body').on(eventName, function (event) {
                            save(dialog);
                        });
                    }
                })
            });

            let btn = $('<button class="btn btn-danger btn-sm text-edit-button">').text('Редактировать параметры');
            if (tabindex) btn.attr('tabindex', tabindex);

            div.append(btn);*/

            formFill(oldValueParam.v)
            div.append(form)
            div.addClass('fieldparams-edit-panel')
        }

        return div.data('val', oldValueParam.v).data('input', form);//.attr('data-category', category).attr('data-category', category);

    },
    __addInput: function (fName, f, Val, item, callback) {
    
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
                })

                break;

            case 'string':
                element = $('<input>').val(oldValue !== undefined ? oldValue : (f.default ? f.default : ''));

                break;
            case 'json':
                element = $('<div class="JSONEditor">').height(500).on('blur', callback);
                var editor = new JSONEditor(element.get(0), {});
                var btn = $('<a href="#" style="padding-top: 5px; display: inline-block; padding-left: 20px;">Вручную</a>').on('click', function () {
                    var div = $('<div>');
                    var textarea = $('<textarea class="form-control" style="height: 250px;">').val(JSON.stringify(editor.get(), null, 2)).appendTo(div);


                    BootstrapDialog.show({
                        message: div,
                        type: null,
                        title: 'Ручное изменение json-поля',
                        buttons: [
                            {
                                'label': "Сохранить",
                                cssClass: 'btn-m btn-warning',
                                action: function (dialog) {
                                    try {
                                        editor.setText(textarea.val());
                                        dialog.close();
                                    } catch (e) {
                                        window.top.App.modal('Ошибка формата JSON')
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
                    let btn2 = $('<a href="#" style="padding-top: 5px; display: inline-block; padding-left: 20px;">Заполнить настройками по умолчанию</a>');
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
                .append('<a href="http://docs.totum.online/fields#fields-settings-' + fName + '" target="_blank"><i class="fa fa-question-circle-o"></i></a>'));
            input.addClass('checkbox');
            $switcher = element;
            if (!element.is(':checked')) {
                Val.isOnCheck = false;
                input.addClass('disabled');
            }
        } else {
            input.prepend($('<label class="field-param-lable">').html(title)
                .append('<a href="http://docs.totum.online/fields#fields-settings-' + fName + '" target="_blank"><i class="fa fa-question-circle-o"></i></a>'));

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
    },
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
    },
    getPanelText: function (fieldvalue) {
        let data = {};
        return JSON.stringify(fieldvalue, null, 2);
        /*
        Object.keys(fieldvalue).forEach(function (k) {
            let v = fieldvalue[k];
            if (v.isOn) data[k] = v.Val;
        });
        return JSON.stringify(data, null, 2);*/
    },
    getCellText: function (fieldValue) {
        return 'Настройки поля';
    }
})
;