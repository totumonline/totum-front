App.pcTableMain.prototype.reOrderRows = function (btnId, $direction) {
    let pcTable = this;
    if (pcTable.tableRow.with_order_field && !pcTable.nSorted) {
        App.notify('Для работы поля порядок перезагрузите таблицу');
        return false;
    }

    if(pcTable.isRestoreView){
        App.notify('Режим восстановления строк. Сортировка отключена');
        return false;
    }


    let idInd;
    let orderingRowIds = [];
    if (this.row_actions_get_checkedIds().length === 0) {
        orderingRowIds.push(btnId);

        let indVisBtn = this.dataSortedVisible.indexOf(btnId) + ($direction === 'after' ? 1 : -1);
        if (indVisBtn < 0 || !(indVisBtn in this.dataSortedVisible)) return;
        if (this.data[this.dataSortedVisible[indVisBtn]].f && this.data[this.dataSortedVisible[indVisBtn]].f.blockorder) {
            App.notify('Нельзя перемещать строку ' + this.getRowTitle(this.data[this.dataSortedVisible[indVisBtn]]));
            return;
        }

        idInd =
            this.dataSorted.indexOf(this.dataSortedVisible[indVisBtn]);
        orderingRowIds.forEach(function (id) {
            pcTable.dataSorted.splice(pcTable.dataSorted.indexOf(id), 1);
        });

    } else {
        if (pcTable.row_actions_get_checkedIds().indexOf(btnId) !== -1) {
            App.notify('В качестве якоря для перемещения нужно выбрать не отмеченную строку');
            return false;
        }
        let idsLength = this.row_actions_get_checkedIds().length;
        this.dataSorted.some(function (id, ind) {
            if (idsLength === 0) return true;
            if (pcTable.data[id].$checked) {
                orderingRowIds.push(id);
                --idsLength;
            }
        });

        orderingRowIds.forEach(function (id) {
            pcTable.dataSorted.splice(pcTable.dataSorted.indexOf(id), 1);
        });
        idInd = this.dataSorted.indexOf(btnId) + ($direction === 'after' ? 1 : 0)
    }

    pcTable.dataSorted.splice(idInd, 0, ...orderingRowIds);

    this.dataSortedVisible = [];
    pcTable.dataSorted.forEach(function (id) {
        if (pcTable.data[id].$visible) pcTable.dataSortedVisible.push(id);
    });

    pcTable._refreshContentTable();

    if (pcTable.tableRow.with_order_field) {
        $('table.pcTable-table').addClass('reordered');
        // pcTable._table.addClass('reordered');
    }
    pcTable.row_actions_uncheck_all();
};
App.pcTableMain.prototype.reOrderRowsSave = function () {
    let pcTable = this;
    /*if (pcTable.notCorrectOrder) {
        App.notify('Поля выбраны с промежутками - выберите корректный фильтр');
        return;
    }*/
    pcTable._orderSaveBtn.prop('disabled', true).find('i').attr('class', 'fa fa-cog');


    this.model.saveOrder(this.dataSorted)
        .then(function (json) {
            pcTable.table_modify(json);
            pcTable._orderSaveBtn.prop('disabled', false).find('i').attr('class', 'fa fa-save');
            $('table.pcTable-table').removeClass('reordered');
            //pcTable._table.removeClass('reordered');

        });

};
App.pcTableMain.prototype.addReOrderRowBind = function () {

    let pcTable = this;
    pcTable._innerContainer.on('click', 'td.n button', function (event) {
        let btn = $(this);

        if (!pcTable.tableRow.with_order_field || pcTable.__getCheckedRowsIds(undefined, true, 'blockorder')) {

            pcTable.reOrderRows.call(pcTable, pcTable._getItemByTr.call(pcTable, btn.closest('tr')).id, btn.find('.fa-angle-up').length === 1 ? 'before' : 'after');
        }
    });
};
