(function () {
        App.mobilePanel = function (title, $div, props) {
            props = props || {};

            let dialog = window.top.BootstrapDialog.show($.extend({
                type: 'edit',
                message: $div,
                draggable: true,
                title: title,
                cssClass: 'mobile-panel '+ (props.buttons?' with-buttons':'')
            }, props));
            return dialog;
        }
    }
)();