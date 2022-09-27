(function () {
    App.numberFormat = function(val, _decimals, _dectimalSeparator, _thousandthSeparator, _prefix, _postfix){
        let dectimalSeparator, thousandthSeparator, postfix;
        if (_dectimalSeparator !== undefined) {
            dectimalSeparator = _dectimalSeparator;
            if (dectimalSeparator.match(/\*\*/)) {
                dectimalSeparator = dectimalSeparator.split('**')[val >= 0 ? 0 : 1];
            }
        }
        if (_thousandthSeparator !== undefined) {
            thousandthSeparator = _thousandthSeparator;
            if (thousandthSeparator.match(/\*\*/)) {
                thousandthSeparator = thousandthSeparator.split('**')[val >= 0 ? 0 : 1];
            }
        }
        postfix = _postfix  || '';
        if (postfix) {
            postfix = postfix.match(/\*\*/) ? postfix.split('**')[val >= 0 ? 0 : 1] : postfix;
        }

        let prefix = _prefix || '';
        if (prefix.match(/\*\*/)) {
            prefix = prefix.split('**')[val >= 0 ? 0 : 1];
            val = Math.abs(val);
        }
        let decimals = _decimals || 0;


        return prefix + (function (number, decimals, dec_point, thousands_sep) {
            var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                sep = (typeof thousands_sep === 'undefined') ? ' ' : thousands_sep,
                dec = (typeof dec_point === 'undefined') ? ',' : dec_point,
                toFixedFix = function (n, prec) {
                    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
                    var k = Math.pow(10, prec);
                    return Math.round(n * k) / k;
                },
                s = (prec ? toFixedFix(n, prec) : Math.round(n)).toLocaleString('fullwide', { useGrouping: false }).split(/[,.]/);

            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        })(parseFloat(val), decimals, dectimalSeparator, thousandthSeparator) + postfix;
    }

})();