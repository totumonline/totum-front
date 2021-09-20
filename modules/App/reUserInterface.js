(function () {

    App.reUserInterface = function (users, UserTables, isNotCreatorHimSelf, isCreatorView) {
        let UserFio = $('#UserFio');
        UserFio.css('cursor', 'pointer');


        let model = App.models.table('/Table/', {}, {isCreatorView: isCreatorView});
        let pcTable = $('#table').data('pctable') || {model: model};
        model.addPcTable(pcTable);

        if (isNotCreatorHimSelf) {
            App.blink(UserFio, 10, '#ffe486');
        }

        const addFioClick = function (event) {

            if (UserFio.attr('aria-describedby')) {
                return true;
            }

            let selectDiv = $('<div class="tech-table" style="width: 200px;"></div>');
            let select;
            if (UserTables.length) {
                selectDiv.height(125)
                let buttons = $('<div class="panel-buttons">');
                selectDiv.prepend(buttons)
                UserTables.forEach((t) => {
                    let btn = $('<button class="btn btn-default btn-xxs"></button>').text(t['title']).on('click', () => {
                        window.location.href = '/Table/0/' + t['name'];
                    });

                    buttons.append(btn)
                })
            } else if (!isCreatorView) {

                selectDiv.height(60)

                let divForPannelFormats = $('<div>');
                selectDiv.prepend(divForPannelFormats);
                model.loadUserButtons().then((json) => {
                    if (json.panelFormats) {
                        let interv;
                        json.panelFormats.rows.forEach((frow) => {
                            switch (frow.type) {
                                case 'text':
                                    divForPannelFormats.append($('<div class="panel-text">').text(frow.value));
                                    break;
                                case 'html':
                                    divForPannelFormats.append($('<div class="panel-html">').html(frow.value));
                                    break;
                                case 'img':
                                    divForPannelFormats.append($('<div class="panel-img">').append($('<img>').attr('src', '/fls/' + frow.value + "_thumb.jpg?rand=" + Math.random())));
                                    break;
                                case 'buttons':
                                    if (frow.value && frow.value.forEach) {
                                        let $buttons = [];
                                        frow.value.forEach((b) => {
                                            let btn = $('<button class="btn btn-default btn-xxs">').text(b.text);
                                            $buttons.push(btn)
                                            if (b.color) {
                                                btn.css('color', b.color)
                                            }
                                            if (b.background) {
                                                btn.css('background-color', b.background)
                                            }
                                            btn.on('click', function () {
                                                model.userButtonsClick(json.panelFormats.hash, b.ind).then(function (json) {
                                                    if (b.refresh) {
                                                        model.refresh(null, b.refresh)
                                                    }
                                                });
                                            })
                                        })
                                        divForPannelFormats.append($('<div class="panel-buttons">').append($buttons));
                                    }
                                    break;
                            }

                        })
                    }
                })
            }


            if (Object.keys(users).length) {
                let sBtn = $('<div class="select-btn"></div>').appendTo(selectDiv);
                select = $('<select data-size="' + (UserTables.length ? 13 - UserTables.length - 1 : (isCreatorView?13:11)) + '" class="open" title="'+App.translate("Select user")+'" data-style="btn-sm btn-default" data-live-search="true" data-width="100%">');

                Object.keys(users).forEach(function (uId) {
                    select.append($('<option>').text(uId).data('content', users[uId]));
                });

                sBtn.append(select);
            }

            UserFio.popover({
                html: true,
                content: selectDiv,
                trigger: 'manual',
                container: 'body',
                placement: 'auto bottom',
                template: '<div class="popover" role="tooltip" style=""><div class="arrow" style="left: 50%;"></div><div class="popover-content" style=" padding: 3px 5px;"></div></div>'
            });
            if (select) {

                selectDiv.height(350)

                select.selectpicker('render').selectpicker('toggle');
                select.data('container', selectDiv);
                select.on('hide.bs.select', function () {
                    if (select.val()) {
                        model.reUser(select.val());
                    }
                    return false;
                });
                setTimeout(function () {
                    UserFio.popover('show');
                    select.selectpicker('render');
                    let popover = $('#' + UserFio.attr('aria-describedby'));
                    popover.css('top', '45px');
                    select.data('selectpicker').$searchbox.focus();
                }, 300);
            }


            setTimeout(() => {
                UserFio.popover('show');

                $('body').one('click.FioPopover', function (e) {
                    if (e.altKey !== undefined) {
                        UserFio.popover('destroy');
                    }
                });
            }, 300)
        };

        UserFio.on('click', addFioClick);
    };

})();