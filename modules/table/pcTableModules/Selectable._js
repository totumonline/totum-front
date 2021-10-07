App.pcTableMain.prototype.isSelected = function (fieldName, itemId) {
    if (this.selectedCells && this.selectedCells.ids[fieldName] && this.selectedCells.ids[fieldName].indexOf(itemId) !== -1) {
        return true;
    }
    return false;
};
(function () {
    let eventNameKeyUp = 'keyup.selectPanelDestroy';
    let eventNameClick = 'click.selectPanelDestroy';

    App.pcTableMain.prototype.getSelectPanel = function (field, item, td) {
        let pcTable = this;
        let selectObject = pcTable.selectedCells;
        selectObject.selectPanelDestroy();

        let $panel = $('<div id="selectPanel" class="text">');

        let textDivHeight = 200;

        let columnName = $('<div class="column-name"></div>').text(field.title);
        if (field.unitType) {
            columnName.append(', ' + field.unitType);
        }
        $panel.append(columnName);

        if (field.type === 'text') {
            columnName.append(', ' + field.textType);
        }
        $panel.append(columnName);


        let rowName = '';
        if (field.category === 'column') {
            rowName = '<span class="id-val">[' + item.id + ']</span>' + pcTable._getRowTitleByMainField(item, ' %s');
            let columnName = $('<div class="row-name"></div>').html(rowName);

            $panel.append(columnName);
        }


        let val = item[field.name];

        let allTextData = $('<div id="selectPanelBig">');
        let textDiv = $('<div class="field-value"><div class="copytext-wrapper"><div class="copytext"></div></div></div>').css('white-space', 'pre-wrap');
        if (pcTable.isMobile) {
            textDiv.height('auto').css('min-height', 40);
        } else {
            textDiv.height(textDivHeight);
        }

        allTextData.append(textDiv).appendTo($panel);

        let textInner = textDiv.find('.copytext');
        if (field.unitType && (val.v) !== null && !(field.type === 'select' && field.multiple)) {
            textInner.attr('data-unit', field.unitType);
        }

        if (val.f) {

            if (val.f.text)
                textDiv.prepend($('<div class="sp-element"><i class="fa fa-font"></i> </div>').append(val.f.text));
            if (val.f.comment)
                textDiv.prepend($('<div class="sp-element"><i class="fa fa-info"></i> </div>').append(val.f.comment));

        }

        if (val.h && val.f && val.f.showhand !== false) {
            if (val.c !== undefined) {
                let c = val.c;
                if (val.c_) {
                    c = val.c_[0];
                    if (val.c_[1]) {
                        c = $('<span class="deleted_value">').text(c);
                    }
                }
                textDiv.append($('<div><i class="fa fa-hand-paper-o"></i> ' + App.translate('Calculated value') + ': </div>').append(c));
            } else
                textDiv.append('<div><i class="fa fa-hand-grab-o pull-left"></i> ' + App.translate('Same as calculated') + '</div>');
        }

        let divForPannelFormats = $('<div><div class="center"><i class="fa fa-spinner fa-spin"></i></div></div>');

        if (field.formatInPanel) {
            textDiv.append(divForPannelFormats);
            divForPannelFormats.data('loadFormats', function () {
                field.pcTable.model.getPanelFormats(field.name, item.id).then((json) => {
                    field.getPanelFormats(divForPannelFormats, json.panelFormats)
                })
            })
        }

        if (field.selectTable) {
            if (field.changeSelectTable) {
                let divForPanneSelect = $('<div><div class="center"></div></div>');

                if (field.multi) {
                    if (val.v && val.v.length) {
                        let btn = $('<button class="btn btn-default btn-xxs"></button>').text(App.translate('Edit')).on('click', () => {
                            field.sourceButtonClick(item);
                        });
                        divForPanneSelect.append($('<div class="panel-buttons">').append(btn)).appendTo(textDiv);
                    }
                } else if (val.v && !val.v_[1]) {
                    let btn = $('<button class="btn btn-default btn-xxs"></button>').text(App.translate('Edit')).on('click', () => {
                        field.sourceButtonClick(item).then((data) => {
                            if (data && data.json && data.json.updated) {
                                pcTable.model.refresh();
                            }
                        });
                    });
                    divForPanneSelect.append($('<div class="panel-buttons">').append(btn)).appendTo(textDiv);
                }
            } else if (field.viewSelectTable) {
                let divForPanneSelect = $('<div><div class="center"></div></div>');

                if (field.multi) {
                    if (val.v && val.v.length) {
                        let btn = $('<button class="btn btn-default btn-xxs"></button>').text(App.translate('View')).on('click', () => {
                            field.sourceButtonClick(item);
                        });
                        divForPanneSelect.append($('<div class="panel-buttons">').append(btn)).appendTo(textDiv);
                    }
                } else if (val.v && !val.v_[1]) {
                    let btn = $('<button class="btn btn-default btn-xxs"></button>').text(App.translate('View')).on('click', () => {
                        field.sourceButtonClick(item).then((data) => {
                            if (data && data.json && data.json.updated) {
                                pcTable.model.refresh();
                            }
                        });
                    });
                    divForPanneSelect.append($('<div class="panel-buttons">').append(btn)).appendTo(textDiv);
                }
            }
        }


        let btnCopy;
        let btns = $('<div class="buttons"></div>');
        let mobileButtons = [];

        //copy
        {
            btnCopy = $('<button class="btn btn-sm btn-default copy_me" disabled data-copied-text="' + App.translate('Copied') + '" title="' + App.translate('Copy') + ' "><i class="fa fa-copy"></i></button>');
            btnCopy.on('click', function () {
                if (textInner.data('text')) {
                    App.copyMe(textInner.data('text'));
                } else {
                    App.copyMe(textInner.text());
                }
                let button = $(this);
                button.width(button.width());
                button.button('copied');
                setTimeout(function () {
                    button.button('reset');
                }, 1000);
                button.blur();
                return false;
            });

            btns.append(btnCopy);
        }

        //edit
        if (td.is('.edt, .panel-edt')) {
            mobileButtons.push({
                label: '<i class="fa fa-pencil-square-o"></i>',
                action: function (dialog) {
                    dialog.close();
                    td.dblclick();
                }
            });
            let editButton = $('<button class="btn btn-sm btn-default"><i class="fa fa-pencil-square-o"></i></button>')
                .appendTo(btns);
            if (pcTable.viewType === 'panels') {
                editButton.on('click', function () {
                    pcTable.editSingleFieldInPanel(field, item.id).then((json) => {
                        if (json) {
                            pcTable.table_modify(json);
                        }
                    }).catch((error) => {
                        console.log(error);
                    });
                    selectObject.selectPanelDestroy();
                })
            } else {
                editButton.on('click', function () {
                    td.dblclick();
                    return false;
                })
            }

        }


        //filter

        if (field.category === 'column' && field.filterable) {
            if (pcTable.isValInFilters.call(pcTable, field.name, val)) {
                mobileButtons.push({
                    label: '<i class="fa fa-filter" style="color: #ffe486"></i>',
                    action: function (dialog) {
                        selectObject.selectPanelDestroy();
                        pcTable.removeValueFromFilters.call(pcTable, field.name, val);
                        dialog.close();
                    }
                });

                $('<button class="btn btn-sm btn-warning" title="' + App.translate("Remove from the filter") + '"><i class="fa fa-filter"></i></button>')
                    .on('click', function () {
                        selectObject.selectPanelDestroy();
                        pcTable.removeValueFromFilters.call(pcTable, field.name, val)
                        return false;
                    })
                    .appendTo(btns);
            } else {
                mobileButtons.push({
                    label: '<i class="fa fa-filter"></i>',
                    action: function (dialog) {
                        selectObject.selectPanelDestroy();
                        pcTable.addValueToFilters.call(pcTable, field.name, val);
                        pcTable._container.scrollTop(pcTable._filtersBlock.offset().top - pcTable.scrollWrapper.offset().top);
                        pcTable.ScrollClasterized.insertToDOM.call(pcTable.ScrollClasterized, 0);
                        dialog.close();
                    }
                });

                $('<button class="btn btn-sm btn-default" title="' + App.translate('Add to the filter') + '"><i class="fa fa-filter"></i></button>')
                    .on('click', function () {
                        selectObject.selectPanelDestroy();
                        pcTable.addValueToFilters.call(pcTable, field.name, val);
                        pcTable._container.scrollTop(pcTable._filtersBlock.offset().top - pcTable.scrollWrapper.offset().top);
                        pcTable.ScrollClasterized.insertToDOM.call(pcTable.ScrollClasterized, 0);
                        return false;
                    })
                    .appendTo(btns);

            }
        }


        if (!pcTable.isMobile) {
            //expand
            let btn = $('<button class="btn btn-sm btn-default"><i class="fa fa-expand" style="padding-top: 3px;" aria-hidden="true"></i></button>');

            btn.on('click', function () {
                allTextData.find('.field-value').height('');
                allTextData.find('.panel-img img').each((ind, img) => {
                    img = $(img);
                    img.attr('src', img.attr('src').replace('_thumb.jpg?', '?'))
                });
                window.top.BootstrapDialog.show({
                    message: allTextData,
                    type: null,
                    title: columnName.text() + (rowName ? " / " + rowName : ''),
                    cssClass: 'fieldparams-edit-panel',
                    draggable: true,
                    onshow: function (dialog) {
                        dialog.$modalHeader.css('cursor', 'pointer');
                        dialog.$modalContent.css({
                            width: "90vw",
                            minHeight: "90vh"
                        });
                        selectObject.selectPanelDestroy();
                    },
                    onshown: function (dialog) {
                        dialog.$modalContent.position({
                            my: 'center top',
                            at: 'center top+30px',
                            of: window.top
                        });
                        allTextData.find('.field-value div.codeEditor').trigger('panel-resize')
                    }

                });
            });
            btns.append(btn);


            //log
            if (pcTable.tableRow.type !== 'tmp' && field.logButton) {
                mobileButtons.push({
                    label: App.translate('Log'),
                    action: function (dialog) {
                        let rowName;
                        if (pcTable.mainFieldName && item.id) {
                            rowName = item[pcTable.mainFieldName].v;
                        }
                        pcTable.model.getFieldLog(field['name'], item.id, rowName);
                        dialog.close();
                    }
                });

                $('<button class="btn btn-sm btn-default" title="' + App.translate('Log of field manual changes') + '">' + App.translate('Log') + '</button>')
                    .on('click', function () {
                        let rowName;
                        if (pcTable.mainFieldName && item.id) {
                            rowName = item[pcTable.mainFieldName].v;
                        }
                        pcTable.model.getFieldLog(field['name'], item.id, rowName);
                        let btn = $(this).addClass('disabled');
                        setTimeout(function () {
                            btn.removeClass('disabled');
                        }, 1000);
                        return false;
                    })
                    .appendTo(btns);
            }

            //close
            $('<button class="btn btn-sm btn-default" title="' + App.translate('Close the panel') + '"><i class="fa fa-times"></i></button>')
                .on('click', function () {
                    selectObject.selectPanelDestroy();
                    return false;
                })
                .appendTo(btns);
        }


        let fieldText = field.getPanelText(val.v, $panel, item);

        if (field.type === 'select' && field.withPreview && val['v'] && (!field.multiple || val['v'].length === 1)) {
            let _panel = $('<div class="previews">').appendTo(textDiv);
            field.loadPreviewPanel(_panel, field.name, item, val['v']).then(function () {
                if (divForPannelFormats.data('loadFormats')) {
                    divForPannelFormats.data('loadFormats')()
                }
            });
        } else {
            if (divForPannelFormats.data('loadFormats')) {
                divForPannelFormats.data('loadFormats')()
            }
        }

        if (pcTable.isCreatorView) {
            if (['select', 'tree', 'date'].indexOf(field.type) !== -1) {
                textDiv.append($('<div class="creator-select-val">' + JSON.stringify(val.v) + '</div>'));
            }
        }
        const applyText = function (text) {

            textInner.text(text);
            btnCopy.prop('disabled', false);
        };
        const apply$ = function ($html, text) {
            textInner.html($html);
            if ($html.data('text')) {
                textInner.data('text', $html.data('text'))
            } else {
                textInner.data('text', text);
            }
            btnCopy.prop('disabled', false);
        };
        const __applyText = function (fieldText) {
            if (typeof fieldText === 'object' && fieldText !== null) {
                if (fieldText instanceof jQuery) {
                    let text = '';
                    if (fieldText.copyText) {
                        apply$(fieldText, fieldText.copyText);
                    } else {
                        fieldText.each(function () {
                            if (text !== '') text += "\n";
                            text += $(this).text();
                        });
                        if (text === '') text = fieldText.text();
                        apply$(fieldText, text);
                    }
                } else if (fieldText.then) {
                    fieldText.then(__applyText)
                } else {
                    applyText(JSON.stringify(fieldText));
                }
            } else {
                applyText(fieldText);
            }
        };
        __applyText(fieldText);


        //log
        if (pcTable.isCreatorView) {

            let itemLog;
            if (pcTable.LOGS) {
                itemLog = pcTable.LOGS;
                if (item && item.id) {
                    itemLog = pcTable.LOGS[item.id];
                }

                if (itemLog) {
                    itemLog = itemLog[field.name];
                }
            }
            let logs = $('<div style="padding-top: 10px">');


            if (itemLog && itemLog.c) {
                let log = $('<button class="btn btn-sm btn-danger"><i class="fa fa-info" style="padding-top: 3px;" aria-hidden="true"> c</i></button>');
                log.on('click', function () {
                    App.logOutput(itemLog.c);
                });
                logs.append(log);
            }


            if (itemLog && itemLog.s) {
                let log = $('<button class="btn btn-sm btn-danger"><i class="fa fa-info" style="padding-top: 3px;" aria-hidden="true"> s</i></button>');
                log.on('click', function () {
                    App.logOutput(itemLog.s);
                });
                logs.append(log);
            }
            if (itemLog && itemLog.a) {
                let log = $('<button class="btn btn-sm btn-danger"><i class="fa fa-info" style="padding-top: 3px;" aria-hidden="true"> a</i></button>');
                log.on('click', function () {
                    App.logOutput(itemLog.a);
                });
                logs.append(log);
            }
            if (itemLog && itemLog.f) {
                let log = $('<button class="btn btn-sm btn-danger"><i class="fa fa-info" style="padding-top: 3px;" aria-hidden="true"> f</i></button>');
                log.on('click', function () {
                    App.logOutput(itemLog.f);
                });
                logs.append(log);
            }
            if (logs.children().length) {
                btns.append(logs);
            }
        }


        if (!pcTable.isMobile)
            $panel.append(btns);

        if (val.e) {
            textDiv.append($('<div style="padding-top: 5px;">').html($('<span>').text(val.e).text().replace(/\[\[(.*?)\]\]/g, '<b>$1</b>')));
        }

        if (pcTable.isMobile) {
            App.mobilePanel(columnName, $panel, {buttons: mobileButtons})
        } else {

            let placement = 'right';
            let spanOffsetLeft = td.offset().left,
                containerOffsetLeft = pcTable._container.offset().left,
                containerWidth = pcTable._container.width(),
                tdWidth = td.width(),
                panelWidth = $panel.is('.text') ? 340 : 240,
                placeToRight = (containerWidth - (spanOffsetLeft - containerOffsetLeft) - tdWidth);


            if (placeToRight < panelWidth) {
                placement = 'left';
                if ((td.offset().left - containerOffsetLeft) < panelWidth) {
                    placement = 'bottom';
                }
            }

            let params = {
                'isParams': true,
                '$text': $panel,
                'element': td,
                'container': pcTable._container,
                'placement': placement,
                'trigger': 'manual'
            };
            App.popNotify(params);
        }


        $('body').on(eventNameClick, function (event) {
            if ($(event.target).closest('#selectPanel').length === 0) {
                selectObject.selectPanelDestroy();
            }
        })
            .on(eventNameKeyUp, function (event) {
                if (event.which == 27) {
                    selectObject.selectPanelDestroy();
                }
            });

        return td;
    }


    App.pcTableMain.prototype._addSelectable = function () {
        var pcTable = this;
        pcTable.selectedCells = {
            fieldName: null,
            ids: {},
            notRowCell: null,
            times: null,
            lastSelected: null,
            notRowCellEmpty: function () {
                if (this.notRowCell) {
                    this.notRowCell.removeClass('selected');
                    let tr = this.notRowCell.closest('.DataRow');
                    if (tr.length === 1) {
                        tr.removeClass('selected');
                    }
                    this.notRowCell = null;
                }
            },
            empty: function () {
                this.notRowCellEmpty();
                let selected = this;
                Object.keys(this.ids).forEach(function (fieldName) {
                    selected.ids[fieldName].forEach(function (id) {
                        let item = pcTable._getItemById(id);
                        if (item && item.$tr) {
                            item.$tr.find('.selected').removeClass('selected');
                            item.$tr.removeClass('selected');
                        }
                    });

                });
                this.ids = {};
                this.lastSelected = null;
            },
            selectColumn: function (fieldName) {
                pcTable.dataSortedVisible.forEach((id) => {
                    if (typeof id !== 'object') {
                        this.add(id, fieldName, true);
                    } else if (id.row) {
                        this.add(id.row.id, fieldName, true);
                    }
                })
                this.summarizer.check();
                this.multiCheck();
            },
            getEditedData: function (val, fix) {
                let editedData = {};
                let isMulti = false;
                if (Object.keys(pcTable.selectedCells.ids).length > 1) {
                    isMulti = true;
                }

                Object.keys(pcTable.selectedCells.ids).forEach(function (fieldName) {
                    pcTable.selectedCells.ids[fieldName].forEach(function (id) {

                        let item = pcTable.data[id];
                        let isFieldBlocked = item[fieldName].f ? item[fieldName].f.block : undefined;

                        if ((item.f.block && isFieldBlocked !== false) || isFieldBlocked || !pcTable.fields[fieldName].editable || !pcTable.fields[fieldName].editGroup) return;
                        if (isMulti && !pcTable.fields[fieldName].editGroupMultiColumns) return;

                        if (!editedData[id]) editedData[id] = {};
                        if (fix) {
                            editedData[id][fieldName] = item[fieldName]['v'];
                        } else {
                            editedData[id][fieldName] = val;
                        }

                    })
                });
                return editedData;
            },
            remove: function (id, fieldName) {
                let selected = this;
                if (!this.ids[fieldName]) return;

                let removedIds = {};

                this.ids[fieldName].some(function (iId, index) {
                    if (iId == id) {
                        selected.ids[fieldName].splice(index, 1);
                        if (selected.ids[fieldName].length === 0) {
                            delete selected.ids[fieldName];

                        }
                        removedIds[id] = true;
                        return true;
                    }
                });

                Object.keys(removedIds).forEach(function (rId) {
                    let isSelected = false;
                    Object.keys(selected.ids).some(function (fieldName) {
                        if (selected.ids[fieldName].indexOf(parseInt(rId)) !== -1) {
                            isSelected = true;
                            return true;
                        }
                    });
                    if (!isSelected) {
                        if (pcTable.data[rId].$tr) {
                            pcTable.data[rId].$tr.removeClass('selected');
                        }
                    }
                });
            },
            add: function (id, fieldName, selectTd) {
                if (!this.ids[fieldName]) {
                    this.ids[fieldName] = [];
                }
                this.ids[fieldName].push(id);
                if (pcTable.data[id].$tr) {
                    pcTable.data[id].$tr.addClass('selected');
                    if (selectTd) {
                        pcTable._getTdByFieldName(fieldName, pcTable.data[id].$tr).addClass('selected')
                    }
                }
            },
            selectPanelDestroy: function () {
                let panelObj = this;

                if (panelObj.selectPanel) {
                    if (panelObj.selectPanel.attr('aria-describedby')) {
                        panelObj.selectPanel.popover('destroy');
                    }
                    panelObj.selectPanel = null;
                }
                $('body').off('.selectPanelDestroy');
            },
            checkIfShowPanel: function (td) {
                "use strict";

                let selectObject = this;


                this.selectPanelDestroy();

                if (td) {
                    let field = pcTable._getFieldBytd(td);
                    let item;
                    if (field.category === 'column') {
                        item = pcTable._getItemBytd(td);
                    } else {
                        item = pcTable.data_params;
                    }

                    this.selectPanel = pcTable.getSelectPanel.call(pcTable, field, item, td)
                }
                return false;
            },
            copySepected: function (withNames, onDoneClbck) {
                let pcTable = this;
                let result = '';
                let allIds = [];
                let allFields = [];

                let data = {};
                let deffs = [];


                Object.keys(pcTable.selectedCells.ids).forEach(function (field) {
                    let ids = pcTable.selectedCells.ids[field];
                    allIds = allIds.concat(ids);
                    allFields.push(field);

                    ids.forEach(function (id) {
                        if (!data[id]) data[id] = {};

                        let res = pcTable.fields[field].getCopyText.call(pcTable.fields[field], pcTable.data[id][field], pcTable.data[id]);
                        if (typeof res === 'object') {
                            deffs.push(res);
                            res.done(function (resData) {

                                data[id][field] = resData;
                            })
                        } else {
                            data[id][field] = res;
                        }
                    })
                });
                allIds = Array.from(new Set(allIds));
                allIds = pcTable.dataSortedVisible.filter(id => allIds.findIndex((_id) => {
                    return _id == id;
                }) !== -1);
                allFields = Array.from(new Set(allFields));
                let fields = [];
                pcTable.fieldCategories.visibleColumns.forEach(function (field) {
                    if (allFields.indexOf(field.name) !== -1) {
                        fields.push(field.name)
                    }
                });
                allFields = fields;
                const DELIM = "\t";

                if (withNames) {
                    result += 'id';
                    allFields.forEach(function (field) {
                        result += DELIM;

                        result += pcTable.fields[field].title;
                    });
                }

                let onDoneClbck2 = onDoneClbck;

                $.when(...deffs).done(function () {
                    allIds.forEach(function (id) {
                        if (result !== '') result += "\n";
                        let start = true;
                        if (withNames) {
                            result += id;
                            start = false;
                        }
                        allFields.forEach(function (field) {
                            if (start === true) start = false;
                            else {
                                result += DELIM;
                            }
                            let _str = data[id][field];

                            if (typeof _str === "undefined") _str = "";

                            if (typeof _str == 'string' && _str.replace(/\t/g, '').match(/[\s"]/)) {
                                if (allFields.length !== 1) {
                                    _str = '"' + _str.replace(/"/g, '""') + '"';
                                }
                            }
                            result += _str;
                        });
                    });

                    App.copyMe(result);
                    setTimeout(onDoneClbck2, 400);
                });


            },
            click: function (td, event) {
                let table = pcTable._table;
                if (td.closest('table').is('.pcTable-filtersTable')) return false;


                if (table.data('moved') === true) {
                    table.data('moved', false);
                    return false;
                }

                if (event.originalEvent && event.originalEvent.path && event.originalEvent.path[0] && $(event.originalEvent.path[0]).is('.asUrl')) {
                    pcTable.actionOnClick(td);
                    return false;
                }


                (() => {

                    if (td.is('.val')/* || !td.is('.edt')*/) {
                        if (this.notRowCell && this.notRowCell.index(td) !== -1) {
                            pcTable.selectedCells.empty();
                        } else {
                            pcTable.selectedCells.empty();
                            this.notRowCell = td;
                            this.notRowCell.addClass('selected');
                            let tr = this.notRowCell.closest('.DataRow');
                            if (tr.length === 1) {
                                tr.addClass('selected');
                            }

                        }
                        $('table.pcTable-table').removeClass('selected-multi').removeClass('selected-column');

                        return;
                    } else {
                        this.notRowCellEmpty();
                    }


                    let tr = td.closest('tr');
                    let item = pcTable._getItemByTr(tr);
                    let field = pcTable._fieldByTd(td, tr);

                    let fieldName = field.name;

                    /*
                       altKey
                     */
                    if (event.altKey) {
                        if (td.is('.selected')) {
                            pcTable.selectedCells.remove(item.id, fieldName);
                            td.removeClass('selected');
                        } else {
                            pcTable.selectedCells.add(item.id, fieldName);

                            td.addClass('selected');
                            this.lastSelected = [fieldName, item.id];
                        }
                    }
                    /*
                     shiftKey
                     */
                    else if (event.shiftKey && Object.keys(pcTable.selectedCells.ids).length) {

                        let selected = this;
                        let ids = [];
                        let step = 'before';

                        pcTable.dataSortedVisible.some(function (_id) {
                            if (typeof _id === "object" && _id.row) {
                                _id = _id.row.id;
                            } else {
                                _id = parseInt(_id);
                            }
                            if (step === 'before') {
                                if (_id === item.id || _id === selected.lastSelected[1]) {
                                    step = 'doIt';
                                    ids.push(_id);

                                    if (item.id === selected.lastSelected[1]) return true;
                                }
                            } else if (step === 'doIt') {
                                ids.push(_id);

                                if (_id === item.id || _id === selected.lastSelected[1]) {
                                    return true;//stop
                                }
                            }

                        });

                        step = 'before';

                        let selectIt = function (field) {
                            ids.forEach(function (_id) {
                                let table_item = pcTable.data[_id];
                                if (!pcTable.isSelected(field.name, _id)) {
                                    selected.add(_id, field.name);
                                    if (table_item.$tr)
                                        pcTable._getTdByFieldName(field.name, table_item.$tr).addClass('selected');
                                }
                            });
                        };

                        pcTable.fieldCategories.column.some(function (field) {
                            if (field.showMeWidth > 0) {
                                if (step === 'before') {
                                    if (field.name === fieldName || field.name === selected.lastSelected[0]) {
                                        step = 'doIt';
                                        selectIt(field);

                                        if (fieldName === selected.lastSelected[0]) return true;
                                    }
                                } else if (step === 'doIt') {

                                    selectIt(field);

                                    if (field.name === fieldName || field.name === selected.lastSelected[0]) {
                                        return true;//stop
                                    }
                                }
                            }

                        });
                        this.lastSelected = [fieldName, item.id];
                    }
                    /*
                     simple click
                     */
                    else {
                        let selected = pcTable.isSelected(field.name, item.id);

                        pcTable.selectedCells.empty();
                        if (!selected) {
                            pcTable.selectedCells.add(item.id, fieldName);
                            td.addClass('selected');
                            this.lastSelected = [fieldName, item.id];
                        }
                    }
                    pcTable.selectedCells.multiCheck();
                })();
                this.summarizer.check();
            },
            multiCheck: () => {
                let SelectedKeys = Object.keys(pcTable.selectedCells.ids);
                if (SelectedKeys.length > 1) {
                    $('table.pcTable-table').addClass('selected-multi');
                } else if (SelectedKeys.length === 1 && Object.values(pcTable.selectedCells.ids)[0].length > 1) {
                    $('table.pcTable-table').removeClass('selected-multi').addClass('selected-column');

                } else {
                    $('table.pcTable-table').removeClass('selected-multi').removeClass('selected-column');
                }
            },
            summarizer: {
                timeout: null,
                element: $('<div class="summarizer"><span></span> : <span></span></div>'),
                status: 0,
                check: () => {
                    if (pcTable.isMobile) {
                        return;
                    }


                    let selFields = Object.keys(pcTable.selectedCells.ids);
                    let numberField;
                    if (selFields.length) {

                        let allNumbers = selFields.every((field) => {
                            if (!numberField) {
                                numberField = pcTable.fields[field];
                            } else {
                                if (pcTable.fields[field].dectimalPlaces && pcTable.fields[field].dectimalPlaces > numberField.dectimalPlaces) {
                                    numberField = pcTable.fields[field];
                                }
                            }
                            return pcTable.fields[field].type === 'number';
                        })

                        let count = 0;
                        let summ = 0;
                        selFields.forEach((field) => {
                            pcTable.selectedCells.ids[field].forEach((id) => {
                                count++;
                                if (allNumbers && pcTable.data[id][field].v !== null) {
                                    summ += parseFloat(pcTable.data[id][field].v);
                                }
                            })
                        })
                        let spans = pcTable.selectedCells.summarizer.element.find('span');

                        if (allNumbers) {
                            spans[1].innerHTML = numberField.numberFormat(summ, numberField.dectimalPlaces || 0, '.');
                        } else {
                            spans[1].innerHTML = '-';
                        }
                        spans[0].innerHTML = count;

                        if (!pcTable.selectedCells.summarizer.status) {
                            pcTable.selectedCells.summarizer.status = 1;
                            pcTable.selectedCells.summarizer.timeout = setTimeout(() => {
                                pcTable.selectedCells.summarizer.element.appendTo(pcTable._innerContainer);
                            }, 1000);
                        }
                    } else {
                        pcTable.selectedCells.summarizer.empty();
                    }
                },
                empty: () => {
                    if (pcTable.selectedCells.summarizer.status) {
                        pcTable.selectedCells.summarizer.status = 0;
                        if (pcTable.selectedCells.summarizer.timeout) {
                            clearTimeout(pcTable.selectedCells.summarizer.timeout);
                        }
                        pcTable.selectedCells.summarizer.element.detach();
                    }
                }
            }

        };
        this._container.on('contextmenu', '.DataRow td:not(.editing,.n,.id), td.val:not(.editing)', function (e) {
            let element = $(this);


            if (pcTable.selectedCells.selectPanel && pcTable.selectedCells.selectPanel.closest('td')[0] == element[0]) {
                pcTable.selectedCells.selectPanelDestroy();
            } else {
                pcTable.selectedCells.selectPanelDestroy();
                pcTable.selectedCells.empty();
                pcTable.selectedCells.checkIfShowPanel(element);
                pcTable.selectedCells.click(element, {});
            }

            return false;
        });
        this._container.on('click', '.DataRow td:not(.editing,.id,.n), td.val:not(.editing), .pcTable-buttons .cell-button', function (event) {

            if (event.target.className === 'file-image-preview') {
                let file = JSON.parse(event.target.getAttribute('data-fileviewpreview'));
                window.top.BootstrapDialog.show({
                    title: file.name,
                    message: '<div class="file-image-big"><img src="/fls/' + file.file + '" style="max-width: 100%; max-height: 100%"/></div>',
                    type: null,
                    draggable: true
                })
            } else if (event.target.className === 'file-pdf-preview') {
                window.open(event.target.getAttribute('data-filename'))
                return false;
            } else {
                let element = $(this);


                if (element.is('.edt.val:not(.editing)')) {
                    let field = pcTable._getFieldBytd(element);
                    if (field.category === 'filter') {
                        pcTable._createEditCell.call(pcTable, element, true)
                        return;
                    }
                }
                if (element.is('.cell-button') && !element.find('button.button-field').is(':disabled')) {
                    let field = pcTable._getFieldBytd(element);
                    pcTable._buttonClick.call(pcTable, element, field);
                    return false;
                }

                if (element.data('clicked')) {
                    element.removeData('clicked');
                } else {
                    element.data('clicked', 1);
                    setTimeout(function () {
                        if (element.data('clicked')) {
                            element.removeData('clicked');
                            pcTable.selectedCells.click(element, event);
                        }
                    }, 200);
                }
            }
        });

        this._container.on('click', 'th.id .for-selected button', function () {
            let btn = $(this);
            let html = btn.html();
            btn.text(App.translate('Copied'));
            pcTable.selectedCells.copySepected.call(pcTable, btn.data('names'), function () {
                btn.html(html)
            });
        });

    };
}());