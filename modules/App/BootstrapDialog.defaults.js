(function () {
    BootstrapDialog.BUTTON_SIZES[BootstrapDialog.SIZE_NORMAL] = 'btn-m';
    BootstrapDialog.defaultOptions.animate=false;
    BootstrapDialog.defaultOptions.closeByBackdrop=false;
    BootstrapDialog.defaultOptions.nl2br=false;
    BootstrapDialog.defaultOptions.type=null;
    BootstrapDialog.TYPE_DANGER = null;


        BootstrapDialog.BootstrapDialogModal.prototype.resetScrollbar=function(){
        let openedDialogs = this.getGlobalOpenedDialogs();
        if (openedDialogs.length === 0) {
            this.$body.css('padding-right', 5);
        }
    }

})();