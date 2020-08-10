(function () {
    App.blink=function ($element, $times, $color) {
        let i = $times || 8;
        let warn = true;
        let blink = function () {
            if (warn){
                $element.css('background-color', $color);
            }else{
                $element.css('background-color', '');
            }
            warn = !warn;
            i--;
            if (i>0){
                setTimeout(blink, 300)
            }
        };
        setTimeout(blink, 300)
    }

})();