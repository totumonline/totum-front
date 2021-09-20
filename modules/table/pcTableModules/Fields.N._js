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

        if (!item.id || format.block || format.blockorder || (item.__inserted && !this.pcTable.isTreeView) || this.pcTable.nSortedTreeBlock) {
            return '';
        }

        let buttons = '<button class="btn btn-xxs btn-default"><i class="fa fa-angle-up"></i></button><button class="btn btn-xxs btn-default"><i class="fa fa-angle-down"></i></button>';
        if (this.pcTable.isTreeView) {

            if(item.__tree){
                buttons='';
            }
            else if (this.pcTable.nSortedTree===undefined || this.pcTable.nSortedTree === item.tree.v) {
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
            }else{
                buttons='';
            }
        }

        return $('<span class="btns"></span>').html(buttons);
    }

});
