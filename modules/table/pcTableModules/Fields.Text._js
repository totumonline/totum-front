fieldTypes.text = {
    width: 50,
    icon: 'fa-align-left',
    type: 'Text',
    isPanelField: true,
    getEditVal: function (div) {
        var val = div.data('val').trim();
        return val;
    },
    getCellText: function (fieldValue) {
        if (fieldValue === null) return '';
        fieldValue = fieldValue.toString();

        let length = fieldValue.length;
        return $('<div>').text(fieldValue.substring(0, this.viewTextMaxLength) + (length > this.viewTextMaxLength ? '...' : '')).text();
    },
    getValue: function (value, item, isModulPanel) {
        "use strict";

        if (isModulPanel || (typeof value === 'string' && value.length < this.viewTextMaxLength && !this.notLoaded)) {
            let def = $.Deferred();
            setTimeout(function () {

                if (!value) value = '';

                def.resolve({'value': value})
            }, 20);
            return def;
        }

        let data = {'fieldName': this.name};
        if (item.id) {
            data['rowId'] = item.id;
        }
        return this.pcTable.model.getValue(data, this.table_id);
    },
    getPanelTextWithLinks: function (text, withCodeMirror = true) {
        let field = this, div;
        if (field.textType === 'text') {
            div = $('<div>');
            div.html(App.textWithLinks(text));
        } else {
            div = $('<div class="codeEditor">');
            if (text && text.trim()) {
                let field = this;
                let options = {
                    value: text,
                    mode: field.getMode(),
                    readOnly: true,
                    theme: 'eclipse',
                    lineNumbers: true,
                    lineWrapping: true,
                    bigOneDialog: true,
                    height: 200

                };
                if (withCodeMirror) {
                    setTimeout(function () {
                        let editor = CodeMirror(div.get(0), options);
                    }, 10);
                } else {
                    div.html(App.textWithLinks(text));
                }
                div.on('panel-resize', function () {
                    div.empty();
                    CodeMirror(div.get(0), options);
                })
            }
        }
        return div;
    },
    getHighCelltext: function (fieldValue, td, item) {
        if (typeof fieldValue !== 'string') return '';
        return $('<div>').text(fieldValue.trim());
    },
    getPanelText: function (fieldValue, td, item) {
        if (fieldValue === null) return '';
        fieldValue = fieldValue.toString();
        let field = this;

        if (fieldValue.length <= this.viewTextMaxLength && !this.notLoaded) return field.getPanelTextWithLinks(fieldValue, false).data('text', fieldValue);

        let def = $.Deferred();

        this.getValue(fieldValue, item, false).then(function (json) {
            def.resolve($('<div>').append(field.getPanelTextWithLinks(json.value, false)).data('text', json.value));
        }).fail(function () {
            def.reject();
        });

        return def.promise();
    },
    getMode() {
        let mode = 'text';
        switch (this.textType) {
            case 'html':
                mode = 'text/html';
                break;
            case 'totum':
                mode = 'totum';
                break;
            case 'markdown':
                mode = 'text/x-markdown';
                break;
            case 'xml':
                mode = 'application/xml';
                break;
            case 'css':
                mode = 'text/css';
                break;
            case 'javascript':
                mode = 'text/javascript';
                break;
        }
        return mode;
    },
    getEditElement: function ($oldInput, oldValueParam, item, enterClbk, escClbk, blurClbk, tabindex, editNow) {

        let field = this;
        let div = $('<div>');
        let dialog = $('<div>');
        let buttons;
        let element = $('<div class="HTMLEditor">');

        oldValueParam = oldValueParam.v || '';

        let formFill = function () {

            field.getValue(oldValueParam, item, !editNow).then(function (json) {
                let editor;
                div.append(element);
                element.empty().appendTo(dialog);

                if (field.textType === 'json') {

                    editor = new JSONEditor(element.get(0), {});
                    try {
                        if (json.value !== '') {
                            editor.setText(json.value);
                        }
                    } catch (e) {
                        window.top.App.modal('Ошибка формата JSON ')
                    }


                    let btn = $('<a href="#" style="padding-top: 5px; display: inline-block; padding-left: 20px;">Вручную</a>').on('click', function () {
                        let div = $('<div>');
                        let textarea = $('<textarea class="form-control">').val(JSON.stringify(editor.get(), null, 2)).appendTo(div);
                        if (window.innerHeight > 460) {
                            textarea.css('height', 350)
                            element.css('min-height', 200);
                        }

                        let buttons = [
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
                        ];

                        if (field.pcTable.isMobile) {
                            App.mobilePanel('Ручное изменение json-поля', div, {buttons: buttons})
                        } else {
                            BootstrapDialog.show({
                                message: div,
                                type: null,
                                title: 'Ручное изменение json-поля',
                                buttons: buttons,
                                cssClass: 'fieldparams-edit-panel',
                                draggable: true,
                                onshown: function (dialog) {
                                    dialog.$modalContent.position({
                                        of: window
                                    });
                                },
                                onshow: function (dialog) {
                                    dialog.$modalHeader.css('cursor', 'pointer');
                                    dialog.$modalContent.css({
                                        width: 500
                                    });
                                }
                            });
                        }
                        return false;
                    });
                    element.find('.jsoneditor-menu').append(btn);
                } else {

                    let mode = field.getMode();


                    let el = $('<div>').appendTo(element);
                    let options = {
                        value: (json.value || '').toString(),
                        mode: mode,
                        minHeight: '150px',
                        readOnly: false,
                        theme: 'eclipse',
                        lineNumbers: true,
                        indentWithTabs: true,
                        autoCloseTags: true
                    };

                    if (mode === 'text') {
                        options.lineNumbers = false;
                        options.lineWrapping = true;
                    }

                    editor = CodeMirror(el.get(0), options);
                    editor.on('paste', function (cm, event) {
                        setTimeout(function () {
                            editor.refresh();
                        }, 1);
                    });
                    if (field.pcTable && field.pcTable.tableRow.name === 'tables') {
                        editor.table = item.name.v || item.name;
                    }

                    if (window.innerHeight > 585) {
                        editor.getScrollerElement().style.minHeight = '350px';
                        dialog.css('min-height', 200)
                    }

                    editor.focus();

                }


                element.data('editor', editor);
                div.data('editor', editor);

            });

        };

        const save = function (dialog, event, notEnter) {
            if (field.textType === 'json') {
                div.data('val', JSON.stringify(element.data('editor').get()));
            } else {
                div.data('val', element.data('editor').getValue());
            }
            if (!notEnter) {
                enterClbk(div, {});
                dialog.close();
            }
        };


        buttons = [];

        let btnsSave = {
            'label': "Сохранить",
            cssClass: 'btn-m btn-warning',
            action: save
        }, btnsClose = {
            'label': null,
            icon: 'fa fa-times',
            cssClass: 'btn-m btn-default btn-empty-with-icon',
            'action': function (dialog) {
                escClbk(div, {});
                dialog.close();
            }
        };

        if (['xml', 'html'].indexOf(field.textType) !== -1) {
            buttons.unshift({
                label: 'Форматировать',
                action: function () {
                    let editor = element.data('editor');
                    let totalLines = editor.lineCount();
                    let totalChars = editor.getValue().length;
                    editor.autoFormatRange({line: 0, ch: 0}, {line: totalLines, ch: totalChars});
                }
            });
        }

        let title = 'Текст поля <b>' + (this.title) + ', ' + field.textType + '</b>';
        let eventName = 'ctrlS.textedit';

        if (editNow) {
            let btnClicked = false;
            setTimeout(function () {
                let cdiv = div.closest('td').find('.cdiv');
                if (cdiv.length > 0) {
                    cdiv.data('bs.popover').options.content.find('.btn').each(function () {
                        let btn = $(this);
                        let buttn = {};
                        buttn.label = btn.data('name');
                        buttn.cssClass = btn.attr('class').replace('btn-sm', 'btn-m');
                        buttn.icon = btn.find('i').attr('class');
                        buttn.save = btn.data('save');
                        buttn.click = btn.data('click');
                        buttn.action = function (dialog) {
                            if (buttn.save) {
                                save(dialog, {}, true);
                            }
                            buttn.click({});
                            btnClicked = true;
                            dialog.close();
                        };

                        buttons.push(buttn)
                    });
                    cdiv.popover('destroy');
                } else {
                    buttons.push(btnsSave);
                    buttons.push(btnsClose)
                }

                if (field.pcTable.isMobile) {

                    App.mobilePanel(title, dialog, {
                        buttons: buttons, onhide: function (dialog) {
                            $('body').off(eventName);
                            if (!btnClicked) {
                                blurClbk(div, {});
                            }
                        },
                        onshown: function (dialog) {
                            formFill();
                        },
                        onshow: function (dialog) {
                            $('body').on(eventName, function (event) {
                                save(dialog, event);
                                return false;
                            });
                        }
                    })

                } else {
                    BootstrapDialog.show({
                        message: dialog,
                        type: null,
                        title: title,
                        cssClass: 'fieldparams-edit-panel',
                        draggable: true,
                        buttons: buttons,
                        onhide: function (dialog) {
                            $('body').off(eventName);
                            if (!btnClicked) {
                                escClbk(div, {});
                            }
                        },
                        onshown: function (dialog) {
                            dialog.$modalContent.position({
                                of: $('body'),
                                my: 'top+50px',
                                at: 'top'
                            });
                            formFill();
                        },
                        onshow: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer')
                            dialog.$modalContent.css({
                                width: '100%'
                            });

                            $('body').on(eventName, function (event) {
                                save(dialog, event);
                                return false;
                            });
                        }

                    });
                }


            }, 1);


            div.text('Редактирование в форме').addClass('edit-in-form');
        } else {
            div.on('keydown click', function (event) {
                if (event.key === 'Tab') {
                    blurClbk(dialog, event, null, true);
                    return
                }

                let _buttons = buttons.splice();
                _buttons.push(btnsSave);
                _buttons.push(btnsClose);

                var div = $(this).closest('div');
                if (field.pcTable.isMobile) {

                    App.mobilePanel(title, dialog, {
                        buttons: _buttons,
                        onhide: function (event) {
                            $('body').off(eventName);
                            escClbk(div, event);
                        },
                        onshown: function (dialog) {
                            formFill();
                            $('body').on(eventName, function (event) {
                                save(dialog, event);
                                return false;
                            });
                        }
                    })

                } else {
                    BootstrapDialog.show({
                        message: dialog,
                        type: null,
                        cssClass: 'fieldparams-edit-panel',
                        title: title,
                        buttons: _buttons,
                        draggable: true,
                        onhide: function (event) {
                            $('body').off(eventName);
                            escClbk(div, event);
                        },
                        onshown: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer');
                            formFill();

                            dialog.$modalContent.css({
                                width: 900
                            });
                            $('body').on(eventName, function (event) {
                                save(dialog, event);
                                return false;
                            });
                        }
                    })
                }
            });

            let btn = $('<button class="btn btn-default btn-sm text-edit-button">').text('Редактировать текст');
            if (tabindex) btn.attr('tabindex', tabindex);

            div.append(btn);
        }
        return div.data('val', oldValueParam);//.attr('data-category', category).attr('data-category', category);

    },
    getEditPanelText(fieldValue) {
        return this.getPanelTextWithLinks(fieldValue.v);
    },
    getCellTextInPanel: function (fieldValue, td, item) {
        return this.getPanelTextWithLinks(fieldValue);
    },
    addPlaceholder(input, placeholder) {
        setTimeout(function () {
            input.data('editor').setOption('placeholder', placeholder);
            input.data('editor').refresh();
        }, 100)
    }
};