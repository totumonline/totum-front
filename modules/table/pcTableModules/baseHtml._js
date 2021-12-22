(function () {
    $.extend(App.pcTableMain.prototype, {
        _rerenderColumnsFooter: function () {
            let footer = this._createFootersTableBlock();
            this._footersBlock.replaceWith(footer);
            this._footersBlock = footer;
        },
        _rerendParamsblock: function () {
            this._createParamsBlock();
            if (this.isMobile) {
                this._refreshParamsBlock();
            }
        },
        _rerendFiltersBlock: function () {
            this._filtersBlock.replaceWith($block = this._createFiltersBlock());
            this._filtersBlock = $block;

            this._refreshFiltersBlock(this.data_params);
        },
        _rerendBottomFoolers: function () {
            this._createFootersSubtable();
            if (this.isMobile) {
                this._refreshFootersBlock();
            }
        },
        _renderTable: function () {
            let pcTable = this;

            //Предотвращение автозаполнения в хроме
            /* $('body').append('<input style="opacity: 0;position: absolute; top:0">\n' +
                 '<input type="password" style="opacity: 0;position: absolute; top:0">\n');
     */

            this._table = $("<table>")
                .addClass(this.tableClass);

            if (this.notCorrectOrder) {
                this._table.addClass('no-correct-n-filtered')
            }


            if (this.isRotatedView) {
                this._innerContainer.addClass('rotatedPcTable')
                this._table.append(this._createHead())
                    .append(this._createBody())
            } else {
                this._table.append(this._createHead())
                    .append(this._createFirstBody())
                    .append(this._createBody())
                    .append(this._createAfterBody())
            }

            this._footersBlock = this._createFootersTableBlock();
            this._table.append(this._footersBlock);
            this._popovers = $('<div class="popovers">');


            if (pcTable.isTreeView) {
                pcTable._connectTreeView.call(pcTable);
                if (this.fields.tree.treeViewType === 'other') {
                    this.addReOrderRowBind();
                }
            } else {
                this.addReOrderRowBind();
            }


            if (this.fieldCategories.column.length === 1) {
                pcTable._container.addClass('no-fields');
            }

            let scrollWrapper = this.scrollWrapper = this._container.append('<div class="pcTable-scrollwrapper">').find('.pcTable-scrollwrapper');
            scrollWrapper
                .append(this._createBeforeSpace())
                .append(this._createTableText());
            if (this.isCreatorView) {
                scrollWrapper
                    .append(this._refreshHiddenFieldsBlock())
            }
            this._paramsBlock = this._createParamsBlock(scrollWrapper);

            let rowsParent = $('<div class="pcTable-rowsWrapper">').appendTo(scrollWrapper);


            rowsParent
                .append(this._createRowsTitle(rowsParent))
                .append(this._createFiltersBlock())
                .append(() => {
                    if (!this.isTreeView && this.tableRow.pagination && this.tableRow.pagination !== '0/0') {
                        return this._pagination();
                    }
                })
                .append(this._rowsButtons())
                .append(this._innerContainer);


            this._footersSubTable = this._createFootersSubtable(scrollWrapper);
            scrollWrapper
                .append(this._footersSubTable)
                .append(this._popovers);

            /* pcTable._container.height(window.innerHeight - pcTable._container.offset().top);
 */
            this.addScrollsRules();

            this._seeCalcucatedValData();
            this._seeSelectPreview();
            this._clickstoCopyMe();

            if (this.isCreatorView) {
                this._hideHell_storage.checkIssetFields.call(this)
            }

        },
        _refreshHiddenFieldsBlock: function () {

            let newBlock = this._hiddenFieldsBlock();
            if (this.HiddenFieldsBlock) {
                this.HiddenFieldsBlock.replaceWith(newBlock);
            }
            this.HiddenFieldsBlock = newBlock;
            return this.HiddenFieldsBlock;
        },
        _hiddenFieldsBlock: function () {
            let pcTable = this, countFields = 0;

            let block = $('<div class="pcTable-hiddenFieldsTables">'), width = 0, $table, $thead, $tbody;

            if (this.beforeSpaceHide || !this._hideHell_storage.getOpened.call(this)) return block;

            let ContainerWidth = this._container.width() - 100;
            $.each(pcTable.hidden_fields || [], function (k, field) {
                countFields++;

                let fWidth = field.width > 0 ? field.width : 100;
                if (width === 0 || (ContainerWidth < (width + fWidth))) {
                    if ($table) $table.width(width);

                    $table = $("<table class='pcTable-hiddenFieldsTable'><thead><tr></tr></thead></table>\"");
                    block.append($table);
                    width = 0;
                    $thead = $table.find('thead tr');
                }
                $thead.append(pcTable._createHeadCell(k, field));
                width += field.width;
            });

            if (pcTable.isCreatorView) {
                Object.keys(pcTable.fields).forEach(function (fieldName, k) {
                    let field = pcTable.fields[fieldName];
                    if (field.showInWeb && field.showMeWidth < 1 && field.name !== 'n') {
                        countFields++;

                        let fWidth = field.width > 0 ? field.width : 100;
                        if (width === 0 || (ContainerWidth < (width + fWidth))) {
                            if ($table) $table.width(width);

                            $table = $("<table class='pcTable-hiddenFieldsTable'><thead><tr></tr></thead></table>\"");
                            block.append($table);
                            width = 0;
                            $thead = $table.find('thead tr');
                        }
                        $thead.append(pcTable._createHeadCell(k, field));
                        width += field.width;
                    }
                });
            }

            if ($table) $table.width(width);
            if (countFields) return block;

            return $('<div class="pcTable-hiddenFieldsTables">');
        },
        _clickstoCopyMe: function () {
            this._container.on('click', '.copy_me', function () {
                let button = $(this);

                if (button.data('clicked')) return false;

                button.data('clicked', true);

                button.width(button.width());

                if (button.data('text')) {
                    App.copyMe(button.data('text'));
                } else {
                    App.copyMe(button.text());
                }
                button.button('copied');
                setTimeout(function () {
                    button.button('reset');
                    button.removeData('clicked');
                }, BUTTONS_TIMEOUT);
                button.blur();
                $('body').click();
                return false;
            })
        },
        _seeCalcucatedValData: function () {
            var pcTable = this;
            this._container.on('mouseover', 'td .fa-hand-paper-o', function () {
                if (!pcTable.isMobile) {
                    var hand = $(this);
                    var td = hand.closest('td');
                    if (td.closest('tr').is('.InsertRow')) return false;
                    var item = pcTable._getItemBytd(td);
                    var field = pcTable._getFieldBytd(td);

                    var notify = $('<div>');
                    let cellText = '';
                    if (item[field.name].c === null || item[field.name].c === '' || item[field.name].c === undefined) {
                        cellText = '';
                    } else {
                        if (field.type === 'select') {
                            if (field.multiple) {
                                $.each(item[field.name].c, function (k, v_) {
                                    if (cellText !== '') cellText += ', ';
                                    cellText += field.getElementString(item[field.name].c[k], item[field.name].c_[k]);
                                })
                            } else {
                                cellText = field.getElementString(item[field.name].c, item[field.name].c_);
                            }

                        } else {
                            cellText = field.getCellText(item[field.name].c, null, item, pcTable);
                            if (typeof cellText === 'object') cellText = cellText.text();
                        }
                    }
                    notify.append($('<div>' + App.translate('Calculated value') + ': </div>').append($('<code>').text(cellText.length<=50?cellText:cellText.substr(0, 47)+'...')));

                    hand.one('mouseout', function () {
                        if (notify.length) {
                            notify.remove();
                            notify = null;
                        }
                    });
                    setTimeout(
                        function () {
                            if (notify && notify.length) {
                                App.popNotify(notify, hand);
                            }
                        }, 500
                    )
                }
            })
        },
        _seeSelectPreview: function () {
            var pcTable = this;
            $('body').on('mouseover', '.select-with-preview li', function (event) {
                let element = $(this);
                let timeObject = setTimeout(function () {
                    if (element.is(':hover')) {
                        let span = element.find('span.select-with-preview');
                        if (pcTable.fields[span.data('field')]) {
                            pcTable.fields[span.data('field')].previewPanel.call(pcTable.fields[span.data('field')], span, element);
                        }
                    }
                }, 300);
                element.one('mouseout', function () {
                    if (timeObject) clearTimeout(timeObject);
                });
            })
        },
        _getFavoriteStar: function () {
            let isInFaves = this.tableRow.__is_in_favorites = this.tableRow.__is_in_favorites || false; /*TEST*/
            let btn = $('#favorite-start');
            let pcTable = this;
            if (isInFaves === null) return $();

            if (btn.length === 0) {
                btn = $('<button class="btn btn-default btn-sm" id="favorite-start"></button>')
                    .on('click', function () {
                        pcTable.model.setTableFavorite(!btn.is('.stared')).then(function (json) {
                            pcTable.tableRow.__is_in_favorites = json.status;
                            pcTable._getFavoriteStar.call(pcTable);
                        })

                    });
            }
            if (isInFaves) {
                btn.addClass('stared').text('★');
            } else {
                btn.removeClass('stared').text('☆');
            }

            return btn;
        },
        _createBeforeSpace: function () {
            let pcTable = this;

            this._beforeSpace = $('<div class="pcTable-beforeSpace">');

            let topButtons;
            if (!pcTable.beforeSpaceHide) {
                pcTable.LogButton = $();


                topButtons = $('<div class="pcTable-topButtons">');

                let $TOTUM_FOOTER = $('#TOTUM_FOOTER');
                if ($TOTUM_FOOTER.length) {
                    topButtons.append($TOTUM_FOOTER);
                }
                if (pcTable.isCreatorView) {
                    let LogButtons = $('<div class="creator-log-buttons">');
                    let codes = $.cookie('pcTableLogs') || '[]';
                    codes = JSON.parse(codes);

                    if (codes.length) {
                        LogButtons.addClass('with-logs')
                        setTimeout(() => {
                            App.blink(LogButtons.find('button'), 6, "#fff")

                        }, 100)
                    }


                    let btn = $('<button class="btn btn-danger btn-sm"><i class="fa" style="width: 12px"></i> ' + App.translate('Show logs') + '</button>')
                        .appendTo(LogButtons)
                        .on('click', function () {
                            let $div;

                            const apply = function () {
                                let codesNew = [];
                                $div.find('input:checked').each(function (i, input) {
                                    codesNew.push($(input).attr('name'));
                                });
                                if (codesNew.length > 0) {
                                    btn.find('i').attr('class', 'fa fa-check-square-o')
                                } else {
                                    btn.find('i').attr('class', 'fa fa-square-o')
                                }
                                $.cookie('pcTableLogs', JSON.stringify(codesNew), {path: '/'});
                                pcTable.FullLOGS = [];
                                pcTable.LOGS = {};
                                btn.popover('destroy');

                                if (codesNew.length) {
                                    LogButtons.addClass('with-logs')
                                } else {
                                    LogButtons.removeClass('with-logs')
                                }
                                codes = codesNew
                            };
                            if (btn.is('[aria-describedby]')) {
                                $div = $('#' + btn.attr('aria-describedby'));
                                apply();
                            } else {

                                $div = $('<div>');
                                $div.append('<div><input type="checkbox" name="c"/> ' + App.translate('Code') + '</div>');
                                $div.append('<div><input type="checkbox" name="a"/> ' + App.translate('Action code') + '</div>');
                                $div.append('<div><input type="checkbox" name="s"/> ' + App.translate('Selects') + '</div>');
                                $div.append('<div><input type="checkbox" name="f"/> ' + App.translate('Formating') + '</div>');

                                let $times = $('<div><input type="checkbox" name="flds"/> ' + App.translate('Fields calculation time') + ' </div>');
                                $div.append($times)
                                if (pcTable.FieldLOGS && pcTable.FieldLOGS.length) {
                                    pcTable.FieldLOGS.forEach((log) => {
                                        let $calcFieldsLogBtn = $('<div style="cursor: pointer"><button class="btn btn-xs"><i class="fa fa-table"></i></button> ' + log.name + '</div>').on('click', function () {
                                            pcTable.model.calcFieldsLog(JSON.stringify(log.data), log.name);
                                        })
                                        $times.append($calcFieldsLogBtn);
                                    })
                                }


                                $div.append('<div style="padding-top: 10px;"><button class="btn btn-sm btn-default">' + App.translate('Apply') + '</button></div>');
                                $div.find('input').each(function (i, input) {
                                    input = $(input);
                                    if (codes.indexOf(input.attr('name')) !== -1) {
                                        input.prop('checked', 'checked');
                                    }
                                    if (codes.indexOf("flds") !== -1 && input.attr('name') !== "flds") {
                                        input.prop('disabled', true);
                                    }
                                });
                                $div.on('change', 'input[name="flds"]', function () {
                                    let val = $(this).is(':checked')
                                    $div.find('input').each((i, inp) => {
                                        inp = $(inp)
                                        if (inp.attr('name') !== 'flds') {
                                            if (val) {
                                                inp.prop("disabled", true)
                                                inp.prop("checked", false)
                                            } else {
                                                inp.prop("disabled", false)
                                            }
                                        }
                                    })
                                });

                                $div.on('click', 'button', function () {
                                    apply()
                                });
                                btn.popover({
                                    trigger: "manual",
                                    placement: "bottom",
                                    content: $div,
                                    html: true,
                                    animation: false,
                                    container: pcTable._container,
                                    onhide: function () {

                                    }
                                }).popover('show');
                            }
                        });

                    let img = btn.find('i');

                    if (codes.length > 0) img.addClass('fa-check-square-o'); else img.addClass('fa-square-o');

                    let btnLog = $('<button class="btn btn-danger btn-sm">' + App.translate('Log') + '</button>').appendTo(LogButtons);
                    pcTable.LogButton = btnLog;
                    btnLog.on('click', function () {
                        if (!pcTable.FullLOGS || pcTable.FullLOGS.length === 0) {
                            App.logOutput('Log is empty');
                        } else {
                            App.logOutput(pcTable.FullLOGS);
                        }
                    });


                    if ($TOTUM_FOOTER.length) {
                        $TOTUM_FOOTER.append(LogButtons);
                    } else {
                        LogButtons.appendTo(topButtons);
                    }

                    $('<button class="btn btn-danger btn-sm"><i class="fa fa-eraser" style="width: 13px"></i></button>')
                        .on('click', function () {
                            pcTable.FullLOGS = [];
                            pcTable.FieldLOGS = [];
                            pcTable.LOGS = {};
                        }).appendTo(LogButtons);
                }
            }
            let csv = $('<span class="common-table-title">');

            csv.append(this.fieldsHiddingGetButton(true));

            if (!pcTable.isMobile) {
                //Печать
                {
                    let btn = $('<button class="btn btn-default btn-sm"><i class="fa fa-print"></i></button>')
                        .on('click', function () {
                            pcTable._print.call(pcTable)
                        }).appendTo(csv);
                }

                if (pcTable.withCsvButtons) {
                    let btn = $('<button class="btn btn-default btn-sm">CSV-' + App.translate('export') + '</button>')
                        .on('click', function () {
                            let $panel = $('<div><div class="menu-item" data-type="full">' + App.translate('Full') + '</div>' +
                                '<div class="menu-item"  data-type="rows">' + App.translate('Only rows') + '</div></div>')
                            $panel.on('click', '.menu-item', function () {
                                let type = $(this).is('[data-type="full"]') ? 'full' : 'rows';
                                $panel.remove();
                                pcTable._csvExport(type);
                            })

                            let popoverId = App.popNotify({
                                isParams: true,
                                $text: $panel,
                                element: btn,
                                container: this._container,
                                trigger: 'manual',
                                placement: 'bottom'
                            });

                            $('#' + popoverId).position({
                                my: "left top",
                                at: "left-3px bottom+10px",
                                of: btn
                            }).off().on('mouseleave', function () {
                                $panel.remove();
                            }).find('.arrow').css('left', '11px').end()
                                .find('.popover-content').css('padding', '5px');

                        });
                    csv.append(btn);
                }
                if (pcTable.withCsvEditButtons && this.control.editing) {
                    let btn = $('<button class="btn btn-default btn-sm">CSV-' + App.translate('import') + '</button>')
                        .on('click', function () {
                            let $panel = $('<div><div class="menu-item" data-type="full">' + App.translate('Full') + '</div>' +
                                '<div class="menu-item"  data-type="rows">' + App.translate('Only rows') + '</div></div>')
                            $panel.on('click', '.menu-item', function () {
                                let type = $(this).is('[data-type="full"]') ? 'full' : 'rows';
                                $panel.remove();
                                pcTable._csvImportClick(type);
                            })

                            let popoverId = App.popNotify({
                                isParams: true,
                                $text: $panel,
                                element: btn,
                                container: this._container,
                                trigger: 'manual',
                                placement: 'bottom'
                            });

                            $('#' + popoverId).position({
                                my: "left top",
                                at: "left-3px bottom+10px",
                                of: btn
                            }).off().on('mouseleave', function () {
                                $panel.remove();
                            }).find('.arrow').css('left', '11px').end()
                                .find('.popover-content').css('padding', '5px');

                        });
                    csv.append(btn);
                }
            }
            if (!this.isAnonim && !pcTable.beforeSpaceHide)
                csv.append(this._getFavoriteStar());


            if (this.tableRow.panels_view) {
                if (this.tableRow.panels_view.state === 'both' && !pcTable.isMobile && window === window.top && pcTable.panels !== 'off') {
                    let btn;
                    if (this.viewType !== 'panels') {
                        btn = $('<button class="btn btn-default btn-sm"><i class="fa fa-address-card-o"></i></button>').on('click', () => {
                            this.model.panelsView(true).then(() => {
                                App.windowReloadWithHash(this.model);
                            })

                        });
                    } else {
                        btn = $('<button class="btn btn-default btn-sm"><i class="fa fa-table"></i></button>').on('click', () => {
                            this.model.panelsView(false).then(() => {
                                App.windowReloadWithHash(this.model);
                            })
                        });
                    }
                    csv.append(btn);
                }
            }


            if (this.isCreatorView && this.isMain) {
                let creatorPart = $('<div class="creator-buttons">');
                $('<button class="btn btn-default btn-xxs field_name copy_me" data-copied-text="' + App.translate('Copied') + '"/>').text(this.tableRow.name).appendTo(creatorPart);


                $('<button class="btn btn-danger btn-xxs" title="' + App.translate('Edit table settings') + '"/>')
                    .html('<i class="fa fa-pencil-square-o"></i>').on('click',  () => {
                    (new EditPanel(1, BootstrapDialog.TYPE_DANGER, {
                        id: pcTable.tableRow.id,
                        cycle_id: pcTable.tableRow.cycle_id
                    })).then((json) => {
                        if (json) App.windowReloadWithHash(pcTable.model);
                    });
                }).appendTo(creatorPart);


                let filters = {'fl_name': [this.tableRow.id]};
                $('<a href="/Table/' + this.Tables.branchId + '/' + this.Tables.id + '/?' + $.param({f: filters}) + '" target="_blank" class="btn btn-danger btn-xxs" title="' + App.translate('Open Tables') + '"/>').html('<i class="fa fa-external-link"></i>').appendTo(creatorPart);


                filters = {'f_table_categories': this.tableRow.category, 'f_table': this.tableRow.id};
                if (this.tableRow.__version) {
                    filters.fl_version = this.tableRow.__version
                }
                $('<a href="/Table/' + this.Tables.branchId + '/' + this.TableFields.id + '/?' + $.param({f: filters}) + '" target="_blank" class="btn btn-danger btn-xxs" title="' + App.translate('Open Tables Fields') + '"/>').html('<i class="fa fa-external-link-square"></i>').appendTo(creatorPart);


                if (this.tableRow.type === "calcs") {
                    creatorPart.append(' ');
                    let btnCopyTable = $('<a href="/Table/' + this.TablesVersions.branchId + '/' + this.TablesVersions.id + '?'
                        + $.param({f: this.calcstable_cycle_version_filters}) + '" target="_blank" class="btn btn-danger btn-xxs" title="' + App.translate('Creating tables versions') + '"><i class="fa fa-code-fork"></i></a>');
                    creatorPart.append(btnCopyTable);

                    creatorPart.append(' ');
                    btnCopyTable = $('<a href="/Table/' + this.TablesCyclesVersions.branchId + '/' + this.TablesCyclesVersions.id + '?'
                        + $.param({f: this.calcstable_versions_filters}) + '" target="_blank" class="btn btn-danger btn-xxs" title="' + App.translate('Changing versions of cycle tables') + '"><i class="fa fa-random"></i></a>');
                    creatorPart.append(btnCopyTable);


                }
                let type = $('<div class="color-danger creator-table-title">' +
                    +this.tableRow.sort + ' <i class="' + App.tableTypes[this.tableRow.type].icon + '"></i> '
                    + App.tableTypes[this.tableRow.type].title + ' [' + this.tableRow.actual + ']</div>');
                creatorPart.append(type);


                if (this.tableRow.type === "calcs") {
                    type.append(App.translate(' / Version %s / Cycle %s', [this.tableRow.__version, this.tableRow.cycle_id]))
                }

                const checkIsFilled = (btn, code) => {
                    if (code === null || code == '' || code.trim() === "=:" || code.trim() === "f1=:") {
                        btn.css('background-color', 'transparent')
                    } else {
                        btn.css('background-color', '#ffedb1')
                    }
                }

                [
                    [App.translate('Creator-tableEditButtons-default_action'), 'default_action', 'codeAction'],
                    [App.translate('Creator-tableEditButtons-on_duplicate'), 'on_duplicate', 'codeAction'],
                    [App.translate('Creator-tableEditButtons-row_format'), 'row_format', 'format'],
                    [App.translate('Creator-tableEditButtons-table_format'), 'table_format', 'format'],

                ].forEach((info) => {
                    let btn = $('<button class="btn btn-danger btn-xxs"></button>').text(info[0])
                        .on('click', function () {
                            pcTable.editTableCode(info[1], info[2]).then(() => {
                                App.blink($(this), 3, "green", "color");
                                checkIsFilled(btn, pcTable.tableRow[info[1]]);
                            })
                        }).appendTo(creatorPart);
                    checkIsFilled(btn, pcTable.tableRow[info[1]]);
                })


                let btnHideAdd = $('<button class="btn btn-danger btn-xxs" id="hide-hell" disabled><i class="fa fa-times"></i></span></button>')
                    .on('click', function () {
                        pcTable._hideHell_storage.switchOpened.call(pcTable)
                    }).appendTo(creatorPart);

                creatorPart.appendTo(topButtons);

                let btnAdd = $('<button class="btn btn-danger btn-xxs" id="addField">' + App.translate('Add field') + '</span></button>').width(113)
                    .on('click', function () {
                        let data = {
                            table_id: {v: pcTable.tableRow.id}, data_src: {v: pcTable_default_field_data_src}
                        };
                        if (pcTable.tableRow.__version) {
                            data['version'] = {v: pcTable.tableRow.__version};
                        }

                        data.cycle_id = pcTable.tableRow.cycle_id;

                        (new EditPanel(2, BootstrapDialog.TYPE_DANGER, data)).then(function (json) {
                            if (json) {
                                App.windowReloadWithHash(pcTable.model);
                            }
                        })
                    }).appendTo(creatorPart);

                creatorPart.appendTo(topButtons);
            }

            if (!pcTable.beforeSpaceHide) {
                this._beforeSpace.append(topButtons);
                this._beforeSpace_title = $('<div class="pcTable-title"><span class="title"/><span class="bttns"/><div class="updated"/></div>').prependTo(this._beforeSpace);


                if (this.tableRow.type === 'calcs' && window.TREE_DATA) {
                    let tabls = $('<div class="pcTable-tabls"><ul class="nav nav-tabs"></div>');
                    let tablsUl = tabls.find('ul');
                    let pathId, topPathId;
                    if (window.location.pathname.match(/^\/[^\/]+\/\d+\/\d+\/\d+\/\d+$/)) {
                        pathId = window.location.pathname.replace(/^\/[^\/]+\/([^\/]+).*?$/, '$1');
                        topPathId = window.location.pathname.replace(/^\/[^\/]+\/([^\/]+\/[^\/]+).*?$/, '$1') + '/';

                        let data = sessionStorage.getItem('cycles_filter');
                        if (data) {
                            data = JSON.parse(data);
                            if (data.id == this.tableRow.tree_node_id) {
                                topPathId += '?';
                                if (data.filter)
                                    topPathId += 'f=' + encodeURIComponent(data.filter);
                                if (data.onPage) {
                                    if (data.filter)
                                        topPathId += '&';
                                    topPathId += 'onPage=' + encodeURIComponent(data.onPage);
                                    topPathId += '&offset=' + encodeURIComponent(data.offset);
                                }

                            }
                        }

                        let addedBack = false;

                        window.TREE_DATA.forEach((br) => {
                            if (br.isCycleTable) {
                                if (!addedBack) {
                                    if (!br.isOneUserCycle)
                                        tablsUl.append('<li><a href="/Table/' + topPathId + '"><i class="fa fa-arrow-left"></a></li>');
                                    addedBack = true;
                                }
                                if (br.id === ('table' + this.tableRow.id))
                                    tablsUl.append('<li class="active"><a class="tab-title">' + br.text + '</a></li>');
                                else
                                    tablsUl.append('<li><a href="/Table/' + pathId + '/' + br.href + '">' + br.text + '</a></li>')
                            }
                        });

                    } else {
                        topPathId = window.location.pathname.replace(/^\/[^\/]+\/([^\/]+).*?$/, '$1');

                        let addedBack = false;

                        window.TREE_DATA.forEach((br) => {
                            if (br.isCycleTable) {
                                if (!addedBack) {
                                    tablsUl.append('<li><a href="/Table/' + topPathId + '/"><i class="fa fa-arrow-left"></a></li>');
                                    addedBack = true;
                                }
                                if (br.id === ('table' + this.tableRow.id))
                                    tablsUl.append('<li class="active"><a class="tab-title">' + br.text + '</a></li>');
                                else
                                    tablsUl.append('<li><a href="' + br.link + '">' + br.text + '</a></li>')
                            }
                        });
                    }


                    this._beforeSpace.append(tabls);
                }

            } else {
                this._beforeSpace_title = $('<div class="pcTable-title"><span class="bttns"/></div>').prependTo(this._beforeSpace);
            }
            this._beforeSpace_title.append(csv);

            if (this.tableRow.description) {
                let btnAdd = $('<a class="btn btn-default btn-sm"><i class="fa fa-info"></i></a>');
                let $description = $('<div class="table-description"/>').html(this.tableRow.description);

                let $btn = $('<button class="btn btn-default btn-sm close-table-description"><i class="fa fa-times"></i></button>')
                $description.append($btn)

                btnAdd.appendTo(csv);
                let storageKey = 'table_description_switcher' + this.tableRow.id;
                let switcher = this.tableRow.description.match('<hide(\/?)>') ? '0' : (localStorage.getItem(storageKey) || localStorage.setItem(storageKey, '1') || localStorage.getItem(storageKey));

                const handleSwitcher = (switch_) => {
                    if (switch_) {
                        switcher = switcher === '1' ? '0' : '1';
                    }

                    switch (switcher) {
                        case '1':
                            $description.show();
                            btnAdd.removeClass('btn-warning').addClass('btn-default');
                            break;
                        default:
                            $description.hide();
                            btnAdd.addClass('btn-warning').removeClass('btn-default');
                    }
                    localStorage.setItem(storageKey, switcher);
                    if (switch_) {
                        this.ScrollClasterized.insertToDOM(0, true);
                    }
                };
                handleSwitcher();

                btnAdd.on('click', handleSwitcher);
                $btn.on('click', handleSwitcher);

                this._beforeSpace.append($description);
            }


            return this._beforeSpace;
        },
        __$rowsButtons: null,
        applyPage: function (data, allCount, offset) {
            this.rows = data.rows;

            let ids;
            if (data.rows.length) {
                ids = {
                    firstId: data.rows[0].id,
                    lastId: data.rows[data.rows.length - 1].id,

                }
            } else {
                ids = {
                    firstId: 0,
                    lastId: 0
                }
            }

            if (data.offset === undefined && offset === undefined) {
                offset = this.PageData.offset;
            }

            this.PageData = {
                ...this.PageData, ...{
                    offset: data.offset === undefined ? offset : data.offset
                    , allCount: allCount === undefined ? data.allCount : allCount
                    , loading: false
                }, ...ids
            }

            this.initRowsData();
            this._refreshContentTable(false, true);
            this.__applyFilters(true);
            this.PageData.$block.empty().append(this._paginationCreateBlock());
            if (data.f) {
                this.apptyTableFormats(data.f)
            }
            this.selectedCells.summarizer.check();
        },
        _paginationCreateBlock: function () {
            let {offset, onPage, allCount} = this.PageData;

            if (onPage == '0') return '';

            let $block = $('<span></span>');


            let page = offset === 0 ? 0 : Math.ceil(offset / onPage);

            let allPages = Math.ceil(allCount / onPage);

            if (allPages < page) {
                allPages += (offset > onPage && (offset % onPage) > 0 ? 1 : 0);
            }

            let before, after, first, last;
            if (offset > 0)
                before = $('<button class="btn btn-default btn-sm"><i class="fa fa-hand-o-left"></i></button>').on('click', () => {
                    this.model.loadPage(this, null, this.PageData.onPage, this.PageData.firstId);
                    return false;
                })
            else before = $('<button class="btn btn-default btn-sm" disabled><i class="fa fa-hand-o-left"></i></button>')

            if ((offset + onPage) < allCount) {
                after = $('<button class="btn btn-default btn-sm"><i class="fa fa-hand-o-right"></i></button>').on('click', () => {
                    let keys = Object.keys(this.data);
                    this.model.loadPage(this, this.PageData.lastId, this.PageData.onPage);
                    return false;
                })
                last = $('<button class="btn btn-default btn-sm"><i class="fa fa-long-arrow-right"></i></button>').on('click', () => {
                    this.model.loadPage(this, null, this.PageData.onPage, -1);
                    return false;
                })
            } else {
                after = $('<button class="btn btn-default btn-sm" disabled><i class="fa fa-hand-o-right"></i></button>')
                last = $('<button class="btn btn-default btn-sm" disabled><i class="fa fa-long-arrow-right"></i></button>')
            }
            if (page > 0) {
                first = $('<button class="btn btn-default btn-sm"><i class="fa fa-long-arrow-left"></i></button>').on('click', () => {
                    this.model.loadPage(this, 0, this.PageData.onPage);
                    return false;
                })
            } else {
                first = $('<button class="btn btn-default btn-sm" disabled><i class="fa fa-long-arrow-left"></i></button>')
            }

            let onpaging = $('<span id="ttm-onpage-input"></span>')
            let selector = $('<input class="form-control" type="number">').appendTo(onpaging).wrap('<span>');
            selector.val(onPage)

            selector.on('change', () => {
                let lastId = 0;
                let prevLastId = null;
                let val = selector.val();

                if (this.PageData.countLimit && parseInt(val) > parseInt(this.PageData.countLimit)) {
                    val = this.PageData.countLimit;
                }

                if (this.PageData.onPage === val) {
                    return;
                }

                if (this.PageData.allCount <= this.PageData.onPage) {

                } else if (page >= Math.floor(this.PageData.allCount / this.PageData.onPage)) {
                    prevLastId = -1;
                }
                this.PageData.onPage = parseInt(val);
                this.model.loadPage(this, lastId, val, prevLastId);
            });


            $block.append(first)
            $block.append(before)
            $block.append('<span class="ttm-pages">' + App.translate('%s from %s', [(page + 1), allPages]) + '</span>')
            $block.append(after)
            $block.append(last)

            $block.append(onpaging)
            onpaging.append(App.translate('%s from %s', ['', allCount]))

            if (allPages > 1) {
                $block.addClass('ttm-pagination-warning');
                onpaging.append(' <i class="fa fa-square"></i>');
            }
            this.saveFilterAndPage();
            return $block;
        },
        _pagination() {
            if (this.PageData !== undefined && !this.PageData.loading) {
                return this.PageData.$block.empty().append(this._paginationCreateBlock());
            } else {
                if (!this.PageData) {
                    this.PageData = {$block: $('<div class="ttm-pagination"></div>')}
                }
                let lastId;

                /*if (this.data) {
                    let keys = Object.keys(this.data);
                    if (keys.length > 0) {
                        lastId = keys[keys.length - 1];
                    }
                }*/
                let checkLimits = this.tableRow.pagination.split('**');
                if (checkLimits[1]) {
                    let limit = checkLimits[1].split('/');
                    this.PageData.countLimit = (this.isMobile ? limit[1] : limit[0])
                }

                let pageSplit = checkLimits[0].split('/');
                let pageCount = parseInt((new URL(document.location)).searchParams.get('onPage') || (this.isMobile ? pageSplit[1] : pageSplit[0]));
                lastId = pageSplit[2] || null;

                this.PageData.onPage = pageCount;
                this.model.loadPage(this, lastId, pageCount, null, (new URL(document.location)).searchParams.get('offset'));

                return this.PageData.$block.empty().append('<i class="fa fa-spinner"></i>');
            }

        }
        ,
        rowButtonsCalcWidth: function () {
            if (this.tableWidth < this._innerContainer.width()) {
                if (this.isMobile) {
                    this.__$rowsButtons.width(this._table.width());
                } else {
                    this.__$rowsButtons.width(this._table.width() - 70);
                }
            } else if (!this.isMobile) {
                this.__$rowsButtons.width(this._innerContainer.width() - 5)
            }
        },
        _rowsButtons: function () {
            let pcTable = this;

            let buttons;
            if (!this.__$rowsButtons) {
                buttons = $('<div class="pcTable-buttons">');
                this.__$rowsButtons = buttons;
            } else {
                buttons = this.__$rowsButtons.empty();
            }
            if (this.fieldCategories.column.length) {

                if (this.isInsertable()) {
                    let insButtons = pcTable._getInsertButtons();
                    buttons.append(insButtons);
                }


                if (this.control.restoring) {
                    $('<button data-action="restore" class="btn btn-sm btn-warning">' + App.translate(this.isRestoreView ? 'Normal mode' : 'Restore') + '</button>')
                        .width(95)
                        .css('margin-left', '5px')
                        .on('click', this.switchRestoreView.bind(this)).appendTo(buttons)
                }


                if (!pcTable.isCreatorView && pcTable.f && pcTable.f.buttons && pcTable.f.buttons && pcTable.f.buttons.length) {

                    const $addButtons = ($btns) => {
                        let width = 0;
                        pcTable.f.buttons.forEach((name) => {
                            if (pcTable.isReplacedToRowsButtonsField(name)) {
                                let $td = $('<span class="button-wrapper">').data('field', name);
                                let button = pcTable.fields[name].getCellText(null, $td, pcTable.data_params);

                                $td.append(button).appendTo($btns)
                                button.wrap('<span class="cell-value">')
                                if (width < pcTable.fields[name].width) {
                                    width = pcTable.fields[name].width;
                                }
                            }
                        })
                        return width;
                    };

                    if (pcTable.isMobile) {
                        let $btns = $('<div class="ttm__burger-buttons">');
                        let width = $addButtons($btns);
                        if ($btns.length) {
                            let burger = $('<span class="button-wrapper ttm__burger-wrapper"><button class="btn btn-default btn-xxs button-field"><i class="fa fa-bars"></i></button></span>').appendTo(buttons);
                            $btns.find('.cell-button,button').width('100%')
                            burger.popover(
                                {
                                    content: $btns,
                                    html: true,
                                    animation: false,
                                    trigger: 'manual',
                                    placement: 'bottom',
                                }
                            )
                            burger.on('click', () => {
                                if (!burger.attr('aria-describedby')) {
                                    burger.popover('show');
                                    const hider = (event) => {
                                        if (event.originalEvent && $(event.originalEvent.target).closest('.modal').length) {
                                            pcTable.closeCallbackAdd(hider, null, 30);
                                            return;
                                        }
                                        burger.popover('hide');
                                    };
                                    pcTable.closeCallbackAdd(hider, null, 30);
                                }
                            })

                        }

                    } else {
                        $addButtons(buttons);
                    }
                }

                if (!this.isTreeView || this.fields.tree.treeViewLoad) {

                    let btnAdd = $('<button class="btn btn-sm" style="margin-left: 5px;">' + App.translate('Reset') + ' <span class="fa fa-filter"></span></button>').width(82)
                        .on('click', function () {
                            setTimeout(function () {
                                pcTable.filtersEmpty.call(pcTable)
                            }, 50)

                        });
                    if (this.filters && Object.keys(this.filters).length) {
                        btnAdd.addClass('btn-warning');
                    } else {
                        btnAdd.attr('disabled', true).addClass('btn-default');
                    }
                    buttons.append(btnAdd);
                    this.filtersClearButton = btnAdd;
                }

            }

            if (this.f.tablecomment) {
                let comment = $('<div class="pcTable-tableComment">').on('click', function () {
                    App.panel(App.translate('Comment of the table rows part'), pcTable.f.tablecomment)
                });
                buttons.prepend(comment.text(this.f.tablecomment));
                setTimeout(function () {
                    let btnsWidth = 0;
                    comment.parent().find('>span,>button').each(function () {
                        btnsWidth += $(this).width() || 0;
                    })
                    btnsWidth += 90;
                    comment.css('width', 'calc(100% - ' + (btnsWidth) + 'px)');
                }, 1);
            }

            return buttons;
        }
        ,
        _refreshContentTable: function (forceRecreateRows, forceCheckHeights) {
            let pcTable = this;
            let $content = this._content;
            forceCheckHeights = forceCheckHeights || false;

            $content.data('state', 'refreshing');
            let uin = App.fullScreenProcesses.showCog();


            this.ScrollClasterized.insertToDOM(0, forceCheckHeights, forceRecreateRows);
            App.fullScreenProcesses.hideCog();

            $content.data('state', 'ready');
            $content.trigger('refreshed');
            this._popovers.empty();

        }
        ,
        _refreshTitle: function () {
            if (this.beforeSpaceHide) return;
            this._beforeSpace_title.find('.title').text(this.f.tabletitle || this.tableRow.title);

            if (this.model.tableData && this.model.tableData.updated) {
                let dt;
                if (!this.isAnonim)
                    dt = moment(this.model.tableData.updated.dt, 'YYY-MM-DD HH:mm').format('DD.MM HH:mm') + ' (code: ' + this.model.tableData.updated.code + ')';
                let updatedDiv = $('<div class="small">').text(dt);
                if (this.control.editing === false) {
                    updatedDiv.append('<div class="">' + App.translate('Read only') + '</div>');
                }
                this._beforeSpace_title.find('.updated').html(updatedDiv);
            }

        },
        _setBrowserTitle() {
            if (this.f.browsertitle) {
                window.document.title = this.f.browsertitle.toString() === 'true' ? (this.f.tabletitle || this.tableRow.title) : this.f.browsertitle;
            }
        }
        ,
        _createTableText: function () {
            this.tableText = $('<div class="pcTable-tableText"></div>').html(this.f.tabletext);
            if (this.f.tablehtml) {
                this.tableText.append(this.f.tablehtml);
            }

            return this.tableText;
        }
        ,
        _refreshTableText: function () {
            this.tableText.text(this.f.tabletext);
        }
        ,
        _createRowsTitle: function (parent = null) {
            let pcTable = this;
            pcTable.__sectionsCloses = pcTable.__sectionsCloses || JSON.parse(localStorage.getItem('sectionCloses') || '{}');
            let storageKey = pcTable.tableRow.id + '/' + (pcTable.tableRow.__version || 0) + '/rows';


            let rowsTitle = $('<div class="pcTable-rowsTitle"></div>').on('click', 'i, span', function () {
                let parent = $(this).closest('.pcTable-rowsWrapper');
                if (parent.is('.pcTable-rowsClose')) {
                    parent.removeClass('pcTable-rowsClose');
                    delete pcTable.__sectionsCloses[storageKey];
                    pcTable.ScrollClasterized.reloadScrollHead();
                } else {
                    parent.addClass('pcTable-rowsClose');
                    pcTable.__sectionsCloses[storageKey] = 1;
                }
                pcTable.ScrollClasterized.insertToDOM(0, true);
                localStorage.setItem('sectionCloses', JSON.stringify(pcTable.__sectionsCloses));
            });


            if (parent && parent.is('.pcTable-rowsClose') && !pcTable.__sectionsCloses[storageKey]) {
                parent.removeClass('pcTable-rowsClose')
            } else if (parent && !parent.is('.pcTable-rowsClose') && pcTable.__sectionsCloses[storageKey]) {
                parent.addClass('pcTable-rowsClose')
            }


            if (this.f.rowstitle) {
                rowsTitle.html($('<span>').text(this.f.rowstitle)).prepend('<i class="fa">');
            } else {
                rowsTitle.text();
            }
            return rowsTitle;
        }
        ,
        _createFiltersBlock: function () {
            let pcTable = this,
                wrapper = $('<div>');
            this._filtersBlock = $('<div>');

            this._filtersBlock.addClass('pcTable-filtersTables pcTable-section');

            if (pcTable.fieldCategories.filter.length) {

                this.___createClosedSection(this._filtersBlock,
                    $('<div class="pcTable-sectionTitle"><span>' + App.translate('Filters') + '</span></div>')
                        .appendTo(this._filtersBlock), 'flt');

                this._filtersBlock.addClass('pcTable-filtersTables');

                let $table, $thead, $tbody;
                let width = 0;
                let ContainerWidth = this._container.width() - 140;
                let panelColor;

                const addGoButtons = function () {
                    if ($table) {
                        const btnGO = function () {
                            let self = $(this);

                            const goFunc = function () {
                                let href;
                                if (self.is('.eraser')) {
                                    href = '?';
                                } else {
                                    href = '?' + $.param({'f': pcTable._filtersBlock.data('cryptoFilters') || pcTable.filtersString});
                                }
                                if (pcTable.isMobile) {
                                    href += '#go-buttons';
                                }

                                window.location.href = href;
                            };
                            setTimeout(function () {
                                pcTable.model.doAfterProcesses(() => {
                                    setTimeout(goFunc, 100)
                                })
                            }, 500);

                            return true;
                        };

                        if (pcTable.isMobile) {
                            $table.after($('<table class="pcTable-filtersTable" id="go-buttons"><tr><td><button class="btn btn-default btn-xs button-go">GO</button> ' +
                                '<button class="btn btn-default btn-xs eraser button-go "><i class="fa fa-eraser"></i></button>' +
                                '</td></tr></td></table>').on('click', '.button-go', btnGO))
                        } else {
                            $thead.append('<th style="width: 69px;"></th>');
                            let $ButtonsGo = $('<td class="buttons-go">').html('<button class="btn btn-default btn-xs button-go">GO</button> <button class="btn btn-default btn-xs eraser button-go"><i class="fa fa-eraser"></i></button>').appendTo($tbody);
                            $table.width(width + 69);
                            $ButtonsGo.on('click', '.button-go', btnGO);
                        }
                    }
                };
                const addFilterCells = (k, v) => {

                    if (v.hidden) return;

                    if (pcTable.isMobile || width === 0 || (ContainerWidth < (width + v.width)) || v.tableBreakBefore) {
                        if (!pcTable.isMobile)
                            addGoButtons();


                        $table = $("<table class='pcTable-filtersTable'><thead><tr></tr></thead><tbody><tr></tr></tbody></table>")
                            .appendTo(this._filtersBlock);

                        width = 0;
                        $thead = $table.find('thead tr');
                        $tbody = $table.find('tbody tr');
                    }

                    if (v.panelColor !== undefined) {
                        panelColor = v.panelColor;
                    }

                    $thead.append(pcTable._createHeadCell(k, v, panelColor));
                    $('<td>').attr('data-field', v.name).appendTo($tbody);
                    width += v.width;
                };

                $.each(pcTable.fieldCategories.filter, addFilterCells);
                addGoButtons();
            }
            return this._filtersBlock;
        }
        ,
        _refreshFiltersBlock: function (newFilters) {
            let pcTable = this;
            newFilters = newFilters || {};

            if (newFilters.params) {
                $.each(pcTable.fieldCategories.filter, function (k, v) {
                    pcTable.data_params[v.name] = newFilters.params[v.name];
                });
                pcTable._filtersBlock.data('cryptoFilters', newFilters.filtersString)

            } else if (!pcTable.filterData) {
                pcTable.filterData = {};
                $.each(pcTable.fieldCategories.filter, function (k, v) {
                    pcTable.filterData[v.name] = $.extend(true, {}, pcTable.data_params[v.name]);
                });

                pcTable.model.addExtraData({'filters': pcTable.filtersString});
            }

            let changed = [];
            let blocked = [];

            $.each(pcTable.fieldCategories.filter, function (k, v) {

                if (v.hidden) return;

                let cell = pcTable._createCell(pcTable.data_params, v);
                /*if (v.insertable === true) {
                    v.editable = true;
                    cell.addClass('edt');
                }*/
                pcTable._filtersBlock.find('td[data-field="' + v.name + '"]').replaceWith(cell);
                if (!Object.equals(pcTable.data_params[v.name].v, pcTable.filterData[v.name].v)) {
                    changed.push(cell);
                }
                if (v.type === 'select' && v.column && pcTable.data_params[v.name].v && (pcTable.data_params[v.name].v === '*NONE*' || pcTable.data_params[v.name].v[0] === '*NONE*')) {
                    blocked.push(cell);
                }
            });

            if (changed.length > 0) {
                changed.forEach(function ($td) {
                    $td.addClass('warning-backg');
                });
                pcTable._filtersBlock.removeClass('with_danger').addClass('with_changed')
            } else if (blocked.length > 0) {
                blocked.forEach(function ($td) {
                    $td.addClass('danger-backg');
                });
                pcTable._filtersBlock.removeClass('with_changed').addClass('with_danger')
            } else {
                pcTable._filtersBlock.removeClass('with_danger, with_changed');
                pcTable._filtersBlock.find('.danger-backg, .warning-backg').removeClass('danger-backg, warning-backg');
            }
            return this._filtersBlock;
        }
        ,
        _createParamsBlock: function (scrollWrapper) {
            let $paramsBlock = $('<div>');
            if (scrollWrapper) {
                $paramsBlock.appendTo(scrollWrapper);
                return $paramsBlock
            } else if (this._paramsBlock) {
                this._paramsBlock.replaceWith($paramsBlock);
                this._paramsBlock = $paramsBlock;
            }

            let pcTable = this;
            if (pcTable.fieldCategories.param) {
                $paramsBlock.addClass('pcTable-paramsTables');
                if (pcTable.isMobile) {
                    let $table, $thead, $tbody;
                    let sectionTitle = '';
                    let isNoTitles = false;

                    let sectionDiv;
                    let sections = [];
                    $.each(pcTable.fieldCategories.param, function (k, field) {
                            if (pcTable.isReplacedToRowsButtonsField(field.name))
                                return;

                            let panelColor;
                            if (field.panelColor !== undefined) {
                                panelColor = field.panelColor;
                            }
                            if (field.sectionTitle !== undefined) {
                                isNoTitles = false;
                                sectionTitle = field.sectionTitle;
                                if (sectionTitle.match(/\*\*(.*)/)) {
                                    sectionTitle.match(/\*\*(.*)/)[1].trim().split(/\s*;\s*/).forEach((param) => {
                                        let split = param.trim().split(/\s*:\s*/);

                                        if (split[0] === 'nolable') {
                                            if (!split[1] || split[1].trim() === 'true') {
                                                sectionTitle = "";
                                            }
                                        }
                                    })
                                    sectionTitle = sectionTitle.replace(/(\*\*.*)/, '')
                                }
                            }
                            if (!field.showMeWidth || (pcTable.data_params[field.name].f && pcTable.data_params[field.name].f.hide && pcTable.data_params[field.name].f.hide.mobile)) return;


                            $table = $("<table class='pcTable-paramsTable'>" + (isNoTitles ? "" : "<thead><tr></tr></thead>") + "<tbody><tr style='background-color: " + panelColor + "'></tr></tbody></table>");
                            if (pcTable.isMobile && field.type === 'button') {
                                $table = $("<table class='pcTable-paramsTable'><tbody><tr></tr></tbody></table>");
                            }

                            if (!sectionDiv || sectionTitle) {
                                sectionDiv = $('<div class="pcTable-section">').appendTo($paramsBlock);
                                if (sectionTitle) {
                                    pcTable.___createClosedSection(sectionDiv, $('<div class="pcTable-sectionTitle"></div>').html($('<span>').text(sectionTitle)).appendTo(sectionDiv), 'p');
                                }
                            }
                            sectionTitle = '';

                            sectionDiv.append($table);
                            if (!isNoTitles) {
                                $thead = $table.find('thead tr');
                                $thead.append(pcTable._createHeadCell(k, field, panelColor));
                            }
                            $tbody = $table.find('tbody tr');
                            $tbody.append('<td data-field="' + field.name + '">');


                        }
                    );
                } else this.__fillFloatBlock($paramsBlock, pcTable.fieldCategories.param);
            }
            return $paramsBlock;
        }
        ,
        _refreshParamsBlock: function (paramsChanges, colorizeIt) {
            var pcTable = this;
            if (pcTable.fieldCategories.param) {

                $.each(pcTable.fieldCategories.param, function (k, v) {
                    if (!v.showMeWidth || paramsChanges && !paramsChanges[v.name]) return true;

                    let cell = pcTable._createCell(pcTable.data_params, v);
                    let oldCell = pcTable._paramsBlock.find('td[data-field="' + v.name + '"]');
                    if (oldCell.css('minHeight')) {
                        cell.css('minHeight', oldCell.css('minHeight'));
                    }

                    oldCell.replaceWith(cell);

                    if (colorizeIt && paramsChanges[v.name] !== 'f') {
                        pcTable._colorizeElement(cell, pcTable_COLORS.saved);
                    }
                })
            }
            return this._paramsBlock;
        }
        ,
        _createFootersSubtable: function (scrollWrapper) {
            let _footersSubTable;
            let pcTable = this;
            _footersSubTable = $("<div class='pcTable-footersTables'>");
            if (scrollWrapper) {
                _footersSubTable.appendTo(scrollWrapper);
                return _footersSubTable;
            } else {
                if (this._footersSubTable) {
                    this._footersSubTable.replaceWith(_footersSubTable);
                    this._footersSubTable = _footersSubTable;
                }
            }

            if (pcTable.isMobile) {
                let width = 0, $table, $thead, $tbody;
                let ContainerWidth = this._container.width() - 100;

                let sectionTitle = '';
                let sectionDiv, isNoTitles;
                $.each(pcTable.notTableFooterFields, function (k, field) {
                    let panelColor;
                    if (field.panelColor !== undefined) {
                        panelColor = field.panelColor;
                    }
                    if (field.sectionTitle !== undefined) {
                        isNoTitles = false;
                        sectionTitle = field.sectionTitle;
                        if (sectionTitle.match(/\*\*(.*)/)) {
                            sectionTitle.match(/\*\*(.*)/)[1].trim().split(/\s*;\s*/).forEach((param) => {
                                let split = param.trim().split(/\s*:\s*/);

                                if (split[0] === 'nolable') {
                                    if (!split[1] || split[1].trim() === 'true') {
                                        sectionTitle = "";
                                    }
                                }
                            })
                            sectionTitle = sectionTitle.replace(/(\*\*.*)/, '')
                        }
                    }
                    if (!field.showMeWidth || (pcTable.data_params[field.name].f && pcTable.data_params[field.name].f.hide && pcTable.data_params[field.name].f.hide.mobile)) return;
                    if (pcTable.isMobile || width === 0 || (ContainerWidth < (width + field.showMeWidth)) || field.tableBreakBefore) {
                        if ($table && !pcTable.isMobile) $table.width(width);

                        $table = $("<table class='pcTable-footersTable'><thead><tr></tr></thead><tbody><tr style='background-color: " + panelColor + "'></tr></tbody></table>");
                        if (field.type === 'button' || isNoTitles) {
                            $table = $("<table class='pcTable-paramsTable'><tbody><tr></tr></tbody></table>");
                        }

                        if (!sectionDiv || sectionTitle) {
                            sectionDiv = $('<div class="pcTable-section">').appendTo(_footersSubTable);
                            if (sectionTitle) {
                                pcTable.___createClosedSection(sectionDiv, $('<div class="pcTable-sectionTitle"></div>').html($('<span>').text(sectionTitle)).appendTo(sectionDiv), 'f');
                            }
                        }
                        sectionTitle = '';
                        sectionDiv.append($table);
                        width = 0;
                        $thead = $table.find('thead tr');
                        $tbody = $table.find('tbody tr');
                    }

                    $thead.append(pcTable._createHeadCell(k, field, panelColor));
                    $tbody.append('<td data-field="' + field.name + '">');
                    width += field.showMeWidth;
                });
            } else this.__fillFloatBlock(_footersSubTable, pcTable.notTableFooterFields);
            return _footersSubTable;
        }
        ,
        _createFootersTableBlock: function () {
            let pcTable = this;
            let _footersBlock;
            _footersBlock = $("<tbody class='pcTable-footers'></tbody>");
            if (pcTable.fieldCategories['footer']) {
                let columnsFooters = {};
                let maxInColumn = 0;

                $.each(pcTable.fieldCategories['footer'], function (k, field) {
                    if (field.showMeWidth && !(pcTable.data_params[field.name].f && pcTable.data_params[field.name].f.hide && pcTable.data_params[field.name].f.hide.mobile)) {
                        if (!field.column) field.column = '';

                        if (!columnsFooters[field.column]) columnsFooters[field.column] = [];
                        columnsFooters[field.column].push(field);
                        if (field.column) {
                            if (maxInColumn < columnsFooters[field.column].length) maxInColumn = columnsFooters[field.column].length;
                        }
                    }
                });

                let NewFooters = $();
                let footerVarNum = 0;
                let trIndex = 0;
                while (footerVarNum < maxInColumn) {

                    let trHead = $('<tr><td class="id"></td></tr>');

                    let trVal = $('<tr><td class="id"></td></tr>').data(pcTable_ROW_ItemId_KEY, 'footers').data(pcTable_DATA_INDEX, 'footers' + (trIndex++));

                    $.each(pcTable.fieldCategories['column'], function (k, field) {
                        if (field.showMeWidth) {
                            let td = $('<td>');
                            if (!columnsFooters[field.name] || !columnsFooters[field.name][footerVarNum]) {
                                td.attr('rowspan', 2);
                                trHead.append(td);
                                td.addClass('footer-empty');
                                return;

                            } else {
                                td = pcTable._createHeadCell(k, columnsFooters[field.name][footerVarNum], columnsFooters[field.name][footerVarNum].panelColor).addClass('footer-name');

                                if (pcTable.isRotatedView) {
                                    td.width('auto')
                                }
                                trHead.append(td);
                            }

                            if (columnsFooters[field.name] && columnsFooters[field.name][footerVarNum]) {

                                let footerField = columnsFooters[field.name][footerVarNum];
                                let td = pcTable._createCell(pcTable.data_params, footerField);
                                td.attr('data-field', footerField.name);
                                trVal.append(td);
                            }
                        }

                    });

                    let width = this.tableRow['rotated_view'] + 50
                    trHead.width(width / 2)
                    trVal.width(width / 2)

                    NewFooters = NewFooters.add(trHead);
                    NewFooters = NewFooters.add(trVal);

                    footerVarNum++;
                }
                _footersBlock.html(NewFooters);
            }
            return _footersBlock;
        }
        ,
        ___createClosedSection(sectionDiv, title, placement) {
            const pcTable = this;
            let sectionId = sectionDiv.parent().find('>div').index(sectionDiv) + 2;
            let storageKey = pcTable.tableRow.id + '/' + (pcTable.tableRow.__version || 0) + '/' + placement + '/' + sectionId;

            pcTable.__sectionsCloses = pcTable.__sectionsCloses || JSON.parse(localStorage.getItem('sectionCloses') || '{}');

            if (pcTable.__sectionsCloses[storageKey]) {
                sectionDiv.addClass('closed');
            }
            $('<span class="btn-i"><i class="fa"></i></span>')
                .prependTo(title);
            title.on('click', 'i, span', function () {
                let sectionDiv = $(this).closest('.pcTable-section');
                if (sectionDiv.is('.closed')) {
                    sectionDiv.removeClass('closed');
                    delete pcTable.__sectionsCloses[storageKey];
                    if (sectionDiv.data('closedrender')) {
                        let scroll = pcTable.scrollWrapper.parent().scrollTop();
                        switch (placement) {
                            case 'p':
                                pcTable._rerendParamsblock();
                                break;
                            case 'f':
                                pcTable._rerendBottomFoolers();
                                break;
                        }
                        pcTable.scrollWrapper.parent().scrollTop(scroll);
                    } else {
                        sectionDiv.find('td').each(function () {
                            let self = $(this);
                            if (self.data('addProgress')) {
                                self.data('addProgress')();
                            }
                        })
                    }
                } else {
                    sectionDiv.addClass('closed');
                    pcTable.__sectionsCloses[storageKey] = 1;
                }
                localStorage.setItem('sectionCloses', JSON.stringify(pcTable.__sectionsCloses));
                pcTable.ScrollClasterized.insertToDOM(null, true);
                return false;
            });
        }
        ,
        _refreshFootersBlock: function (paramsChanges, colorizeIt) {
            let pcTable = this;
            let footers = pcTable._footersBlock.add(pcTable._footersSubTable)

            if (pcTable.fieldCategories.footer) {
                $.each(pcTable.fieldCategories.footer, function (k, v) {
                    if (!v.showMeWidth || paramsChanges && !paramsChanges[v.name]) return true;

                    let cell = pcTable._createCell(pcTable.data_params, v);
                    cell.attr('data-field', v.name);
                    footers.find('td[data-field="' + v.name + '"]').replaceWith(cell);

                    if (colorizeIt && paramsChanges[v.name] !== 'f') {
                        pcTable._colorizeElement(cell, pcTable_COLORS.saved);
                    }
                })
            }
            return this._paramsBlock;
        }
        ,
        _createHead: function () {
            this._header = $("<thead>").append(this._createHeadRow());
            return this._header;
        }
        ,
        _refreshHead: function () {
            this._header.empty().append(this._createHeadRow());
            return this._header;
        }
        ,
        _createFirstBody: function () {
            this._beforebody = $("<tbody class='beforeRows'>").append('<tr class="extra-clasters">');
            this.extraClastersTop = this._beforebody.find('.extra-clasters');
            return this._beforebody;
        }
        ,
        _createAfterBody: function () {
            this._afterbody = $("<tbody class='afterRows'>").append('<tr class="extra-clasters">');
            this.extraClastersBottom = this._afterbody.find('.extra-clasters');
            return this._afterbody;
        }
        ,
        _createBody: function () {
            this._content = $("<tbody class='dataRows'>");

            return this._content;
        }
        ,
        _createHeadRow: function () {
            let pcTable = this;
            let $row = $("<tr>");


            if (!this.fieldCategories.visibleColumns.length) {
                pcTable._container.addClass('withNoColumns')
            } else {
                pcTable._container.removeClass('withNoColumns')
            }

            pcTable._createHeadCellId().appendTo($row);
            let $width = $row.find('.id').width();


            pcTable._table.removeClass('n-filtered');
            $.each(this.fieldCategories.visibleColumns, function (index, field) {
                let panelColor;
                if (field.panelColor !== undefined) {
                    panelColor = field.panelColor;
                }
                let $th;
                if (field.name === 'n') {
                    pcTable._table.addClass('n-filtered');
                    $th = pcTable._createHeadCellNo();
                } else {
                    $th = pcTable._createHeadCell(index, field, panelColor);
                }
                $th.appendTo($row);
                $width += parseInt(field.showMeWidth);
            });

            this.tableWidth = $width;

            if (!this.isRotatedView)
                this._table.width(this.tableWidth);

            return $row;
        }
        ,
        _createHeadCellId: function () {
            let pcTable = this;
            let $th = $('<th class="id"><span>id</span></th>');

            if (pcTable.tableRow.order_field === null || pcTable.tableRow.order_field === 'id') {
                let span = $th.find('span').css('font-weight', 'bold');
                if (pcTable.isCreatorView) {
                    if (pcTable.tableRow.order_desc === true) {
                        span.append(' <i class="fa fa-sort-amount-desc roles"></i>');
                    } else {
                        span.append(' <i class="fa fa-sort-amount-asc roles"></i>');
                    }
                }
            }

            let panel = $('<div class="pcTable-filters"></div>');


            /*******Кнопка показать поле n*****/
            let OrderClass = 'btn-warning';

            let $btnNHiding = $('<button class="btn btn-default btn-xxs" id="n-expander"><i class="fa fa-sort"></i></button>')
            if (this.isTreeView && this.fields.tree.treeViewType !== 'other') {
                $btnNHiding.prop('disabled', true)
            } else {
                $btnNHiding.on('click', function () {
                    if (!pcTable.fieldCategories.visibleColumns.some(function (field) {
                        return field.name === 'n';
                    })) {
                        pcTable.fieldsHiddingHide.call(pcTable, 'n', true);
                        $btnNHiding.addClass(OrderClass)
                    } else {
                        pcTable.fieldsHiddingHide.call(pcTable, 'n');
                        $btnNHiding.removeClass(OrderClass)
                    }
                    pcTable.ScrollClasterized.reloadScrollHead();
                })
            }

            if (pcTable.fieldCategories.visibleColumns.some(function (field) {
                return field.name === 'n';
            })) {
                $btnNHiding.addClass(OrderClass)
            }
            /*******Кнопка показать поле n*****/


            if (pcTable.isMobile) {

            } else {
                let filterButton = this._getIdFilterButton();

                panel.append($btnNHiding)
                    .append(' ')
                    .append(filterButton)
                    .append(' ')
                    .append(pcTable._idCheckButton);
            }
            $th.append(this._checkStatusBar);
            $th.append(panel);

            pcTable._idCheckButton.off().on('click', function () {
                if (pcTable._idCheckButton.find('span').is('.fa-check')) {
                    pcTable.row_actions_uncheck_all.call(pcTable);
                    pcTable.__checkedRows = [];
                } else {
                    for (let i = 0; i < pcTable.dataSortedVisible.length; i++) {
                        let element = pcTable.dataSortedVisible[i];
                        let item = typeof element !== 'object' ? pcTable._getItemById(element) : element.row;
                        if (item && !item.$checked) {
                            pcTable.row_actions_check.call(pcTable, item, true);
                            pcTable.__checkedRows.push(item.id)
                        }

                    }
                }
                pcTable._headCellIdButtonsState();
            });

            panel = $('<div class="pcTable-filters for-selected"><button class="btn btn-default btn-xxs"><i class="fa fa-copy"></i></button> <button class="btn btn-default btn-xxs" data-names="true"><i class="fa fa-clone"></i></button></div>');
            $th.append(panel);

            this._refreshCheckedStatus();

            return $th;
        }
        ,
        _getIdFilterButton: function () {
            let pcTable = this;
            let filterButton;
            let span = $('<span>');

            filterButton = $('<button class="btn btn-xxs btn-filter" id="checkS"><span class="fa fa-circle-o"></span></button>').on('click', function () {
                if (filterButton.is('.btn-warning')) {
                    filterButton.addClass('btn-default').removeClass('btn-warning').find('span').removeClass('fa-circle').addClass('fa-circle-o');

                    delete pcTable.filters['id'];
                    span.find('.btn-filter:not(#checkS)').parent().replaceWith(pcTable.__getFilterButton('id'))
                } else {
                    filterButton.removeClass('btn-default').addClass('btn-warning').find('span').removeClass('fa-circle-o').addClass('fa-circle');
                    pcTable.filters['id'] = pcTable.__checkedRows.slice().map(function (v) {
                        return v.toString()
                    });

                }
                pcTable.__applyFilters();
                pcTable._headCellIdButtonsState();
            });
            if (pcTable.filters.id && pcTable.filters.id.length) {
                filterButton.addClass('btn-warning').removeClass('btn-default');
            } else {
                filterButton.addClass('btn-default').removeClass('btn-warning');
            }

            span.append(filterButton);
            span.append(pcTable.__getFilterButton('id'));

            return span;
        }
        ,
        _createHeadCellNo: function () {
            let pcTable = this;
            let field = pcTable.fields['n'];
            let spanTitle = $('<span class="cell-title">')
                .text(field.title ? field.title : field.name)
                .attr('title', field.title);
            let btn = $('<button class="btn btn-default btn-xxs" style="width: 45px"><i class="fa fa-save"></i></button>');

            let $th = $('<th class="n">').width(field.userWidth || field.width).append(spanTitle);

            if (pcTable.isCreatorView) {
                if (pcTable.tableRow.order_field === 'n') {
                    if (pcTable.tableRow.order_desc === true) {
                        spanTitle.before('<i class="fa fa-sort-amount-desc roles"></i>');
                    } else {
                        spanTitle.before('<i class="fa fa-sort-amount-asc roles"></i>');
                    }
                }
                spanTitle.before('<br/>');
            }


            pcTable._orderSaveBtn = btn;
            if (pcTable.tableRow.with_order_field && !pcTable.f.blockorder && !pcTable.tableRow['__blocked']) {
                btn.on('click', function () {
                    pcTable.reOrderRowsSave.call(pcTable);
                })
            } else {
                btn.prop('disabled', true);
                this._table.addClass('no-correct-n-filtered');
            }
            return $th.append($('<div class="pcTable-filters">').append(btn));
        }
        ,
        __getCellTitle: function (field) {
            return Object.getPath(this.f, ['fieldtitle', field.name], field.title)
        }
        ,

        isReplacedToRowsButtonsField(fieldName) {
            let pcTable = this;
            return pcTable.fields[fieldName] && pcTable.f && pcTable.f.buttons && pcTable.f.buttons && pcTable.f.buttons.length && pcTable.f.buttons.indexOf(fieldName) !== -1;
        },
        _createHeadCell: function (index, field, panelColor) {
            let pcTable = this;

            let $th = $('<th>')
                .data('field', field.name);

            field.$th = $th;

            let width = field.showMeWidth || field.width || 100;
            if (!this.isRotatedView || !(field.category === 'column')) {

                if (field.category !== 'column' && width && pcTable.isMobile) {
                    width = 100;
                }

                if (pcTable.isMobile) {
                    if (field.category === 'column' && field.editable) {
                        width += 20;
                    }
                    width += 20;
                }
                if (width)
                    $th.width(width);
            }

            if (pcTable.fields[field.name]) {
                pcTable.fields[field.name].$th = $th;
            }

            if (field.panelColor) {
                $th.css('background-color', field.panelColor);
            } else if (panelColor !== undefined && panelColor !== '') {
                $th.css('background-color', panelColor);
                field.panelColor = panelColor;
            }
            if (field.webRoles && field.webRoles.length === 1 && field.webRoles[0].toString() === "1") {
                $th.addClass('admin-see');
            }

            if (field['type'] === 'footer' && field['column']) {
                $th = $('<td>');
            }

            let title = this.__getCellTitle(field);

            let spanTitle = $('<span class="cell-title">')
                .text(title)
                .attr('title', title).appendTo($th);

            if (pcTable.isCreatorView && !this.isRotatedView) {
                let creatorIcons = $('<span class="creator-icons">').prependTo(spanTitle);


                const getCategoryIcon = function (category) {
                    let placeIcon = '';
                    switch (category) {
                        case 'param':
                            placeIcon = 'fa-hand-o-up';
                            break;
                        case 'column':
                            placeIcon = 'fa-hand-o-right';
                            break;
                        case 'filter':
                            placeIcon = 'fa-hand-o-left';
                            break;
                        case 'footer':
                            placeIcon = 'fa-hand-o-down';
                            break;
                    }
                    return placeIcon;
                };

                if (field.isHiddenField || !field.showMeWidth) {
                    creatorIcons.append('<i class="fa ' + getCategoryIcon(field.category) + ' roles"></i>');
                }

                if (field.showInWeb && !field.isHiddenField && !field.showMeWidth) {
                    $th.addClass('eye-hidden');
                }

                if (field.linkTableName) {
                    creatorIcons.append('<i class="fa fa-chain roles"></i>');
                }
                creatorIcons.append('<i class="fa ' + field.icon + ' roles"></i>');
                let $ord = $('<i class="roles">' + (field._ord || field.ord) + '</i>');
                creatorIcons.append($ord);
                if (field._ord) {
                    $ord.addClass('reordered');
                    $ord.before('<i class="roles">' + (field.ord) + '</i>')
                }
                if (field._category) {
                    $ord.before('<i class="fa ' + getCategoryIcon(field._category) + ' roles reordered fa-bold"></i>')
                }


                if (field.category === 'column' && pcTable.tableRow.order_field === field.name) {
                    $ord.css('font-weight', 'bold');
                    if (pcTable.tableRow.order_desc === true) {
                        creatorIcons.append('<i class="fa fa-sort-amount-desc roles"></i>');
                    } else {
                        creatorIcons.append('<i class="fa fa-sort-amount-asc roles"></i>');
                    }
                }

                if (field.codeAction) {
                    let star = $('<i class="fa fa-star roles"></i>');
                    creatorIcons.append(star);
                    let title = '';
                    if (field.CodeActionOnAdd) {
                        if (title !== '') title += "\n";
                        title += App.translate('On adding');
                    }
                    if (field.CodeActionOnChange) {
                        if (title !== '') title += "\n";
                        title += App.translate('On changing');
                    }
                    if (field.CodeActionOnDelete) {
                        if (title !== '') title += "\n";
                        title += App.translate('On deleting');
                    }
                    if (field.type === 'button' || field.CodeActionOnClick) {
                        if (title !== '') title += "\n";
                        title += App.translate('On click');
                    }
                    if (title === "") {
                        star.removeClass('fa-star').addClass('fa-star-o');
                    }
                    star.attr('title', title);
                }
                if (field.code && !field.linkFieldName) {
                    if (field.codeOnlyInAdd) {
                        creatorIcons.append('<i class="fa fa-cogs fa-lower roles"></i>');
                    } else {
                        creatorIcons.append('<i class="fa fa-cogs roles"></i>');
                    }
                }

                const getRoles = function (rolesList) {
                    let roles = '';
                    rolesList.forEach(function (r) {
                        if (roles !== '') roles += "\n";
                        roles += pcTable.ROLESLIST[r.toString()]
                    });
                    return roles;
                };

                if (field.webRoles) {
                    creatorIcons.append($('<i class="fa fa-eye roles"></i>').attr('title', getRoles(field.webRoles)));
                }
                if (field.type !== "button") {
                    let lockInHead = false;
                    if (field.addRoles) {
                        creatorIcons.append($('<i class="fa fa-plus roles h"></i>').attr('title', getRoles(field.addRoles)));
                    } else if (!field.insertable) {
                        if (field.category === "column") {
                            if (!field.editable) {
                                creatorIcons.append($('<i class="fa fa-lock roles h"></i>').attr('title', App.translate('Adding and editing is disallowed')));
                                lockInHead = true;
                            } else {
                                creatorIcons.append($('<i class="fa fa-plus roles h"></i>').attr('title', App.translate('Adding is disallowed')));
                            }
                        } else if (!field.editable) {
                            creatorIcons.append($('<i class="fa fa-lock roles h"></i>').attr('title', App.translate('Editing is disallowed')));
                            lockInHead = true;
                        }
                    }

                    if (field.editRoles) {
                        creatorIcons.append($('<i class="fa fa-pencil roles h"></i>').attr('title', getRoles(field.editRoles)));
                    } else if (!field.editable && !lockInHead) {
                        creatorIcons.append($('<i class="fa fa-pencil roles h"></i>').attr('title', App.translate('Editing is disallowed')));
                    }

                    if (field.logRoles) {
                        creatorIcons.append($('<i class="fa fa-archive roles h"></i>').attr('title', getRoles(field.logRoles)));
                    }
                }
                if (field.showInXml) {
                    let roles = '';
                    if (field.xmlRoles) {
                        roles = getRoles(field.xmlRoles)
                    }
                    creatorIcons.append($('<i class="fa fa-exchange roles"></i>').attr('title', roles));
                }

            }

            if (field.unitType) {
                spanTitle.append(', ' + field.unitType);
            }


            let filterBlock = $('<div class="pcTable-filters">');

            //i
            let span_help;
            if (field.help && field.help.length) {
                if (!pcTable.isCreatorView && field.category !== "column") {
                    $th.addClass('worker-with-i');
                }
                span_help = $('<span class="btn btn-xxs btn-default cell-help" tabindex="-1" id="field-help-' + field.name + '"><i class="fa fa-info"></i></span>');
                $th.addClass('with-help');

                if (pcTable.isCreatorView && /^\s*<admin>.*?<\/admin>\s*$/s.test(field.help)) {
                    span_help.addClass('danger-backg');
                }

                span_help.appendTo(filterBlock);
                let i_content = $('<div class="i-inner-div">').html(field.help).width(230);
                let closeLimit;
                if (pcTable.isMobile) {
                    span_help.on('click', function () {
                        App.mobilePanel(App.translate('Field %s', field.title), field.help);
                    })
                } else
                    span_help.on('click open close', function (event) {
                        let btn = $(this);

                        if (!btn.data('bs.popover')) {
                            if (event.type !== "close") {
                                span_help.popover(
                                    {
                                        trigger: "manual",
                                        content: i_content,
                                        html: true,
                                        placement: () => {
                                            let placement = 'bottom';
                                            let height = 300;
                                            let container = pcTable._container;
                                            let heightOffset = btn.offset().top - container.offset().top;

                                            //Определить где больше места - сверху или снизу
                                            if ((field.category === "column" && pcTable.insertRow) || heightOffset > container.height() / 2) {
                                                placement = 'top';
                                                height = heightOffset - 40;
                                            } else {
                                                height = container.height() - heightOffset - 70;
                                            }
                                            i_content.css('max-height', height);
                                            return placement;
                                        },
                                        container: pcTable.scrollWrapper
                                    }
                                );
                                setTimeout(()=>{
                                    btn.popover('show');
                                }, 10)

                            }
                        } else if (event.type !== "open") {
                            if (closeLimit) clearTimeout(closeLimit);
                            closeLimit = setTimeout(() => {
                                if (btn.attr('aria-describedby') && $('#' + btn.attr('aria-describedby').length)) {
                                    btn.popover('destroy')
                                }
                            }, 120);
                        }
                        $('body').trigger('_click')
                        return false;
                    });


                pcTable.addThHelpCloser();

            }


            if (field.category === 'column') {
                if ((!pcTable.isTreeView || pcTable.fields.tree.treeViewLoad) && field.filterable && field.showMeWidth > 0) {
                    $th.addClass('with-filter2');
                    this.__getFilterButton(field.name).appendTo(filterBlock);
                }
            }

            //Стрелочка с выпадающим меню
            if (pcTable.isCreatorView || (field.dropdownView !== false && field.category === "column")) {
                $th.addClass('with-filter');
                let isRed = pcTable.isCreatorView && !(field.dropdownView !== false && field.category === "column");

                (() => {
                    let $divPopoverArrowDown = $('<div class="cell-header-dropdown">');
                    let btnDropDown = $('<button class="btn btn-default btn-xxs"  tabindex="-1">' +
                        '<i class="fa fa-caret-down"></i></button>');
                    if (pcTable.fixedColumn === field.name) {
                        btnDropDown.addClass('btn-warning').removeClass('btn-default')
                    }

                    if (!field.pcTable) {
                        btnDropDown.addClass('field_name')
                    } else if (isRed) {
                        btnDropDown.addClass('field_name')
                    }

                    const funcOnTableChanged = function (json) {
                        if (json) {
                            App.windowReloadWithHash(pcTable.model);
                        }
                    };

                    if (pcTable.isCreatorView) {
                        let btn = $('<div class="menu-item color-danger">');
                        btn.append('<i class="fa fa-pencil-square-o"></i> ' + App.translate('Edit'));
                        $divPopoverArrowDown.append(btn);


                        const contextmenu = function () {
                            (new EditPanel(2, BootstrapDialog.TYPE_DANGER, {
                                id: field.id,
                                cycle_id: pcTable.tableRow.cycle_id
                            })).then(funcOnTableChanged);
                            return false;
                        };

                        btn.on('click', contextmenu);
                        btnDropDown.on('contextmenu', contextmenu);


                        btn = $('<div class="menu-item color-danger">');
                        btn.append('<i class="fa fa-clone"></i> ' + App.translate('Duplicate'));
                        $divPopoverArrowDown.append(btn);
                        btn.on('click', function () {

                            App.getPcTableById(2).then(function (pcTableTablesFields) {
                                pcTableTablesFields.model.checkEditRow({id: field.id}).then(function (json) {
                                    let ee = {};
                                    let pin = {};
                                    $.each(json.row, function (k, v) {
                                        if (typeof v === 'object') {
                                            ee[k] = v;
                                            pin[k] = true;
                                        }
                                    });
                                    ee.cycle_id = pcTable.tableRow.cycle_id;
                                    (new EditPanel(2, BootstrapDialog.TYPE_DANGER, ee, false, pin)).then(funcOnTableChanged);
                                });
                            })


                        });

                        btn = $('<div class="menu-item color-danger">');
                        btn.append('<i class="fa fa-plus"></i> ' + App.translate('Insert after'));
                        $divPopoverArrowDown.append(btn);
                        btn.on('click', function () {
                            App.getPcTableById(2, {afterField: field.ord}).then(function (pcTableTable) {
                                let ee = {};
                                ee.ord = {'v': field.ord + 10};
                                ee.category = {v: field.category};
                                ee.table_id = {v: pcTable.tableRow.id};

                                ee.cycle_id = pcTable.tableRow.cycle_id;

                                if (pcTable.tableRow.__version) {
                                    ee.version = {v: pcTable.tableRow.__version};
                                }
                                ee.data_src = {v: pcTable_default_field_data_src};
                                (new EditPanel(pcTableTable, BootstrapDialog.TYPE_DANGER, ee, false, ee)).then(funcOnTableChanged);
                            })
                        });

                        if (field.category === 'param' || (field.category === 'footer' && field.column == "")) {
                            btn = $('<div class="menu-item color-danger">');
                            btn.append('<i class="fa fa-hand-scissors-o"></i> ' + App.translate('Section'));
                            $divPopoverArrowDown.append(btn);
                            btn.on('click', () => {
                                this.__editSectionTitle(field)
                            });
                        }


                        btn = $('<div class="menu-item color-danger">');
                        btn.append('<i class="fa fa-refresh"></i> ' + App.translate('Change NAME'));
                        $divPopoverArrowDown.append(btn);
                        btn.on('click', function () {
                            pcTable.model.renameField(field.name);
                        });


                        btn = $('<div class="menu-item color-danger">');
                        btn.append('<i class="fa fa-times"></i> ' + App.translate('Delete'));
                        $divPopoverArrowDown.append(btn);
                        btn.on('click', function () {


                            let title = field.title;

                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_DANGER,
                                title: App.translate('Delete field %s from table %s?', [title, pcTable.tableRow.title]),
                                buttons: [
                                    {
                                        action: function (panel, event) {
                                            "use strict";
                                            panel.close();
                                            App.getPcTableById(2).then(function (pcTableFields) {
                                                App.panelTimer(App.translate('Deleting field %s from table %s?', [title, pcTable.tableRow.title]), pcTableFields.tableRow.delete_timer, function () {
                                                    pcTableFields.model.delete(field.id).then(function () {
                                                        App.windowReloadWithHash(pcTable.model);
                                                    })
                                                });
                                            });
                                        },
                                        cssClass: 'btn-warning',
                                        label: App.translate('Delete')
                                    },
                                    {
                                        action: function (panel) {
                                            panel.close();
                                        },
                                        label: App.translate('Cancel')
                                    }
                                ],
                                draggable: true
                            })
                        });

                    }

                    if (field.category !== 'filter' && field.pcTable) {

                        //Скрыть
                        if (!pcTable.isMobile) {
                            let btn = $('<div class="menu-item">');
                            if (field.showMeWidth) {
                                btn.append('<i class="fa fa-eye-slash"></i> ' + App.translate('Hide'));
                                btn.on('click', function () {
                                    btnDropDown.popover('hide');
                                    pcTable.fieldsHiddingHide.call(pcTable, field.name);
                                });
                            } else {
                                btn.append('<i class="fa fa-eye-slash"></i> ' + App.translate('Show'));
                                btn.on('click', function () {
                                    btnDropDown.popover('hide');
                                    pcTable.setColumnWidth.call(pcTable, field.name, field.width, field.id);
                                });
                            }
                            btn.appendTo($divPopoverArrowDown);


                            if (field.category !== 'column' || !pcTable.isRotatedView) {
                                //ширина
                                btn = $('<div class="menu-item">');
                                btn.append('<i class="fa fa-arrows-h"></i> ' + App.translate('Field width'));
                                btn.on('click', function () {
                                    btnDropDown.popover('hide');
                                    let div = $('<div><input type="number" class="form-control" value="' + field.showMeWidth + '" style="padding-left: 2px;"/></div>');
                                    let btns = [
                                        {
                                            label: App.translate('Apply'),
                                            action: function (dialog) {
                                                let width = parseInt(div.find('input').val());
                                                dialog.close();
                                                field.pcTable.setColumnWidth.call(field.pcTable, field.name, width);

                                            }
                                        },
                                        {
                                            label: App.translate('Cancel'),
                                            action: function (dialog) {
                                                dialog.close()
                                            }
                                        }
                                    ];
                                    if (pcTable.isCreatorView) {
                                        btns.splice(0, 0, {
                                            label: App.translate('By default'),
                                            cssClass: 'btn-m btn-danger',
                                            action: function (dialog) {
                                                let width = parseInt(div.find('input').val());
                                                dialog.close();
                                                field.pcTable.setColumnWidth.call(field.pcTable, field.name, width, field.id);
                                            }
                                        })
                                    }
                                    BootstrapDialog.show({
                                        message: div,
                                        /*cssClass: 'edit-row-panel',*/
                                        title: App.translate('Field %s width', field.title),
                                        onshown: function (dialog) {
                                            let inp = div.find('input');
                                            inp.focus();
                                            inp.on('keydown', function (event) {
                                                if (event.keyCode === 13) {
                                                    field.pcTable.setColumnWidth.call(field.pcTable, field.name, parseInt(div.find('input').val()));
                                                    dialog.close()
                                                }
                                            });
                                            dialog.$modalDialog.width(500);
                                        },
                                        buttons: btns,
                                        draggable: true
                                    })

                                });
                                btn.appendTo($divPopoverArrowDown);
                            }
                        }

                    }
                    if (field.showMeWidth > 0 && field.category === 'column') {


                        if (pcTable.fixedColumn === field.name) {
                            $('<div class="menu-item">').append('<i class="fa fa-thumb-tack"></i> ' + App.translate('Unpin')).addClass('color-warning').appendTo($divPopoverArrowDown)
                                .on('click', function () {
                                    btnDropDown.popover('hide');
                                    pcTable.fixColumn();
                                });
                        } else if (field.type !== 'button' && !pcTable.isRotatedView) {
                            $('<div class="menu-item">').append('<i class="fa fa-thumb-tack"></i> ' + App.translate('Pin')).appendTo($divPopoverArrowDown)
                                .on('click', function () {
                                    btnDropDown.popover('hide');
                                    pcTable.fixColumn(field.name);
                                });
                        }
                        if (!pcTable.isTreeView) {

                            //sort a-z
                            {
                                let btn = $('<div class="menu-item">');
                                btn.append('<i class="fa fa-sort-alpha-asc"></i> ' + App.translate('Sort A-Z'));
                                $divPopoverArrowDown.append(btn)
                                btn.on('click', function () {
                                    pcTable.sort(field, 1);
                                })
                            }
                            //sort z-a
                            {
                                let btn = $('<div class="menu-item">');
                                btn.append('<i class="fa fa-sort-alpha-desc"></i> ' + App.translate('Sort Z-A'));
                                $divPopoverArrowDown.append(btn);
                                btn.on('click', function () {
                                    pcTable.sort(field, -1);
                                })
                            }

                        }

                        //select column
                        {
                            let btn = $('<div class="menu-item">');
                            btn.append('<i class="fa fa-hand-pointer-o"></i> ' + App.translate('Select'));
                            $divPopoverArrowDown.append(btn);
                            btn.on('click', function () {
                                pcTable.selectedCells.empty();
                                pcTable.selectedCells.selectColumn(field.name)
                            })
                        }

                        //Математические операции
                        if (field.category === 'column' && field.type === 'number') {
                            let btn = $('<div class="menu-item">');
                            btn.append('<i class="fa fa-diamond"></i> ' + App.translate('Math operations'));
                            $divPopoverArrowDown.append(btn);
                            btn.on('click', function () {
                                let $div = $('<div>');

                                let summ = 0, count = 0, max = null, min = null, notNumber = 0;
                                let error = false;
                                pcTable.dataSortedVisible.some(function (id) {
                                    let BigVal;

                                    try {
                                        if (typeof id !== 'object') {
                                            BigVal = Big(pcTable.data[id][field.name].v);
                                        } else {
                                            if (!id.row) {
                                                return;
                                            }
                                            BigVal = Big(id.row[field.name].v);
                                        }
                                        summ = Big(summ).plus(BigVal);
                                        ++count;
                                        if (max === null) max = BigVal;
                                        else {
                                            if (BigVal.gt(max)) max = BigVal;
                                        }
                                        if (min === null) min = BigVal;
                                        else {
                                            if (BigVal.lt(min)) min = BigVal;
                                        }
                                    } catch (e) {
                                        ++notNumber;
                                    }

                                });


                                let table = $('<table class="totum-math-operations"><thead><tr><th>' + App.translate('Operation') + '</th><th>' + App.translate('Value') + '</th></tr></thead>').appendTo($div),
                                    tbody = $('<tbody>').appendTo(table);

                                let format = function (num, notUnit) {
                                    let unit = '';
                                    notUnit = notUnit || false;
                                    if (field.unitType && !notUnit) {
                                        unit = ' ' + field.unitType;
                                    }
                                    if (field.currency) {
                                        let options = {};
                                        if (field.dectimalPlaces) {
                                            options.minimumFractionDigits = field.dectimalPlaces;
                                        }
                                        return parseFloat(num).toLocaleString(App.lang.locale, options) + unit;
                                    }
                                    return num + unit;
                                };

                                $('<tr><td>' + App.translate('Summ') + '</td><td>' + format(summ) + '</td></tr>').appendTo(tbody);
                                $('<tr><td>' + App.translate('Number of numbers') + '</td><td>' + format(count, true) + '</td></tr>').appendTo(tbody);
                                $('<tr><td>' + App.translate('Average') + '</td><td>' + (count !== 0 ? format(Big(summ).div(count).round(field.dectimalPlaces || 0)) : "null") + '</td></tr>').appendTo(tbody);
                                $('<tr><td>' + App.translate('Max') + '</td><td>' + format(max) + '</td></tr>').appendTo(tbody);
                                $('<tr><td>' + App.translate('Min') + '</td><td>' + format(min) + '</td></tr>').appendTo(tbody);
                                $('<tr><td>' + App.translate('Non-numeric elements') + '</td><td>' + format(notNumber, true) + '</td></tr>').appendTo(tbody);


                                if (pcTable.isTreeView) {
                                    $div.append('<div>' + App.translate('Calculated only by visible rows') + '</div>')
                                }

                                let title = field.title + (field.unitType ? ', ' + field.unitType : '');
                                if (pcTable.isMobile) {
                                    App.mobilePanel(title, $div)
                                } else {
                                    BootstrapDialog.show({
                                        title: title,
                                        type: 'edit',
                                        message: $div,
                                        draggable: true,
                                        onshown: function (dialog) {
                                            dialog.$modalDialog.width(400);
                                        },
                                        buttons: [
                                            {
                                                action: function (dialog) {
                                                    dialog.close();
                                                },
                                                'label': null,
                                                icon: 'fa fa-times',
                                                cssClass: 'btn-m btn-default btn-empty-with-icon',
                                            }
                                        ]
                                    });
                                }
                            })
                        }


                    }

                    //linkToSelectTable
                    if (field.linkToSelectTable) {
                        let table = field.linkToSelectTable;
                        let btn = $('<div class="menu-item color-primary">');
                        btn.append('<i class="fa fa-external-link"></i> ' + table['title']);
                        $divPopoverArrowDown.append(btn);
                        btn.on('click', function () {
                            window.open(table.link, '_blank').focus()
                            return false;
                        })
                    }


                    btnDropDown.popover({
                        html: true,
                        content: $divPopoverArrowDown,
                        trigger: 'manual',
                        container: pcTable._container,
                        placement: 'auto bottom'
                    });
                    btnDropDown.on('click', () => {
                        if (field.category === 'column' && pcTable.PageData && pcTable.PageData.onPage && pcTable.PageData.allCount > pcTable.PageData.onPage) {
                            if ($divPopoverArrowDown.find('.column-dropdown').length === 0)
                                $divPopoverArrowDown.append('<div class="column-dropdown">' + App.translate('By current page') + ' </div>');
                        } else {
                            $divPopoverArrowDown.find('.column-dropdown').remove();
                        }

                        if (!btnDropDown.data('bs.popover').tip().hasClass('in')) {
                            btnDropDown.popover('show');
                            setTimeout(function () {
                                /* pcTable._container.one('click', function () {
                                     btn.popover('hide');
                                 });*/
                                pcTable.closeCallbacks.push(() => {
                                    btnDropDown.popover('hide');
                                })
                            }, 20);
                        }

                    });
                    return btnDropDown;

                })().appendTo(filterBlock);
            }

            filterBlock.appendTo($th);
            let filterBlockWidth = filterBlock.find('.btn').length * 20 + 5;

            if (this.isCreatorView && !this.isRotatedView && (!field.showMeWidth || field.showMeWidth > 50)) {
                let pcTableCreatorButtonsBlock = $('<div class="th-left-bottom-buttons">').appendTo($th);
                if (field.category === 'footer' && field.column && this.fields[field.column] && !pcTable.hidden_fields[field.name]) {
                    width = this.fields[field.column].width;
                }
                let btn = $('<div class="btn  btn-xxs field_name copy_me"  tabindex="-1" data-copied-text="' + App.translate('Copied') + '">')
                    .text(field.name).appendTo(pcTableCreatorButtonsBlock).css('max-width', width - filterBlockWidth);
            }
            if (!pcTable.isRotatedView && pcTable.isMobile) {
                spanTitle.css('max-width', width/* - filterBlockWidth*/ - 5)
            }


            return $th;
        }
        ,
        _createNoDataRow: function (text) {
            let amountOfFields = 0;
            $.each(this.fields, function (index, field) {
                amountOfFields++;
            });
            let pcTable = this;

            let $addBtn = $();
            if (!text && this.PageData && this.PageData.loading) {
                text = App.translate('Wait, the table is loading');
            } else if (this.isInsertable()) {
                $addBtn = $('<button class="btn btn-warning btn-xxs">' + App.translate('Add row') + '</button>').width(120)
                    .on('click', () => {
                        this.__$rowsButtons.find('[data-action="add"]:first').click();
                    });
            }

            if (text === undefined) {
                if (this.PageData && this.PageData.allCount) {
                    this.model.loadPage(this, null, this.PageData.onPage, null, this.PageData.offset);
                } else {
                    text = App.translate('Table is empty') + ' ';
                }
            }
            return $("<tr>").addClass(this.noDataRowClass)
                .append('<td class="id">')
                .append($("<td>").attr("colspan", amountOfFields).append(text).append($addBtn));
        }
        ,
        _createRow: function (item, chData) {
            chData = chData || [];
            let pcTable = this;

            if (!item.$tr) {
                item.$tr = $("<tr>");

                if (!pcTable.isRotatedView) {
                    item.$tr.height(pcTABLE_ROW_HEIGHT);
                } else {
                    item.$tr.width(pcTable.tableRow.rotated_view);
                }
                /* перенос в css сглючивает прокрутку*/
                item.$tr.data('item', item);
            }

            let $row = item.$tr.empty();
            $row.attr('class', 'DataRow');
            $row.attr('data-' + pcTable_ROW_ItemId_KEY, item['id']);

            if (item.e_data && item.e_data.b == true) {
                $row.addClass('BlockedRow');
            }

            if (item['InsDel']) {
                $row.addClass('insDeleted');
            }
            this._addCellId(item, $row);
            // this._addCellNo(item, $row);

            let i = 0;
            let len = this.fieldCategories.visibleColumns.length;
            if (this.fieldCategories.visibleColumns[i] && this.fieldCategories.visibleColumns[i].name === 'n') {
                let field = this.fieldCategories.visibleColumns[i];
                let td = $('<td>');
                $row.append(td.append('<span class="cell-value">').append(field.getCellText(null, td, item)));
                if (item.__inserted) {
                    td.addClass('just-inserted')
                }
                ++i;
            }

            for (i; i < len; ++i) {
                let field = this.fieldCategories.visibleColumns[i];
                let td;

                $row.append(td = pcTable._createCell(item, field));
                if (chData.indexOf(field.name) > -1) {
                    pcTable._colorizeElement(td, pcTable_COLORS.saved);
                }
            }

            return item.$tr;
        }
        ,
        addThHelpCloser: function () {
            if (!this.pcTableContainerFieldHelpEvent) {
                let pcTable = this;
                this.pcTableContainerFieldHelpEvent = true;
                this._container.on('click escPressed', function (event) {
                    pcTable._container.find('[id^="field-help"][aria-describedby^="popover"]').each(function () {
                        if ($(this).attr('id') !== event.target.id && !$(event.target).closest('#' + $(this).attr('id')).length) {
                            $(this).trigger('close');
                        }
                    });

                });
            }
        },
        refreshRow: function (tr, item, newData) {
            if ((tr && tr.is('.DataRow')) || item) {

                if (!item) {
                    item = this._getItemByTr(tr);
                }

                let chData = [];
                if (newData) {
                    let changed = false, oldData;
                    if (this.isTreeView) {
                        oldData = {
                            id: item.id,
                            tree: {v: item.tree.v},
                            tree_category: {v: item.tree_category ? item.tree_category.v : null}
                        };
                        if (this.fields.tree.treeBfield && oldData[this.fields.tree.treeBfield]) {
                            oldData[this.fields.tree.treeBfield] = {...item[this.fields.tree.treeBfield]}
                        }
                    }
                    for (var k in newData) {
                        if (newData[k] !== null && typeof newData[k] == 'object') {
                            if (newData[k].changed) {
                                chData.push(k);
                                delete newData[k].changed;
                                changed = true;
                            } else if (!Object.equals(newData[k], item[k]) && (k in this.fields) && this.fields[k].type !== "listRow") {
                                chData.push(k);
                                changed = true;
                            }
                        } else if (newData[k] != item[k]) {
                            chData.push(k);
                            changed = true;
                        }
                        item[k] = newData[k];
                    }
                    if (changed) {
                        $.extend(item, newData);
                        if (this.isTreeView) {
                            this.placeInTree(item, oldData, false)
                        }
                    }
                }

                if (tr) this._createRow(item, chData);
            } else if (this._isParamsArea(tr)) {
                this._refreshParamsBlock();
            } else if (this._isFootersArea(tr)) {
                this._refreshFootersBlock();
            }

        }
        ,

        _createCell: function (item, field) {
            let pcTable = this;
            var td = $("<td>");

            let format, editbutton = '';

            if (!item[field.name]) {
                console.log(App.translate('Field % not found', field.name));
                console.log(item);
            }

            try {
                format = $.extend({}, (pcTable.f || {}), (item.f || {}), (item[field.name].f || {}));
            } catch (e) {
                console.log(e, item, field.name);
                format = {};
            }
            let isHeighter = (format.height > 33 || format.maxheight > 33);


            if (field.editable && (this.control.editing || field.category === 'filter') && !format.block) {
                td.addClass('edt');
                if (field.editGroup) {

                    if (field.editGroupMultiColumns) {
                        td.addClass('e-gm').addClass('e-g');
                    } else {
                        td.addClass('e-g');
                    }
                }
                if ((['button', 'fieldParams'].indexOf(field.type) === -1) && (pcTable.isMobile || format.editbutton)) {
                    editbutton = '<button class="fa fa-edit pull-right ttm-edit ibtn"></button>'
                }
            }

            if (pcTable.isMobile && field.type !== 'chart') {
                editbutton = '<button class="fa fa-ellipsis-h ttm-panel pull-right ibtn"></button>' + editbutton;
            }

            if (format.block) {
                td.addClass('blocked');
            }

            if (field.category !== 'column') {
                td.attr('data-field', field.name);
            }

            var span = $('<span class="cell-value">')
            var val = item[field.name];

            if (!field.linkFieldName && field.code && !field.codeOnlyInAdd) {
                td.addClass('with-code');
            }

            if (field.category !== 'column' && field.type !== 'chart') {
                td.data('field', field.name).addClass('val')
            }
            let isErrorVal;
            let $hand;
            let $error;
            if (val) {

                isErrorVal = val.e;

                if (val.h && (!('showhand' in format) || format.showhand === true)) {
                    if (val.c !== undefined && val.v != val.c) {
                        $hand = $('<i class="fa fa-hand-paper-o pull-right cell-icon" aria-hidden="true"></i>');
                    } else {
                        $hand = $('<i class="fa fa-hand-rock-o pull-right cell-icon" aria-hidden="true"></i>');
                    }

                    if (pcTable.isMobile) {
                        $hand.addClass('ttm-panel');
                    }
                }
                if (val.d) {
                    td.addClass('deleted_value');
                }


                if (val.e) {
                    if (field.errorText) {
                        span.text(field.errorText);
                    } else {
                        $error = $('<i class="fa fa-exclamation-triangle pull-right" aria-hidden="true"></i>');
                        if (pcTable.isMobile) {
                            $error.addClass('ttm-panel');
                        } else {
                            $error.attr('title', val.e)
                        }
                        td.append($error);
                    }
                }

                if (format.text && field.type != "button" && !(pcTable.isTreeView && field.name === 'tree' && item.__tree && (field.treeViewType === 'self' || (item.tree_category && item.tree_category.v)))) {
                    span.text(format.text);
                } else if (!(val.e && field.errorText)) {
                    var cellInner = isHeighter ? field.getHighCelltext(val.v, td, item) : field.getCellText(val.v, td, item);
                    if (typeof cellInner === 'object') {
                        span.html(cellInner)
                    } else span.text(cellInner);
                }

                if (field.CodeActionOnClickAsUrl) {
                    span.html($('<span class="asUrl">').html(span.html()));
                }

            }

            if (format.comment && field.type != "button") {
                td.append($('<i class="cell-icon fa fa-info pull-right"></i>').attr('title', format.comment));
            }
            if ($hand)
                td.append($hand);
            if (editbutton) {
                td.append(editbutton);
            }


            span.appendTo(td);

            if (!format.text && field.unitType && !isErrorVal && val.v !== null && !(['select', 'tree'].indexOf(field.type) > -1 && field.multiple)) {
                if (field.before) {
                    if (!('prefix' in field)) {
                        span.attr('data-unit-type-before', field.unitType + ' ');
                    }

                } else {
                    if (!('postfix' in field)) {
                        span.attr('data-unit-type', ' ' + field.unitType);
                    }
                }
            }

            if (field.css) {
                td.addClass(field.css)
            }
            if (this.isSelected(field.name, item.id)) {
                td.addClass('selected');
            }

            if (!(field.type === "button" && field.pcTable.isMobile && field.category !== 'column')) {
                if (format.background) {
                    td.css('background-color', format.background);
                } else if (field.panelColor) {
                    td.css('background-color', field.panelColor);
                }
                if (format.color) td.css('color', format.color);
            }

            if (format.bold) td.css('font-weight', 'bold');

            if (format.align) {
                td.css('text-align', format.align);
            } else if (format.tab) {
                td.css('padding-left', format.tab + "px");
            }

            if (format.decoration) td.css('text-decoration', format.decoration);
            if (format.italic) td.css('font-style', 'italic');


            if ((field.type === 'tree' && cellInner && typeof cellInner === 'object' && cellInner.is('.tree-view'))) {
                if ($error) {
                    $error.remove();
                }
            } else if (format.icon && field.type !== "button") {
                td.prepend('<i class="cell-icon fa fa-' + format.icon + '"></i>');
            }

            if (format.progress && format.progresscolor) {
                let addProgress = function () {
                    if (!span.isAttached()) {
                        setTimeout(addProgress, 50);
                    } else {
                        let progress = Math.round(span.width() * parseInt(format.progress) / 100);
                        span.css('box-shadow', 'inset ' + progress.toString() + 'px 0px 0 0 ' + format.progresscolor);
                    }
                };
                if (pcTable.isMobile) {
                    td.data('addProgress', function () {
                        let span = td.find('.cell-value');
                        span.css('box-shadow', 'inset ' + (Math.round(span.width() * parseInt(format.progress) / 100)).toString() + 'px 0px 0 0 ' + format.progresscolor);
                    });
                }
                addProgress();
            }

            field.format = format;

            if (field.td_style && typeof field.td_style === 'function') {
                td.css(field.td_style(format))
            }

            return td;
        }
        ,
        _getLoadingSpinner: function () {
            return $('<div class="text-center"><i class="fa fa-spinner"></i></div>');
        }
        ,
        _colorizeElement: function (td, color, repeated) {
            let i = 10;

            let colorize = function () {
                if (i === 0) {
                    td.css('box-shadow', '');
                } else {
                    td.css('box-shadow', 'inset 0 0 100px 100px ' + App.hexToRGB(color, i / 10));
                    i--;
                    setTimeout(colorize, 50);
                }
            };

            colorize();

            return;


            var toColor = td.css('background-color');
            if (toColor === '') {
                var repeated = repeated || 0;
                if (repeated < 5) {
                    var pcTable = this;
                    setTimeout(function () {
                        pcTable._colorizeElement(td, color, repeated + 1)
                    }, 50);
                }
                return;
            }
            if (toColor.substr(0, 1) != '#') {
                toColor = App.rgb2hex(toColor);
            }
            var parent = td;
            while (toColor == '#000000') {
                parent = parent.parent();
                toColor = parent.css('background-color');
                if (toColor.substr(0, 1) != '#') {
                    toColor = App.rgb2hex(toColor);
                }
            }

            if (/(background\-color:[^;"]+;?)/.test(td.attr('style'))) {
                td.data('backgroundcolor', true);
            }

            this._TmpColorize(td, color, toColor);
        }
        ,
        _TmpColorize: function ($element, color, toColor) {

            var pcTable = this;
            var i = 0;
            var color = color || '#ff0000';
            var toColor = toColor || '#ffffff';
            var color2;

            if (toColor.substr(0, 1) != '#') {
                toColor = App.rgb2hex(toColor);
            }

            var shadeColor = function (color, percent, toColor) {
                var f = parseInt(color.slice(1), 16),
                    toColor = parseInt(toColor.slice(1), 16),
                    t1 = percent < 0 ? 0 : toColor >> 16,
                    t2 = percent < 0 ? 0 : toColor >> 8 & 0x00FF,
                    t3 = percent < 0 ? 0 : toColor & 0x0000FF,
                    p = percent < 0 ? percent * -1 : percent,
                    R = f >> 16,
                    G = f >> 8 & 0x00FF,
                    B = f & 0x0000FF;
                return "#" + (0x1000000 + (Math.round((t1 - R) * p) + R) * 0x10000 + (Math.round((t2 - G) * p) + G) * 0x100 + (Math.round((t3 - B) * p) + B)).toString(16).slice(1);
            }

            i++;
            if (i == 10) {
                color2 = toColor;
            } else {
                color2 = shadeColor(color, 0.1, toColor);
                if (color2 == color) color2 = toColor;
            }


            $element.css('background-color', color2);
            if (color2 != toColor) {
                setTimeout(function () {
                    pcTable._TmpColorize($element, color2, toColor);
                }, 50)
            } else if (!$element.data('backgroundcolor')) {
                $element.attr('style', $element.attr('style').replace(/(background\-color:[^;"]+;?)/, ''));
            }

        }
        ,
        __deleteSection(sectionField) {
            App.panelTimer(App.translate('Section deleting'), 5, () => {
                App.getPcTableById(2).then(function (pcTable) {
                    pcTable.model.checkEditRow({id: sectionField.id}).then((json) => {
                        let data_src = json.row.data_src.v;

                        pcTable.model.saveEditRow({
                            data_src: {
                                v: {
                                    ...data_src,
                                    tableBreakBefore: {isOn: false},
                                    sectionTitle: {isOn: false, Val: data_src.sectionTitle.Val},
                                }
                            },
                            id: sectionField.id
                        }).then((json) => {
                            sectionField.tableBreakBefore = false;
                            delete sectionField.sectionTitle;
                            if (sectionField.category === 'param') {
                                sectionField.pcTable._rerendParamsblock()
                            } else {
                                sectionField.pcTable._rerendBottomFoolers();
                            }
                        })
                    })
                })
            })
        }
        ,
        __editSectionTitle(sectionField) {
            App.getPcTableById(2).then(function (pcTable) {
                pcTable.model.checkEditRow({id: sectionField.id}).then((json) => {
                    let data_src = json.row.data_src.v;
                    let section_title = '';
                    if (data_src.sectionTitle && 'Val' in data_src.sectionTitle)
                        section_title = data_src.sectionTitle.Val || '';
                    let editor;


                    let sectionName = section_title.replace(/^(.*?)\*\*.*$/, '$1');
                    let text = sectionName;
                    if (/\*\*/.test(section_title)) {
                        section_title.replace(/^.*?\*\*/, '').split(/\s*;\s*/).forEach((t) => {
                            if (t.trim() === "") return;
                            text += "\n";
                            text += t.split(':').join(" : ");
                        })
                    }
                    let dialog = $('<div class="HTMLEditor">');

                    const saveSection = (text) => {
                        let params = '';
                        if (text.trim() !== "") {
                            let split = text.split(/\s*[\n\r]+\s*/);
                            let section_name = split[0];
                            split.splice(0, 1);
                            params = section_name;
                            if (split.length) {
                                params += "**" + split.join(';').replace(/\s*:\s*/g, ':');
                            }
                        }

                        let section_title = params
                        pcTable.model.saveEditRow({
                            data_src: {
                                v: {
                                    ...data_src,
                                    tableBreakBefore: {isOn: true, Val: true},
                                    sectionTitle: {isOn: true, Val: section_title}
                                }
                            },
                            id: sectionField.id
                        }).then((json) => {
                            sectionField.sectionTitle = section_title;
                            sectionField.tableBreakBefore = true;
                            if (sectionField.category === 'param') {
                                sectionField.pcTable._rerendParamsblock()
                            } else {
                                sectionField.pcTable._rerendBottomFoolers();
                            }
                        })

                    };


                    window.top.BootstrapDialog.show({
                        message: dialog,
                        type: BootstrapDialog.TYPE_DANGER,
                        title: App.translate('Section editing'),
                        cssClass: 'sectionTitle-edit-panel',
                        draggable: true,
                        buttons: [{
                            label: App.translate('Save'),
                            action: (dialog) => {
                                saveSection(editor.getValue())
                                dialog.close();
                            }
                        }],
                        onhide: function (dialog) {
                        },
                        onshown: function (_dialog) {
                            _dialog.$modalContent.position({
                                of: $(window.top.document.body),
                                my: 'top+50px',
                                at: 'center top'
                            });

                            editor = CodeMirror(dialog.get(0), {
                                value: text,
                                mode: "sections",
                                minHeight: '150px',
                                readOnly: false,
                                theme: 'eclipse',
                                lineNumbers: true,
                                indentWithTabs: false,
                                autoCloseTags: false
                            });

                            editor.on('paste', function (cm, event) {
                                setTimeout(function () {
                                    editor.refresh();
                                }, 1);
                            });
                        },
                        onshow: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer')
                            dialog.$modalContent.css({
                                width: '100%'
                            });
                        }

                    });
                });
            });
        },
        getElementFormat: function (field, id) {
            let item;
            if (id) {
                item = this.data[id];
            } else {
                item = this.data_params;
            }
            return $.extend({}, (this.f || {}), (item.f || {}), (item[field.name].f || {}));
        }
    })
    ;
})();