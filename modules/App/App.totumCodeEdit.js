(function () {
    App.totumCodeEdit = function (code, title, codeData, checkboxes, canBeSwitchOff) {
        return new Promise((resolve, reject) => {

            let newCodemirrorDiv = $('<div class="HTMLEditor" id="bigOneCodemirror" style="height: 100%;"></div>');
            let wrapper = $('<div class="totum-edit-codes"></div>').append(newCodemirrorDiv);

            let eventName = 'ctrlS.CodeEdit';

            let panelClassSwitcher = () =>{};
            let chsDiv;
            if (checkboxes && checkboxes.length && codeData && codeData.codeType === 'codeAction' && checkboxes) {
                wrapper.append('<div class="code-checkboxes-warning-panel">' + App.translate('There is no any active trigger.') + '</div>')

                panelClassSwitcher = () => {
                    if (chsDiv.find(':checked').length === 0) {
                        wrapper.addClass('code-checkboxes-active-warning');
                    } else {
                        wrapper.removeClass('code-checkboxes-active-warning');
                    }
                }
            }


            let value = code;
            let editorMax;
            let resolved = false


            if (checkboxes && checkboxes.length) {
                chsDiv = $('<div class="flex">').appendTo(wrapper);
                checkboxes.forEach(([name, title, val]) => {
                    let ch = $('<input type="checkbox">').attr('name', name);
                    let chDiv = $('<div class="">').append(ch).append($('<label>').text(title).on('click', () => {
                        ch.trigger('click')
                    }));
                    if (val) {
                        ch.prop("checked", true)
                    }
                    chsDiv.append(chDiv)
                });
                chsDiv.on('change', 'input', panelClassSwitcher)
                panelClassSwitcher()
            }


            let Dialog

            const getCheckboxes = () => {
                let chVals = [];
                if (checkboxes) {
                    wrapper.find('input').each(function () {
                        chVals[this.name] = this.checked;
                    })
                }
                return chVals;
            }
            const save = () => {
                resolved = true;
                resolve({
                    code: editorMax.getValue(),
                    checkboxes: getCheckboxes(),
                })
                Dialog.close();
            }
            $('body').on(eventName, () => {
                save();
            });

            let buttons = [
                {
                    action: save,
                    cssClass: 'btn-warning btn-save',
                    label: App.translate('Save') + ' Alt+S'
                },
                {
                    action: () => {
                        Dialog.close();
                    },
                    cssClass: 'btn-default btn-save',
                    label: '<i class="fa fa-times"></i>'
                }

            ];
            if (canBeSwitchOff)
                buttons.unshift({
                    action: () => {
                        App.confirmation(App.translate("Disable code") + " " + title, {
                            [App.translate('Cancel')]: (dialog) => {
                                dialog.close();
                            },
                            [App.translate("Disable")]: (dialog) => {
                                resolved = true;
                                resolve({
                                    code: editorMax.getValue(),
                                    checkboxes: getCheckboxes(),
                                    switchoff: true,
                                })
                                dialog.close();
                                Dialog.close();
                            }
                        }, App.translate("Code disabling"))
                    },
                    cssClass: 'btn-default btn-save',
                    label: App.translate("Disable")
                })

            window.top.BootstrapDialog.show({
                message: wrapper,
                type: null,
                title: title,
                buttons: buttons,
                cssClass: 'fieldparams-edit-panel',
                draggable: true,
                onhidden: () => {
                    $('body').off(eventName);
                    if (!resolved)
                        reject();
                },
                onshow: function (dialog) {
                    Dialog = dialog;
                    dialog.$modalHeader.css('cursor', 'pointer');

                    let heightDiff = 100;
                    if (chsDiv) {
                        heightDiff += chsDiv.height()
                    }

                    dialog.$modalContent.css({
                        width: "90vw",
                        minHeight: "calc(90vh - " + heightDiff + "px)"
                    });
                },

                onshown: function (dialog) {
                    editorMax = window.top.CodeMirror(newCodemirrorDiv.get(0), {
                        mode: "totum",
                        value: value,
                        theme: 'eclipse',
                        lineNumbers: true,
                        indentWithTabs: true,
                        autoCloseTags: true,
                        bigOneDialog: save
                    });

                    if (codeData) {
                        Object.keys(codeData).forEach((k) => {
                            editorMax[k] = codeData[k]
                        })
                    }

                    let minheight = Math.round(dialog.$modalContent.height() - dialog.$modalHeader.outerHeight() - 40);
                    editorMax.getScrollerElement().style.minHeight = minheight + 'px';
                    newCodemirrorDiv.find('.CodeMirror').css('min-heught', minheight);
                    App.CodemirrorFocusBlur(editorMax)

                    editorMax.focus();
                    dialog.$modalContent.position({
                        my: 'center top',
                        at: 'center top+30px',
                        of: window.top
                    });
                }

            });
        })
    }
})();