(function () {
    App.ManuallyJsonChanging = function (title, value, save) {
        let div = $('<div>');
        let textarea = $('<textarea class="form-control">').val(JSON.stringify(value, null, 2)).appendTo(div);

        if (window.top.innerHeight > 460) {
            textarea.height(350)
        }
        const saveM = function (dialog) {
            if (save(textarea.val())) {
                dialog.close();
            }
        }

        let buttons = [
            {
                'label': App.translate('Save') + ' Alt+S',
                cssClass: 'btn-m btn-warning',
                action: saveM
            }, {
                'label': null,
                icon: 'fa fa-times',
                cssClass: 'btn-m btn-default btn-empty-with-icon',
                'action': function (dialog) {
                    dialog.close();
                }
            }
        ];

        if (App.isMobile()) {
            App.mobilePanel(title, div, {
                buttons: buttons,
            })
        } else {
            let eventName = 'ctrlS.Manually';
            window.top.BootstrapDialog.show({
                message: div,
                type: null,
                title: title,
                draggable: true,
                cssClass: 'fieldparams-edit-panel',
                buttons: buttons,
                onhide: function (event) {
                    $('body').off(eventName);
                },
                onshown: function (dialog) {
                    dialog.$modalContent.position({
                        of: window.top
                    });
                    $('body').on(eventName, () => {
                        saveM(dialog)
                    })
                },
                onshow: function (dialog) {
                    dialog.$modalHeader.css('cursor', 'pointer')
                    dialog.$modalContent.css({
                        width: 500
                    });
                }

            });
        }
    }

})();