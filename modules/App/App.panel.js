(function () {
        App.panel = function (title, $div, props) {
            props = props || {};
            let dialog = window.top.BootstrapDialog.show($.extend({
                type: 'edit',
                message: $div,
                draggable: true,
                title: title,
                cssClass: 'web-panel '+ (props.buttons?' with-buttons ':'') + (props.class ||'')
            }, props));
            return dialog;
        }
    }
)();