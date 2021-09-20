(function () {
    App.logOutput = function (log) {
        let $mes = $('<div style="overflow-x: auto">');

        let btns = [
            {
                'label': App.translate("Expand All"),
                cssClass: 'btn-m btn-default',
                'action': function (dialog) {
                    $mes.jstree("open_all");
                }
            },
            {
                'label': null,
                icon: 'fa fa-times',
                cssClass: 'btn-m btn-default btn-empty-with-icon',
                'action': function (dialog) {
                    dialog.close();
                }
            }];

        if (typeof log === 'string') {
            btns.splice(0, 1);
        }

        window.top.BootstrapDialog.show({
            message: $mes,
            type: BootstrapDialog.TYPE_DANGER,
            title: App.translate('Scheme of calculation'),
            buttons: btns,
            draggable: true,
            cssClass: 'log-output',
            onshown: function (dialog) {
                dialog.$modalContent.position({
                    of: window.top
                });

                if (typeof log === 'string') {
                    $mes.html('<div style="color: white; ">' + log + '</div>');
                } else {

                    $mes.jstree({
                        "state": {"key": "leftTree"},
                        'core': {
                            'check_callback': true,
                            "open_parents": true,
                            'data': log,
                            themes: {
                                'name': 'default-dark'
                            }
                        },
                        "types": {
                            "folder": {},
                            "code": {"icon": "fa fa-cog"},
                            "cogs": {"icon": "fa fa-cogs"},
                            "error": {"icon": "fa fa-exclamation-triangle"},
                            "list": {"icon": "fa fa-code"},
                            "fixed": {"icon": "fa fa-hand-rock-o"},
                            "param": {"icon": "fa fa-hashtag"},
                            "execcode": {"icon": "fa fa-magic"},
                            "recalcs": {"icon": "fa fa-recycle"},
                            "clocks": {"icon": "fa fa-clock-o"},
                            "mbs": {"icon": "fa fa-database"},
                            "selects": {"icon": "fa fa-navicon"},
                            "!": {"icon": "fa fa-exclamation"},
                            "table_simple": App.tableTypes.simple,
                            "table_version": App.tableTypes.version,
                            "table_calcs": App.tableTypes.calcs,
                            "table_tmp": App.tableTypes.tmp,
                            "table_globcalcs": App.tableTypes.globcalcs,
                            "table_cycles": App.tableTypes.cycles,
                        },
                        "plugins": ["types", "themes"]
                    }).on('click', 'a.jstree-anchor', function () {

                        let node = $mes.jstree(true).get_node(this.id);
                        let json, title;
                        try {
                            json = JSON.parse(node.text)
                            title = '';
                        } catch (e) {
                            try {
                                let match = node.text.match(/^([a-zA-Z_0-1]+)\s*:\s*(.*)$/);
                                json = JSON.parse(match[2]);
                                title = match[1];
                            } catch (e) {
                                json = node.text;
                            }
                        }

                        if (json) {
                            if (typeof json === 'string') {
                                element = $('<div class="HTMLEditor" id="bigOneCodemirror">').height(500);
                                var editor = new CodeMirror(element.get(0), {
                                    value: json,
                                    mode: "text/html",
                                    height: '500px',
                                    readOnly: true,
                                    theme: 'eclipse',
                                    lineNumbers: true,
                                    indentWithTabs: true,
                                    autoCloseTags: true
                                });
                                let int = setInterval(() => {
                                    if (element.isAttached()) {
                                        editor.refresh()
                                        clearInterval(int)
                                    }
                                }, 50)
                            } else {
                                element = $('<div class="JSONEditor">').height(500);
                                var editor = new JSONEditor(element.get(0), {mode: "view"}, json);
                            }
                            window.top.BootstrapDialog.show({
                                message: element,
                                title: title,
                                onshown: function (dialog) {
                                    dialog.$modalContent.position({
                                        of: window.top
                                    });
                                },
                                onshow: function (dialog) {
                                    let width = window.top.innerWidth * 0.8;
                                    dialog.$modalHeader.css('cursor', 'pointer');
                                    dialog.$modalContent.css({
                                        width: width
                                    });
                                }
                            })

                        }


                    });
                }
            },
            onshow:

                function (dialog) {
                    let width = window.top.innerWidth * 0.8;

                    dialog.$modalHeader.css('cursor', 'pointer');
                    dialog.$modalContent.css({
                        width: width
                    });
                    dialog.$modalContent.find('.modal-body').css('background-color', '#333');
                }

        })
        ;
    }
    ;

})
();