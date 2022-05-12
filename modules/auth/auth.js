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
                    label: App.translate('Send password to email')
                },
                {
                    action: function (dialog) {
                        dialog.close();
                    },
                    label: App.translate('Cancel')
                }
            ];

            BootstrapDialog.show({
                message: $fieldsDiv,
                title: App.translate('New password'),
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
                    label: App.translate('Register and send password to email')
                },
                {
                    action: function (dialog) {
                        dialog.close();
                    },
                    label: App.translate('Cancel')
                }
            ];

            BootstrapDialog.show({
                message: $fieldsDiv,
                title: App.translate('Registration'),
                buttons: buttons,
                draggable: true
            })
        });

        if (!sessionStorage.getItem('browserConfirm') && (!navigator.userAgent.match(/(chrome|safari|firefox|yandex(?=\/))\/?\s*(\d+)/i) || navigator.userAgent.match(/BlackBerry|iPod|Opera Mini|IEMobile/i))) {
            let authForm = $('#auth_form');
            $('body').html('<div style="width: 600px; margin: auto; padding-top: 50px; font-size: 16px; text-align: center;" id="comeinBlock">' +
                '<img src="/imgs/start.png" alt="">' +
                '<div style="padding-bottom: 10px;">' + App.translate('Service is optimized for browsers Chrome, Safari, Yandex, FireFox latest versions') + '.</div>' +
                '<div><a href="#" id="comein" class="btn-default btn">' + App.translate('I still want to see it') + '</a></div></div>');
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