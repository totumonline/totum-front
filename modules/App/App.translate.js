(function () {

    App.translate = function (str, $vars) {
        if (App.lang && App.lang.translates[str]) {
            str = App.lang.translates[str];
        }

        if ($vars) {
            if (typeof $vars !== 'object') {
                $vars = [$vars];
            }
            $vars.forEach((s) => {
                str = str.replace(/%s/, s)
            })
        }
        return str;
    }

})();