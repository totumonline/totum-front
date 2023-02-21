(function () {
    BootstrapDialog.BUTTON_SIZES[BootstrapDialog.SIZE_NORMAL] = 'btn-m';
    BootstrapDialog.defaultOptions.animate = false;
    BootstrapDialog.defaultOptions.closeByBackdrop = false;
    BootstrapDialog.defaultOptions.nl2br = false;
    BootstrapDialog.defaultOptions.type = null;
    BootstrapDialog.TYPE_DANGER = null;

    let bootstrapDialogs = [];
    BootstrapDialog.getTopDialog = () => {
        return bootstrapDialogs[0];
    }

    BootstrapDialog.BootstrapDialogModal.prototype.resetScrollbar = function () {
        let openedDialogs = this.getGlobalOpenedDialogs();
        if (openedDialogs.length === 0) {
            this.$body.css('padding-right', 5);
        }
    }

    BootstrapDialog.prototype.initOptions = function (options) {
        this.options = $.extend(true, this.defaultOptions, options);

        let onshown = this.options.onshown;
        let onhidden = this.options.onhidden;

        this.options.onhidden = (dialog) => {
            if (onhidden && typeof onhidden === 'function') {
                onhidden.call(this, dialog);
            }

            bootstrapDialogs.shift();
        }
        this.options.onshown = (dialog) => {

            bootstrapDialogs.unshift(dialog);

            if (onshown && typeof onshown === 'function') {
                onshown.call(this, dialog);
            }


            let dubleButtons;
            let buttons = dialog.$modalFooter.find('button');
            const getButtons = () => {
                dubleButtons = $('<div class="float-footer-buttons" style="right: ' + (dialog.$modal.width() - dialog.$modalBody.width() - dialog.$modalBody.offset().left - 10) + 'px; ">').appendTo(dialog.$modal).append(buttons)
            }
            setTimeout(() => {
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