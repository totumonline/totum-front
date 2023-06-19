(function () {
    App.numberFormat = function (val, _decimals, _dectimalSeparator, _thousandthSeparator, _prefix, _postfix) {
        val = val.toString();
        let dectimalSeparator = '.', thousandthSeparator = '', postfix = '', prefix = '';

        if (typeof _dectimalSeparator === 'string') {
            dectimalSeparator = _dectimalSeparator;
            if (dectimalSeparator.match(/\*\*/)) {
                dectimalSeparator = dectimalSeparator.split('**')[val >= 0 ? 0 : 1];
            }
        }
        if (typeof _thousandthSeparator === 'string') {
            thousandthSeparator = _thousandthSeparator;
            if (thousandthSeparator.match(/\*\*/)) {
                thousandthSeparator = thousandthSeparator.split('**')[val >= 0 ? 0 : 1];
            }
        }
        if (typeof _postfix === 'string') {
            postfix = _postfix;
            postfix = postfix.match(/\*\*/) ? postfix.split('**')[val >= 0 ? 0 : 1] : postfix;
        }

        if (typeof _prefix === 'string') {
            prefix = _prefix;
            if (prefix.match(/\*\*/)) {
                prefix = prefix.split('**')[val >= 0 ? 0 : 1];
                if (val[0] === '-') {
                    val = val.substring(1);
                }
            }
        }
        let decimals = parseInt(_decimals);

        return prefix + (function (decimals, dec_point, thousands_sep) {
            var parts = val.split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);
            if (parts[1] || decimals) {
                parts[1] = typeof parts[1] === 'undefined' ? parts[1] = "" : parts[1];
                if (decimals) {
                    parts[1] = parts[1].substring(0, decimals);
                    for (let i = parts[1].length; i < decimals; i++) {
                        parts[1] += "0";
                    }
                }
            }
            return parts.join(dec_point);
        })(decimals, dectimalSeparator, thousandthSeparator) + postfix;
    }

})();