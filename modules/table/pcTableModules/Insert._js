$.extend(App.pcTableMain.prototype, {
    _insertItem: null,
    _insertRow: null,
    _insertRowActive: false,
    _insertButtons: null,
    _insertRowHash: null,
    _addButtons: null,
    _insertError: {},
    _currentInsertCellIndex: 0,
    _InsertFocusFalse: false,
    isInsertable: function () {
        return this.control.adding && !this.f.blockadd && !this.isRestoreView;
    },
    _addInsert: function (addVars) {
        var pcTable = this;
        if (this.control.adding) {
            if (!this._insertRow || !this._insertRow.length) {
                this._insertRow = this._createInsertRow(null, 0, addVars);
                this._insertRowActive = true;
                this._insertButtonsChangeStatuses();

                this._beforebody.prepend(this._insertRow);
                this._table.addClass('with-adding-row');
            }
        }
    },
    _insertButtonsChangeStatuses: function () {
        if (this._insertRow) {
            if (this._insertButtons)
                this._insertButtons.find('[data-action="add"]').removeClass('btn-warning').addClass('btn-default').attr('disabled', 'disabled');
            if (this.dataSortedVisible.length === 0) {
                this._table.find('.pcTable-noDataRow button').removeClass('btn-warning').addClass('btn-default').attr('disabled', 'disabled');
            }
        } else {
            if (this._insertButtons)
                this._insertButtons.find('[data-action="add"]').addClass('btn-warning').removeClass('btn-default').removeAttr('disabled')
            if (this.dataSortedVisible.length === 0) {
                this._table.find('.pcTable-noDataRow button').addClass('btn-warning').removeClass('btn-default').removeAttr('disabled');
            }
        }
    },
    _InsertAddInsertBtnsPanel: function ($row) {
        let pcTable = this;
        let panel;

        let btns = {};
        btns[('<span id="saveInsertRow">' + App.translate('Save') + '</span>')] =
            function () {
                if (!panel.is('.onSaving')) {
                    panel.addClass('onSaving');

                    pcTable.__insertRowActions('saveInsertRow', function () {
                        pcTable._saveInsertRow('close').always(function () {
                            panel.removeClass('onSaving');
                        });
                    });
                }
            };
        btns[('<i class="fa fa-save"></i>')] =
            function () {
                if (!panel.is('.onSaving')) {
                    panel.addClass('onSaving');
                    pcTable.__insertRowActions('saveInsertRow', function () {
                        pcTable._saveInsertRow.call(pcTable).always(function () {
                            panel.removeClass('onSaving');
                        });
                    });
                }
            };
        btns[('<i class="fa fa-paste"></i>')] =
            function () {
                if (!panel.is('.onSaving')) {
                    panel.addClass('onSaving');
                    pcTable.__insertRowActions('saveInsertRow', function () {
                        pcTable._saveInsertRow.call(pcTable, 'notClean').always(function () {
                            panel.removeClass('onSaving');
                        });
                    });
                }
            };
        btns['<i class="fa fa-times"></i>'] = function () {
            pcTable._closeInsertRow.call(pcTable, $(this).closest('#' + pcTable_PANNEL_IDS.insert));

        };

        panel = this._addRowPanel(pcTable_PANNEL_IDS.insert, $row, btns);
        this._addButtons = panel.find('button:not(:last)');
    },
    __insertRowActionsStack: [],
    __insertRowActions: function (actionName, actionFunction) {
        "use strict";
        let pcTable = this;

        if (['saveInsertRow', 'clickSourceButton'].indexOf(actionName) !== -1) {
            setTimeout(function () {
                pcTable.model.getDefferedProcess().then(actionFunction);
            }, 450)
        }

    },
    _saveInsertRow: function (isNotClean) {
        let pcTable = this;
        let data = {};
        let $d = $.Deferred();
        if (Object.keys(pcTable._insertError).length) {
            let fieldName = Object.keys(pcTable._insertError)[0];
            let _error = pcTable._insertError[fieldName];
            App.notify(_error, $('<div>' + App.translate('Error in %s field', $('<span>').text(pcTable.fields[fieldName].title || pcTable.fields[fieldName].name)).html()) + '</div>');
            pcTable._currentInsertCellIndex = pcTable.fieldCategories.visibleColumns.findIndex(function (field) {
                if (field.name === fieldName) return true
            });

            pcTable._insertFocusIt()
            $d.reject();
        } else {


            let doIt = function () {
                pcTable._insertRowActive = false;
                pcTable.model.add(pcTable._insertRowHash).then(function (json) {
                    pcTable.table_modify.call(pcTable, json);
                    pcTable._insertRowHash = null;
                    pcTable._insertRowActive = true;
                    pcTable._currentInsertCellIndex = 0;
                    switch (isNotClean) {
                        case 'notClean':
                            let item = {};
                            Object.keys(pcTable._insertItem).forEach((k) => {
                                if (typeof pcTable._insertItem[k] === "object" && "v" in pcTable._insertItem[k]) {
                                    item[k] = pcTable._insertItem[k].v;
                                }
                            })
                            pcTable._createInsertRow(pcTable._insertRow, true, item);
                            break;
                        case 'close':
                            pcTable._closeInsertRow();
                            break;
                        default:
                            pcTable._insertItem = null;
                            pcTable._insertRow.html('<td class="id"></td>');
                            pcTable._createInsertRow(pcTable._insertRow, 0);
                    }


                }).always(function () {
                    $d.resolve();
                }).fail(() => {
                    pcTable._insertRowActive = true;
                });
            };
            pcTable.model.doAfterProcesses(doIt);
        }
        return $d.promise();
    },
    _addInsertRow: function () {
        let pcTable = this;
        if (this.tableRow['type'] === 'cycles') {
            pcTable.model.add({}).then(function (json) {
                if (json.firstTableId) {
                    window.location.href = window.location.pathname + '/' + json.chdata.rows[0].id + '/' + json.firstTableId;
                } else {
                    pcTable.table_modify(json);
                }
            });
        } else {
            if (pcTable.isMobile)
                pcTable._addInsertWithPanel();
            else
                pcTable._addInsert()
        }
    },
    _getInsertButtons: function () {
        let pcTable = this;
        let AddWithRow, AddWithPanel;

        if (this.tableRow['type'] === 'cycles') {
            AddWithPanel = AddWithRow = function () {
                pcTable.model.add({}).then(function (json) {
                    if (json.firstTableId) {
                        window.location.href = window.location.pathname + '/' + json.chdata.rows[0].id + '/' + json.firstTableId;
                    } else {
                        pcTable.table_modify(json);
                    }
                });
            }
        } else {
            AddWithRow = function () {
                if (pcTable.isMobile)
                    pcTable._addInsertWithPanel();
                else
                    pcTable._addInsert()
            };
            AddWithPanel = function () {
                pcTable._addInsertWithPanel()
            }
        }
        this._insertButtons = $('<span>');

        const getAddButton = (inner, func, dataAction) => {
            return $('<button ' + (dataAction ? 'data-action="' + dataAction + '"' : '') + ' class="btn btn-sm btn-warning">' + inner + '</button>')

                .appendTo(this._insertButtons)
                .on('click', func);
        }

        if (this.isTreeView && this.tableRow.type === 'cycles') {
        } else if (this.viewType === 'panels' || this.isRotatedView || this.isTreeView) {
            getAddButton(App.translate('Add'), AddWithPanel, "add").width(80)
        } else {
            if (this.tableRow.id !== 2) {
                getAddButton(App.translate('Add'), AddWithRow, "add").width(80)
            }

            if (!pcTable.isMobile && this.tableRow.panel) {
                getAddButton('<i class="fa fa-th-large"></i>', AddWithPanel).css('margin-left', 5);
            }
        }
        return this._insertButtons;
    },
    _addInsertWithPanel: function (addVars) {
        let pcTable = this;
        new EditPanel(pcTable, null, addVars || {}).then(function (json) {
            if (json) {
                pcTable.table_modify.call(pcTable, json);
            }
        });
    },
    _closeInsertRow: function () {
        if (!this._insertPanel) {
            if (this._insertRow) {
                this._insertRow.find('td').each(function () {
                    $(this).remove();
                });
                this._insertRow.remove();
                this._insertRow = null;
                this._insertRowHash = null;
                this._insertRowActive = false;
            }

        } else {
            this._insertPanel = null;
        }
        this._insertItem = null;
        this._insertButtonsChangeStatuses();

        this._currentInsertCellIndex = 0;
        this._table.removeClass('with-adding-row');
    },
    _createInsertRow: function ($row, focusIt, savedFieldName) {
        var pcTable = this;
        var item = pcTable._insertItem || (pcTable._insertItem = {});

        if (!$row) {
            this.insertRow = $row = $('<tr class="InsertRow" style="height: 35px;"><td class="id"></td></tr>')
                .on('click focus', 'input,button,select', function (event) {
                    let inputElement = $(this);
                    let active = pcTable._insertRow.find('.active');
                    if (!active.length || (event.type === 'click' && !inputElement.is('[type="checkbox"]') && active !== $(this).closest('td'))) {
                        active.removeClass('active');
                        pcTable._currentInsertCellIndex = $(this).closest('td').data('index');
                        $(this).closest('td').addClass('active');
                    }
                })
            ;
            this._InsertAddInsertBtnsPanel($row);
            this.insertRow.editedFields = {};
        }

        if (!pcTable._currentInsertCellIndex) pcTable._currentInsertCellIndex = 0;
        let data = {};
        if (savedFieldName) {
            if (typeof savedFieldName === 'object') {
                data = savedFieldName
            } else {
                data = {[savedFieldName]: pcTable._insertItem[savedFieldName].v};
            }
        }

        let visibleColumnsIndexes = [];
        pcTable.fieldCategories.visibleColumns.forEach(function (field) {
            visibleColumnsIndexes.push(field.name);
        });

        pcTable.model.checkInsertRow(data, pcTable._insertRowHash, this.insertRow.clearField).then(function (json) {
            pcTable.insertRow.clearField = null;
            pcTable._insertRowHash = pcTable._insertRowHash || json.hash;
            item = json.row;
            let errors = false;
            let tabi = 2;
            $.each(pcTable.fieldCategories.column, function (ind, field) {


                if (!field.showMeWidth) {
                    pcTable._insertItem[field.name] = item[field.name];
                    return;
                }


                let index = visibleColumnsIndexes.indexOf(field.name);


                var td = $row.find('td:eq(' + (index + 1) + ')');
                let Oldval = $.extend(true, {}, pcTable._insertItem[field.name]);
                let isForce = pcTable._insertItem[field.name] && pcTable._insertItem[field.name].force;

                pcTable._insertItem[field.name] = item[field.name];


                if (td.length) {

                    let isBlockedField = field.name === 'n' || pcTable._insertItem[field.name].f && pcTable._insertItem[field.name].f.block === true;

                    if (td.data('input') && !isBlockedField) {

                        let name = field.name;
                        let isEqual = false;

                        if (isForce) {
                            isEqual = false;
                        } else if (item[field.name].v === null && Oldval.v == '') {
                            isEqual = true;
                        } else {
                            isEqual = Object.equals(item[field.name].v, Oldval.v) && !field.codeSelectIndividual;
                        }

                        if ((Oldval === undefined || !isEqual || field.name == 'data_src' || field.type == 'comments' || (field.code && !field.codeOnlyInAdd))) {
                            pcTable._createInsertCell.call(pcTable, td, field, $row, index, 'td', pcTable._createInsertRow);
                            if (savedFieldName === field.name) {
                                pcTable._colorizeElement(td, pcTable_COLORS.saved);
                            }
                        }
                    } else {
                        td.replaceWith(pcTable._createInsertCell.call(pcTable, null, field, $row, index, 'td', pcTable._createInsertRow));
                    }
                } else {
                    $row.append(td = pcTable._createInsertCell.call(pcTable, null, field, $row, index, 'td', pcTable._createInsertRow));
                }

                if (td.data('input')) {
                    td.data('input').attr('tabindex', tabi++)
                }

            });
            pcTable._addButtons.each(function (i, btn) {
                $(btn).attr('tabindex', tabi++)
            })
            pcTable._insertFocusIt.call(pcTable);
        });


        return $row;
    },
    _createInsertCell: function (td, field, row, index, nodeName, parentFunction) {
        var pcTable = this;
        nodeName = nodeName || 'td';
        var td = td || $("<" + nodeName + ">").each((i, _td) => {
            $_td = $(_td);
            if (field.help) {
                $_td.on('focus', 'input,button,select', function (event) {
                    let i = pcTable._table.find('thead th #field-help-' + field.name);
                    let element = $(event.target);
                    setTimeout(function () {
                        i.trigger('open');
                        element.one('blur remove', function () {
                            i.trigger('close');
                        });
                    }, 120);
                })
            }
            $_td.on('focus', 'input,button,select', () => {
                this._InsertFocusFalse = Date.now();
            })
        });

        td.data('index', index);


        if (field.code) {
            td.addClass('with-code');
        }


        if (pcTable._insertItem[field.name] === undefined) {
            pcTable._insertItem[field.name] = null;
        }


        let f = pcTable._insertItem[field.name] ? (pcTable._insertItem[field.name].f || {}) : {};
        if (!field.insertable || f.block === true) {
            let val = pcTable._insertItem[field.name];
            if (val) val = val.v;


            td.empty().append($('<span class="cell-value">').html(f.text ? f.text : field.getCellText(val, td, pcTable._insertItem)));
            if (f.comment) {
                let i = $('<i class="fa fa-info pull-right" style="padding: 3px;">');
                i.attr('title', f.comment)
                td.prepend(i);

            } else if (f.icon && field.type !== 'button') {
                let i = $('<i class="fa fa-' + f.icon + ' pull-right" style="padding: 3px;">');
                td.prepend(i);
            }

            if (f.icon || f.text || f.comment)
                td.on('click', () => {
                    let $panel = $('<div>');
                    let _val = $('<div>').text(val).appendTo($panel);
                    if (f.icon) {
                        let i = $('<i class="fa fa-' + f.icon + '" style="padding: 3px;">');
                        _val.prepend(i);
                    }
                    if (f.text) {
                        let i = $('<div><i class="fa fa-font" style="padding: 3px;"> </div>');
                        i.append(f.text);
                        $panel.append(i);
                    }
                    if (f.comment) {
                        let i = $('<div><i class="fa fa-info" style="padding: 3px;"> </div>');
                        i.append(f.comment);
                        $panel.append(i);
                    }


                    if (pcTable.isMobile) {
                        App.mobilePanel(field.title, $panel)
                    } else {

                        let placement = 'right';
                        let spanOffsetLeft = $panel.offset().left,
                            containerOffsetLeft = pcTable._container.offset().left,
                            containerWidth = pcTable._container.width(),
                            tdWidth = $panel.width(),
                            panelWidth = $panel.is('.text') ? 340 : 240,
                            placeToRight = (containerWidth - (spanOffsetLeft - containerOffsetLeft) - tdWidth);


                        if (placeToRight < panelWidth) {
                            placement = 'left';
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

                        let eventNameKeyUp = 'keyup.insertPanelDestroy';
                        let eventNameClick = 'click.insertPanelDestroy';

                        const insertPanelDestroy = function () {
                            $('body').off('.selectPanelDestroy');
                            td.popover('destroy');
                        };

                        $('body').on(eventNameClick, function (event) {
                            if ($(event.target).closest('#selectPanel').length === 0) {
                                insertPanelDestroy();
                            }
                        })
                            .on(eventNameKeyUp, function (event) {
                                if (event.which == 27) {
                                    insertPanelDestroy();
                                }
                            });

                        return false;
                    }

                });
            return td;
        }


        var getEditVal = function ($input) {

            var editVal;
            try {
                editVal = field.getEditVal($input);
                delete pcTable._insertError[field.name]
                input.removeClass('error');
            } catch (error) {
                input.addClass('error');
                pcTable._insertError[field.name] = error;
                /*App.popNotify(error, $input, 'default');*/
                return null;
            }

            return editVal;
        };


        var saveClbck = function ($input, event, refresh) {

            var editValResult = getEditVal($input);
            pcTable._currentInsertCellIndex = index + 1;
            if (editValResult === null || refresh) {
                parentFunction.call(pcTable, row, pcTable._currentInsertCellIndex, field.name);
                pcTable._insertFocusIt.call(pcTable)
            } else {
                if (field.isDataModified(editValResult, pcTable._insertItem[field.name].v)) {
                    pcTable.insertRow.editedFields[field.name] = true;
                    pcTable._insertItem[field.name].v = editValResult;
                    if (field.isPanelField === true) {
                        pcTable._createInsertCell.call(pcTable, td, field, row, index, nodeName, parentFunction);
                    }
                    parentFunction.call(pcTable, row, pcTable._currentInsertCellIndex, field.name);
                } else {
                    pcTable._insertFocusIt.call(pcTable)
                }
            }

        };
        var blurClbck = function ($input, event, _, setNextIndex) {
            if (setNextIndex) {
                pcTable._currentInsertCellIndex = index + (setNextIndex === -1 ? -1 : 1);
                pcTable._insertFocusIt.call(pcTable);
            }

            setTimeout(function () {
                if (!$input) return;
                let td = $input.closest('td');
                if (!td.length || !td.closest('tr').length) return false;

                let editValResult = getEditVal($input);
                if (field.isDataModified(editValResult, pcTable._insertItem[field.name].v)) {
                    pcTable._currentInsertCellIndex = index + 1;
                    ;
                    pcTable.insertRow.editedFields[field.name] = true;

                    pcTable._insertItem[field.name].v = editValResult;
                    if (field.isPanelField === true) {
                        pcTable._createInsertCell.call(pcTable, td, field, row, index, nodeName, parentFunction);
                    }
                    parentFunction.call(pcTable, row, pcTable._currentInsertCellIndex, field.name);
                }
            }, 150)
        };
        var escClbck = function ($input, event) {
            let td = $input.closest('td');
            if (!td.length || !td.closest('tr').length) return false;

            let editVal = getEditVal($input);
            let itemVal = pcTable._insertItem[field.name].v + "";

            if (field.isDataModified(editVal, itemVal)) {
                pcTable._createInsertCell(td, field, row, index, nodeName, parentFunction);
                pcTable._colorizeElement(td, pcTable_COLORS.blured);
            }
            pcTable._currentInsertCellIndex = index + 1;
            pcTable._insertFocusIt.call(pcTable);
        };

        let input = field.getEditElement(td.data('input'), pcTable._insertItem[field.name], pcTable._insertItem, saveClbck, escClbck, blurClbck);

        if (f && f.placeholder && field.addPlaceholder) {
            field.addPlaceholder(input, f.placeholder)
        }

        if (!input.isAttached()) {
            td.html(input).data('input', input);
        }
        if (field.code && !field.codeOnlyInAdd) {
            let hand = td.find('.fa-hand-paper-o');

            if (pcTable._insertItem && pcTable._insertItem[field.name].h) {
                if (hand.length === 0) {
                    hand = $('<i class="fa fa-hand-paper-o pull-right">').on('click', () => {
                        this.insertRow.clearField = field.name;
                        parentFunction.call(pcTable, row, pcTable._currentInsertCellIndex + 1);
                    });
                    td.prepend(hand).addClass('ins-handed');
                }
            } else {
                if (hand.length === 1) {
                    hand.remove();
                }
                td.removeClass('ins-handed');
            }
        }

        if (field['type'] === 'select' && field.changeSelectTable === 2) {
            td.addClass('with-source-add-button');
            let btn = $('<button class="btn btn-default btn-sm source-add" tabindex="-1"><i class="fa fa-plus"></i></button>');

            td.prepend(btn);
            let clickSourceButton = function () {
                let ee = {};
                let item = pcTable._insertItem;

                $.each(item, function (k, v) {
                    if (k.substring(0, 1) !== '$') {
                        ee[k] = v;
                    }
                });
                let isAdd = true;
                if (isAdd) {
                    ee[field.name] = null;
                }
                let opened = 0;
                $(window.top.document.body)
                    .on('pctable-opened.select-add-' + field.name, function () {
                        opened++;
                    })
                    .on('pctable-closed.select-add-' + field.name, function (event, data) {
                        opened--;
                        let isAdded = (data /*&& data.tableId === field.selectTableId*/ && data.method === 'insert' && data.json && data.json.chdata && data.json.chdata.rows);
                        if (opened === 0 || isAdded) {
                            let inputOld = input;
                            delete field.list;
                            if (inputOld.data('input').data('LISTs')) {
                                inputOld.data('input').data('LISTs').isListForLoad = true;
                            }
                            if (isAdded) {
                                if (field.multiple) {
                                    item[field.name].v.push(Object.keys(data.json.chdata.rows)[0]);
                                } else {
                                    item[field.name].v = Object.keys(data.json.chdata.rows)[0];
                                }
                            }
                            inputOld.replaceWith(input = field.getEditElement(inputOld, item[field.name], item, saveClbck, escClbck, blurClbck));
                            $('body').off('.select-add-' + field.name);
                            td.data('input', input);
                            parentFunction.call(pcTable, row, pcTable._currentInsertCellIndex, field.name);

                        }
                    });
                pcTable.model.selectSourceTableAction(field.name, ee);
                return false;
            };
            btn.on('click', function () {
                pcTable.__insertRowActions('clickSourceButton', clickSourceButton);
            });
        }

        return td;
    },
    _insertFocusIt: function (outTimed) {
        let pcTable = this;
        if (this._InsertFocusFalse && (Date.now() - this._InsertFocusFalse) < 200) {
            return false;
        }
        if (!outTimed) {
            setTimeout(function () {
                pcTable._insertFocusIt.call(pcTable, 1);
            }, 10);
            return false;
        }


        let isLastCell = true;
        let isPanel = this._insertPanel ? true : false;
        let $row = this.insertRow;
        if (isPanel) {
            if (pcTable._insertPanel) {
                $row = pcTable._insertPanel.$modalBody;
            } else {
                return false;
            }
        }

        if (!$row || !$row.length) return false;

        $.each(pcTable.fieldCategories.visibleColumns, function (index, field) {
            if (pcTable._currentInsertCellIndex == index) {
                if (!field.insertable || (pcTable._insertItem && pcTable._insertItem[field.name] && pcTable._insertItem[field.name].f && pcTable._insertItem[field.name].f.block === true)) {
                    pcTable._currentInsertCellIndex++;
                    return;
                } else {
                    if (isPanel) {
                        field.focusElement($row.find('.cell:eq(' + index + ')').data('input'));
                    } else {
                        field.focusElement(pcTable._getTdByColumnIndex($row, index + 1).data('input'));
                    }
                }
                isLastCell = false;
                return false;
            }
        });
        if (isLastCell) {
            this.insertRow.find('td.active').removeClass('active');

            if (isPanel) {
                let buttonSave = pcTable._insertPanel.indexedButtons[Object.keys(pcTable._insertPanel.indexedButtons)[0]];
                buttonSave.focus();
            } else {
                $('#saveInsertRow').parent().focus();
            }
        }
    }
});