(function () {

    App.reUserInterface = function (users, isNotCreatorHimSelf, UserTables) {
        let UserFio = $('#UserFio');
        UserFio.css('cursor', 'pointer');

        if (isNotCreatorHimSelf) {
            App.blink(UserFio, 10, '#ffe486');
        }

        const setAuthUser = function (userId) {
            let model = App.models.table('/Table/', {}, {});

            let pcTable = $('#table').data('pctable') || {isCreatorView: true};
            model.addPcTable(pcTable);
            model.reUser(userId);
        };

        const addFioClick = function () {


            let selectDiv = $('<div class="tech-table" style="height: 350px; width: 200px;"></div>');
            let select;
            if (UserTables.length) {
                let buttons = $('<div>');
                selectDiv.prepend(buttons)
                UserTables.forEach((t) => {
                    let btn = $('<button class="btn btn-default btn-xxs UsersTablesButton"></button>').text(t['title']).on('click', () => {
                        window.location.href = '/Table/0/' + t['name'];
                    });

                    buttons.append(btn)
                })
            }
            if (Object.keys(users).length) {
                let sBtn = $('<div class="select-btn"></div>').appendTo(selectDiv);
                select = $('<select data-size="6" class="open" title="Выберите пользователя" data-style="btn-sm btn-default" data-live-search="true" data-width="100%">');

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
                select.selectpicker('render').selectpicker('toggle');
                select.data('container', selectDiv);
                select.on('hide.bs.select', function () {
                    if (select.val()) {
                        setAuthUser(select.val());
                    }
                    $('body').off('click.FioPopover');
                    return false;
                });
                setTimeout(function () {
                    select.selectpicker('render');
                    UserFio.popover('show');
                    let popover = $('#' + UserFio.attr('aria-describedby'));
                    popover.css('top', '45px');
                    select.data('selectpicker').$searchbox.focus();
                    $('body').one('click.FioPopover', function (e) {
                        if (e.altKey !== undefined) {
                            UserFio.popover('destroy');
                            UserFio.one('click', addFioClick);
                        }
                    });
                }, 50);
            }else{
                UserFio.popover('show');
            }
        };

        UserFio.one('click', addFioClick);


    };

})();