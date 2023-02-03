App.pcTableMain.prototype._tableExtButtons = function () {
    let dialog;
    let $dialog = $('<div class="print-choosing"></div>');

    let pcTable = this;

    this.f.extbuttons.forEach((name) => {
        let field = this.fields[name];
        if (field && field.type === 'button') {
            let td = $('<div class="button-wrapper no-width">').data('field', name).appendTo($dialog);
            let $btn = field.getCellText(null, td, this.data_params).appendTo(td)
            $btn.wrap('<span class="cell-value">').on('click', function () {
                pcTable._buttonClick(td, field);
                dialog.close();
            })
        }
    })

    let buttons = [
        {
            label: App.translate('Cancel'),
            action: function (dialogRef) {
                dialogRef.close();
            }
        }
    ];


    dialog = window.top.BootstrapDialog.show({
        message: $dialog,
        type: null,
        buttons: buttons,
        draggable: true
    })
}