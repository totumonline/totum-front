fieldTypes.n = $.extend({}, fieldTypes.default, {
    name: 'n',
    width: 52,
    title: App.translate('Order'),
    category: 'column',
    hidden: true,
    showInWeb: true,
    getCellText: function (val, td, item) {
        let format = item.f || {};
        td.addClass('n');

        if (!item.id || format.block || format.blockorder || this.pcTable.nSortedTreeBlock) {
            return '';
        }

        let buttons = '<button class="btn btn-xxs btn-default"><i class="fa fa-angle-up"></i></button><button class="btn btn-xxs btn-default"><i class="fa fa-angle-down"></i></button>';
        if (this.pcTable.isTreeView) {
            buttons = '';
            if (item.__tree) {
                if (this.pcTable.fields.tree.treeViewType === 'self'  && (this.pcTable.nSortedTree === undefined || this.pcTable.nSortedTree === item.tree.v)) {
                    let index;
                    this.pcTable.dataSorted.some((v, k) => {
                        if (v.toString() === item.id.toString()) {
                            index = k;
                            return true;
                        } else if (typeof v === 'object' && 'v' in v && v.v.toString() === item.id.toString()) {
                            index = k;
                            return true;
                        }
                    })
                    buttons = '';
                    if (typeof index !== null) {

                        let itemBefore;
                        if (index > 0) {
                            if (typeof this.pcTable.dataSorted[index - 1] === 'object') {
                                itemBefore = this.pcTable.dataSorted[index - 1].row;
                            } else {
                                itemBefore = this.pcTable.data[this.pcTable.dataSorted[index - 1]];
                            }
                        }


                        if (itemBefore && itemBefore.tree.v === item.tree.v) {
                            buttons += '<button class="btn btn-xxs btn-default"><i class="fa fa-angle-up"></i></button>';
                        } else {
                            buttons += '<button class="btn btn-xxs btn-default arrow-disabled"><i class="fa fa-angle-up"></i></button>';
                        }

                        let itemAfter;
                        if (index <= this.pcTable.dataSorted.length) {
                            if (typeof this.pcTable.dataSorted[index + 1] === 'object') {
                                itemAfter = this.pcTable.dataSorted[index + 1].row;
                            } else {
                                itemAfter = this.pcTable.data[this.pcTable.dataSorted[index + 1]];
                            }
                        }

                        if (itemAfter && itemAfter.tree.v === item.tree.v) {
                            buttons += '<button class="btn btn-xxs btn-default"><i class="fa fa-angle-down"></i></button>';
                        } else {
                            buttons += '<button class="btn btn-xxs btn-default arrow-disabled"><i class="fa fa-angle-down"></i></button>';
                        }
                    }
                }
            } else if (this.pcTable.nSortedTree === undefined || this.pcTable.nSortedTree === item.tree.v) {
                let index = this.pcTable.dataSorted.indexOf(item.id + '');
                buttons = '';
                if (index >= 1 && typeof this.pcTable.dataSorted[index - 1] !== 'object') {
                    buttons += '<button class="btn btn-xxs btn-default"><i class="fa fa-angle-up"></i></button>';
                } else {
                    buttons += '<button class="btn btn-xxs btn-default arrow-disabled"><i class="fa fa-angle-up"></i></button>';
                }
                if (index < (this.pcTable.dataSorted.length - 1) && typeof this.pcTable.dataSorted[index + 1] !== 'object') {
                    buttons += '<button class="btn btn-xxs btn-default"><i class="fa fa-angle-down"></i></button>';
                } else {
                    buttons += '<button class="btn btn-xxs btn-default arrow-disabled"><i class="fa fa-angle-down"></i></button>';
                }
            } else {
                buttons = '';
            }
        }

        return $('<span class="btns"></span>').html(buttons);
    }

});
