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
            let td = $('<td>').html(this.fields[field.field].getCellText(data[field.field].v, div, data));
            td.height(field.height)
            if (!field.border) {
                td.css('border-color', 'transparent')
                td.css('background-color', 'transparent')
            }

            let fData = $('<div>').append(td);
            if (field.title) {
                fData.prepend($('<th>').text(this.fields[field.field].title));
            }
            div.append(fData)
        })

        return div;
    }
    const addSortable = function (div) {
        if (this.kanban) {
            $(div).find('.kanban').sortable({
                items: '.panelsView-card',
                connectWith: '.kanban',
                stop: (event, ui) => {
                    let $item = $(ui.item);
                    let itemId = $item.data('id');
                    let nowBeforeId = $item.prev().data('id');
                    App.fullScreenProcesses.show('sorting');


                    let kanban = this.data[itemId][this.tableRow.panels_view.kanban];
                    if (this.data[itemId][this.tableRow.panels_view.kanban] != $item.parent().data('value')) {
                        kanban = $item.parent().data('value');
                        this.model.save({[itemId]: {[this.tableRow.panels_view.kanban]: kanban}}).then((json) => {
                            this.table_modify(json, undefined);
                        });
                    }
                    let order = [];
                    $item.parent().find('.panelsView-card').each((i, div) => {
                        order.push($(div).data('id'))
                    })

                    if (order.length > 1) {
                        this.model.saveOrder(order).then((json) => {
                            this.table_modify(json);
                        }).always(() => {
                            App.fullScreenProcesses.hide('sorting');
                        });
                    } else {
                        App.fullScreenProcesses.hide('sorting');
                    }
                }
            })
        } else
            $(div).sortable({
                stop: (event, ui) => {
                    let $item = $(ui.item);
                    let itemId = $item.data('id');
                    let nowBeforeId = $item.prev().data('id');
                    App.fullScreenProcesses.show('sorting');
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
                    this.model.saveOrder(this.dataSorted).then((json) => {
                        this.table_modify(json);
                    }).always(() => {
                        App.fullScreenProcesses.hide('sorting');
                    });

                }
            })
    }
    const createPanelsContent = function () {
        let $div = this._content || $('<div class="pcTable-floatBlock">').each((i, d) => {
            if (this.tableRow.with_order_field) {
                setTimeout(() => {
                    addSortable.call(this, d)
                }, 1)
            }
        });
        $div.empty();
        this.__applyFilters();

        if (this.kanban) {
            $div.addClass('kanbanWrapper')
            $div.css('grid-template-columns', "1fr ".repeat(this.kanban.length))
            this.kanban.forEach((v) => {
                v.$div = $('<div class="kanban"></div>').data('value', v[0]);
                v.$div.append($('<div class="kanban-title">').text(v[1]))
                let kId = v[0];
                $div.append(v.$div);

                this.dataSortedVisible.forEach((id) => {
                    if (this.data[id][this.tableRow.panels_view.kanban].v == kId) {

                        v.$div.append(this._getRowCard(id));
                    }
                })
            })
        } else {
            this.dataSortedVisible.forEach((id) => {
                $div.append(this._getRowCard(id));
            })
        }


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

        this._content.on('dblclick', '.panelsView-card', function () {
            let id = $(this).data('id');
            new EditPanel(pcTable, null, {id: id}).then(function (json) {
                if (json) {
                    pcTable.table_modify.call(pcTable, json);
                }
            });
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

        this._renderTable = render.bind(this);
        this._getRowCard = getRowCard.bind(this);

        this._refreshHead = () => {
        }
        this.__addFilterable = () => {
        }
        this.Scroll = () => {
            return {
                reloadScrollHead: () => {
                }
            };
        }
        this.rowButtonsCalcWidth = () => {
        }
        this.refreshRow = refreshRow.bind(this);

        this._refreshContentTable = createPanelsContent.bind(this);
    }

})();