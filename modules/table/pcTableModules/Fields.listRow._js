fieldTypes.listRow = $.extend({}, fieldTypes.default, {
    icon: 'fa-code',
    isPanelField: true,
    getPanelTextAsTable: function (fieldValue) {
        if (typeof fieldValue === 'object' && fieldValue !== null && fieldValue.settings && fieldValue.data && fieldValue.settings.columns && fieldValue.settings.columns.length) {
            const table = $('<table class="json-table">');
            let field = this;
            let settings = fieldValue.settings;
            let columns = settings.columns;
            let headRow = false;
            try {
                if (settings.headRow) {
                    const tr = $('<tr>').appendTo(table);
                    if (typeof settings.headRow === 'boolean') {
                        columns.forEach(function (column) {
                            $('<td>').text(column).appendTo(tr).addClass('head');
                        })
                    } else {
                        columns.forEach(function (column) {
                            $('<td>').text(settings.headRow[column]).appendTo(tr).addClass('head');
                        })
                    }
                }

                fieldValue.data.forEach(function (listItem) {
                    const tr = $('<tr>').appendTo(table);
                    columns.forEach(function (column) {
                        let val = listItem[column];
                        if (typeof val != "string" || val === "") {
                            val = JSON.stringify(val)
                        }
                        const td = $('<td>').text(val).appendTo(tr);
                    });
                    if (settings.headColumn) {
                        tr.find('td:first').addClass('head');
                    }
                });
                return table;

            } catch (e) {
                console.log(e);

            }
        }
    },
    getPanelText: function (fieldValue, td, item) {
        let def = $.Deferred();
        let field = this;

        const panelHtmlResult = function (val) {
            let table = field.getPanelTextAsTable.call(field, val);
            if (table) {
                table.copyText = JSON.stringify(val)
                def.resolve(table);
                return;
            }
            def.resolve($('<div>').text(JSON.stringify(val, null, 2)));
        };


        if (typeof fieldValue !== 'string') {
            panelHtmlResult(fieldValue);
        } else {
            this.getValue(fieldValue, item, false).then(function (json) {
                panelHtmlResult(json.value)

            }).fail(function () {
                def.reject();
            });
        }

        return def.promise();
    },
    getValue: function (value, item, isModulPanel) {
        "use strict";
        let def = $.Deferred();

        if (isModulPanel || this.category === "filter" || typeof value === "object" || !value) {
            def.resolve({value: value});
            return def;
        } else {
            let data = {'fieldName': this.name};
            if (item.id) {
                data['rowId'] = item.id;
            }
            this.pcTable.model.getValue(data, this.table_id).then(function (json) {
                def.resolve(json);
            })
        }


        return def;
    },
    getEditElement: function ($oldInput, oldValueParam, item, enterClbk, escClbk, blurClbk, tabindex, editNow) {

        let field = this;
        let div = $('<div>');
        let dialog = $('<div>').css('min-height', 200);
        let buttons;
        let element = $('<div class="HTMLEditor">');

        oldValueParam = oldValueParam.v || '';

        let formFill = function () {

            field.getValue(oldValueParam, item, !editNow).then(function (json) {
                let editor;
                div.append(element);
                element.empty().appendTo(dialog);

                editor = new JSONEditor(element.get(0), {});
                try {
                    if (json.value !== '') {
                        editor.setText(JSON.stringify(json.value));
                    }
                } catch (e) {
                    window.top.App.modal('Ошибка формата JSON ');
                }
                element.css('min-height', 200);

                let btn = $('<a href="#" style="padding-top: 5px; display: inline-block; padding-left: 20px;">Вручную</a>').on('click', function () {
                    let div = $('<div>');
                    let textarea = $('<textarea class="form-control" style="height: 350px;">').val(JSON.stringify(editor.get(), null, 2)).appendTo(div);
                    let title = 'Ручное изменение json-поля', buttons = [
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
                        App.mobilePanel(title, div, {
                            buttons: buttons,
                        })
                    } else {
                        window.top.BootstrapDialog.show({
                            message: div,
                            type: null,
                            title: title,
                            draggable: true,
                            cssClass: 'fieldparams-edit-panel',
                            buttons: buttons,
                            onhide: function (event) {
                                // escClbk(div, event);
                            },
                            onshown: function (dialog) {
                                dialog.$modalContent.position({
                                    of: window.top
                                });
                            },
                            onshow: function (dialog) {
                                dialog.$modalHeader.css('cursor', 'pointer')
                                dialog.$modalContent.css({
                                    width: 500
                                });
                            }

                        });
                    }


                    return false;
                });
                element.find('.jsoneditor-menu').append(btn);
                element.data('editor', editor);
            });

        };

        const save = function (dialog, event, notEnter) {
            div.data('val', element.data('editor').get());
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

        let title = 'Текст поля <b>' + (this.title) + '</b>';
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
                        buttons: buttons,
                        onhide: function (dialog) {
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
                            });
                        }
                    })
                } else {
                    window.top.BootstrapDialog.show({
                        message: dialog,
                        type: null,
                        title: title,
                        cssClass: 'fieldparams-edit-panel',
                        draggable: true,
                        buttons: buttons,
                        onhide: function (dialog) {
                            $('body').off(eventName);
                            if (!btnClicked) {
                                blurClbk(div, {});
                            }
                        },
                        onshown: function (dialog) {
                            dialog.$modalContent.position({
                                of: $(window.top.document.body),
                                my: 'top+50px',
                                at: 'top'
                            });
                            formFill();
                        },
                        onshow: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer')
                            dialog.$modalContent.css({
                                width: 900,
                                maxWidth: "99vw"
                            });

                            $('body').on(eventName, function (event) {
                                save(dialog, event);
                            });
                        }

                    });
                }


            }, 1);


            div.text('Редактирование в форме').addClass('edit-in-form');
        } else {
            div.on('focus click', 'button', function () {
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
                            });
                        }
                    })
                } else {
                    window.top.BootstrapDialog.show({
                        message: dialog,
                        type: null,
                        cssClass: 'fieldparams-edit-panel',
                        title: title,
                        draggable: true,
                        buttons: _buttons,
                        onhide: function (event) {
                            $(window.top.document.body).off(eventName);
                            escClbk(div, event);
                        },
                        onshown: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer');
                            formFill();

                            dialog.$modalContent.css({
                                width: 900,
                                maxWidth: "99vw"
                            });
                            $(window.top.document.body).on(eventName, function (event) {
                                save(dialog, event);
                            });
                        }
                    })
                }

            });

            let btn = $('<button class="btn btn-default btn-sm text-edit-button">').text('Редактировать список/json');
            if (tabindex) btn.attr('tabindex', tabindex);

            div.append(btn);

        }
        return div.data('val', oldValueParam);//.attr('data-category', category).attr('data-category', category);

    },
    isDataModified: function (editVal, itemVal) {
        if (editVal === "") editVal = null;
        if (itemVal === "") itemVal = null;

        if (itemVal === editVal) return false;

        if (Object.equals(editVal, itemVal)) return false;

        return true;


    },
    getEditVal: function (div) {
        return div.data('val');
    },
    getCellText: function (fieldValue) {
        if (typeof fieldValue != 'string') {
            return JSON.stringify(fieldValue)
        }
        return fieldValue;
    },
    getHighCelltext(fieldValue, td, item){
        return this.getCellText(fieldValue);
    },
    getEditPanelText(fieldValue){
        return this.getCellText(fieldValue.v);
    }
});
