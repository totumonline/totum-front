(function () {
    const show_img = function (img, file) {
        img.attr('data-fileviewpreview', JSON.stringify({'name': file.name, file: file.file}))
    }


    fieldTypes.file = {
        icon: 'fa-file-image-o',
        getSize: function (size) {
            if (size > 100 * 1024) {
                return ' ' + (Math.round(size / (1024 * 1024) * 10) / 10).toLocaleString() + 'Mb'
            } else {
                return ' ' + Math.round(size / 1024).toLocaleString() + 'Kb'
            }
        },
        getCellText: function (fieldValue) {
            if (!fieldValue || fieldValue === null || fieldValue.length == 0) return '';
            let div = $('<span style=""></span>');
            const file_images = function (file) {
                let img;
                if (['png', 'jpg'].indexOf(file.ext) !== -1) {
                    img = $('<img src="/fls/' + file.file + '_thumb.jpg" style="z-index: 200; max-height: 24px; padding-right: 4px;" class="file-image-preview" data-filename="' + file.file + '"/>');
                    show_img(img, file);
                }
                else if(file.ext === 'pdf'){
                    img = '<img src="/imgs/file_ico_pdf.png" style="max-height: 24px;  padding-right: 4px;" class="file-pdf-preview" data-filename="/fls/' + file.file + '"/>';
                }
                else {
                    img = '<img src="/imgs/file_ico.png" style="max-height: 24px;  padding-right: 4px;"/>';
                }
                let a = $('<a href="/fls/' + file.file + '"  class="file-sell-text" download="' + $('<div>').text(file.name).html() + '" style="padding-right: 5px"></a>');
                div.append(img)
                a.append(file.name);
                div.append(a);

            };
            if (fieldValue.length && fieldValue.forEach
            ) {
                fieldValue.forEach(file_images);
            }
            return div.children();
        },
        getCopyText: function (fieldValue, item) {
            fieldValue = fieldValue.v;
            if (!fieldValue || fieldValue === null || fieldValue.length == 0) return '';
            let field = this;
            let toCopy = '';
            fieldValue.forEach(function (file) {
                if (toCopy !== '') toCopy += "\n";
                toCopy += file.name + ' ' + window.location.protocol + '//' + window.location.host + '/fls/' + file.file + ' ' + field.getSize(file.size);
            });
            return toCopy;
        }
        ,
        getPanelText: function (fieldValue) {
            if (!fieldValue || fieldValue === null || fieldValue.length == 0) return '';
            let div = $('<div class="file-mini-panel">');
            let field = this;
            let toCopy = '';
            let imgRand = Math.random();
            fieldValue.forEach(function (file) {
                let img = '';
                let _class = '';
                if (['jpg', 'png'].indexOf(file.ext) !== -1) {
                    img = $('<img src="/fls/' + file.file + '_thumb.jpg?rand=' + imgRand + '"/>');
                    _class = 'with-img';
                    show_img(img, file);
                }
                $('<div>').addClass(_class).appendTo(div).append(img).append($('<br/><a href="/fls/' + file.file + '" download="' + $('<div>').text(file.name).html() + '">').text(file.name)).append(field.getSize(file.size));

                if (toCopy !== '') toCopy += "\n";
                toCopy += window.location.protocol + '//' + window.location.host + '/fls/' + file.file;
            });
            return div.data('text', toCopy);
        }
        ,
        getEditVal: function (div) {
            if (this.required && div.data('val') == '') throw App.translate('The field must be entered');
            return div.data('val');
        }
        ,
        getEditElement: function ($oldInput, oldValue, item, enterClbk, escClbk, blurClbk, tabindex, editNow) {
            let field = this;
            let pcTable = this.pcTable;
            let div = $('<div>');
            let dialogBody = $('<div>').css('min-height', 200);
            let buttons, dialog;
            let Files = oldValue.v || [];
            let isEntered = false;

            const printFile = function (file) {
                let addDiv = $('<div class="filePart"><div><span class="name"></span><span class="size"></span><button class="btn btn-danger btn-xs remove"><i class="fa fa-remove"></i></button></div></div>');

                let fl = {
                    name: file.name,
                    type: file.type,
                    tmpfile: file.tmpfile,
                    size: file.size,
                    file: file.file,
                    ext: file.ext
                };
                let regExpName = new RegExp('^' + field.pcTable.tableRow.id + '_' + (item.id ? item.id : ''));
                
                addDiv.data('file', fl);
                addDiv.find('.name').text(file.name);
                addDiv.find('.size').text(field.getSize(file.size));
                if (!file.file) {
                    addDiv.append('<div class="progressbar">&nbsp;</div>');
                } else {
                    let a = $('<a>').attr('href', '/fls/' + file.file).attr('download', file.name);
                    addDiv.find('.name').wrap(a);
                    if (['jpg', 'png'].indexOf(file.ext) !== -1) {
                        $('<img>').attr('src', '/fls/' + file.file + '_thumb.jpg?rand=' + Math.random()).insertBefore(addDiv.find('.name'));
                        addDiv.addClass('with-img')
                    }

                }
                if (file.tmpfile) {
                    addDiv.addClass('addFile');
                    let process = addDiv.find('.progressbar');
                    process.text(App.translate('Required to save the item for file binding'));
                }
                return addDiv;
            };

            const saveDisable = function (disable) {
                dialog.$modalFooter.find('button:first').prop('disabled', disable);
            };

            const formFill = function () {
                dialogBody.empty();
                let fileAdd = $('<input type="file" name = "file" ' + (field.multiple ? 'multiple' : '') + ' accept="' + field.accept + '" style="display: block; position: absolute; top: -3000px"/>');//fileInput

                let addForm = $('<div>').appendTo(dialogBody);
                let btn = $('<button class="btn btn-default btn-sm">' + App.translate(field.multiple ? 'Adding files' : 'Adding file') + '</button>');
                addForm.append(btn);
                btn.wrap('<div class="addFilesButton">');
                btn.wrap('<div>');
                let dropZone = $('<div class="ttm-dropzone" id="ttmDropzone">'+App.translate('Drag and drop the file here')+'</div>').insertAfter(btn.parent())
                dropZone.on('dragenter', () => dropZone.addClass('highlight'))
                dropZone.on('dragleave', () => dropZone.removeClass('highlight'))
                dropZone.on('drop', (e) => {
                    e.preventDefault();
                    dropZone.removeClass('highlight')
                    if (!dropZone.is('.disabled')) {
                        if (!this.multiple && e.originalEvent.dataTransfer.files.length > 1) {
                            App.notify(App.translate('The field accepts only one file'), App.translate('Error'))
                            return false
                        }
                        save(e.originalEvent.dataTransfer.files)
                    }
                    return false;
                })
                const checkBtnDisable = function () {
                    if (!field.multiple) {
                        if (dialogBody.find('.filePart').length > 0) {
                            btn.prop('disabled', true);
                            dropZone.addClass('disabled');
                        } else {
                            btn.prop('disabled', false);
                            dropZone.removeClass('disabled');
                        }
                    }
                };
                const save = function (files) {
                    if (files) {
                        let deffs = [];
                        saveDisable(true);

                        for (let i = 0, numFiles = files.length; i < numFiles; i++) {
                            let file = files[i];
                            let addDiv = printFile(file).addClass('addFile').appendTo(dialogBody);
                            checkBtnDisable();


                            let process = addDiv.find('.progressbar');

                            /*if (file.size > 10 * 1024 * 1024) {
                                process.text('Ошибка - файл больше 10 Mb').css({
                                    'box-shadow': 'none',
                                    'background-color': '#ffe486'
                                });
                                addDiv.on('click', '.remove', function () {
                                    addDiv.remove();
                                    checkBtnDisable();
                                });
                                continue;
                            }*/


                            let xhr = new XMLHttpRequest();
                            let deff = $.Deferred();

                            addDiv.on('click', '.remove', function () {
                                addDiv.remove();
                                xhr.abort();
                                deff.resolve();
                                checkBtnDisable();
                            });

                            xhr.upload.onprogress = function (event) {
                                process.css('box-shadow', 'inset ' + Math.round(parseInt(process.width()) * event.loaded / event.total).toString() + 'px 0px 0 0 #85FF82');
                                if (event.loaded === event.total) {
                                    process.text(App.translate('Checking the file with the server'));
                                }
                            };


                            xhr.onload = xhr.onerror = function (mess) {
                                deff.resolve();

                                if (this.status === 200) {
                                    try {
                                        let ans = JSON.parse(this.responseText);
                                        if (ans.fname) {
                                            process.text(App.translate('Done'));
                                            addDiv.data('file').tmpfile = ans.fname;
                                            return;
                                        }
                                    } catch (e) {

                                    }
                                }
                                addDiv.data('file', null);
                                process.text(App.translate('Error')).css({'box-shadow': 'none', 'background-color': '#ffe486'})

                            };

                            xhr.open("POST", pcTable.model.getUri(), true);

                            let formData = new FormData();
                            formData.append("file", file);
                            formData.append("method", 'tmpFileUpload');
                            formData.append("ajax", true);
                            xhr.send(formData);
                            deffs.push(deff.promise());
                        }
                        $.when(...deffs).then(function () {
                            saveDisable(false)
                        })
                    }
                };


                //Вывести файлы
                Files.forEach(function (fl) {
                    let part = printFile(fl).appendTo(dialogBody);
                    part.on('click', '.remove', function () {
                        part.remove();
                        checkBtnDisable();
                    });
                });

                checkBtnDisable();

                btn.on('click', function () {

                    $('body').append(fileAdd);
                    fileAdd.click();
                    fileAdd.on('change', function () {
                        save(this.files)
                    });
                });

            };

            const save = function (dialog) {
                let files = [];
                dialog.$modalContent.find('.filePart').each(function () {
                    let fileDiv = $(this), file = fileDiv.data('file');
                    if (file) {
                        files.push(file)
                    }
                });
                div.data('val', files);
                Files = files;
                isEntered = true;
                enterClbk(div, {});
                dialog.close();
            };


            buttons = [
                {
                    'label': App.translate('Save')+' Alt+S',
                    cssClass: 'btn-m btn-warning',
                    action: save
                }, {
                    'label': null,
                    icon: 'fa fa-times',
                    cssClass: 'btn-m btn-default btn-empty-with-icon',
                    'action': function (dialog) {
                        enterClbk(div, {});
                        dialog.close();
                    }
                }
            ];

            let title = App.translate('Files form <b>%s</b>', (this.title)) + this.pcTable._getRowTitleByMainField(item, ' (%s)');
            let eventName = 'ctrlS.textdialog';

            let showDialog = function (div) {

                if (field.pcTable.isMobile) {
                    dialog = App.mobilePanel(title, dialogBody, {
                        buttons: buttons,
                        onhide: function (event) {
                            $('body').off(eventName);
                            if (!isEntered) {
                                escClbk(div, event);
                            }
                        },
                        onshown: function (dialog) {
                            formFill();
                            $('body').on(eventName, function (event) {
                                save(dialog);
                            });

                        }
                    })
                } else {
                    dialog = window.top.BootstrapDialog.show({
                        message: dialogBody,
                        type: null,
                        cssClass: 'fieldparams-edit-panel',
                        title: title,
                        draggable: true,
                        buttons: buttons,
                        onhide: function (event) {
                            $('body').off(eventName);
                            if (!isEntered) {
                                escClbk(div, event);
                            }
                        },
                        onshown: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer');
                            dialog.$modalContent.css({
                                width: 600
                            });
                            formFill();

                            $('body').on(eventName, function (event) {
                                save(dialog);
                            });

                        }
                    })
                    div.data('Dialog', dialog);
                }


            };

            if (editNow) {

                showDialog(div);
                div.text(App.translate('Editing in the form')).addClass('edit-in-form');
            } else {
                div.on('keydown', function (event) {
                    if (event.key === 'Tab') {
                        blurClbk(dialog, event, null, true);
                        return
                    }
                    showDialog($(this).closest('div'))
                });
                div.on('focus click keydown', 'button', function () {
                    showDialog($(this).closest('div'))
                });

                let btn = $('<button class="btn btn-default btn-sm text-edit-button">').text(App.translate('Edit field'));
                if (tabindex) btn.attr('tabindex', tabindex);

                div.append(btn);
            }
            return div.data('val', Files);
        }
        ,
        getEditPanelText: function (value) {
            return this.getCellTextInPanel(value.v).children();
        }
        ,
        getCellTextInPanel: function (oldValue) {
            let div = $('<div class="panel-preview"></div>');
            if (oldValue && oldValue.length && oldValue.forEach) {
                oldValue.forEach(function (file) {
                    let img;
                    if (['png', 'jpg'].indexOf(file.ext) !== -1) {
                        img = $('<img src="/fls/' + file.file + '_thumb.jpg" />');
                        show_img(img, file);
                    } else {
                        img = '<img src="/imgs/file_ico.png" />';
                    }

                    let a = $('<div><a href="/fls/' + file.file + '" download="' + $('<div>').text(file.name).html() + '"></a></div>');
                    a.prepend(img)
                    a.find('a').append(file.name);
                    div.append(a);
                });
            }
            return div;
        }
        ,
        isDataModified: function (edited, fromItem) {

            if ([null, ''].indexOf(edited) !== -1 && [null, ''].indexOf(fromItem) !== -1) return false;
            if ([null, ''].indexOf(edited) !== -1 || [null, ''].indexOf(fromItem) !== -1) return true;

            return !Object.equals(fromItem, edited);
        }
    }
})();