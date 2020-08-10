fieldTypes.json = {

    __addInput: function (fName, f, oldValue) {
        var f = f || {};
        var type = f.type || typeof oldValue[fName];
        var width = 12;
        if (type == 'checkbox') width = 3;
        if (f.width) width = f.width;
        var input = $('<div class="field form-group">').attr('data-name', fName).addClass('col-sm-' + width);


        var element;

        switch (type) {
            case 'string':
                element = $('<input>').val(oldValue[fName] ? oldValue[fName] : (f.default ? f.default : ''));
                break;
            case 'json':
                element = $('<div class="JSONEditor">').height(300);
                var editor = new JSONEditor(element.get(0), {});
                var btn = $('<a href="#">editText</a>').on('click', function () {
                    var div = $('<div>');
                    var textarea = $('<textarea class="form-control" style="height: 250px;">').val(JSON.stringify(editor.get(), null, 2)).appendTo(div);
                    div.dialog({
                        title: 'Содержимое JSON-поля',
                        width: 500,
                        height: 600,
                        buttons: {
                            'Сохранить': function () {
                                editor.setText(textarea.val());
                                div.dialog('close')
                            },
                            'Закрыть': function () {
                                div.dialog('close')
                            }
                        }
                    });
                    return false;
                });
                element.find('.jsoneditor-menu').append(btn);

                element.data('editor', editor);
                editor.set(oldValue[fName] ? oldValue[fName] : (f.default ? JSON.parse(f.default) : {}));
                break;
            case 'html':
                element = $('<div class="HTMLEditor">').height(300);
                var el = $('<div>').appendTo(element);
                var editor = CodeMirror(el.get(0), {
                    value: (oldValue[fName] ? oldValue[fName] : (f.default ? f.default : "")),
                    mode: "text/html",
                    height: '250px',
                    readOnly: false,
                    theme: 'eclipse',
                    lineNumbers: true,
                    gutter: true,
                    indentWithTabs: true,
                    autoCloseTags: true
                });
                setTimeout(function () {
                    editor.refresh()
                }, 20);
                element.data('editor', editor);
                break;
            case 'integer':
                element = $('<input>').val(oldValue[fName] ? oldValue[fName] : (f.default ? f.default : "")).attr('type', 'number');
                if (f.min !== undefined) element.attr('min', f.min);
                if (f.max !== undefined) element.attr('max', f.max);
                if (f.step !== undefined) element.attr('step', f.step);
                break;
            case 'checkbox':
                element = $('<input>').attr('type', 'checkbox');
                if (oldValue[fName]) element.prop('checked', true);
                else if (oldValue[fName] === undefined) element.prop('checked', true);

                break;
            case 'select':
                element = $('<select>');
                if (f.values) {
                    $.each(f.values, function (k, v) {
                        element.append($('<option>').attr('value', k).text(v));
                    })
                }

                if (oldValue[fName]) element.val(oldValue[fName]);
                else if (oldValue[fName] === undefined && f.default) element.val(f.default);
                break;
        }
        if (type == 'checkbox') {
            input.prepend($('<label>').text(f.title ? f.title : fName).addClass('form-check-label'));
            if (element) {
                element.data('type', type)
                input.find('label').prepend(element);
            }
            // input.addClass('checkbox');
        }
        else {
            input.prepend($('<label>').text(f.title ? f.title : fName));
            if (element) element.data('type', type).addClass('form-control');
            input.append(element);
        }

        input.data('type', type);

        var button = $(' <span>*</span>');

        if (f.required) {
            button.addClass('text-danger');
        } else {
            button.text('');
            button.addClass('glyphicon glyphicon-remove remove');
            button.on('click', function () {
                var field = $(this).closest('.field');
                var name = field.data('name');
                field.remove();
                //TODO - not worked
                /* var elseFields=$(this).closest('.jsonForm').parent().find('.elseFields select');
                 elseFields.append('<option name="' +name+ '">' +name+ '</option>');*/
            })
        }


        input.find('label').after(button);
        return input;
    },

    getEditElement: function ($oldInput, oldValueParam, item, enterClbk, escClbk, blurClbk) {

        var field = this;
        var div = $('<div>');
        var dialog = $('<div>').css('min-height', 200);
        var buttons;
        var form = $('<div class="jsonForm row">').appendTo(dialog);
        div.data('form', form);
        div.data('field', this);


        var format = this.jsonFields;
        var oldValue = oldValueParam || {};

        if (typeof oldValue == 'string') oldValue = JSON.parse(oldValue);

        var addInput = function (fName) {
            var input = field.__addInput(fName, format[fName], oldValue);
            form.append(input);
        };

        var oldValueTmp = $.extend({}, oldValue);


        var emptyGroup = '';
        var elseFieldsLength = 0;
        var elseFields = {}
        elseFields[emptyGroup] = [];

        $.each(format, function (fName, fOpt) {
            if (fOpt.required == true || fOpt.showInForm == true) {
                addInput(fName);
                if (oldValueTmp[fName] !== undefined) delete oldValueTmp[fName];
            }
            else if (oldValueTmp[fName] === undefined) {
                var group = emptyGroup;
                if (fOpt.fGroup) {
                    group = fOpt.fGroup
                    if (!elseFields[fOpt.fGroup]) {
                        elseFields[fOpt.fGroup] = [];
                    }
                }
                elseFields[group].push(fName);
                elseFieldsLength++;
            }
        });

        $.each(oldValueTmp, function (k, v) {
            addInput(k)
        });

        if (elseFieldsLength) {
            var input = $('<div class="row elseFields">');
            let element = $('<select class="selectpicker form-control dropup" data-size="5" data-title="--Выбрать поле--">');

            if (App.keys(elseFields).length == 1) {
                $.each(elseFields[App.keys(elseFields)[0]], function (k, fName) {
                    element.append($('<option>').attr('value', fName).text(format[fName].title ? format[fName].title : fName));
                });
            }
            else {
                $.each(elseFields, function (group, fields) {
                    var group = $('<optgroup label="' + group + '">');
                    $.each(fields, function (k, fName) {
                        group.append($('<option>').attr('value', fName).text(format[fName].title ? format[fName].title : fName));
                    });
                    element.append(group);
                })
            }


            input.prepend($('<label>').text('Добавить поле'));
            element.addClass('form-control');

            input.append(element);
            element.selectpicker('render');
            element.on('change', function () {
                var f = $(this).val();
                element.find('option[value="' + f + '"]').remove();
                addInput(f);
            });

            dialog.append(input.wrap('<div style="padding:10px">').parent());
        }


        buttons = {

            "Сохранить": function () {

                var obj = {};
                var fullJSONEditor = form.find('.fullJSONEditor');
                if (fullJSONEditor.length == 1) {
                    obj = fullJSONEditor.data('editor').get();
                }
                else {

                    form.find('input, select, textarea, .JSONEditor, .HTMLEditor').not('.JSONEditor *').not('.HTMLEditor *').each(function () {
                        var element = $(this);
                        var nameField = element.closest('.field').data('name');


                        switch (element.closest('.field').data('type')) {
                            case "array":
                                try {
                                    obj[nameField] = element.data('editor').get();
                                    if (!$.isArray(obj[nameField])) {
                                        throw 'Ошибка структуры поля';
                                    }
                                }
                                catch (err) {
                                    App.notify('Ошибка структуры поля ' + nameField);
                                    throw 'Ошибка структуры поля';
                                }
                                break;
                            case "object":
                            case "json":
                                try {
                                    obj[nameField] = element.data('editor').get();
                                    if (typeof obj[nameField] !== "object") {
                                        throw 'Ошибка структуры поля';
                                    }
                                }
                                catch (err) {
                                    App.notify('Ошибка структуры поля ' + nameField);
                                    throw 'Ошибка структуры поля';
                                }
                                break;
                            case "html":
                                obj[nameField] = element.data('editor').getValue();
                                break;
                            case "checkbox":
                            case "boolean":
                                obj[nameField] = element.is(':checked') ? true : false;
                                break;
                            case "integer":
                                obj[nameField] = parseInt(element.val());
                                break;
                            default:
                                obj[nameField] = element.val();
                                break;
                        }


                    });
                }
                div.data('val', JSON.stringify(obj));

                enterClbk(div, event);
                dialog.remove();
            },
            "Закрыть": function () {
                dialog.dialog('close');
            }, "Редактор": function () {
                var height = form.height();
                var element = $('<div class="fullJSONEditor">').height(height + 100);
                var editor = new JSONEditor(element.get(0), {});
                editor.set(oldValue)
                var btn = $('<a href="#">editText</a>').on('click', function () {
                    var div = $('<div>');
                    var textarea = $('<textarea class="form-control" style="height: 250px;">').val(JSON.stringify(editor.get(), null, 2)).appendTo(div);
                    div.dialog({
                        title: 'Содержимое JSON-поля',
                        width: 500,
                        height: height + 100,
                        buttons: {
                            'Сохранить': function () {
                                editor.setText(textarea.val());
                                div.dialog('close')
                            },
                            'Закрыть': function () {
                                div.dialog('close')
                            }
                        }
                    });
                    return false;
                });
                form.empty().append(element);
                form.next().empty();
                element.data('editor', editor);
                element.find('.jsoneditor-menu').append(btn);
            }
        };

        if (item.id) {
            dialog.dialog({
                title: (item && item.id ? item.id : '') + ' ' + this.title
                , width: 700
                , modal: true
                , close: function (event) {
                    escClbk(div, event);
                    dialog.remove();
                },
                buttons: buttons
            });
            div.text('Редактирование в форме').addClass('edit-in-form');
        }
        else {
            div.on('focus click', 'button', function () {
                var div = $(this).closest('div');
                dialog.dialog({
                    title: field.title || field.name
                    , width: 700
                    , modal: true
                    , close: function (event) {
                        escClbk(div, event);
                        dialog.remove();
                    },

                    buttons: buttons
                });
            });
            div.append($('<button class="btn btn-default">').text(oldValueParam ? oldValueParam : 'Редактирование'))
        }

        return div.data('val', oldValueParam);

    },
    getEditVal: function (input) {
        return input.data('val');
    },
    getCellText: function (val) {
        return JSON.stringify(val);
    },
    focusElement: function (div) {
        var button = div.find('button');
        var field = this;
        if (button.length === 0) {
            setTimeout(function () {
                field.focusElement(div)
            }, 50)
        }
        else
            button.focus();

    }
    /*,
     getCellText: function(fieldValue){
     return $('<div>').text(fieldValue).height(30).css('textOverflow', 'ellipsis')
     }*/
};