(function () {
    App.reUserInterface = function (usersIN, UserTables, isNotCreatorHimSelf, isCreatorView) {
        let UserFio = $('#UserFio');
        let sliced = false, users;
        UserFio.css('cursor', 'pointer');

        let model = App.models.table('/Table/', {}, {isCreatorView: isCreatorView});
        let pcTable = $('#table').data('pctable') || {model: model};
        model.addPcTable(pcTable);

        if (isNotCreatorHimSelf) {
            App.blink(UserFio, 10, '#ffe486');
        } else if (App.isTopWindow() && isCreatorView) {

            if ($('#isCreator').length === 0) {
                let creatorButton = $('<span id="isCreator" class="btn btn-sm"><i class="fa-user-circle fa"></i></span>');

                if (App.isMobile()) {
                    creatorButton.addClass('btn-warning');
                    creatorButton.popover({
                        html: false,
                        content: App.translate('You are in mobile mode - switch to desktop mode to enable the admin layer.'),
                        trigger: 'manual',
                        container: 'body',
                        placement: 'bottom',
                        template: '<div class="popover" role="tooltip" style=""><div class="arrow" style="left: 50%;"></div><div class="popover-content" style=" padding: 3px 5px;"></div></div>'
                    });

                    creatorButton.on('click', () => {
                        if (!creatorButton.attr('aria-describedby')) {
                            creatorButton.popover('show');
                            setTimeout(() => {
                                $('body').one('click.creatorButton', function (e) {
                                    if (e.altKey !== undefined) {
                                        creatorButton.popover('hide');
                                    }
                                });
                            }, 100);
                        }
                    })


                } else {


                    if (localStorage.getItem('notCreator')) {
                        creatorButton.addClass('btn-warning');
                        $('.plus-top-branch').hide();
                    } else {
                        creatorButton.addClass('btn-danger');
                    }

                    let isCommonView = false;
                    if ($.cookie('ttm__commonTableView') === 'true') {
                        creatorButton.addClass('commonView');
                        isCommonView = true;
                    }

                    const changeNotCreator = (setted) => {
                        if (!setted) {
                            localStorage.setItem('notCreator', true)
                        } else {
                            localStorage.removeItem('notCreator')
                        }
                    }

                    creatorButton.on('click', () => {
                        let mainTable = $('#table').data('pctable');
                        let specView = mainTable && (isCommonView || mainTable.isTreeView || mainTable.viewType);
                        if (specView) {
                            let showed;
                            if (!creatorButton.data('bs.popover')) {

                                let $selects = $('<div id="isCreatorSelector"></div>');

                                $selects.append('<div><input type="checkbox" data-type="NotCreatorView"> ' + App.translate('isCreatorSelector-NotCreatorView') + '</div>');
                                if (specView) {
                                    $selects.append('<div><input type="checkbox" data-type="CommonView"> ' + App.translate('isCreatorSelector-CommonView') + '</div>');
                                }

                                $selects.append('<div><button>' + App.translate('Apply') + '</button></div>');

                                if ($.cookie('ttm__commonTableView') === 'true') {
                                    $selects.find('[data-type="CommonView"]').prop('checked', true);
                                }
                                if (localStorage.getItem('notCreator')) {
                                    $selects.find('[data-type="NotCreatorView"]').prop('checked', true);
                                }

                                if (App.isMobile()) {
                                    $selects.find('[data-type="NotCreatorView"]').parent().addClass('disabled')
                                    $selects.find('[data-type="NotCreatorView"]').prop('disabled', true)
                                } else {
                                    $selects.find('[data-type="NotCreatorView"]').parent().removeClass('disabled')
                                    $selects.find('[data-type="NotCreatorView"]').prop('disabled', false)
                                }


                                $selects.on('click', 'button', function () {
                                    let NotCreatorView = $selects.find('[data-type="NotCreatorView"]').is(':checked');
                                    let CommonView = $selects.find('[data-type="CommonView"]').is(':checked');
                                    let MobileView = $selects.find('[data-type="MobileView"]').is(':checked');
                                    changeNotCreator(!NotCreatorView);
                                    let path = window.location.pathname
                                    if (!CommonView) {
                                        $.removeCookie('ttm__commonTableView', {path: path})
                                    } else {
                                        $.cookie('ttm__commonTableView', 'true', {path: path})
                                    }

                                    window.location.reload(true)
                                })
                                $selects.on('click', (event) => {
                                    event.stopPropagation();
                                })


                                creatorButton.popover({
                                    trigger: "manual",
                                    placement: "bottom",
                                    content: $selects,
                                    html: true,
                                    animation: false,
                                    container: '#pk nav.navbar-default'
                                })
                            }
                            if (!showed) {

                                creatorButton.popover('show');
                                setTimeout(() => {
                                    if (mainTable) {
                                        mainTable.closeCallbacks.push(() => {
                                            setTimeout(() => {
                                                creatorButton.popover('hide');
                                                showed = false;
                                            }, 50)
                                        })
                                    }
                                }, 100);
                            }


                        } else {
                            changeNotCreator(localStorage.getItem('notCreator'))
                            window.location.reload(true);
                        }
                    })
                }

                $('#docs-link').before(creatorButton)
            }
        }

        const addFioClick = async function (event) {

            if (UserFio.attr('aria-describedby')) {
                return true;
            }

            let selectDiv = $('<div class="tech-table" id="fioPanel" style="width: 200px;"></div>');
            let select;
            if (UserTables.length) {
                let buttons = $('<div class="panel-buttons">');
                selectDiv.prepend(buttons)
                UserTables.forEach((t) => {
                    let btn = $('<button class="btn btn-default btn-xxs"></button>').text(t['title']).on('click', () => {
                        window.location.href = '/Table/0/' + t['name'];
                    });

                    buttons.append(btn)
                })
            } else if (!isCreatorView) {

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
            let Sliced;
            let loadUsers = async function (q) {
                let model = App.models.table('/Table/', {}, {isCreatorView: isCreatorView});
                let pcTable = $('#table').data('pctable') || {model: model};
                model.addPcTable(pcTable);

                let data = await model.getReUsers(q);
                data = data.users;
                users = data.users;
                sliced = data.sliced;
                select.empty();
                users.forEach(function (r) {
                    select.append($('<option>').text(r.id).attr('data-content', r.fio));
                });
                select.val('');
                select.selectpicker('refresh');
                if (sliced) {
                    Sliced.show().insertAfter(selectDiv.find('.select-btn'));
                } else {
                    Sliced.hide();
                }
            }

            if (usersIN === true) {
                let sBtn = $('<div class="select-btn"></div>').appendTo(selectDiv);
                select = $('<select class="open" title="' + App.translate("Select user") + '" data-style="btn-sm btn-default" data-live-search="true" data-width="100%">');
                sBtn.append(select);
                Sliced = $('<div id="reUsersSliced" class="ttm-paging-danges text-center">' + App.translate('The data is incomplete.') + '</div>');
                await loadUsers();
            }

            UserFio.popover({
                html: true,
                content: selectDiv,
                trigger: 'manual',
                container: 'body',
                placement: 'bottom',
                template: '<div class="popover" role="tooltip" style=""><div class="arrow" style="left: 50%;"></div><div class="popover-content" style=" padding: 3px 5px;"></div></div>'
            });

            if (select) {

                select.selectpicker('render').selectpicker('toggle');

                select.data('container', selectDiv);
                select.on('hide.bs.select', function () {
                    if (select.val()) {
                        model.reUser(select.val());
                    }
                    return false;
                });
                select.data('selectpicker').$searchbox.off().on('click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api', function (e) {
                    e.stopPropagation();
                });
                let Q = '', searchTimeout;
                select.data('selectpicker').$searchbox.on('keyup', function (e) {

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

                setTimeout(function () {
                    UserFio.popover('show');
                    select.selectpicker('render');
                    let popover = $('#' + UserFio.attr('aria-describedby'));
                    popover.css('top', '45px');
                    select.data('selectpicker').$searchbox.focus();
                }, 300);
            }


            setTimeout(() => {

                let logOutButton = $('<a href="/Auth/logout/" class="btn">' + App.translate('Logout') + '</a>');
                let divLogout = $('<div class="bottomButtons">').append(logOutButton);
                if (App.isMobile('isButton')) {
                    let deviceButton = $('<span id="mobileSwitcher" class="btn"><i class="fa-desktop fa"></i></span>');
                    if (!App.isMobile()) {
                        deviceButton = $('<span id="mobileSwitcher" class="btn"><i class="fa-mobile fa"></i></span>');
                    }
                    deviceButton.on('click', () => {
                        if (App.isMobile()) {
                            if (App.isMobile(true)) {
                                App.confirmation('<div style="white-space: pre-wrap">' + App.translate("mobileToDesctopUserWarning") + '</div>', {
                                    [App.translate('Cancel')]: (dialog) => {
                                        dialog.close();
                                    },
                                    [App.translate("OK")]: (dialog) => {
                                        localStorage.setItem('notMobileView', 'true')
                                        window.location.reload(true);
                                    }
                                }, App.translate('Attention'))
                            } else {
                                localStorage.setItem('notMobileView', 'true')
                                window.location.reload(true);
                            }
                        } else {
                            localStorage.setItem('notMobileView', 'false')
                            window.location.reload(true);
                        }
                    })

                    divLogout.prepend(deviceButton);
                    divLogout.css({
                        'grid-template-columns': '45px 1fr'
                    })
                }

                selectDiv.append(divLogout)
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