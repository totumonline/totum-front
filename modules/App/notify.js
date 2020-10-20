(function () {
    App.notify = function ($text, $title, $style) {

        let def=$.Deferred();
        window.top.BootstrapDialog.show({
            message: $text,
            type: BootstrapDialog.TYPE_DEFAULT,
            title: $title,
            buttons: [
                {
                    'label': null,
                    icon: 'fa fa-times',
                    cssClass: 'btn-m btn-default btn-empty-with-icon',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }

                }
            ],
            onshow: function (dialog) {
                if (!$title) {
                    dialog.$modalHeader.remove();
                }
                dialog.$modal.css('z-index', 2000);
                def.resolve(dialog);
            }
        })
       return def;
    };
    App.topNotify = function ($text, $title, $style) {
        $style = 'success';
        $title = $title || '';
        $('#notifies').append('<div class="alert alert-' + $style + '">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            '<strong>' + $title + '</strong>' + $text +
            '</div>');
    };
    App.popNotify = function ($text, element, timeout, container, trigger) {
        let placement = 'bottom';
        let inOptions = {};
        let class_p;
        let options = {};
        if ($text.isParams) {
            inOptions = $text;
            if ($text['element']) element = $text['element'];
            if ($text['timeout']) timeout = $text['timeout'];
            if ($text['container']) container = $text['container'];
            if ($text['trigger']) trigger = $text['trigger'];
            if ($text['placement']) placement = $text['placement'];
            if ($text['class']) class_p = $text['class'];
            $text = $text['$text'];
        }
        timeout = timeout || undefined;
        container = container || element.closest('.pcTable-scrollwrapper, .InsertPanel');
        trigger = trigger || 'manual';

        options = $.extend(options, {
            html: true,
            content: $text,
            trigger: trigger,
            container: container,
            placement: placement,
            width: "70vw",
            animation: false
        });

        if (timeout == 'default') {
            timeout = 2000;
        }

        element.on('shown.bs.popover', function () {
            let popover = element.data('bs.popover');
            let left = parseInt(popover.$tip.css('left'));
            let arrowLeft = parseInt(popover.$arrow.css('left'));
            if (left < 0) {
                popover.$tip.css('left', 0);
                popover.$arrow.css('left', (arrowLeft + left) + 'px');
            }
            if (placement === 'bottom') {
                let top = element.offset().top + element.outerHeight();
                let popovertop = popover.$tip.offset().top;
                let containerTop = container.scrollTop() - container.offset().top;
                if (popovertop - top > 10) {
                    popover.$tip.css('top', top + 2 + containerTop + (container.is('.InsertPanel') ? $('.modal-dialog').offset().top : 0));
                }
            }
        });

        element.popover(options)
        if (trigger == 'manual') {
            element.popover('show');
            if(class_p){
                $('#' + element.attr('aria-describedby')).addClass(class_p);
            }
        }

        element.on('remove destroy', function () {
            if (element && element.attr('aria-describedby'))
                element.popover('destroy');
        });
        if ($text.on) {
            $text.on('remove destroy', function () {
                if (element.length && element.attr('aria-describedby') && $('#' + element.attr('aria-describedby')).length)
                    element.popover('destroy');
                //$('#' + element.attr('aria-describedby')).remove();
            });
        }
        if (timeout) {
            setTimeout(function () {
                if (element && element.attr('aria-describedby')) {
                    element.popover('destroy');
                }
            }, timeout)
        }
        return element.attr('aria-describedby');
    }
})();