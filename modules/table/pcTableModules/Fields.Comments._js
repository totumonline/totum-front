fieldTypes.comments = {
    icon: 'far fa-comments-o',
    getEditVal: function (div) {
        return div.data('val');
    },
    isDataModified: function (editVal, itemVal) {
        return editVal !== null;
    },
    getCellText: function (fieldValue) {
        let field = this;
        if (fieldValue.n === 0 || !fieldValue.n) return '';

        let mainDiv = $('<span>');

        let div = $('<span class="comments">').text(fieldValue.c[0] + ' ' + fieldValue.c[1] + ': ' + fieldValue.c[2]).appendTo(mainDiv);

        if (fieldValue.notViewed) {
            div.addClass('notViewed');
            if (field.decorationColor) {
                div.css('border-bottom-color', App.theme.getColor(field.decorationColor, true));
            }
        }

        return mainDiv;
    },
    getValue: function (value, item, isModulPanel, force) {
        "use strict";
        let field = this;
        let def = $.Deferred();

        let data = {'fieldName': this.name};
        if (item.id) {
            data['rowId'] = item.id;
        }

        if (isModulPanel) {
            if (!value) value = [];
            else if (typeof value === "string" && !(field.category === 'column' && !item.id)) {
                let def2 = this.getValueFromServer ? this.getValueFromServer() : this.pcTable.model.getValue(data, this.table_id);
                def2.then((json) => {
                    def.resolve({'value': value, list: json.value});
                })
            } else {
                def.resolve({'value': value});
            }
        } else if (!force && (value.n === 0 || (value.n === 1 && !value.cuted && !value.notViewed))) {
            if (!value) value = [];
            def.resolve({'value': [value.c]});

        } else if (!force && value.n > 1 && !value.notViewed && value.all) {
            def.resolve({'value': value.c});
        } else {

            def = this.getValueFromServer ? this.getValueFromServer() : this.pcTable.model.getValue(data, this.table_id);
        }
        def.then(function (json) {
            let views;
            if (value.notViewed)
                views = value;
            else if (item && item[field.name]) {
                if (item[field.name].v.notViewed) {
                    views = item[field.name].v
                } else {
                    views = item[field.name]
                }
            }
            if (views && views.notViewed) {
                let $_def = $.Deferred();
                $_def.then(function () {
                    delete views.notViewed;
                    let td;
                    if (item.id) {
                        td = field.pcTable._getTdByFieldName(field.name, field.pcTable.data[item.id].$tr);
                    } else {
                        td = field.pcTable._paramsBlock.find('td[data-field="' + field.name + '"]');
                        if (!td.length) {
                            td = field.pcTable._footersBlock.find('td[data-field="' + field.name + '"]')
                        }
                    }
                    if (td && td.length) {
                        td.find('.notViewed-num').remove();
                        td.find('.notViewed').removeClass('notViewed');
                    }
                });
                if (item[field.name].notViewed) {
                    field.pcTable.model.setCommentsViewed(item[field.name].v.length, field.name, item.id).then(function () {
                        $_def.resolve();
                    });
                } else {
                    $_def.resolve();
                }

            }
        });

        return def;
    },
    getPanelText: function (_, __, item) {
        let field = this;
        let def = $.Deferred();
        let fieldValue = _ || item[field.name];

        const getDiv = function (arr) {
            let div = $('<div class="comments">');
            $.each(arr, function (i, com) {
                div.append(field.getCommentLine(com));
            });
            setTimeout(function () {
                let element;
                if (div.closest('td').length) {
                    element = div.closest('td')
                } else {
                    element = div.closest('.field-value')
                }
                element.scrollTop(div.height())
            }, 100);
            return div;
        };
        if (fieldValue.all) {
            return getDiv(fieldValue.c);
        }
        this.getValue(fieldValue, item, false).then(function (json) {
            def.resolve(getDiv(json.value));
        }).fail(function () {
            def.reject();
        });

        return def.promise();
    },
    getCommentLine: function (com, withEdits) {
        let div = $('<div class="comments-line">');
        div.append($('<span class="com_author">').text(com[1]));
        div.append($('<span class="com_dt">').text(com[0]));
        div.append($('<div class="com_text">').html(App.textWithLinks(com[2])));

        let edit;
        if (com[3]) {
            div.append(edit = $('<div class="com_edit">').html(App.translate('Edited')));
        }
        if (com[4] === 'editable' && withEdits) {
            edit = edit || $('<div class="com_edit">').appendTo(div)
            edit.html('<button class="btn btn-m btn-default comment-edit">' + (com[3] ? '<span>' + App.translate('Edited') + '</span>' : '') + '<i class="fa fa-edit"></i></button>')
        }

        return div;
    },
    getPanelVal(val, div) {
        return val;
    },
    getEditElement: function ($oldInput, oldValueParam, item, enterClbk, escClbk, blurClbk, tabindex, editNow) {

        let field = this;
        let div = $oldInput || $('<div>');
        let dialog = $('<div>').css('min-height', 200);
        div.data('dialog', dialog);
        let buttons;
        let valPreview, Dialog;
        let btnClicked = false;
        let element = editNow === 'editField' ? div : dialog;

        oldValueParam = oldValueParam.v || '';

        let formFill = function (dlg) {
            field.getValue(oldValueParam, item, !editNow, true).then(function (json) {
                let $input = $('<textarea type="text" style="height:90px;resize: vertical" class="form-control"/>');

                if (typeof json.value === 'object' || typeof json.list === 'object') {
                    let list = json.value;
                    if (typeof list !== 'object') {
                        list = json.list;
                    }

                    $.each(list, function (i, com) {
                        element.append(field.getCommentLine(com, true));
                    });

                    element.on('click', '.comment-edit', (event) => {
                        field.editLastComment(list[list.length - 1], item);
                        Dialog.close();
                    })


                }

                if (json.value && typeof json.value !== 'object') {
                    $input.val(json.value)
                } else if (div.data('val')) {
                    $input.val(div.data('val'))
                }
                element.append($('<div class="comments-input">').append($input));
                element.data('input', $input);
                $input.focus();
            });

        };
        const save = function (dlg, event, notEnter) {
            let val = element.find('textarea').val().trim();
            div.data('val', val);

            if (valPreview) {
                valPreview.text(val);

                if (val !== '') {
                    valPreview.css('color', App.theme.getColor('red', true));
                } else {
                    valPreview.html(field.getValPreview(oldValueParam));
                    valPreview.css('color', '');
                }
            }
            if (!notEnter) {
                enterClbk(div, {});
                dlg.close();
            }
        };


        buttons = [];

        let btnsSave = {
            'label': App.translate('Save') + ' Alt+S',
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

        let title = App.translate('Comments of field') + ' <b>' + (this.title) + '</b>' + this.pcTable._getRowTitleByMainField(item, ' (%s)');
        let eventName = 'ctrlS.commentdialog';


        if (editNow) {
            if (editNow === 'editField') {
                formFill();
            } else {

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
                        Dialog = App.mobilePanel(title, dialog, {
                            buttons: buttons,
                            onhide: function (dialog) {
                                $('body').off(eventName);
                                if (!btnClicked) {
                                    blurClbk(div, {});
                                }
                            },
                            onshown: function (dialog) {

                                formFill(dialog);
                            },
                            onshow: function (dialog) {
                                $('body').on(eventName, function (event) {
                                    save(dialog, event, false);
                                });
                            }
                        })
                    } else {
                        Dialog = window.top.BootstrapDialog.show({
                            message: dialog,
                            type: null,
                            title: title,
                            cssClass: 'fieldparams-edit-panel',
                            draggable: true,
                            buttons: buttons,
                            onhide: function (dialog) {
                                $(window.top.document).find('body').off(eventName);
                                if (!btnClicked) {
                                    blurClbk(div, {});
                                }
                            },
                            onshown: function (dialog) {
                                dialog.$modalContent.position({
                                    of: $(window.top.document).find('body'),
                                    my: 'top+50px',
                                    at: 'top'
                                });
                                formFill(dialog);
                            },
                            onshow: function (dialog) {
                                dialog.$modalHeader.css('cursor', 'pointer');
                                dialog.$modalContent.css({
                                    width: 900
                                });

                                $(window.top.document).find('body').on(eventName, function (event) {
                                    save(dialog, event, false);
                                });
                            }

                        });
                    }
                    div.data('Dialog', Dialog)

                }, 1);


                div.text(App.translate('Editing in the form')).addClass('edit-in-form');
                setTimeout(() => {
                    div.closest('td').addClass('editing-in-modal')
                })
            }
        } else {
            let showned = false;
            div.off().on('click keydown', function (event) {
                if (showned) return false;
                if (event.key === 'Tab') {
                    blurClbk(dialog, event, null, true);
                    return
                }
                showned = true;

                let buttonsClick = buttons.slice(0);
                buttonsClick.push(btnsSave);
                buttonsClick.push(btnsClose);

                var div = $(this).closest('div');
                if (field.pcTable.isMobile) {
                    Dialog = App.mobilePanel(title, dialog, {
                        buttons: buttonsClick,
                        onhide: function (event) {
                            showned = false;
                            $('body').off(eventName);
                            escClbk(div, event);
                        },
                        onshown: function (dialog) {
                            if (dialog.$modalBody.find('textarea').length === 0) {
                                formFill(dialog);
                            }
                            $('body').on(eventName, function (event) {
                                save(dialog, event, false);
                            });

                        }
                    })
                } else {
                    Dialog = window.top.BootstrapDialog.show({
                        message: dialog,
                        type: null,
                        cssClass: 'fieldparams-edit-panel',
                        title: title,
                        draggable: true,
                        size: BootstrapDialog.SIZE_WIDE,
                        buttons: buttonsClick,
                        onhide: function (event) {
                            showned = false;
                            $(window.top.document).find('body').off(eventName);
                            escClbk(div, event);
                        },
                        onshown: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer');
                            if (dialog.$modalBody.find('textarea').length === 0) {
                                formFill(dialog);
                            }

                            dialog.$modalContent.css({
                                width: 900
                            });

                            $(window.top.document).find('body').on(eventName, function (event) {
                                save(dialog, event, false);
                            });

                        }
                    })
                }

            });

            if (div.find('button').length === 0) {
                let btn = $('<button class="btn btn-default btn-sm text-edit-button">').text(App.translate('Add comment'));
                if (tabindex) btn.attr('tabindex', tabindex);
                div.append(btn);
                this.checkWaiting(btn)
            }

        }
        return div.data('val', null);//.attr('data-category', category).attr('data-category', category);

    },
    getCellTextInPanel: function (fieldValue, td, item, oldItem) {
        return this.getEditPanelText({v: fieldValue}, item, oldItem)
    },
    getEditPanelText: function (val, item, oldItem) {
        if (!val) return;
        if (val.v.forEach) {
            let f = $('<div>');
            val.v.forEach(function (row) {


                f.append(
                    $('<div class="">')
                        .append($('<span class="user">').text(row[1]))
                        .append($('<span class="date">').text(row[0]))
                        .append($('<div class="text">').text(row[2]))
                        .append(row[3]?$('<div class="edited">').text(App.translate('Edited')):'')
                )
            });
            return f.children();
        } else {
            let f = $('<div>');
            if (oldItem[this.name] && oldItem[this.name].v && oldItem[this.name].v.forEach) {
                oldItem[this.name].v.forEach(function (row) {
                    f.append(
                        $('<div>')
                            .append($('<span class="user">').text(row[1]))
                            .append($('<span class="date">').text(row[0]))
                            .append($('<div class="text">').text(row[2]))
                    )
                });
            }

            f.append($('<div class="new-comment">').text(val.v));
            return f.children();
        }
    },
    getValPreview(oldValueParam) {
        return this.getCellText({
            c: oldValueParam[oldValueParam.length - 1],
            n: oldValueParam.length
        })
    },
    editLastComment: function (com, item) {
        let input, Dialog, field = this;
        let html = $('<div>');
        input = $('<input type="text" class="form-control" id="ttmInput">').appendTo(html).val(com[2]).on('keydown', (event) => {
            if (event.keyCode === 13) {
                save();
            }
        });

        let save = function () {
            if (com[2] === input.val()) {
                Dialog.close();
                return;
            }
            field.pcTable.model.save({
                [item.id ? item.id : 'params']: {[field.name]: {value: input.val(), editLastComment: com[2]}}
            })
                .then(
                    (json) => {
                        field.pcTable.table_modify(json);
                        Dialog.close();
                    }
                );
        };

        setTimeout(() => {
            input.focus();
        }, 1)

        let props = {
            buttons: [
                {
                    label: App.translate('Save'), action: save
                }
                , {
                    label: App.translate('Cancel'), action: function (dialog) {
                        dialog.close();
                    }
                }
            ], class: 'linkButtons'
        };
        let title = App.translate('Your last comment editing');

        if (App.isMobile()) {
            Dialog = App.mobilePanel(title, html, props)
        } else {
            if (props.width || !props.html) {
                props.onshown = function (dialog) {
                    if (props.width) {
                        dialog.$modalDialog.width(props.width)
                    }
                }
            }
            Dialog = App.panel(title, html, props);
        }


    }

};