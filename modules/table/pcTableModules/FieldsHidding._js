;(function () {

    $.extend(App.pcTableMain.prototype, {
        ___fieldsHiddingShowAllButton: null,
        _hideHell_storage: {
            isset_fields: false,
            opened: null,
            blinkIt: false,
            getOpened: function () {
                if (this._hideHell_storage.opened === null) {
                    this._hideHell_storage.opened = hiddingHellStorage.getSavedOpenedVal(this.tableRow)
                    if (this._hideHell_storage.opened === false) {
                        this._hideHell_storage.blinkIt = true;
                    }
                }
                return this._hideHell_storage.opened;
            },
            checkIssetFields: function (force) {
                if (this.isCreatorView && this._beforeSpace) {
                    let isset_fields = this._hideHell_storage.isset_fields;
                    this._hideHell_storage.isset_fields = (Object.keys(this.hidden_fields).length || Object.keys(this.fields).some((field) => field !== 'n' && (!this.fields[field].showMeWidth || this.fields[field].showMeWidth < 1)));


                    if (force || isset_fields !== this._hideHell_storage.isset_fields) {
                        let hh = this._beforeSpace.find('#hide-hell').removeClass('btn-contour');
                        if (this._hideHell_storage.isset_fields) {
                            hh.removeAttr('disabled');
                            if (this._hideHell_storage.opened) {
                                hh.find('i').addClass('fa-arrow-up').removeClass('fa-arrow-down').removeClass('fa-times')
                                hh.addClass('btn-contour');
                            } else {
                                hh.find('i').removeClass('fa-arrow-up').addClass('fa-arrow-down').removeClass('fa-times');

                                if (this._hideHell_storage.blinkIt) {
                                    App.blink(hh, 8, '#fff');
                                    this._hideHell_storage.blinkIt = false;
                                }
                            }
                        } else {
                            hh.attr('disabled', 'disabled');
                            hh.find('i').addClass('fa-times').removeClass('fa-arrow-up').removeClass('fa-arrow-down')
                        }


                    }
                }
            },

            switchOpened: function () {
                this._hideHell_storage.opened = !this._hideHell_storage.opened;
                this._hideHell_storage.checkIssetFields.call(this, true);
                hiddingHellStorage.saveOpenedVal(this.tableRow, this._hideHell_storage.opened);
                this._refreshHiddenFieldsBlock();
            }
        },
        fieldsHiddingHide: function (fieldName, showMe) {
            let visibleFields = hiddingStorage.get(this.tableRow) || {};
            if (showMe) {
                visibleFields[fieldName] = this.fields[fieldName].width;
            } else {
                delete visibleFields[fieldName];
            }
            this.setVisibleFields(visibleFields);
        },
        setVisibleColumns: function () {
            let pcTable = this;
            this.fieldCategories.visibleColumns = [];
            this.fieldCategories.column.forEach(function (field) {
                if (field.showMeWidth) {
                    pcTable.fieldCategories.visibleColumns.push(field);
                }
            });

        },
        setColumnWidth: function (name, width, fieldId) {
            let visibleFields = hiddingStorage.get(this.tableRow) || {};
            visibleFields[name] = width;
            let self = this;
            if (fieldId) {
                App.getPcTableById(2).then(function (pcTableTablesFields) {
                    pcTableTablesFields.model.checkEditRow({id: fieldId}).then(function (json) {
                        if (json.row) {
                            json.row.data_src.v.width.Val = parseInt(width);
                            pcTableTablesFields.model.save({[fieldId]: json.row}).then(function () {
                                self.setVisibleFields(visibleFields);
                            })
                        }
                    })
                })
            } else {
                this.setVisibleFields(visibleFields);
            }
        },
        loadVisibleFields: function (hideShowForse) {

            let visibleFields = {};
            let storageDate = hiddingStorage.getDate(this.tableRow);
            hideShowForse = hideShowForse || {};

            if (!storageDate || (this.tableRow.fields_actuality != '' && this.tableRow.fields_actuality > storageDate)) {
                //Тут будет табличка про обновление настроек - когда-нибудь
                this.setVisibleFields(visibleFields, true, moment().format(App.dateTimeFormats.db), hideShowForse);
            } else {
                visibleFields = hiddingStorage.get(this.tableRow) || {};
                this.setVisibleFields(visibleFields, true, undefined, hideShowForse);
            }
        },
        setVisibleFields: function (visibleFields, isFromLoad, updatedDate, hideShowForse) {
            let pcTable = this;
            let isRowsChanged = false, isOthersChanged = false;
            hideShowForse = hideShowForse || {};

            if (visibleFields && Object.keys(visibleFields).length === 0) {
                visibleFields = {};
                Object.values(pcTable.fields).forEach(function (field) {
                    let newVal = (field.hidden && hideShowForse[field.name] !== false) || hideShowForse[field.name] === true ? 0 : field.width;


                    if (newVal != pcTable.fields[field.name].showMeWidth)
                        if (field.category === 'column' || (field.category === 'footer' && field.column)) {
                            isRowsChanged = true;
                        } else
                            isOthersChanged = true;

                    pcTable.fields[field.name].showMeWidth = newVal;
                    visibleFields[field.name] = pcTable.fields[field.name].showMeWidth;
                });
            } else {

                Object.values(pcTable.fields).forEach(function (field) {
                    let newVal;
                    if (field.category === 'filter') {
                        newVal = field.width;
                    } else if (visibleFields[field.name] !== undefined) {
                        newVal = parseInt(visibleFields[field.name]);
                    } else {
                        newVal = isFromLoad && !field.hidden ? field.width : 0;
                    }
                    if (field.name in hideShowForse) {
                        if (hideShowForse[field.name] === true) {
                            newVal = 0
                        } else {
                            newVal = field.width;
                        }
                    }

                    if (newVal != pcTable.fields[field.name].showMeWidth)
                        if (field.category === 'column' || (field.category === 'footer' && field.column)) {
                            isRowsChanged = true;
                        } else
                            isOthersChanged = true;
                    pcTable.fields[field.name].showMeWidth = newVal
                    visibleFields[field.name] = pcTable.fields[field.name].showMeWidth;

                });
            }
            hiddingStorage.set(visibleFields, this.tableRow, updatedDate);
            /*
                    let onlyVisibleFields = [];
                    Object.keys(visibleFields).forEach(function (fieldName) {
                        if (visibleFields[fieldName] > 0) {
                            onlyVisibleFields.push(fieldName)
                        }
                    });
                      $.cookie("tableViewFields" + this.tableRow.id, null, '/');
                      $.cookie("tableViewFields" + this.tableRow.id, null, {path: window.location.pathname});
              */

            this.setVisibleColumns();


            if (this._header) {
                if (isOthersChanged)
                    this.setWidthes();
                if (isRowsChanged) {
                    this._refreshHead();
                    this.rowButtonsCalcWidth();
                    this._refreshContentTable(true);
                    this._rowsButtons();
                    this._rerenderColumnsFooter();

                    /*Удаляем строки с не тем количеством столбцов*/
                    Object.keys(this.data).forEach((id) => {
                        delete this.data[id].$tr;
                    });
                    this.ScrollClasterized.insertToDOM(null, true, true);
                }
                if (this.isCreatorView) {
                    this._hideHell_storage.checkIssetFields.call(pcTable);
                    this._refreshHiddenFieldsBlock();
                }
            }

            this.fieldsHiddingGetButton();
            if (this._insertRow) this._closeInsertRow();


        }, hideAdminViewFields: function () {
            let pcTable = this;
            let visibleFields = hiddingStorage.get(this.tableRow) || {};
            Object.keys(visibleFields).forEach(function (fieldName) {
                let fieldWidth = visibleFields[fieldName];
                if (fieldWidth > 0) {
                    let field = pcTable.fields[fieldName];
                    if (!field || field.webRoles && field.webRoles.length === 1 && field.webRoles[0] == "1") {
                        delete visibleFields[fieldName];
                    }
                }
            });

            this.setVisibleFields(visibleFields);
        },
        setDefaultVisibleFields: function () {
            let fields = {};
            let pcTable = this;
            Object.values(pcTable.fields).forEach(function (field) {
                if (!field.hidden) {
                    fields[field.name] = field.width;
                } else {
                    fields[field.name] = 0;
                }
            });
            pcTable.setVisibleFields.call(pcTable, fields);
        },
        fieldsHiddingShowPanel: function () {
            let pcTable = this;
            let $fieldsDiv = $('<div class="hidding-form">');
            let lastCheck, dialog;

            const refreshDefaultEyeGroups = function (setsDiv) {

                setsDiv = setsDiv || $('#defaultEyeGroups'),
                    sets = pcTable.tableRow.fields_sets || [];

                setsDiv.empty().append('<b>Наборы по умолчанию:</b> ');

                sets.forEach(function (set, i) {
                    let link = $('<a href="#">').text(set.name).data('index', i);
                    setsDiv.append(link.wrap('<span>').parent());
                    if (pcTable.isCreatorView) {
                        if (i > 0) {
                            link.parent().append($('<button class="btn btn-xxs field_name"><i class="fa fa-arrow-left"></i></button>').data('index', i));
                        }
                        link.parent().append($('<button class="btn btn-xxs field_name"><i class="fa fa-remove"></i></button>').data('index', i));
                    }
                });
                setsDiv.off();
                if (pcTable.isCreatorView) {
                    setsDiv.on('click', '.btn', function () {
                        let i = $(this).find('i');
                        if (i.is('.fa-remove')) {
                            let remove = $(this);
                            pcTable.model.removeEyeGroupSet(remove.data('index')).then(function (json) {
                                pcTable.tableRow.fields_sets = json.sets;
                                refreshDefaultEyeGroups();
                            })
                        } else {
                            let leftMe = $(this);
                            pcTable.model.leftEyeGroupSet(leftMe.data('index')).then(function (json) {
                                pcTable.tableRow.fields_sets = json.sets;
                                refreshDefaultEyeGroups();
                            })
                        }
                    });
                }
                setsDiv.on('click', 'a', function () {
                    let index = $(this).data('index');
                    let fields = sets[index]['fields'];
                    if (Array.isArray(fields)) {
                        let _fields = {};
                        fields.forEach(function (fName) {
                            if (pcTable.fields[fName]) {
                                _fields[fName] = pcTable.fields[fName].width;
                            }
                        });
                        fields = _fields;
                    }
                    pcTable.setVisibleFields.call(pcTable, fields);
                    dialog.close();
                });
            };

            let sets = hiddingSetsStorage.getNames(pcTable.tableRow);
            if (sets && sets.length) {
                let setsDiv = $('<div class="fieldsHiddenSets">').appendTo($fieldsDiv);

                setsDiv.append('<b>Наборы:</b> ');

                sets.forEach(function (name) {
                    let link = $('<a href="#">').text(name).data('name', name);
                    setsDiv.append(link.wrap('<span>').parent());
                    let span = link.parent();
                    span.append($('<button class="btn btn-xxs" data-action="remove"><i class="fa fa-remove"></i></button>').data('name', name));
                    if (pcTable.isCreatorView) {
                        span.append($('<button class="btn btn-xxs field_name" data-action="addDefaultSet" title="Сохранить как набор по умолчанию"><i class="fa fa-save"></i></button>').data('name', name));
                    }
                });
                setsDiv.on('click', '.btn', function () {
                    let remove = $(this),
                        name = remove.data('name');

                    if (pcTable.isCreatorView && $(this).data('action') === 'addDefaultSet') {
                        let fields = hiddingSetsStorage.get(pcTable.tableRow, name) || [];
                        pcTable.model.AddEyeGroupSet(name, fields).then(function (json) {
                            pcTable.tableRow.fields_sets = json.sets;
                            refreshDefaultEyeGroups();
                            hiddingSetsStorage.remove(pcTable.tableRow, name);
                            remove.parent().remove();
                        });
                        return;
                    }
                    hiddingSetsStorage.remove(pcTable.tableRow, name);
                    remove.parent().remove();
                });


                setsDiv.on('click', 'a', function () {
                    let a = $(this);
                    let name = a.data('name');
                    let fields = hiddingSetsStorage.get(pcTable.tableRow, name) || [];
                    pcTable.setVisibleFields.call(pcTable, fields);
                    dialog.close();
                });
            }

            sets = pcTable.tableRow.fields_sets || [];

            let setsDiv = $('<div class="fieldsHiddenSets" id="defaultEyeGroups">').appendTo($fieldsDiv);

            if (sets && sets.length) {
                refreshDefaultEyeGroups(setsDiv);
            }


            $fieldsDiv.on('click', 'input[type="checkbox"]', function (event) {
                let input = $(this);
                let formDiv = input.closest('.hidding-form');
                if (event.shiftKey) {
                    let index = formDiv.find('input').index(input);
                    let _i = formDiv.find('input').index($(this));

                    formDiv.find('input').each(function (i) {
                        if ((_i <= i && i < lastCheck) || (_i >= i && i > lastCheck)) {
                            $(this).prop('checked', input.is(':checked') ? 'checked' : false).trigger('change');
                        }
                    });

                } else {
                    lastCheck = formDiv.find('input').index($(this));
                }
            });

            let buttons = [
                {
                    label: 'Применить',
                    action: function (dialogRef) {
                        let fields = {};
                        $fieldsDiv.find('input:checked').each(function () {
                            let input = $(this);
                            fields[input.attr('name')] = parseInt(input.closest('div').find('input[type="number"]').val()) || null;
                        });
                        pcTable.setVisibleFields.call(pcTable, fields);
                        dialogRef.close();

                    }
                },
                {
                    label: 'По умолчанию',
                    action: function (dialogRef) {
                        dialogRef.close();
                        pcTable.setDefaultVisibleFields.call(pcTable);

                    }
                },
                {
                    label: 'Показать все',
                    action: function (dialogRef) {
                        dialogRef.close();
                        let fields = {};
                        Object.values(pcTable.fields).forEach(function (field) {
                            fields[field.name] = field.width;
                        });
                        pcTable.setVisibleFields.call(pcTable, fields);
                    }
                },
                {
                    label: 'Создать набор',
                    action: function (dialogRef) {

                        let fields = {};
                        $fieldsDiv.find('input:checked').each(function () {
                            let input = $(this);
                            fields[input.attr('name')] = parseInt(input.closest('div').find('input[type="number"]').val()) || null;
                        });
                        pcTable.setVisibleFields.call(pcTable, fields);
                        dialogRef.close();

                        let $divSetName = $('<div></div>');
                        $divSetName.append('<div style="padding-top: 10px;"><label>Название набора</label><input type="text" id="fieldsSetName" class="form-control"/></div>');
                        window.top.BootstrapDialog.show({
                            message: $divSetName,
                            title: 'Сохранить набор полей',
                            type: null,
                            buttons: [
                                {
                                    label: 'Сохранить',
                                    action: function (dialog) {
                                        let $input = $divSetName.find('#fieldsSetName');
                                        if ($input.val().trim() === '') {
                                            $input.addClass('error');
                                        } else {
                                            hiddingSetsStorage.set(pcTable.tableRow, fields, $input.val().trim());
                                            dialog.close();
                                        }
                                    }
                                },
                                {
                                    'label': null,
                                    icon: 'fa fa-times',
                                    cssClass: 'btn-m btn-default btn-empty-with-icon',
                                    action: function (dialog) {
                                        dialog.close();
                                    }
                                }
                            ],
                            draggable: true
                        })
                    }

                },
                {
                    label: 'Отмена',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }

            ];

            if (pcTable.isCreatorView) {
                buttons.splice(2, 0, {
                    label: 'Скрыть адм.поля',
                    action: function (dialogRef) {
                        dialogRef.close();
                        pcTable.hideAdminViewFields.call(pcTable);

                    }
                })
            }

            let categories = {'param': 'Хэдер', 'column': 'Колонки', 'footer': 'Футер'};
            Object.keys(categories).forEach(function (category) {

                if (pcTable.fieldCategories[category] && pcTable.fieldCategories[category].length) {

                    $fieldsDiv.append('<div class="category-name">' + categories[category] + '</div>');
                    $.each(pcTable.fieldCategories[category], function (k, field) {
                        let hidden = '';
                        if (field.hidden) {
                            hidden = ' (Скрыто по умолчанию)';
                        }
                        let fCheckbox = $('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="' + field.name + '" class="form-check-input"> ' + field.title + hidden + '</label> <input type="number" placeholder="' + field.width + '" value="' + (field.showMeWidth && field.showMeWidth !== field.width ? field.showMeWidth : field.width) + '"/></div>');
                        if (field.showMeWidth) {
                            fCheckbox.find('input').prop('checked', true);
                            fCheckbox.attr('data-checked', true);
                        }
                        fCheckbox.appendTo($fieldsDiv);
                    });

                }
            });

            $fieldsDiv.on('change', 'input[type="checkbox"]', function () {
                let div = $(this).closest('div');
                if ($(this).is(':checked')) {
                    div.attr('data-checked', true);
                } else {
                    div.removeAttr('data-checked');
                }
            });


            dialog = window.top.BootstrapDialog.show({
                message: $fieldsDiv,
                title: 'Видимость полей',
                buttons: buttons,
                type: null,
                draggable: true,
                onshow: function (dialog) {
                    if (pcTable.isCreatorView) {
                        dialog.$modalContent.css({
                            width: "800px",
                        });
                    }
                },
            })
        },
        fieldsHiddingGetButton: function (blinkMe) {
            "use strict";

            let pcTable = this;

            if (!this.___fieldsHiddingShowAllButton) {

                let timeout;

                this.___fieldsHiddingShowAllButton = $('<button class="btn btn-sm"><span class="fa fa-eye-slash"></span></button>')
                    .on('click', function () {
                        pcTable.fieldsHiddingShowPanel.call(pcTable)
                    }).on('contextmenu', function () {
                        if (!pcTable.isCreatorView) {
                            pcTable.setDefaultVisibleFields.call(pcTable);
                        } else if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                            pcTable.hideAdminViewFields.call(pcTable, true);
                        } else {
                            timeout = setTimeout(function () {
                                pcTable.setDefaultVisibleFields.call(pcTable);
                                timeout = null;
                            }, 500);
                        }
                        return false;
                    });
            }

            let isHidedExtraFields = Object.values(pcTable.fields).some(function (field) {
                if (field.showInWeb && !field.hidden && !field.showMeWidth) return true;
            });

            if (!isHidedExtraFields) {
                this.___fieldsHiddingShowAllButton.addClass('btn-default');
                this.___fieldsHiddingShowAllButton.removeClass('btn-warning');

            } else {
                this.___fieldsHiddingShowAllButton.addClass('btn-warning');
                this.___fieldsHiddingShowAllButton.removeClass('btn-default');
                if (blinkMe) {
                    App.blink(this.___fieldsHiddingShowAllButton, 8, '#fff');
                }
            }
            return this.___fieldsHiddingShowAllButton;
        }
    });

    let storageName = 'pcTableShowFieldsWithDates';
    let getTableId = function (tableRow) {
        let tableId = tableRow.id;
        if (tableRow.type === 'calcs') {
            tableId += '$' + tableRow.__version
        }
        return tableId;
    };
    let hiddingHellStorage = {
        saveOpenedVal: function (tableRow, opened) {
            localStorage.setItem(this.getKeyString(tableRow), opened.toString());
        },
        getKeyString: function (tableRow) {
            return tableRow.id + '/' + tableRow.__version
        },
        getSavedOpenedVal: function (tableRow) {
            let json = localStorage.getItem(this.getKeyString(tableRow));
            if (json) {
                return JSON.parse(json)
            }
            return true;
        }
    };

    let hiddingStorage = {
        set: function (fields, tableRow, dt) {

            let tableId = getTableId(tableRow);

            let sessionFilters = {};
            let filters = fields || {};
            try {
                sessionFilters = JSON.parse(localStorage.getItem(storageName)) || {};
            } catch (error) {

            }
            if (dt || !sessionFilters[tableId]) {
                sessionFilters[tableId] = [filters, dt];
            } else {
                sessionFilters[tableId][0] = filters;
            }
            localStorage.setItem(storageName, JSON.stringify(sessionFilters));
        },
        get: function (tableRow) {
            let tableId = getTableId(tableRow);
            return hiddingStorage.getInner(tableId)[0];
        },
        getDate: function (tableRow) {
            let tableId = getTableId(tableRow);
            return hiddingStorage.getInner(tableId)[1];
        },
        getInner: function (tableId) {
            let session, fields, date;
            try {
                session = JSON.parse(localStorage.getItem(storageName)) || {};
            } catch (error) {
                session = {};
            }
            return session[tableId] || []
        }
    };
    let hiddingSetsStorage = {
        set: function (tableRow, fields, name) {
            let tableId = getTableId(tableRow);

            let SetsFoFields = [];
            let storageName = 'pcTableShowFieldsSets' + tableId;

            let filters = fields || [];
            try {
                SetsFoFields = JSON.parse(localStorage.getItem(storageName)) || {};
            } catch (error) {

            }
            SetsFoFields[name] = filters;
            localStorage.setItem(storageName, JSON.stringify(SetsFoFields));
        },
        get: function (tableRow, name) {
            let tableId = getTableId(tableRow);
            let setFields;
            let storageName = 'pcTableShowFieldsSets' + tableId;
            try {
                setFields = JSON.parse(localStorage.getItem(storageName));
                setFields = setFields[name];
            } catch (error) {
            }

            if (setFields === null || setFields === undefined) setFields = undefined;
            return setFields;
        },
        getNames: function (tableRow) {
            let tableId = getTableId(tableRow);

            let setFields;
            let storageName = 'pcTableShowFieldsSets' + tableId;
            try {
                setFields = JSON.parse(localStorage.getItem(storageName));
                return Object.keys(setFields);
            } catch (error) {
            }
            if (setFields === null || setFields === undefined) setFields = undefined;
            return setFields;
        },
        remove: function (tableRow, name) {
            let tableId = getTableId(tableRow);
            let setFields;
            let storageName = 'pcTableShowFieldsSets' + tableId;
            try {
                setFields = JSON.parse(localStorage.getItem(storageName));
                delete setFields[name];
                localStorage.setItem(storageName, JSON.stringify(setFields));
            } catch (error) {
            }
        }
    };
})();