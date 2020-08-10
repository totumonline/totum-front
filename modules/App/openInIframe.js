(function () {
    App.openInIframe = function (title, uri, iframeName) {
        iframeName = iframeName || 'newIframe';
        let $iframe = $('<iframe style="min-width: 500px; width: 100%; height: 70vh; border: none" name = "' + iframeName + '"></iframe>');
        BootstrapDialog.show({
            message: $iframe.attr('src', uri),
            size: BootstrapDialog.SIZE_WIDE,
            title: title,
            buttons: [
                {
                    'label': "Обновить",
                    cssClass: 'btn-m btn-default',
                    'action': function (dialog) {
                        let $iframeNew;
                        $iframeNew= $('<iframe style="min-width: 500px; width: 100%; height: 70vh; border: none" name = "' + iframeName + '"></iframe>').attr('src', uri);
                        $iframe.replaceWith($iframeNew);
                        $iframe = $iframeNew;
                    }
                },
                {
                    'label': "Открыть",
                    cssClass: 'btn-m btn-default',
                    'action': function (dialog) {
                        $('<a>').attr('href', uri).hide().appendTo('body').get(0).click();
                        dialog.close();
                    }
                },
                {
                    'label': "Вкладка",
                    cssClass: 'btn-m btn-default',
                    'action': function (dialog) {
                        let a = $('<a>').attr('href', uri).attr('target', '_blank').hide().appendTo('body')
                        a.get(0).click();
                        a.remove();
                        dialog.close();
                    }
                },
                {
                    'label': null,
                    icon: 'fa fa-times',
                    cssClass: 'btn-m btn-default btn-empty-with-icon',
                    'action': function (dialog) {
                        dialog.close();
                    }
                }
            ]
        });
    };

    App.aInIframe = function (a) {
        a = $(a);
        App.openInIframe(a.text(), a.attr('href'));
        return false;
    }

})();