(function () {
    let iframeNum = 0;
    let dialogOffset = -1;

    const getNotificationPanel = (id, buttonText) => {
        return '<div id="' + id + '">' + App.translate('__clock_shelve_panel') + ' <button>' + buttonText + '</button></button></div>'
    }

    let notificationManager, _notifications, getNotificationOffset = function (withManager) {
            let offset = {x: 20, y: 70};
            let isMobile = screen.width <= window.MOBILE_MAX_WIDTH;
            if (isMobile) {
                offset.x = 0.09 * window.innerWidth / 2

            }
            if (withManager) offset.y += 60;

            return offset;
        },
        _model;
    setTimeout(() => {
        _model = App.models.table('/Table/');
        _model.addPcTable({model: _model})
    }, 10)

    App.checkNotificationManager = function (notifications) {
        notifications = notifications || _notifications
        let notifications_count = Object.keys(notifications).length;
        if (notifications_count > 1) {
            if (!notificationManager || !notificationManager.closest('body').length) {

                let clocks;
                notificationManager = $('<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-warning" role="alert" id="notifies_manager" ><button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button><button class="timer" id="notification_clock_panel_all_timer"><i class="fa fa-clock-o"></i></button></div>')
                notificationManager.appendTo('body');

                notificationManager.find('button.close')
                    .on('click', function () {
                        onHide();
                        notificationManager.remove();
                        notificationManager = null;
                        _model.notificationUpdate(Object.keys(notifications), 'deactivate').then(function () {
                        })
                        Object.values(notifications).forEach((notifications) => {
                            notifications.forEach((nf) => {
                                nf.$modal.remove();
                            })
                        })
                        notifications = [];
                    }).on('remove', () => {
                    if (clocks) {
                        clocks.popover('destroy')
                    }

                })
                notificationManager.find('button.timer').on('click', function () {
                    if ($(this).is('.active')) return false;
                    $(this).addClass('active')
                    clocks = $(this);
                    $div = $('<div>').append(getNotificationPanel('notification_clock_panel_all', App.translate('Shelve all')));
                    $div.on('click', 'button', function () {
                        let num = $div.find('input').val();
                        let select = $div.find('select').val();
                        onHide();
                        _model.notificationUpdate(Object.keys(notifications), 'later', num, select).then(function () {
                        })
                        notificationManager.remove();
                        notificationManager = null;
                        Object.values(notifications).forEach((notifications) => {
                            notifications.forEach((nf) => {
                                nf.$modal.remove();
                            })
                        })
                        notifications = [];
                    });


                    clocks.popover({
                        placement: "bottom",
                        content: $div,
                        html: true,

                        animation: false,
                        container: $('body'),
                    }).popover('show');

                    clocks.on('remove', onHide);

                    setTimeout(() => {
                        $('body').on('click.notes', (event) => {
                            if (!$(event.originalEvent.path[0]).closest('#notification_clock_panel_all').length) {
                                clocks.popover('destroy');
                                onHide();
                            }
                        })
                    }, 20)

                });

                const onHide = function () {
                    $('body').off('click.notes');
                    $('#notification_clock_panel_all_timer').removeClass('active');
                };
            }

        } else if (notificationManager) {
            notificationManager.remove()
            notificationManager = null;
        }
    }

    App.showLInks = function (links, model) {
        links.forEach(function (linkObject) {

            if (['top-iframe', 'iframe'].indexOf(linkObject.target) !== -1 && window.top != window) {
                window.top.App.showLInks([linkObject], model);
                return;
            }

            let openLinkLocation = function (target) {
                "use strict";

                if (linkObject.postData) {
                    let _target = '_self';
                    let form;

                    if (target === 'iframe' || target === 'top-iframe') {
                        let iframeName = 'iframe' + (++iframeNum);
                        _target = iframeName;

                        let fn = BootstrapDialog;

                        let $iframe;

                        let dialog = fn.show({
                            message: $iframe = $('<iframe style="width: 100%; ' + (linkObject.width ? '' : 'min-width: 500px;') + ' height: 70vh; border: none" name = "' + iframeName + '"></iframe>'),
                            size: BootstrapDialog.SIZE_WIDE,
                            title: linkObject['title'],
                            draggable: true,
                            cssClass: 'target-iframe',
                            onhidden: function () {
                                if (linkObject.refresh) {
                                    let pcTable = $('#table').data('pctable');
                                    model.refresh(null, linkObject.refresh)
                                    //window.location.reload();
                                }
                            },
                            onshown: function (dialog) {
                                if (linkObject.width) {
                                    let width = 500;
                                    if (linkObject.width > width) width = linkObject.width;
                                    dialog.$modalDialog.width(width)
                                }
                                let wnd = $iframe.get(0).contentWindow;
                                let check = function () {
                                    try {
                                        if (wnd.App && wnd.App.setSessionStorage) wnd.App.setSessionStorage.call(wnd, 'linkObject', linkObject);
                                        else {
                                            setTimeout(check, 200)
                                        }
                                    } catch (e) {

                                    }
                                };
                                check();
                            },
                            buttons: [
                                {
                                    'label': App.translate("Refresh"),
                                    cssClass: 'btn-m btn-default',
                                    'action': function () {
                                        $iframe.get(0).contentWindow.location.reload();
                                        form.detach();
                                    }
                                },
                                {
                                    'label': App.translate('Open'),
                                    cssClass: 'btn-m btn-default',
                                    'action': function (dialog) {
                                        openLinkLocation('self');
                                        //dialog.close();
                                    }
                                },
                                {
                                    'label': App.translate("Tab"),
                                    cssClass: 'btn-m btn-default',
                                    'action': function (dialog) {
                                        window.open($iframe.get(0).contentWindow.location, '_blank');
                                        dialog.close();
                                    }
                                },
                                {
                                    'label': null,
                                    icon: 'fa fa-times',
                                    cssClass: 'btn-m btn-default btn-empty-with-icon',

                                    'action': function (dialog) {
                                        dialog.close();
                                    }
                                }
                            ]
                        });

                        $iframe.on('load', function () {
                            let _window = $iframe.get(0).contentWindow;
                            try {
                                _window.closeMe = function () {
                                    dialog.close();
                                };
                            } catch (e) {

                            }
                        })
                    } else if (target === 'blank') {
                        _target = '_blank';
                    } else if (target === 'parent') {
                        _target = '_parent';
                        //window.parent.App.linkObject=linkObject;;
                    } else if (target === 'top') {
                        _target = '_top';
                    } else {

                        if (window.parent !== window) {
                            sessionStorage.linkObject = JSON.stringify(linkObject);
                        }
                    }

                    form = $('<form>', {
                        method: "post",
                        action: linkObject.uri,
                        target: _target,
                    });


                    const getMultiInput = function (name, v) {
                        if (typeof v === 'boolean') {
                            v = v === true ? 'true' : 'false';
                        }
                        if (typeof v === 'string' || typeof v === 'number' || v === null) {
                            form.append($('<input>', {
                                type: 'hidden',
                                name: name,
                                value: v
                            }))
                        } else {
                            $.each(v, function (k, v) {
                                getMultiInput(name + '[' + k + ']', v);
                            });
                        }
                    };

                    $.each(linkObject.postData, function (k, v) {
                        getMultiInput(k, v);
                    });
                    form.appendTo('body').submit();
                    form.detach();

                } else {
                    switch (target) {
                        case 'top':
                            window.top.location.href = linkObject.uri;
                            break;
                        case 'parent':
                            //window.parent.App.linkObject=linkObject;;
                            window.parent.location.href = linkObject.uri;
                            break;
                        case 'blank':
                            let a = $('<a href="' + linkObject.uri + '" target="_blank">link</a>');
                            a.appendTo('body');
                            a.get(0).click();
                            a.remove();
                            break;
                        case 'iframe':
                        case 'top-iframe':
                            let uri = linkObject.uri;
                            if (linkObject.elseData) {
                                let withoutCategories = [];
                                if (linkObject.elseData.header === false) {
                                    withoutCategories.push('param')
                                }
                                if (linkObject.elseData.footer === false) {
                                    withoutCategories.push('footer')
                                }
                                uri += '#' + encodeURIComponent(JSON.stringify({wc: withoutCategories}));
                            }
                            let $iframe = $('<iframe src="' + uri + '" style="width: 100%; height: 70vh; border: none"></iframe>');

                            let dialog = BootstrapDialog.show({
                                message: $iframe,
                                draggable: true,
                                size: BootstrapDialog.SIZE_WIDE,
                                title: linkObject['title'],
                                cssClass: 'target-iframe',
                                onhidden: function () {
                                    if (linkObject.refresh) {
                                        model.refresh(null, linkObject.refresh)
                                    }
                                    dialogOffset--;
                                },
                                onshown: function (dialog) {
                                    if (linkObject.width) {
                                        dialog.$modalDialog.width(linkObject.width)
                                    }
                                    if (++dialogOffset) {
                                        dialog.$modalDialog.css('margin-top', 30 + 20 * dialogOffset)
                                    }

                                    let wnd = $iframe.get(0).contentWindow;
                                    let check = function () {
                                        try {
                                            if (wnd.App && wnd.App.setSessionStorage) wnd.App.setSessionStorage.call(wnd, 'linkObject', linkObject);
                                            else {
                                                setTimeout(check, 200)
                                            }
                                        } catch (e) {

                                        }
                                    };
                                    check();
                                },
                                buttons: [
                                    {
                                        'label': App.translate("Refresh"),
                                        cssClass: 'btn-m btn-default',
                                        'action': function () {
                                            $iframe.get(0).contentWindow.location.reload();
                                        }
                                    },
                                    {
                                        'label': App.translate('Open'),
                                        cssClass: 'btn-m btn-default',
                                        'action': function (dialog) {
                                            try {
                                                if ($iframe.get(0).contentWindow.sessionStorage.linkObject)
                                                    linkObject = JSON.parse($iframe.get(0).contentWindow.sessionStorage.linkObject);
                                            } catch (e) {

                                            }
                                            openLinkLocation('self');
                                            //dialog.close();
                                        }
                                    },
                                    {
                                        'label': App.translate("Tab"),
                                        cssClass: 'btn-m btn-default',
                                        'action': function (dialog) {
                                            window.open($iframe.get(0).contentWindow.location, '_blank');
                                            dialog.close();
                                        }
                                    },
                                    {
                                        'label': null,
                                        icon: 'fa fa-times',
                                        cssClass: 'btn-m btn-default btn-empty-with-icon',
                                        'action': function (dialog) {
                                            dialog.close();
                                        }
                                    }
                                ]
                            });
                            $iframe.on('load', function () {
                                let _window = $iframe.get(0).contentWindow;
                                try {
                                    _window.closeMe = function () {
                                        dialog.close();
                                    };
                                } catch (e) {

                                }
                            })
                            break;
                        default:
                            if (window.parent != window) {
                                sessionStorage.linkObject = JSON.stringify(linkObject);
                            }
                            window.location.href = linkObject.uri;

                    }
                }

            };
            openLinkLocation(linkObject.target);

        });
    };
    App.showDatas = function (datas, notificationId, wnd) {
        let dialogs = [];
        let model = this;
        let props;
        datas.forEach(function (data) {
            switch (data[0]) {
                case 'fileUpload':
                    let inputFile = $('<input type="file" ' + (data[1].limit > 1 ? 'multiple' : '') + ' accept="' + data[1].type + '" style="display:none">').appendTo('body').click();
                    inputFile.on('change', function () {
                        let promices = [];
                        if (this.files.length > data[1].limit) {
                            App.notify(App.translate('Upload limit exceeded'));
                        } else {

                            for (var i = 0; i < this.files.length; i++) {
                                let file = this.files.item(i);
                                promices.push(new Promise((resolve, reject) => {
                                    var reader = new FileReader();
                                    reader.onloadend = function () {
                                        resolve({"name": file.name, "base64": btoa(reader.result)});
                                    }
                                    reader.readAsBinaryString(file);
                                }))
                            }

                            Promise.all(promices).then((fileArr) => {
                                model.filesUpload(fileArr, data[1].hash).then(() => {
                                    if (data[1].refresh) {
                                        model.refresh(null, data[1].refresh)
                                    }
                                })
                            })
                        }
                    });
                    break;
                case 'files':
                    data[1].files.forEach((file) => {
                        var sliceSize = 512;
                        var byteCharacters = atob(file.string);
                        var byteArrays = [];

                        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                            var slice = byteCharacters.slice(offset, offset + sliceSize);
                            var byteNumbers = new Array(slice.length);

                            for (var i = 0; i < slice.length; i++) {
                                byteNumbers[i] = slice.charCodeAt(i);
                            }
                            var byteArray = new Uint8Array(byteNumbers);
                            byteArrays.push(byteArray);
                        }


                        let blob = new Blob(byteArrays, {type: file.type});
                        saveAs(blob, file.name);
                    })
                    break;
                case 'input':
                    let input, Dialog;
                    let html = $('<div>').html(data[1].html);
                    if (html.find('#ttmInput').length) {
                        input = html.find('#ttmInput');
                    } else {
                        input = $('<input type="text" class="form-control" id="ttmInput">');
                        if (data[1].type) {
                            input.attr('type', data[1].type)
                            if (data[1].type === 'password') {
                                input.attr('autocomplete', "off")
                            }
                        }
                        if (data[1].value)
                            input.val(data[1].value)
                        html.append(input);
                        input.wrap('<div>');
                        input.on('keydown', (event) => {
                            if (event.keyCode === 13) {
                                save();
                            }
                        })
                    }

                    let save = function () {
                        model.inputClick(data[1].hash, input.val()).then(function () {
                            if (data[1].close && wnd && wnd.closeMe) {
                                window.closeMe();
                            } else if (data[1].refresh) {
                                model.refresh(null, data[1].refresh)
                            }
                            Dialog.close();
                        });
                    };

                    setTimeout(() => {
                        input.focus();
                    }, 1)

                    props = {
                        buttons: [
                            {
                                label: (data[1]['button'] || App.translate('Save')), action: save
                            }
                            , {
                                label: App.translate('Cancel'), action: function (dialog) {
                                    dialog.close();
                                }
                            }
                        ], class: 'linkButtons'
                    };
                    if (screen.width <= window.MOBILE_MAX_WIDTH) {
                        Dialog = App.mobilePanel(data[1].title, html, props)
                    } else {
                        if (props.width || !props.html) {
                            props.onshown = function (dialog) {
                                if (props.width) {
                                    dialog.$modalDialog.width(props.width)
                                }
                            }
                        }
                        Dialog = App.panel(data[1].title, html, props);
                    }
                    break;
                case 'buttons':
                    props = {...data[1], buttons: [], class: 'linkButtons'};
                    data[1].buttons.forEach(function (btn, i) {
                        props.buttons.push(
                            {
                                id: 'link-btn' + i,
                                label: btn.text,
                                action: function (dialog) {
                                    model.buttonsClick(data[1].hash, i).then(function () {
                                        if (data[1].close && wnd && wnd.closeMe) {
                                            window.closeMe();
                                        } else if (data[1].buttons[i].refresh) {
                                            model.refresh(null, data[1].buttons[i].refresh)
                                        }
                                        dialog.close();
                                    });
                                },
                                icon: btn.icon ? 'fa fa-' + btn.icon : null,
                                background: btn.background,
                                color: btn.color
                            }
                        )
                    });

                    if (screen.width <= window.MOBILE_MAX_WIDTH) {
                        App.mobilePanel(data[1].title, $('<div>').html(data[1].html), props)
                    } else {
                        if (props.width || !props.html) {
                            props.onshown = function (dialog) {
                                if (props.width) {
                                    dialog.$modalDialog.width(props.width)
                                }
                                if (!props.html) {
                                    dialog.$modalBody.remove()
                                }
                                props.buttons.forEach((btn) => {
                                    let _btn = dialog.getButton(btn.id);
                                    if (btn.background) {
                                        _btn.css('background-color', btn.background);
                                    }
                                    if (btn.color) {
                                        _btn.css('color', btn.color);
                                    }
                                });

                            }
                        }
                        App.panel(data[1].title, $('<div>').html(data[1].html), props);
                    }


                    break;
                case 'table':
                    if (window.top != window) {
                        return window.top.App.showDatas.call(model, [data]);
                    } else {
                        dialogs.push(showTable(data[1], model));
                    }

                    break;
                case 'text':
                    dialogs.push(showText(data[1], model));
                    break;
                case 'json':
                    dialogs.push(showJson(data[1], model));
                    break;
                case 'print':
                    dialogs.push(showPrint(data[1]['body'], data[1]['styles']));
                    break;
                case 'notification':
                    let offset = getNotificationOffset();
                    let notification;
                    let message;
                    if (data[1].text) {
                        message = '<div>' + data[1].text + '</div>';


                    } else {
                        message = data[1].title + '<div class="body"></div>';
                        setTimeout(() => {
                            notification.$ele.find('.body').append(showNotificationTable(data[1], () => {
                                notification.$ele.remove();
                            }));
                        })
                    }
                    notification = $.notify({
                        message: message
                    }, {
                        'offset': offset,
                        type: 'warning',
                        allow_dismiss: true,
                        delay: 0,
                        onClose: function () {
                            if (!notification.$ele.data('deactivated')) {
                                model.notificationUpdate(notificationId, 'deactivate').then(function () {
                                    notification.$ele.trigger('hide.bs.modal');
                                });
                            }
                        }
                    });
                    notification.$ele.find('button.close').after('<button class="timer"><i class="fa fa-clock-o"></i></button>');
                    notification.$ele.css('transition', 'none');
                    notification.$ele.on('click', '.timer:not(.disabled)', function () {
                        let clocks = $(this);
                        clocks.addClass('disabled');
                        $div = $('<div>').append(getNotificationPanel('notification_clock_panel', App.translate('Shelve')));
                        $div.on('click', 'button', function () {

                            let num = $div.find('input').val();
                            let select = $div.find('select').val();
                            onHide();
                            model.notificationUpdate(notificationId, 'later', num, select).then(function () {
                            })
                            clocks.popover('destroy');
                            notification.$ele.data('deactivated', true)
                            notification.$ele.find('button[data-notify="dismiss"]').click();
                        });
                        const onHide = function () {
                            $('body').off('click.note' + notificationId);
                            clocks.removeClass('disabled');
                        };

                        clocks.popover({
                            placement: "bottom",
                            content: $div,
                            html: true,
                            animation: false,
                            container: $('body'),
                        }).popover('show');

                        clocks.on('remove', onHide);

                        setTimeout(() => {
                            $('body').on('click.note' + notificationId, (event) => {
                                if (!$(event.originalEvent.path[0]).closest('#notification_clock_panel').length) {
                                    clocks.popover('destroy');
                                    onHide();
                                }
                            })
                        }, 20)

                    });
                    dialogs.push({
                        $modal: notification.$ele,
                        simpleClose: () => {
                            notification.$ele.data('deactivated', true)
                            notification.$ele.find('button[data-notify="dismiss"]').click();
                        }, notification: notification
                    });

                    break;
            }
        });
        return dialogs;
    };
    App.getPcTableById = function (id, elseData, element, config_else) {
        let $d = $.Deferred();
        (new App.models.table('/Table/0/' + id.toString(), {}, {})).getTableData(elseData ? elseData.sess_hash : null).then(function (config) {

            if (config_else && (config_else.withHeader === false || config_else.withFooter === false)) {
                let fields = [];
                Object.values(config.fields).forEach(function (field, i) {
                    if (field.category === 'param' && config_else.withHeader === false) delete config.fields[field.name];
                    else if (field.category === 'footer' && config_else.withFooter === false) delete config.fields[field.name];
                });
                delete config_else.withHeader;
                delete config_else.withFooter;
            }

            config.model = new App.models.table('/Table/0/' + id.toString(), $.extend({'updated': config.updated}, elseData || {}));

            $.extend(true, config, config_else);

            let pcTable = new App.pcTableMain(element, config);
            $d.resolve(pcTable);
        });
        return $d.promise();
    };
    App.showPanels = function (panels, InPcTable) {
        if (window.top != window) return window.top.App.showPanels.call(window.top, panels)

        let pcTables = {};
        let def = $.Deferred();
        const showPanel = function () {
            let panel = panels.shift();

            let data = {}, fixed = {};
            if (panel.id) {
                data.id = panel.id;
            } else if (panel.field) {
                data = panel.field;
                fixed = data;
            }

            const show = function (pcTable) {

                (new EditPanel(pcTable, null, data, panels.length > 0, fixed)).then(function (json, isNext) {
                    if (json || isNext) {
                        if (panels.length) {
                            showPanel();
                            return;
                        }
                    }
                    if (panel.refresh) {
                        InPcTable.model.refresh(null, panel.refresh)
                    }
                    def.resolve();
                });
            };

            if (panel.uri !== window.location.pathname) {
                if (pcTables[panel.uri]) {
                    show(pcTables[panel.uri]);
                } else {
                    (new App.models.table(panel.uri, {}, {})).getTableData().then(function (config) {
                        config.model = new App.models.table(panel.uri, {'updated': config.updated});
                        pcTables[panel.uri] = new App.pcTableMain(null, config);

                        show(pcTables[panel.uri]);
                    });
                }
            } else {
                show($('#table').data('pctable'));
            }
        };

        showPanel();
        return def;
    };

    let notificationDialog = function (title, body, width, refresh, type) {
        return BootstrapDialog.show({
            message: body,
            draggable: false,
            closable: false,
            modal: false,
            onhidden: function () {
                if (refresh) {
                    let pcTable = $('#table').data('pctable');
                    pcTable.model.refresh(null, refresh)
                }
            },
            onshown: function (dialog) {
                dialog.$modalHeader.remove();
                dialog.$modal.css({
                    position: 'static'
                });
                dialog.$modalDialog.css({
                    width: width || '600',
                    right: 0,
                    margin: 0,
                    position: 'fixed',
                    height: 300,
                    top: 0
                });
                dialog.$modalBody.css({
                    padding: 0
                });
                dialog.$modal.data('bs.modal').$backdrop.hide()
            }
        });
    };


    let dialog = function (title, body, width, refresh, type, model, btns) {
        btns = btns || [];
        btns.push({
            'label': null,
            icon: 'fa fa-times',

            cssClass: 'btn-m btn-default btn-empty-with-icon',
            'action': function (dialog) {
                dialog.close();
            }
        });

        return BootstrapDialog.show({
            message: body,
            title: title,
            type: type || null,
            draggable: true,
            onhidden: function () {
                if (refresh) {
                    if (refresh === 'strong') {
                        window.location.reload()
                    } else {
                        model.refresh(null, refresh)
                    }
                }
                dialogOffset--;
            },
            onshown: function (dialog) {
                if (width) {
                    dialog.$modalDialog.width(width)
                }
                if (++dialogOffset) {
                    dialog.$modalDialog.css('margin-top', 30 + 20 * dialogOffset)
                }
            },
            buttons: btns
        });
    };

    function showText(data, model) {
        dialog(data['title'], data['text'], data.width, data.refresh, null, model)
    }

    function showJson(data, model) {
        let div = $('<div>');
        let mode = data['hash'] ? {} : {mode: "view"};
        let editor = new JSONEditor(div.get(0), mode, data['json'])
        let btns = [];
        if (data['hash']) {
            btns.push({
                'action': (dialog) => {
                    model.linkJsonClick(data['hash'], JSON.stringify(editor.get()));
                    dialog.close();
                },
                'label': data['buttontext'],
                cssClass: 'btn-warning btn-save'
            })
        }

        dialog(data['title'], div, data.width, data.refresh, null, model, btns)
    }

    function showNotificationTable(data, closeMe) {

        let height;
        if (data.height) {
            height = data.height;
            if (/^\d+$/.test(data.height)) {
                height += 'px';
            }
        }

        let src = '/Table/0/' + data.table_id + '?sess_hash=' + data.sess_hash;
        if (!/^\/Table\//.test(window.location.pathname) && !window.location.pathname.match(/^\/(\?.*)?$/))
            src = data.table_id + '?sess_hash=' + data.sess_hash;

        let $iframe = $('<iframe style="width: 100%; height: ' + (height || "80vh") + '; border: none;" src="' + src + '">');
        $iframe.on('load', function () {
            let _window = $iframe.get(0).contentWindow;
            _window.closeMe = closeMe;
            $(_window.document.body).css('background-color', 'transparent').addClass('notification-table')

        });
        return $iframe;
    }

    function showTable(data, model) {

        let height;
        if (data.height) {
            height = data.height;
            if (/^\d+$/.test(data.height)) {
                height += 'px';
            }
        }

        let src = '/Table/0/' + data.table_id + '?sess_hash=' + data.sess_hash + '&iframe=1';
        if (window.location.pathname !== '/' && !/^\/Table\//.test(window.location.pathname))
            src = data.table_id + '?sess_hash=' + data.sess_hash + '&iframe=1';

        let $iframe = $('<iframe style="width: 100%; height: ' + (height || "80vh") + '; border: none;" src="' + src + '">');
        $('body').append($iframe);
        let btns = [];
        if ($('#table').data('pctable') && $('#table').data('pctable').isCreatorView) {
            btns.push({
                'label': App.translate("In a new tab"),
                cssClass: 'btn-m btn-danger',
                'action': function (dialog) {
                    let wnd = window.open($iframe.get(0).contentWindow.location, '_blank');
                    dialog.close();
                    return;
                }
            });
        }
        let _dialog = dialog(data['title'], $iframe, data.width, data.refresh, null, model, btns);
        $iframe.on('load', function () {
            let _window = $iframe.get(0).contentWindow;
            _window.closeMe = function () {
                _dialog.close();
            };
        })
    }

    function showPrint(body, styles, pdf) {
        App.fullScreenProcesses.showCog();


        if (pdf) {
            var pdfFile = new Blob([atob(pdf)], {
                type: "application/pdf"
            });
            var pdfUrl = URL.createObjectURL(pdfFile);
            var a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();

        } else {
            let iframe = $('<iframe style="width: 500px; height: 200px; position: absolute; top: -1000px; background: #fff;">').appendTo(window.top.document.body);
            let tempFrame = iframe[0];
            let tempFrameWindow = tempFrame.contentWindow ? tempFrame.contentWindow : tempFrame.contentDocument.defaultView;


            tempFrameWindow.document.head.innerHTML = '<style>' + styles + '</style>';
            tempFrameWindow.document.body.innerHTML = body;
            let iBody = tempFrameWindow.document.body;

            let def = $.Deferred();
            let iCheck = 0;
            const checkScroll = function () {
                iBody.scrollTop = iBody.scrollHeight + 100;
                if (++iCheck < 100 && iBody.scrollTop >= iBody.scrollHeight) {
                    setTimeout(checkScroll, 50);
                } else {
                    setTimeout(function () {
                        def.resolve();

                    }, 2000)
                }
            };

            const checkBodyHeight = function () {
                if (++iCheck < 100 && iBody.scrollHeight < 200) {
                    setTimeout(checkBodyHeight, 50);
                    return;
                }
                //console.log('checkBodyHeight'+iCheck);
                iCheck = 0;
                checkScroll();
            };
            checkBodyHeight();
            def.then(function () {
                App.fullScreenProcesses.hideCog();

                setTimeout(function () {
                    tempFrameWindow.focus();
                    tempFrameWindow.print();
                }, 250);

                setTimeout(function () {
                    // iframe.remove();
                }, 10000);
            });
        }
    }
})();