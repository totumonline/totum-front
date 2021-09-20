(function () {

    const getRowCard = function (id) {
        let data = this.data[id];
        let div = data.$tr || $('<div class="panelsView-card pcTable-floatInner">')
            .css({
                'min-height': this.tableRow.panels_view.height + 'px',
                height: this.tableRow.panels_view.height,
                width: this.tableRow.panels_view.width
            });
        data.$tr = div.empty();
        div.data('id', id);
        let panelFields = this.tableRow.panels_view.fields;
        panelFields.forEach((field) => {
            let td = $('<td>');
            let css = {};

            css['height'] = field.height;

            td.data('name', field.field);

            if (!field.border) {
                css['border-color'] = 'transparent';
                css['background-color'] = 'transparent';
            }

            let format, Field = this.fields[field.field];
            try {
                format = $.extend({}, (this.f || {}), (data.f || {}), (data[field.field].f ? data[field.field].f || {} : {}));
            } catch (e) {
                console.log(e, data, field.field);
                format = {};
            }
            if (Field.type != "button") {


                if (format.color) {
                    css['font-color'] = format.color;
                }
                if (format.background) {
                    css['background-color'] = format.background;
                }
                if (format.text) {
                    td.text(format.text)
                } else {
                    let val = Field.getHighCelltext(data[field.field].v, td, data);
                    if (val !== null && typeof val === 'object') {
                        if (val.then && typeof val.then === "function") {
                            td.html('<div class="text-center"><i class="fa fa-spinner"></i></div>')
                            val.then((val) => {
                                if (typeof val === 'object') {
                                    td.html(val)
                                } else {
                                    td.text(val);
                                }

                            })
                        } else {
                            td.html(val)
                        }
                    } else {
                        td.text(val)
                    }
                    if (Field.unitType && val !== '') {
                        td.append(' ' + Field.unitType);
                    }
                }

                if (format.comment) {
                    td.prepend($('<i class="fa fa-help">').attr('title', format.comment))
                } else if (format.icon) {
                    td.prepend($('<i class="fa">').addClass('fa-' + format.icon))
                }

                td.attr('data-field-type', Field.type).addClass('nonowrap');

                if(Field.editable && Field.pcTable.control.editing && !format.block){
                    td.addClass('panel-edt');
                }

                if (format.showhand !== false && data[field.field].h) {
                    let val = data[field.field], $hand;
                    if (val.c !== undefined && val.v != val.c) {
                        $hand = $('<i class="fa fa-hand-paper-o pull-right cell-icon" aria-hidden="true"></i>');
                    } else {
                        $hand = $('<i class="fa fa-hand-rock-o pull-right cell-icon" aria-hidden="true"></i>');
                    }
                    td.append($hand)
                }

            } else {
                data.__td_style = function () {
                    let style = {td: {}, Button: {}};
                    if (format.background) {
                        style.Button.backgroundColor = format.background
                    }
                    if (format.color) {
                        style.Button.color = format.color
                    }
                    style.td.backgroundColor = 'transparent';
                    return style;
                }

                td.html(Field.getCellText(data[field.field].v, td, data))

                let btn = td.find('button');
                btn.on('click', () => {
                    this._buttonClick(td, Field, data);
                })
            }


            if (format.bold) {
                css['font-weight'] = 'bold';
            }
            if (format.italic) {
                css['font-style'] = 'italic';
            }


            if (format.decoration) {
                css['text-decoration'] = format.decoration;
            }
            if (format.align) {
                css['text-align'] = format.align;
            }
            if (format.color) {
                css['color'] = format.color;
            }
            if (format.tab) {
                css['padding-left'] = format.tab;
            }
            if (format.progress && format.progresscolor) {
                let addProgress = function () {
                    if (!td.isAttached()) {
                        setTimeout(addProgress, 50);
                    } else {
                        let progress = Math.round(td.outerWidth() * parseInt(format.progress) / 100);
                        td.css('box-shadow', 'inset ' + progress.toString() + 'px 0px 0 0 ' + format.progresscolor);
                    }
                };
                addProgress();
            }

            td.css(css)

            let fData = $('<div>').append(td);
            let pcTable = this;

            if (field.title) {
                let title = $('<th>').text(this.fields[field.field].title);


                if (Field.help) {
                    if (!Field.helpFunc) {
                        pcTable.addThHelpCloser();

                        Field.helpFunc = function (event) {
                            let btn = $(this);
                            let closeLimit;
                            if (!btn.data('bs.popover')) {
                                if (event.type !== "close") {
                                    pcTable._container.trigger('click');
                                    setTimeout(() => {
                                        let i_content = $('<div class="i-inner-div">').html(Field.help).width(230);
                                        btn.popover(
                                            {
                                                trigger: "manual",
                                                content: i_content,
                                                html: true,
                                                placement: () => {
                                                    let placement = 'bottom';
                                                    let height = 300;
                                                    let container = pcTable._container;
                                                    let heightOffset = btn.offset().top - container.offset().top;
                                                    i_content.css('max-height', height);
                                                    return placement;
                                                },
                                                container: pcTable.scrollWrapper
                                            }
                                        );
                                        btn.popover('show');
                                    }, 150)

                                }
                            } else if (event.type !== "open") {
                                if (closeLimit) clearTimeout(closeLimit);
                                closeLimit = setTimeout(() => {
                                    if (btn.attr('aria-describedby') && $('#' + btn.attr('aria-describedby').length)) {
                                        btn.popover('destroy')
                                    }
                                }, 120);
                            }
                            return false;
                        }
                    }
                    title.prepend($('<button class="btn btn-default btn-xxs cell-help" id="field-help-' + Field.name + '-' + id + '"><i class="fa fa-info"></i></button>').on('click open close', Field.helpFunc));
                }
                fData.prepend(title);
            }
            div.append(fData)
        })

        if (this.tableRow.panels_view.controls) {

            if (!this.pcTableControllsEvents) {
                this.pcTableControllsEvents = true;
                let pcTable = this;
                this._innerContainer.on('click', '.panel-controls button', function () {
                    let btn = $(this);
                    let trId = btn.closest('.panelsView-card').data('id')
                    switch (btn.data('action')) {
                        case 'duplicate':
                            pcTable.row_duplicate(trId);
                            break;
                        case 'delete':
                            pcTable.rows_delete(trId);
                            break;
                        case 'recalculate':
                            pcTable.row_refresh(trId);
                            break;
                        case 'panel':
                            pcTable._row_edit([trId]);
                            break;
                    }
                    return false;
                })
            }

            let controls = $('<div class="panel-controls">');
            controls.append('<span class="panle-id">id ' + id + '</span>');

            if (this.tableRow.panel) {
                controls.append('<button class="btn btn-default btn-xxs" data-action="panel"><i class="fa fa-th-large"></i></span>');
            }

            if (this.control.duplicating && !this.f.blockduplicate && !data.f.blockduplicate) {
                controls.append('<button class="btn btn-default btn-xxs" data-action="duplicate"><i class="fa fa-clone"></i></span>');
            }
            if (this.control.deleting && !this.f.blockdelete && !data.f.blockdelete) {
                controls.append('<button class="btn btn-default btn-xxs" data-action="delete"><i class="fa fa-times"></i></span>');
            }
            controls.append('<button class="btn btn-default btn-xs" data-action="recalculate"><i class="fa fa-refresh"></i></span>');

            div.append(controls);
        }

        return div;
    }
    const addSortable = function (div) {
        if (this.kanban) {

            const saveOrder = ($item) => {
                let $d = $.Deferred();

                let order = [];
                $item.parent().find('.panelsView-card').each((i, div) => {
                    order.push($(div).data('id'))
                })

                if (order.length > 1) {
                    order.forEach((v) => {
                        this.dataSorted.splice(this.dataSorted.indexOf(v), 1);
                    })
                    this.dataSorted.push(...order);

                    return this.model.saveOrder(order).then((json) => {
                        this.table_modify(json);
                    });
                } else {
                    $d.resolve();
                }
                return $d.promise();
            }

            $(div).find('.kanban').sortable({
                items: '.panelsView-card',
                connectWith: this.fields[this.tableRow.panels_view.kanban].editable ? '.kanban' : "",
                stop: (event, ui) => {
                    let $item = $(ui.item);
                    let itemId = $item.data('id');
                    let nowBeforeId = $item.prev().data('id');
                    App.fullScreenProcesses.show('sorting');

                    let kanban = this.data[itemId][this.tableRow.panels_view.kanban];
                    if (this.data[itemId][this.tableRow.panels_view.kanban] != $item.parent().data('value')) {
                        kanban = $item.closest('.kanban').data('value');
                        this.model.save({[itemId]: {[this.tableRow.panels_view.kanban]: kanban}}).then((json) => {
                            if (this.tableRow.with_order_field) {
                                saveOrder($item).always(() => {
                                    this._container.getNiceScroll().resize();
                                    App.fullScreenProcesses.hide('sorting');
                                })
                            } else {
                                this.table_modify(json);
                                this._container.getNiceScroll().resize();
                                App.fullScreenProcesses.hide('sorting');
                            }
                        });
                    } else {
                        if (this.tableRow.with_order_field) {
                            saveOrder($item).always(() => {
                                App.fullScreenProcesses.hide('sorting');
                            })
                        }
                    }
                }
            })
        } else {
            if (!$(div).data('sortableAdded')) {
                $(div).data('sortableAdded', 1);
                $(div).sortable({
                    stop: (event, ui) => {
                        let $item = $(ui.item);
                        let itemId = $item.data('id');
                        let nowBeforeId = $item.prev().data('id');

                        let old = [...this.dataSorted];
                        this.dataSorted.splice(this.dataSorted.indexOf(itemId), 1);
                        if (nowBeforeId) {
                            this.dataSorted.splice(this.dataSorted.indexOf(nowBeforeId) + 1, 0, itemId);
                        } else {
                            this.dataSorted.splice(0, 0, itemId);
                        }
                        this.dataSortedVisible = [];
                        this.dataSorted.forEach((id) => {
                            if (this.data[id].$visible) this.dataSortedVisible.push(id);
                        });
                        if (!Object.equals(old, this.dataSorted)) {
                            App.fullScreenProcesses.show('sorting');
                            this.model.saveOrder(this.dataSorted).then((json) => {
                                this.table_modify(json);
                            }).always(() => {
                                App.fullScreenProcesses.hide('sorting');
                            });
                        }

                    }
                })
            }
        }
    }
    const createPanelsContent = function () {
        let $div = this._content || $('<div class="pcTable-floatBlock">');

        $div.each((i, d) => {
            if ((this.tableRow.with_order_field || this.kanban) && this.control.editing && !(this.f.blockorder || this.f.blockedit)) {
                setTimeout(() => {
                    addSortable.call(this, d)
                }, 1)
            }
        });

        $div.empty();
        this.__applyFilters();


        if (this.dataSortedVisible.length || this.kanban) {
            if (this.kanban) {
                this._innerContainer.addClass('kanbanInnerContainer');
                $div.addClass('kanbanWrapper').empty()

                $div.css('grid-template-columns', "1fr ".repeat(this.kanban.length));
                let width = 0;
                this.kanban.forEach((v) => {
                    let divWidth = (this.tableRow.panels_view.panels_in_kanban || 1) * (parseInt(this.tableRow.panels_view.width) + 10) - 10;

                    v.$div = $('<div class="kanban"></div>').data('value', v[0]).width(divWidth);

                    if (width)
                        width += 20;
                    width += divWidth
                    v.$div.append($('<div class="kanban-title">').text(v[1]).attr('data-value', v[0]))
                    let $cards = $('<div class="kanban-cards">');
                    v.$div.append($cards);
                    let kId = v[0];
                    $div.append(v.$div);

                    if (this.dataSortedVisible.length) {
                        this.dataSortedVisible.forEach((id) => {
                            let val = this.data[id][this.tableRow.panels_view.kanban].v || "";
                            if (val == kId) {
                                $cards.append(this._getRowCard(id));
                            }
                        })
                    } else {
                        $cards.append('<div class="empty-kanban">'+App.translate('No data')+'</div>');
                    }
                })
                $div.width(width);
                this.tableWidth = width;
            } else {

                this.dataSortedVisible.forEach((id) => {
                    let card = this._getRowCard(id);
                    $div.append(card);
                })
            }

        } else {
            $div.append('<div class="no-panels">'+App.translate('No data')+'</div>');
        }
        setTimeout(() => {
            this._container.getNiceScroll().resize();
        })

        return $div;
    };

    const render = function () {
        let pcTable = this;
        this._sorting = {};
        this._table = $("<table>")
            .addClass(this.tableClass);

        if (this.notCorrectOrder) {
            this._table.addClass('no-correct-n-filtered')
        }

        this._popovers = $('<div class="popovers">');


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
            .append(this._rowsButtons())
            .append(this._innerContainer);

        this._footersBlock = $();
        this._content = this._refreshContentTable().appendTo(this._innerContainer);
        if (this.tableRow.panels_view.css) {
            this._container.prepend($('<style>').text(this.tableRow.panels_view.css))
        }

        this._innerContainer.addClass('panelsView');

        this._footersSubTable = this._createFootersSubtable(scrollWrapper);
        scrollWrapper
            .append(this._footersSubTable)
            .append(this._popovers);

        /* pcTable._container.height(window.innerHeight - pcTable._container.offset().top);
*/

        this._seeCalcucatedValData();
        this._seeSelectPreview();
        this._clickstoCopyMe();

        if (pcTable.tableRow.type == 'cycles') {
            this._content.on('dblclick', '.panelsView-card', function () {
                let id = $(this).data('id');
                pcTable.model.dblClick(id)
            });
        }


        let selectedDiv;
        this._content.on('contextmenu', '.panelsView-card td', function () {
            if (selectedDiv) {
                selectedDiv.removeClass('selected')
            }
            let td = $(this);
            let item = pcTable.data[td.closest('.panelsView-card').data('id')];
            let field = td.data('name');
            if (td.data('panel') && td.data('panel').isAttached() && pcTable.selectedCells.selectPanel === td.data('panel')) {
                pcTable.selectedCells.selectPanelDestroy();
                td.data('panel', null);
            } else {
                td.data('panel', pcTable.selectedCells.selectPanel = pcTable.getSelectPanel.call(pcTable, pcTable.fields[field], item, td));
                selectedDiv = td.addClass('selected')
            }
        });

        let selected;

        this._content.on('click', '.panelsView-card', function (event) {
            if (event.originalEvent && event.originalEvent.path && !$(event.originalEvent.path[0]).is('button, .fa')) {
                let td = $(this);
                if (selected && selected.get(0) === td.get(0)) {
                    td.removeClass('selected');
                    selected = null
                } else {
                    if (selected)
                        selected.removeClass('selected');
                    selected = td.addClass('selected');
                }
            }
        });

        if (this.isCreatorView) {
            this._hideHell_storage.checkIssetFields.call(this)
        }
    }
    const refreshRow = function (tr, item, newData) {
        if (tr.is('.panelsView-card')) {
            $.extend(item, newData);
            this._getRowCard(item.id);
        }


    }

    App.pcTableMain.prototype._renderTablePanelView = function () {

        this.loadFilters();
        this.model.addExtraData({'panelsView':true})

        this._renderTable = render.bind(this);
        this._getRowCard = getRowCard.bind(this);

        this._refreshHead = () => {
        }

        this.Scroll = () => {
            return {
                reloadScrollHead: () => {
                },
                insertToDOM: () => {
                    this._refreshContentTable();
                }
            };
        }
        if (this.kanban) {
            let scrollable = this._container;
            let scroll_debounce;
            let wrapper, cln, topButton, attached = false;
            const scrollFunc = () => {
                wrapper = wrapper || this._container.find('.kanbanWrapper.pcTable-floatBlock');
                let offset = wrapper.offset();
                if (offset.top < 0) {
                    if (!cln) {
                        let css = {
                            left: offset.left + this._innerContainer.scrollLeft(),
                            'grid-template-columns': wrapper.css('grid-template-columns'),
                            width: wrapper.width()
                        }
                        cln = $('<div class="kanbanWrapper pcTable-floatBlock cln">').css(css);
                        cln.width(this._innerContainer.width())


                        $('.kanban').each(function () {
                            let exs = $(this);
                            let knb = $("<div class='kanban'>").width(exs.width()).append(exs.find('.kanban-title').clone())
                            cln.append(knb)
                        })
                        let pcTable = this;
                        topButton=$('<button class="scroll-top-button"><i class="fa fa-arrow-up"></i></button>').on('click', function () {
                            pcTable._container.scrollTop(pcTable._container.find('.pcTable-rowsWrapper').offset().top - pcTable.scrollWrapper.offset().top);
                        });
                    }
                    if (!attached) {
                        attached = true;
                        this._innerContainer.append(cln)
                        this._innerContainer.append(topButton)

                        cln.scrollLeft(this._innerContainer.scrollLeft())
                    }
                } else if (attached) {
                    attached = false;
                    cln.detach();
                    topButton.detach();
                }
            };
            scrollable.on('scroll', () => {
                clearTimeout(scroll_debounce);
                scroll_debounce = setTimeout(() => {
                    scrollFunc();
                }, 50);
            });

            let scroll_horizontal_debounce;
            this._innerContainer.on('scroll', ()=>{
                clearTimeout(scroll_horizontal_debounce);
                scroll_horizontal_debounce = setTimeout(()=>{
                    if(cln){
                        cln.scrollLeft(this._innerContainer.scrollLeft())
                    }
                }, 50)
            })

            this.rowButtonsCalcWidth = function () {

                if (this.tableWidth < this.tableRow.panels_view.width) {
                    this.__$rowsButtons.width(this.tableRow.panels_view.width)
                } else if (this.tableWidth < this._innerContainer.width()) {
                    this.__$rowsButtons.width(this.tableWidth)
                } else if (!this.isMobile) {
                    this.__$rowsButtons.width(this._innerContainer.width())
                }
            }
        } else {
            this.rowButtonsCalcWidth = function () {
                this.__$rowsButtons.css('minWidth', this.tableRow.panels_view.width)

                this.tableWidth = 0;
                this._innerContainer.find('.panelsView-card').toArray().some((v) => {
                    let $v = $(v);
                    let left = $v.offset().left + $v.width();
                    if (left > this.tableWidth) {
                        this.tableWidth = left;
                    } else {
                        return true;
                    }
                });
                this.tableWidth -= this._innerContainer.offset().left + 50;
                if (!this.isMobile) {
                    if (this.tableWidth < this.tableRow.panels_view.width) {
                        this.__$rowsButtons.width(this.tableRow.panels_view.width)
                    } else {
                        this.__$rowsButtons.width(this.tableWidth)
                    }
                }
            }
        }
        this.refreshRow = refreshRow.bind(this);

        this._refreshContentTable = createPanelsContent.bind(this);

        this._getItemBytd = function (td) {
            return this.data[td.closest('.panelsView-card').data('id')] || this.data_params;
        }
        this._getFieldBytd = function (td) {
            if (td.closest('.panelsView-card').length === 0) {
                return this.fields[td.data('field')]
            } else {
                return this.fields[td.data('name')]
            }
        }

    }

})();