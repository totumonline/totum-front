(function () {
    App.totumCodeEdit = function (code, title, table, checkboxes, canBeSwitchOff) {
        return new Promise((resolve, reject) => {

            let newCodemirrorDiv = $('<div class="HTMLEditor" id="bigOneCodemirror" style="height: 100%;"></div>');
            let wrapper = $('<div class="totum-edit-codes"></div>').append(newCodemirrorDiv);

            let eventName = 'ctrlS.CodeEdit';


            let value = code;
            let editorMax;
            let resolved = false

            let chsDiv;

            if (checkboxes) {
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
                    label: 'Cохранить'
                }

            ];
            if (canBeSwitchOff)
                buttons.unshift({
                    action: () => {
                        App.confirmation("Отключить код " + title, {
                            "Отмена": (dialog) => {
                                dialog.close();
                            },
                            'Отключить': (dialog) => {
                                resolved = true;
                                resolve({
                                    code: editorMax.getValue(),
                                    checkboxes: getCheckboxes(),
                                    switchoff: true,
                                })
                                dialog.close();
                                Dialog.close();
                            }
                        }, "Отключение кода")
                    },
                    cssClass: 'btn-default btn-save',
                    label: 'Отключить'
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
                    editorMax = CodeMirror(newCodemirrorDiv.get(0), {
                        mode: "totum",
                        value: value,
                        theme: 'eclipse',
                        lineNumbers: true,
                        indentWithTabs: true,
                        autoCloseTags: true,
                        bigOneDialog: save
                    });

                    if (table) editorMax.table = table;

                    let minheight = Math.round(dialog.$modalContent.height() - dialog.$modalHeader.outerHeight() - 40);
                    editorMax.getScrollerElement().style.minHeight = minheight + 'px';
                    newCodemirrorDiv.find('.CodeMirror').css('min-heught', minheight);
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