(function () {
    let niceScrollOn = false;
    let niceScollTimer;
    $.extend(App.pcTableMain.prototype, {
        switchContainerNideScroll: function (on_off) {
            let pcTable = this;
            if (pcTable.isAnonim) return;
            if (niceScollTimer) clearTimeout(niceScollTimer);
            niceScollTimer = setTimeout(() => {
                if (on_off !== niceScrollOn) {
                    if (on_off) {
                        pcTable._container.niceScroll({
                            cursorwidth: 7,
                            mousescrollstep: 90,
                            scrollspeed: 50,
                            autohidemode: false,
                            enablekeyboard: false,
                            cursoropacitymin: 1,
                            railoffset: {left: -3},
                            cursorcolor: '#e1e0df'
                        });
                    } else {
                        pcTable._container.getNiceScroll().remove();
                    }
                    niceScrollOn = on_off;
                }
            }, 100);
        },
        addScrollsRules: function () {
            let pcTable = this;
            this._innerContainer
                .append(this._table);
            if (!pcTable.isMobile) {
                this._innerContainer.on('scroll', function () {
                    "use strict";

                    pcTable._removeEditCell();

                });

                if (!pcTable.withoutScrolls) {
                    $(function () {
                        pcTable.switchContainerNideScroll(true);
                    });
                }
            }


        },
        Scroll: function () {
            let pcTable = this;
            let self = {};

            self.table = undefined;
            self.topButton = undefined;
            let scrollable;


            let heights = {
                all: 0,
                top: 0,
                content: 0,
                bottom: 0
            };

            let table;
            let last_cluster = false,
                scroll_debounce = 0,
                createTableHeadRow = function () {
                    if (!self.table) {
                        self.table = $('<table class="scroll-head-row">').appendTo(pcTable._innerContainer);
                        self.table.width(pcTable.tableWidth);
                        self.table.append($('table.pcTable-table thead').clone(true)).attr('class', $('table.pcTable-table').attr('class'));

                        self.table.find('th:not(.id) div, th:not(.id) .btn').remove();
                        self.table.find('th.id .pcTable-filters button[data-action="checkbox"]').remove();
                        self.table.find('th').removeClass('with-filter');
                        let $topButton = $('<div class="btn btn-default btn-xxs "><i class="fa fa-arrow-up"></i></div>')
                            .on('click', function () {
                                pcTable._container.scrollTop(pcTable._container.find('.pcTable-rowsWrapper').offset().top - pcTable.scrollWrapper.offset().top);
                            });

                        self.table.find('th.id .pcTable-filters:first').append($topButton);

                        if (self.table.find('th.n').length) {
                            let saveButton = pcTable._innerContainer.find('th.n').find('i.fa-save').parent().clone(true);
                            self.table.find('th.n').append($('<div class="pcTable-filters">').append(saveButton));
                        }
                        if (!pcTable.isMobile && !self.topButton) {
                            self.topButton = $('<button class="scroll-top-button"><i class="fa fa-arrow-up"></i></button>').appendTo(pcTable._innerContainer).on('click', function () {
                                pcTable._container.scrollTop(pcTable._container.find('.pcTable-rowsWrapper').offset().top - pcTable.scrollWrapper.offset().top);
                            });
                        }
                    }
                    self.table.css({
                        position: 'absolute',
                        top: parseInt($('#table').offset().top) - parseInt($('.innerContainer').offset().top)
                    });

                },
                scrollFunc = function () {

                    let scrollTop = getScrollTop();
                    if (last_cluster != (last_cluster = self.getClusterNum(scrollTop))) {
                        self.insertToDOM(last_cluster);
                    }

                    let tableInner = $('table.pcTable-table');
                    let tableInnerHead = tableInner.find('thead');
                    if (tableInnerHead.height() + tableInner.offset().top - $('#table').offset().top <= 0) {
                        if (!self.table) {
                            createTableHeadRow();
                        } else {
                            self.table.css({top: parseInt($('#table').offset().top) - parseInt($('.innerContainer').offset().top)})
                        }

                    } else {
                        if (self.table) {
                            self.table.remove();
                            self.table = undefined;
                            if (self.topButton) {
                                self.topButton.remove();
                                self.topButton = undefined;
                            }

                            pcTable._content.off('scroll')
                        }
                    }


                },
                getScrollTop = function () {
                    try {
                        if (pcTable.isAnonim) {
                            let offset = $(document).scrollTop() - pcTable._content.offset().top;
                            if (offset < 0) return 0
                            return -offset;
                        }
                        return pcTable._content.offset().top;
                    } catch (e) {
                        debugger
                        return 0;
                    }

                };


            if (pcTable.isAnonim) {
                scrollable = $(document)
            } else {
                scrollable = pcTable._container
            }
            scrollable.on('scroll', function () {
                clearTimeout(scroll_debounce);
                scroll_debounce = setTimeout(function () {
                    scrollFunc.call(pcTable);
                }, 50);
            });

            let cache = {
                top_offset: 0,
                bottom_offset: 0,
                rows: $()
            };
            $.extend(self, {
                rows_in_block: 4,
                item_height: pcTABLE_ROW_HEIGHT,
                emptyCache: function () {
                    cache = {};
                },
                getClusterNum: function (scrollTop) {
                    let num;
                    if (scrollTop >= 0) num = 0;
                    else {
                        num = Math.floor(-scrollTop / this.block_height)
                    }

                    return Math.max(num, 0);
                },
                reloadScrollHead: function () {
                    if (self.table) {
                        self.table.remove();
                        self.table = undefined;
                    }
                    scrollFunc.call(pcTable);
                },
                generate: function (cluster_num) {
                    let rows = pcTable.dataSortedVisible;
                    let rows_len = rows.length;
                    if (rows_len < this.rows_in_block) {
                        return {
                            top_offset: 0,
                            bottom_offset: 0,
                            rows: rows
                        }
                    }
                    let items_start,
                        items_end,
                        top_offset,
                        bottom_offset,
                        this_cluster_rows;

                    do {
                        items_start = Math.max((this.rows_in_block * cluster_num), 0),
                            items_end = items_start + this.rows_in_cluster + 3 * this.rows_in_block,
                            top_offset = Math.max(items_start * this.item_height, 0),
                            bottom_offset = Math.max((rows_len - items_end) * this.item_height, 0), this_cluster_rows = [];

                        for (let i = items_start; i < items_end; i++) {
                            rows[i] && this_cluster_rows.push(rows[i]);
                        }
                    } while (cluster_num > 0 && this_cluster_rows.length === 0 && --cluster_num > -1)

                    return {
                        top_offset: top_offset,
                        conteinerHeight: pcTable._content.height(),
                        i_start: items_start,
                        bottom_offset: bottom_offset,
                        cluster_num: cluster_num,
                        rows: this_cluster_rows
                    }
                },
                getRowsHeight: function () {
                    if (pcTable.dataSortedVisible.length === 0) return;
                    this.block_height = this.item_height * this.rows_in_block;
                    this.rows_in_cluster = Math.floor((window.innerHeight - pcTable._container.offset().top) / this.item_height);
                },
                insertToDOM: function (cluster, forceCheckTableHeight, forceRefreshData) {
                    // explore row's height

                    if (pcTable.isMobile) {
                        this.setHtml(pcTable.dataSortedVisible, 0, 0, forceRefreshData);
                    } else {
                        if (!this.rows_in_cluster) {
                            this.getRowsHeight();
                        }

                        if (!cluster) cluster = this.getClusterNum(getScrollTop());

                        let data = this.generate(cluster),
                            this_cluster_rows = data.rows.map((k) => {
                                if (typeof k === 'object') {
                                    return k.row ? k.row.id : (k.id || k.v)
                                }
                                return k;
                            }).join(',');
                        if (forceRefreshData || this.checkChanges('data', this_cluster_rows, cache)) {
                            this.setHtml(data.rows, data.top_offset, data.bottom_offset, forceRefreshData);
                        }
                        if (forceCheckTableHeight && pcTable._container.getNiceScroll) {
                            pcTable._container.getNiceScroll().resize();
                        }
                        pcTable._content.trigger('scrolled');
                    }
                },
                setHtml: function (rows, top, bottom, forceRefreshData) {
                    let height = 0;
                    pcTable._content.find('.editing').each(function (element) {
                        pcTable._removeEditing.call(pcTable, element);
                    });
                    let $trs = pcTable._content.empty().get(0);
                    if (top) $trs.appendChild($('<tr style="height: ' + top + 'px;" class="loading-row"><td colspan="' + (pcTable.fieldCategories.column.length + 1) + '"></td></tr>').get(0));

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
                    if (bottom) $trs.appendChild($('<tr style="height: ' + bottom + 'px;" class="loading-row"><td colspan="' + (pcTable.fieldCategories.column.length + 1) + '"></td></tr>').get(0));
                },
                checkChanges: function (type, value, cache) {
                    let changed = value != cache[type];
                    cache[type] = value;
                    return changed;
                }
            });

            return self;
        }
    });
}());