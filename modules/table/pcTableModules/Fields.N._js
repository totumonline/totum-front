fieldTypes.n = $.extend({}, fieldTypes.default, {
    name: 'n',
    width: 52,
    title: 'Порядок',
    category: 'column',
    hidden: true,
    showInWeb: true,
    getCellText: function (val, td, item) {
        let format = item.f || {};
        td.addClass('n');

        if (!item.id || format.block || format.blockorder || item.__inserted){
            return '';
        }
        

        return $('<span class="btns"><button class="btn btn-xxs btn-default"><i class="fa fa-angle-up"></i></button> <button class="btn btn-xxs btn-default"><i class="fa fa-angle-down"></i></button></span>');
    }

});
