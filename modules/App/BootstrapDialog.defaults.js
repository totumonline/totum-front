(function () {
    BootstrapDialog.BUTTON_SIZES[BootstrapDialog.SIZE_NORMAL] = 'btn-m';
    BootstrapDialog.defaultOptions.animate = false;
    BootstrapDialog.defaultOptions.closeByBackdrop = false;
    BootstrapDialog.defaultOptions.nl2br = false;
    BootstrapDialog.defaultOptions.type = null;
    BootstrapDialog.TYPE_DANGER = null;


    BootstrapDialog.BootstrapDialogModal.prototype.resetScrollbar = function () {
        let openedDialogs = this.getGlobalOpenedDialogs();
        if (openedDialogs.length === 0) {
            this.$body.css('padding-right', 5);
        }
    }

    BootstrapDialog.prototype.initOptions=function (options) {
        this.options = $.extend(true, this.defaultOptions, options);

        let onshown = this.options.onshown;

        this.options.onshown = (dialog)=>{
            if(onshown && typeof onshown==='function'){
                onshown.call(this, dialog);
            }
            let dubleButtons;
            let buttons = dialog.$modalFooter.find('button');
            const getButtons = () => {
                dubleButtons = $('<div style="position: fixed; right: ' + (dialog.$modal.width() - dialog.$modalBody.width() - dialog.$modalBody.offset().left - 10) + 'px; bottom: 20px; z-index: 1100">').appendTo(dialog.$modal).append(buttons)
            }
            setTimeout(()=>{
                if (dialog.$modalFooter.get(0).getBoundingClientRect().top > window.innerHeight - 20) {
                    getButtons();
                }
            }, 200)
            dialog.$modal.on("scroll", () => {
                if (dialog.$modalFooter.get(0).getBoundingClientRect().top > window.innerHeight - 20) {
                    if (!dubleButtons)
                        getButtons();
                } else if (dubleButtons) {
                    dialog.$modalFooter.append(buttons);
                    dubleButtons.remove();
                    dubleButtons = null;
                }
            })
        }


        return this;
    }

})();