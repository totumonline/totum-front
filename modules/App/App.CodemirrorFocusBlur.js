(function () {
    App.CodemirrorFocusBlur = function (editor) {
        let btn = $(editor.display.lineDiv).closest('.modal-content').find('.modal-footer .fa-times').closest('button');
        editor.on('focus', (editor) => {
            if (!btn.is(':disabled')) {
                btn.width(btn.width());
                btn.addClass('with-lock')
                btn.prop('disabled', true)

                let times = btn.find('.fa-times').hide();
                let btnTimes = $('<span class="fa fa-lock"/>')
                times.after(btnTimes);
            }
        });
        editor.on('blur', (editor, Event) => {
            if (btn.is(':disabled')) {
                let times = btn.find('.fa-times');
                times.next().remove();
                times.show();
                btn.prop('disabled', null)
            }
        });
    }

})();