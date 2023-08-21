(function () {

    App.bugFinder = function () {
        let $div = $('<div id="bugFinder">');
        let selector = $('<div class="bugFinder-selector" style="display: grid; grid-gap: 10px; grid-template-columns: minmax(50px, max-content) 1fr">').appendTo($div);
        let $select = $('<select><option value="1">By address:</option></select>').appendTo(selector)
        let $PathInput = $('<input type="text" class="form-control" placeholder="' + App.translate('put address here') + '">').appendTo(selector)

        let settings = $('<div class="bugFinder-settings" style="padding: 3px 0; display: grid; grid-gap: 10px; grid-template-columns: minmax(70px, max-content) 60px 160px 1fr">').appendTo($div);

        let console = $('<div class="bugFinder-console" style="background-color: #333333; overflow: auto">').appendTo($div);

        let timeLimit = $('<input class="form-control" type="number" step="1" min="1" max="20"/>').val(1).appendTo(settings);
        timeLimit.before($('<label style="margin-top: 7px;">').text('Time limit:'))

        let pageType = $('<select style="width: 120px;" data-width="css-width" data-size="auto"><option value="main">Main table</option><option value="page">First pagination page</option></select>').val("main").appendTo(settings);
        pageType.selectpicker()

        let Start = $('<button class="btn btn-danger">').text(App.translate('Start')).appendTo(settings).on('click', () => {
                let activeProcess = {noErrorNotice: true};

                if (Start.is('.disabled')) {
                    Start.removeClass('disabled').text(App.translate('Start'))
                    if (activeProcess.jqXHR && activeProcess.jqXHR.abort) {
                        activeProcess.jqXHR.abort();
                    }

                } else {
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
                    Start.addClass('disabled').text(App.translate('Stop'));

                    let model = App.models.table($PathInput.val(), {}, {isCreatorView: true});
                    let pcTable = {model: model};
                    model.addPcTable(pcTable);

                    const bugFinder = (function (type, fieldNum) {
                        return this.__ajax('post', {
                            method: 'bugFinder',
                            timeLimit: timeLimit.val(),
                            type: type,
                            pageType: pageType.val(),
                            fieldNum: fieldNum
                        }, activeProcess)
                    }).bind(model);

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


                    let title = 'Проверка работает ли при включенных кодах'
                    bugFinder({pl: null, code: null})
                        .then(() => consoller(title, "Все работает. Проверять нечего", "green"))
                        .catch(async (error) => {
                            consoller(title, error.responseText)

                            try {
                                let stop;
                                for (let i = 0; i < tests.length && !stop; i++) {
                                    let test = tests[i];
                                    await bugFinder(test.type).then(async () => {
                                        consoller(test.title, 'It\'s OK! Let\'s find the field', "green");

                                        let i = 1;
                                        while (i < 10) {
                                            try {
                                                let data = await bugFinder(test.type, i);
                                                consoller(test.title + ' ' + i, 'THE FIELD IS ' + data.fieldName, "green", data.fieldId);
                                                stop = true;
                                                break;
                                            } catch (error) {
                                                consoller(test.title + ' ' + i, error.responseText)
                                            }
                                            i++;
                                        }

                                        throw new Error("FIELD NOT FOUND")
                                    }).catch((error) => {
                                        consoller(test.title, error.responseText)
                                    })
                                }

                            } catch (e) {

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