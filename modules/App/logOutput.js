(function () {
    App.logOutput = function (log) {
        let $mes = $('<div style="overflow-x: auto">');

        let btns=[
            {
                'label': "Развернуть все",
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
            title: 'Схема расчета',
            buttons: btns,
            draggable: true,
            cssClass: 'log-output',
            onshown: function (dialog) {
                dialog.$modalContent.position({
                    of: window.top
                });

                if (typeof log === 'string') {
                    $mes.html('<div style="color: white; ">'+log+'</div>');
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
                    });
                }
            },
            onshow: function (dialog) {
                let width = window.top.innerWidth*0.8;

                dialog.$modalHeader.css('cursor', 'pointer');
                dialog.$modalContent.css({
                    width: width
                });
                dialog.$modalContent.find('.modal-body').css('background-color', '#333');
            }

        });
    };

})();