(function () {
    $.extend(App.pcTableMain.prototype, {
        _renderRotatedView: function () {
            let pcTable = this;

            $.extend(this, {
                isRotatedView: true,

                rowButtonsCalcWidth: function () {
                    if (!this.isMobile) {
                        let width = this._table.offset().left + this._table.width() - 80;
                        if (width < this._innerContainer.width())
                            this.__$rowsButtons.width(width)
                        else {
                            this._innerContainer.width()
                        }
                    }
                },
                _addCellId: function (item, $row) {
                    let $tdId = $('<td class="id"></td>');
                    let span = $('<span class="rowName"></span>').appendTo($tdId);
                    if (this.mainFieldName && this.mainFieldName !== 'id' && item[this.mainFieldName] && item[this.mainFieldName].v) {
                        span.text(item[this.mainFieldName].v);

                    } else {
                        span.text(item['id']);
                        $tdId.addClass('small-rotated-id');
                    }

                    $tdId.appendTo($row);

                    this.row_actions_icons_add($tdId);


                    if (item.$checked === true) {
                        this.row_actions_check(item, true);
                    }
                    return $tdId;
                },
                _createHeadCellId: function () {
                    let pcTable = this;
                    let $th = $('<th class="id"></th>');
                    let panel = $('<div class="pcTable-filters"></div>');

                    /*******Кнопка показать поле n*****/
                    let OrderClass = 'btn-warning';

                    let $btnNHiding = $('<button class="btn btn-default btn-xxs" id="n-expander"><i class="fa fa-sort"></i></button>')
                    $btnNHiding.prop('disabled', true)

                    if (!pcTable.isMobile) {
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
                },
                Scroll: () => {
                    return {
                        reloadScrollHead: () => {
                        },
                        insertToDOM: function (cluster, forceCheckTableHeight, forceRefreshData) {
                            this.setHtml(pcTable.dataSortedVisible, 0, 0, forceRefreshData);
                        },
                        emptyCache: () => {

                        },
                        setHtml: function (rows, top, bottom, forceRefreshData) {
                            let height = 0;
                            pcTable._content.find('.editing').each(function (element) {
                                pcTable._removeEditing.call(pcTable, element);
                            });
                            let $trs = pcTable._content.empty().get(0);
                            if (pcTable.dataSorted.length === 0) {
                                $trs.appendChild(pcTable._createNoDataRow().get(0));
                            } else if (pcTable.dataSortedVisible.length === 0) {
                                $trs.appendChild(pcTable._createNoDataRow(App.translate('No rows are selected by the filtering conditions')).get(0));
                            } else {
                                for (let i in rows) {
                                    let row = rows[i];
                                    if (typeof row !== 'object') {
                                        let item = pcTable.data[row];
                                        if (!item.$tr || forceRefreshData) {
                                            pcTable._createRow.call(pcTable, item);
                                        }
                                        item.$tr.data('item', item);
                                        $trs.appendChild(item.$tr.get(0));
                                    } else {
                                        $trs.appendChild(pcTable._createTreeFolderRow.call(pcTable, row).get(0));
                                    }
                                }
                            }
                        }
                    };
                }
            })
        }
    })
})();