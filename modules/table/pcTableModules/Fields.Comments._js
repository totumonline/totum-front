fieldTypes.comments = {
    icon: 'far fa-comments-o',
    getEditVal: function (div) {
        return div.data('val');
    },
    getCellText: function (fieldValue) {
        let field = this;
        if (fieldValue.n === 0 || !fieldValue.n) return '';

        let mainDiv = $('<span>');

        let div = $('<span class="comments">').text(fieldValue.c[0] + ' ' + fieldValue.c[1] + ': ' + fieldValue.c[2]).appendTo(mainDiv);

        if (fieldValue.notViewed) {
            div.addClass('notViewed');
            if (field.decorationColor) {
                div.css('border-bottom-color', field.decorationColor);
            }
        }

        return mainDiv;
    },
    getValue: function (value, item, isModulPanel) {
        "use strict";
        let field = this;
        let def = $.Deferred();

        if (isModulPanel) {
            if (!value) value = [];
            def.resolve({'value': value});
        } else if (value.n === 0 || (value.n === 1 && !value.cuted && !value.notViewed)) {
            if (!value) value = [];
            def.resolve({'value': [value.c]});

        }
        else if (value.n> 1 && !value.notViewed && value.all) {
            def.resolve({'value': value.c});
        }
        else {
            let data = {'fieldName': this.name};
            if (item.id) {
                data['rowId'] = item.id;
            }
            def = this.pcTable.model.getValue(data, this.table_id);
        }
        def.then(function (json) {
            if (item[field.name].v.notViewed || item[field.name].notViewed) {
                let $_def = $.Deferred();
                $_def.then(function () {
                    delete item[field.name].v.notViewed;
                    delete item[field.name].notViewed;
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

        const getDiv=function (arr) {
            let div = $('<div class="comments">');
            $.each(arr, function (i, com) {
                div.append(field.getCommentLine(com));
            });
            setTimeout(function () {
                div.closest('td').scrollTop(div.height())
            }, 100);
            return div;
        };
        if (fieldValue.all){
            return  getDiv(fieldValue.c);
        }
        this.getValue(fieldValue, item, false).then(function (json) {
            def.resolve(getDiv(json.value));
        }).fail(function () {
            def.reject();
        });

        return def.promise();
    },
    getCommentLine: function (com) {
        let div = $('<div class="comments-line">');
        div.append($('<span class="com_dt">').text(com[0]));
        div.append(' ');
        div.append($('<span class="com_author">').text(com[1]));
        div.append(' ');
        div.append($('<span class="com_text">').html(App.textWithLinks(com[2])));

        return div;
    },
    getPanelVal(val, div) {
        return val;
    },
    getEditElement: function ($oldInput, oldValueParam, item, enterClbk, escClbk, blurClbk, tabindex, editNow) {

        let field = this;
        let div = $oldInput || $('<div>');
        let dialog = div.data('dialog') || $('<div>').css('min-height', 200);
        div.data('dialog', dialog);
        let buttons;
        let valPreview;

        oldValueParam = oldValueParam.v || '';

        let formFill = function (dlg) {
            field.getValue.call(field, oldValueParam, item, !editNow).then(function (json) {
                let $input = $('<textarea type="text" style="height:90px;resize: vertical" class="form-control"/>');
                $.each(json.value, function (i, com) {
                    dialog.append(field.getCommentLine(com));
                });
                dialog.append($('<div class="comments-input">').append($input));
                dialog.data('input', $input);
                $input.focus();
            });

        };
        const save = function (dlg, event, notEnter) {
            let val = dialog.find('textarea').val().trim();
            div.data('val', val);

            if (valPreview) {
                valPreview.text(val);

                if (val !== '') {
                    valPreview.css('color', 'red');
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

        let title = 'Комментарии поля <b>' + (this.title) + '</b>';
        let eventName = 'ctrlS.commentdialog';
        let btnClicked = false;

        if (editNow) {


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

                            formFill(dialog);
                        },
                        onshow: function (dialog) {
                            $('body').on(eventName, function (event) {
                                save(dialog, event, false);
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
                                blurClbk(div, {});
                            }
                        },
                        onshown: function (dialog) {
                            dialog.$modalContent.position({
                                of: $('body'),
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

                            $('body').on(eventName, function (event) {
                                save(dialog, event, false);
                            });
                        }

                    });
                }


            }, 1);


            div.text('Редактирование в форме').addClass('edit-in-form');
        } else {
            let showned = false;
            div.off().on('focus click', 'button', function () {
                if (showned) return false;
                showned = true;
                let buttonsClick = buttons.slice(0);
                buttonsClick.push(btnsSave);
                buttonsClick.push(btnsClose);

                var div = $(this).closest('div');
                if (field.pcTable.isMobile) {
                    App.mobilePanel(title, dialog, {
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
                    BootstrapDialog.show({
                        message: dialog,
                        type: null,
                        cssClass: 'fieldparams-edit-panel',
                        title: title,
                        draggable: true,
                        size: BootstrapDialog.SIZE_WIDE,
                        buttons: buttonsClick,
                        onhide: function (event) {
                            showned = false;
                            $('body').off(eventName);
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

                            $('body').on(eventName, function (event) {
                                save(dialog, event, false);
                            });

                        }
                    })
                }

            });

            if (div.find('button').length === 0) {
                let btn = $('<button class="btn btn-default btn-sm text-edit-button">').text('Добавить комментарий');
                if (tabindex) btn.attr('tabindex', tabindex);
                div.append(btn);
            }

        }
        return div.data('val', null);//.attr('data-category', category).attr('data-category', category);

    },
    getCellTextInPanel: function(fieldValue, td, item, oldItem){
        return this.getEditPanelText({v:fieldValue}, item, oldItem)
    },
    getEditPanelText: function (val, item, oldItem) {
        if (!val) return;
        if (val.v.forEach) {
            let f = $('<div>');
            val.v.forEach(function (row) {
                f.append(
                    $('<div>')
                        .append($('<span class="date">').text(row[0]))
                        .append($('<span class="user">').text(row[1]))
                        .append($('<span class="text">').text(row[2]))
                )
            });
            return f.children();
        } else {
            let f = $('<div>');
            if(oldItem[this.name] && oldItem[this.name].v && oldItem[this.name].v.forEach){
            oldItem[this.name].v.forEach(function (row) {
                f.append(
                    $('<div>')
                        .append($('<span class="date">').text(row[0]))
                        .append($('<span class="user">').text(row[1]))
                        .append($('<span class="text">').text(row[2]))
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
    }

};