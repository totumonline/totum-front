(function () {
    App.blink = function ($element, $times, $backgroundcolor, $param) {
        let i = $times || 8;
        $param = $param || 'background-color';

        if (i % 2) {
            i++;
        }
        let warn = true;
        let blink = function () {
            if ($element) {
                if (warn) {
                    $element.css($param, $backgroundcolor);
                } else {
                    if ($backgroundcolor)
                        $element.css($param, '');
                }
                warn = !warn;
                i--;
                if (i > 0) {
                    setTimeout(blink, 300)
                }
            }
        };
        setTimeout(blink, 300)
    }

})();