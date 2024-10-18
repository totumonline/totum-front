(function () {
    App.totumCodeEdit = function (code, title, codeData, checkboxes, canBeSwitchOff, isSwitchedOff) {
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

            if(isSwitchedOff){
                title = $(title).append('<span class="switched-off-code"><i class="fa fa-chain-broken"></i></span>');
            }

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
                        lineWrapping: App.lineWrapping(),
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

                    <!---->

                    dialog.$modalHeader.find('button.close').append('<i class="fa fa-commenting AI-add-panel"></i>')

                    dialog.$modalHeader.find('button.close .AI-add-panel').on('click', function () {
                        let $htmlBlock = dialog.$modalBody.find('.bootstrap-dialog-message')
                        if ($htmlBlock.is('.With-AI')){
                            $htmlBlock.removeClass('With-AI').find('.AI-Block').remove()
                            editorMax.getScrollerElement().style.minHeight = minheight + 'px';
                            return false
                        }
                        editorMax.getScrollerElement().style.minHeight = "";

                        $htmlBlock.addClass('With-AI With-AI2')


                        let $AIBlock = $('<div class="AI-Block">')

                        $htmlBlock.append($AIBlock)

                        let $AIDialog = $('<div class="AI-Dialog"></div>');

                        $AIBlock.append($AIDialog)
                        $modal = $AIDialog.closest('.modal')

                        $modal.on('scroll', ()=>{
                            $AIDialog.css('padding-top', $modal.scrollTop()-30)
                        })



                        let $AIButtons = $('<div class="AI-Buttons" style=""><button>Send</button><button name="ask_selected">Ask selected</button><button name="stop">Stop</button><button name="new">New</button></div>')
                        let sendButton = $AIButtons.find('button:first')
                        let stopButton = $AIButtons.find('button[name="stop"]')
                        let newButton = $AIButtons.find('button[name="new"]')

                        let setButton = $AIButtons.find('button[name="set_selected"]')
                        let $Input = $('<div class="AI-Input"><textarea placeholder=">" ></textarea></div>')

                        $AIBlock.append($Input).append($AIButtons)

                        editorMax.refresh()

                        const sendMessage = window.AIINtegrate($htmlBlock.find('.AI-Dialog').get(0), $Input.find('textarea').get(0), sendButton.get(0), stopButton.get(0), newButton.get(0), editorMax.table)
                        $AIBlock.find('.AI-Dialog').on('click', '.code-action', function(){
                            editorMax.replaceSelection($(this).data('editor').getValue());
                        })


                        $AIButtons.find('button[name="ask_selected"]').on('click', () => {
                            if (editorMax.getSelection().trim() !== '') {
                                let text = $Input.find('textarea').data('editor').getValue().trim()
                                sendMessage(editorMax.getSelection() + (text != "" ? "\n" + text : ""))
                            }
                        })
                        return false;
                    })
                }

            });
        })
    }
})();