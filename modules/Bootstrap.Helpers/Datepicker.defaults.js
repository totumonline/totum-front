(function () {

    $.fn.datetimepicker.defaults.icons.close = 'glyphicon glyphicon-ok';
    setTimeout(()=>{
        $.fn.datetimepicker.defaults.tooltips.close = App.translate('Apply and close');
    })
})();