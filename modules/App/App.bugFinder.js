(function () {

    setTimeout(() => App.bugFinder(), 10);

    App.bugFinder = function () {
        let $div = $('<div id="bugFinder">');
        let selector = $('<div class="bugFinder-selector">').appendTo($div);

        let $select = $('<select><option value="1">By address:</option></select>').appendTo(selector)
        let $PathInput = $('<input type="text" class="form-control" placeholder="' + App.translate('put address here') + '">').appendTo(selector)

        selector.append('<label>By user:</label>')
        let $user = $('<select  data-live-search="true" data-title="Current user"></select>').appendTo(selector).val('').selectpicker()

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
                    $btn.replaceWith(error)
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
                $row.append($('<button><i class="fa fa-edit"></i></button>').on('click', () => {
                    (new EditPanel(2, BootstrapDialog.TYPE_DANGER, {
                        id: fieldId
                    }))
                }))
            }
            console.scrollTop(console.get(0).scrollHeight)
        }
        let timeLimit = $('<input class="form-control" type="number" step="1" min="1" max="20"/>').val(1).appendTo(settings);
        timeLimit.before($('<label>').text('Time limit:'))

        let pageType = $('<select class="bugFinder-pageType" data-width="css-width" data-size="auto"><option value="main">Main table</option><option value="page">First pagination page</option></select>').val("main").appendTo(settings);
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
        let Start = $('<button class="btn btn-danger">').text(App.translate('Start')).appendTo(settings).on('click', () => {
                if (Start.is('.started')) {
                    STOP.act(true);

                } else {
                    STOP.v = false;

                    console.empty();
                    $PathInput.val('/Table/132/587')

                    if (!$PathInput.val()) {
                        App.notify('Set address path');
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

                    const bugFinder = (function (type, fieldNum) {
                        return this.__ajax('post', {
                            method: 'bugFinder',
                            timeLimit: timeLimit.val(),
                            type: type,
                            pageType: pageType.val(),
                            fieldNum: fieldNum,
                            user: $user.val()
                        }, activeProcess)
                    }).bind(model);


                    let tests = [
                        {type: {pl: "param", code: "code"}, title: "headers code"},
                        {type: {pl: "filter", code: "code"}, title: "filters code"},
                        {type: {pl: "column", code: "code"}, title: "columns code"},
                        {type: {pl: "footer", code: "code"}, title: "footers code"},
                        {type: {pl: "param", code: "format"}, title: "headers format"},
                        {type: {pl: "filter", code: "format"}, title: "filters format"},
                        {type: {pl: "column", code: "format"}, title: "columns format"},
                        {type: {pl: "footer", code: "format"}, title: "footers format"},
                        {type: {pl: "param", code: "codeAction"}, title: "headers action"},
                        {type: {pl: "filter", code: "codeAction"}, title: "filters action"},
                        {type: {pl: "column", code: "codeAction"}, title: "columns action"},
                        {type: {pl: "footer", code: "codeAction"}, title: "footers action"},
                    ]


                    let title = 'Check for work with on codes'
                    bugFinder({pl: null, code: null})
                        .then((data) => {
                            data.ok === 1 ? consoller(title, "All works", "green") : consoller(title, data.ok, "red");
                            STOP.act()
                        })
                        .catch(async (error) => {
                            consoller(title, error.responseText)

                            try {
                                let stop;
                                for (let i = 0; i < tests.length && !stop && !STOP.get(); i++) {
                                    let test = tests[i];
                                    await bugFinder(test.type).then(async () => {
                                        consoller(test.title, 'It\'s OK! Let\'s find the field', "green");

                                        let i = 1;
                                        while (i < 10 && !STOP.get()) {
                                            try {
                                                let data = await bugFinder(test.type, i);
                                                consoller(test.title + ' ' + i, 'THE FIELD IS ' + data.fieldName, "green", data.fieldId);
                                                stop = true;
                                                STOP.act()
                                                break;
                                            } catch (error) {
                                                if (error.statusText != 'abort')
                                                    consoller(test.title + ' ' + i, error.responseText)
                                            }
                                            i++;
                                        }
                                        stop = true;
                                    }).catch((error) => {
                                        if (error.statusText != 'abort')
                                            consoller(test.title, error.responseText)
                                    })
                                }

                            } catch (e) {
                                STOP.act()
                            }

                        })


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
                _dialog.$modalHeader.append($('<div style>').text(App.translate('Тут текст про то, что все проходит в несохраняющемся режиме безопасно для базы, но может дернуть сторонние сервисы и отправить email.')))
                _dialog.$modalContent.position({
                    of: $(window.top.document.body),
                    my: 'top+10px',
                    at: 'center top'
                });

                $select.selectpicker();
                console.height('calc(100vh - 200px)')

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