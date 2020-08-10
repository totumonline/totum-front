(function () {
    if (!window.Hlps)
        window.Hlps = {};
    var Hlps = window.Hlps;
    Hlps.selectpicker = {};
    Hlps.selectpicker.open = function (selectElement) {
        var btn = $(selectElement).data('selectpicker').$newElement.children()[0];
        btn = $(btn);
        if (!btn.attr('aria-expanded') || btn.attr('aria-expanded') === 'false') {
            btn.click();
        }
    }
    Hlps.selectpicker.focus = function (selectElement) {

        var focusIt=function(){
            var selectpicker = selectElement.data('this');

            if (!selectpicker || !selectElement.is('.selectpicker')){
                var i = 0;
                setTimeout(function(){

                    i++;
                    if (i<4) focusIt();
                    else return false;

                }, 1+100*i);
            }
            else {
                var btn = selectpicker.$newElement.children()[0];
                btn = $(btn);
                btn.focus();
            }
        }
        focusIt();
    }
    Hlps.selectpicker.getButton = function (selectElement) {
        var btn = $(selectElement).data('selectpicker').$newElement.children()[0];
        btn = $(btn);
       return btn;
    }

})();