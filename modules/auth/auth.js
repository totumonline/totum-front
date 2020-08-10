(function () {
    LOGINJS = function () {

        let $fieldsDiv = $('<div><div class="form-group"><label>Email:</label><input id="elseEmail"  type="text"\n' +
            '                                                                      name="login"\n' +
            '                                                                      value=""\n' +
            '                                                                      class="form-control"\n' +
            '                /></div></div>');


        $('body').on('click', '#recover', function () {
            let buttons = [
                {
                    action: function (dialog) {
                        let email = $('#elseEmail').val().trim();
                        if (email == '') {
                            $('#elseEmail').addClass('error');
                            return;
                        }
                        let form = $('<form method="post"><input type="hidden" name="login" value=""><input type="hidden" name="recover" value="true"></form>');
                        form.find('[name="login"]').val($('#elseEmail').val());
                        form.appendTo('body');
                        form.submit();
                        dialog.close();
                    },
                    label: 'Отправить пароль на email'
                },
                {
                    action: function (dialog) {
                        dialog.close();
                    },
                    label: 'Отмена'
                }
            ];

            BootstrapDialog.show({
                message: $fieldsDiv,
                title: 'Новый пароль',
                buttons: buttons,
                draggable: true
            })
        });

        $('body').on('click', '#register', function () {
            let buttons = [
                {
                    action: function (dialog) {
                        let email = $('#elseEmail').val().trim();
                        if (email == '') {
                            $('#elseEmail').addClass('error');
                            return;
                        }
                        let form = $('<form method="post"><input type="hidden" name="login" value=""><input type="hidden" name="register" value="true"></form>');
                        form.find('[name="login"]').val($('#elseEmail').val());
                        form.appendTo('body');
                        form.submit();
                        dialog.close();
                    },
                    label: 'Зарегистрировать и отправить пароль на email'
                },
                {
                    action: function (dialog) {
                        dialog.close();
                    },
                    label: 'Отмена'
                }
            ];

            BootstrapDialog.show({
                message: $fieldsDiv,
                title: 'Регистрация',
                buttons: buttons,
                draggable: true
            })
        });

        if (!sessionStorage.getItem('browserConfirm') && (!navigator.userAgent.match(/(chrome|safari|firefox|yandex(?=\/))\/?\s*(\d+)/i) || navigator.userAgent.match(/BlackBerry|iPod|Opera Mini|IEMobile/i))) {
            let authForm = $('#auth_form');
            $('body').html('<div style="width: 600px; margin: auto; padding-top: 50px; font-size: 16px; text-align: center;" id="comeinBlock">' +
                '<img src="/imgs/start.png" alt="">' +
                '<div style="padding-bottom: 10px;">Сервис оптимизирован под броузеры Chrome, Safari, Yandex, FireFox последних версий.</div>' +
                '<div><a href="#" id="comein" class="btn-default btn">Все равно хочу посмотреть</a></div></div>');
            $('#comein').on('click', function () {
                sessionStorage.setItem('browserConfirm', true);
                $('#comeinBlock').remove();
                $('body').html(authForm);
                authForm.show();
            });
        } else {
            $('#auth_form').show();
        }
    }
})();