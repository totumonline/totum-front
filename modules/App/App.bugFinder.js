(function () {

   // setTimeout(() => App.bugFinder(), 10);

    App.bugFinder = function () {

        let $div = $('<div id="bugFinder">');
        $('<div class="bugFinder-warning">').text(App.translate('bugFinder-warning')).appendTo($div)

        let selector = $('<div class="bugFinder-selector">').appendTo($div);

        let $select = $('<label>'+App.translate('By address')+':</label>').appendTo(selector)
        let $PathInput = $('<input type="text" class="form-control" placeholder="' + App.translate('Enter the path to the table') + '">').appendTo(selector)

        selector.append('<label>'+App.translate('By user')+':</label>')
        let $user = $('<select  data-live-search="true" data-title="'+App.translate('Current user')+'"></select>').appendTo(selector).val('').selectpicker()

        {
            $user.data('selectpicker').$searchbox.off().on('click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api', function (e) {
                e.stopPropagation();
            });
            let Q = '', searchTimeout;
            const loadUsers = async function () {
                let model = App.models.table('/Table/', {}, {isCreatorView: true});
                let pcTable = $('#table').data('pctable') || {model: model};
                model.addPcTable(pcTable);

                let data = await model.getReUsers(Q);
                data = data.users;
                $user.empty();
                data.users.forEach(function (r) {
                    $user.append($('<option>').text(r.id).attr('data-content', r.fio));
                });
                if (data.sliced) {
                    $user.append($('<option disabled>').text("").attr('data-content', "..."));
                }
                $user.val('');
                $user.selectpicker('refresh');
            }
            $user.one('show.bs.select', () => {
                loadUsers()
            })

            $user.data('selectpicker').$searchbox.on('keyup', function (e) {
                if (e.key === 'Escape') {
                    $('body').click();
                    return true;
                }
                let q = $(this).val();
                if (Q !== q) {
                    Q = q;
                    if (searchTimeout) {
                        clearTimeout(searchTimeout)
                    }
                    searchTimeout = setTimeout(() => loadUsers(Q), 750);
                }
            });
        }


        let settings = $('<div class="bugFinder-settings">').appendTo($div);

        let console = $('<div class="bugFinder-console">').appendTo($div);
        const consoller = (title, error, _class, fieldId) => {
            let $row = $('<div>');
            $row.append($('<div>').text(title));
            if (!_class) {
                let $btn = $('<button>Error</button>').on('click', () => {
                    $btn.replaceWith(error.replace(/^\s*<br\s*\/?>\s*/, '') + '<br/>');

                    $btn.parent().addClass('error-text')
                })
                $row.append($('<div>').html($btn));
            } else {
                $row.append($('<div>').text(error));
            }
            console.append($row)
            if (_class) {
                $row.addClass(_class)
            }
            if (fieldId) {
                if (typeof fieldId === 'object') {
                    $row.find('*:last').prepend($('<button><i class="fa fa-edit"></i></button>').on('click', () => {
                        (new EditPanel(1, BootstrapDialog.TYPE_DANGER, {
                            id: fieldId.tableId
                        }))
                    }))
                } else {
                    $row.find('*:last').prepend($('<button><i class="fa fa-edit"></i></button>').on('click', () => {
                        (new EditPanel(2, BootstrapDialog.TYPE_DANGER, {
                            id: fieldId
                        }))
                    }))
                }
            }
            console.scrollTop(console.get(0).scrollHeight)
        }
        let timeLimit = $('<input class="form-control" type="number" step="1" min="1" max="20"/>').val(1).appendTo(settings);
        timeLimit.before($('<label>').text(App.translate('Time limit, sec.')+':'))

        let pageType = $('<select class="bugFinder-pageType" data-width="css-width" data-size="auto"><option value="main">'+App.translate('Main table')+'</option><option value="page">'+App.translate('First pagination page')+'</option></select>').val("main").appendTo(settings);
        pageType.selectpicker()

        let STOP = {
            v: false,
            get: function () {
                return this.v
            },
            act: function (byClick) {
                Start.removeClass('started').text(App.translate('Start'))
                STOP.v = true;

                if (activeProcess.jqXHR && activeProcess.jqXHR.abort) {
                    activeProcess.jqXHR.abort();
                }
                if (byClick) {
                    consoller('STOP', '---', 'red')
                }
            }
        };
        let activeProcess = {noErrorNotice: true};
        let Start = $('<button class="btn btn-danger">').text(App.translate('Start')).appendTo(settings).on('click', async () => {
                if (Start.is('.started')) {
                    STOP.act(true);

                } else {
                    STOP.v = false;

                    console.empty();
                   // $PathInput.val('/Table/132/587')

                    if (!$PathInput.val()) {
                        App.notify(App.translate('Enter the path to the table'));
                        return;
                    }
                    let url;
                    try {
                        url = new URL($PathInput.val());
                    } catch (e) {
                        url = new URL(window.location.protocol + window.location.host + '/' + $PathInput.val());
                    }
                    if (url.host !== window.location.host) {
                        App.notify('Host must be of your Totum');
                        return;
                    }
                    Start.addClass('started').text(App.translate('Stop'));

                    let model = App.models.table($PathInput.val(), {}, {isCreatorView: true});
                    let pcTable = {model: model};
                    model.addPcTable(pcTable);

                    const bugFinder = (function (types, fieldNum) {
                        return this.__ajax('post', {
                            method: 'bugFinder',
                            timeLimit: timeLimit.val(),
                            types: types,
                            pageType: pageType.val(),
                            fieldNum: fieldNum,
                            user: $user.val()
                        }, activeProcess)
                    }).bind(model);

                    const bugFinderWrapper = async (types, fieldNum) => {
                        let data, error;
                        try {
                            data = await bugFinder(types, fieldNum)
                        } catch (e) {
                            error = e.responseText
                        }
                        return [data, error]
                    }


                    let tests = [
                        {type: {pl: "", code: "", table: "default_action"}, title: "Add table action code"},
                        {type: {pl: "param", code: "code"}, title: "Add headers code"},
                        {type: {pl: "filter", code: "code"}, title: "Add filters code"},
                        {type: {pl: "column", code: "code"}, title: "Add columns code"},
                        {type: {pl: "footer", code: "code"}, title: "Add footers code"},

                        {type: {pl: "", code: "", table: "table_format"}, title: "Add table format code"},
                        {type: {pl: "", code: "", table: "row_format"}, title: "Add row format code"},

                        {type: {pl: "param", code: "format"}, title: "Add headers format"},
                        {type: {pl: "filter", code: "format"}, title: "Add filters format"},
                        {type: {pl: "column", code: "format"}, title: "Add columns format"},
                        {type: {pl: "footer", code: "format"}, title: "Add footers format"},
                        {type: {pl: "param", code: "codeAction"}, title: "Add headers action"},
                        {type: {pl: "filter", code: "codeAction"}, title: "Add filters action"},
                        {type: {pl: "column", code: "codeAction"}, title: "Add columns action"},
                        {type: {pl: "footer", code: "codeAction"}, title: "Add footers action"},
                    ]


                    let data, error, title, tableId;

                    [data, error] = await bugFinderWrapper();
                    title = 'Check for work with all codes'
                    if (data) {
                        data.ok === 1 ? consoller(title, "Everything works", "green") : consoller(title, data.ok, "red");
                        STOP.act()
                        return;
                    } else {
                        consoller(title, error)
                    }
                    [data, error] = await bugFinderWrapper(tests.map((x) => x.type));
                    title = 'Check for work with no codes'
                    if (!data) {
                        consoller(title, error, "red");
                        STOP.act()
                        return;
                    } else {
                        consoller(title, 'No codes - everything works', "green");
                        tableId = data.tableId;
                    }

                    let _tests, test, fields;
                    for (let i = 0; i < tests.length && !STOP.get(); i++) {
                        _tests = tests.slice(i + 1).map((x) => x.type);
                        test = tests[i];
                        title = test.title;
                        [data, error] = await bugFinderWrapper(_tests);
                        if (data) {
                            consoller(title, 'It works', "green");
                            fields = data.fields;
                        } else {
                            if (test.type.table) {
                                consoller(title, 'That\'s code!', "red", {tableId: tableId});
                                STOP.act()
                                return;
                            } else {
                                consoller(title, 'That\'s fields!', "red");

                                let _fields, _field;
                                for (let _if = 0; _if < fields.length && !STOP.get(); _if++) {
                                    _fields = fields.slice(_if + 1).map((x) => x.id);
                                    _field = fields[_if];
                                    [data, error] = await bugFinderWrapper([test.type, ..._tests], _fields);
                                    if(error){
                                        consoller(title+' field '+_field.name, 'That\'s field!', "red", _field.id);
                                        STOP.act()
                                        return;
                                    }else{
                                        consoller(title+' field '+_field.name, 'It works', "green");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )

        window.top.BootstrapDialog.show({
            message: $div,
            type: BootstrapDialog.TYPE_DANGER,
            title: App.translate('BugFinder'),
            cssClass: 'fieldparams-edit-panel',
            draggable: true,
            buttons: [],
            onhide: function (dialog) {
            },
            onshown: function (_dialog) {
                _dialog.$modalContent.width('90vw')
                _dialog.$modalContent.position({
                    of: $(window.top.document.body),
                    my: 'top+10px',
                    at: 'center top'
                });

                $select.selectpicker();
                console.height('calc(100vh - 250px)')

            },
            onshow: function (dialog) {
                dialog.$modalHeader.css('cursor', 'pointer')
                dialog.$modalContent.css({
                    width: '100%'
                });
            }

        });
    }
})
();