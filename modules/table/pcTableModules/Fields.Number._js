fieldTypes.number = {
    icon: 'fa-hashtag',
    getEditVal: function (input) {

        let val = input.val().trim();

        if ((val === undefined || val === '' || val === null)) {
            if (this.required) {
                throw App.translate('The field %s must be entered', this.title);
            }
            return '';
        } else if (this.regexp) {
            var r = new RegExp(this.regexp);
            if (!r.test(val)) {
                let notify = this.regexpErrorText || App.translate('Value fails regexp validation: "%s"', this.regexp);
                notify = App.translate('Filled "%s" field  error: %s', [(this.title || this.name), notify]);
                throw notify;
            }
        }

        let valNew = val.replace(/[^\-()\d/*+.,%:\/]/g, '');
        if (!/^(\+|\*|\%|\/|\:)?(\-?[\d]+((\.|\,)[\d]+)?)%?$/.test(valNew)) {
            throw App.translate('There must be a number');
        }
        val = val.replace(/,/, '.');
        return val;

    },
    getCopyText: function (val, td, item) {
        if (val === null || val === undefined || val === '' || val.v === null) return '';

        return (val.v).toString().replace(/\./g, ',');
    },
    numberFormat: function (number, decimals, dec_point, thousands_sep) {
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ' ' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? ',' : dec_point,
            toFixedFix = function (n, prec) {
                // Fix for IE parseFloat(0.55).toFixed(0) = 0;
                var k = Math.pow(10, prec);
                return Math.round(n * k) / k;
            },
            s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    },
    getCellText: function (val, td, item) {
        if (val === null || val === undefined || val === '') return '';

        if (this.currency) {
            let options = {};


            let dectimalSeparator, thousandthSeparator, postfix;
            if ('dectimalSeparator' in this) {
                dectimalSeparator = this.dectimalSeparator;
                if (dectimalSeparator.match(/\*\*/)) {
                    dectimalSeparator = dectimalSeparator.split('**')[val >= 0 ? 0 : 1];
                }
            }
            if ('thousandthSeparator' in this) {
                thousandthSeparator = this.thousandthSeparator;
                if (thousandthSeparator.match(/\*\*/)) {
                    thousandthSeparator = thousandthSeparator.split('**')[val >= 0 ? 0 : 1];
                }
            }
            postfix = this.postfix;
            if (postfix && postfix.match(/\*\*/)) {
                postfix = postfix.split('**')[val >= 0 ? 0 : 1];
            } else {
                postfix = '';
            }

            let prefix = this.prefix || '';
            if (prefix.match(/\*\*/)) {
                prefix = prefix.split('**')[val >= 0 ? 0 : 1];
                val = Math.abs(val);
            }
            let decimals = this.dectimalPlaces || 0;


            return prefix + this.numberFormat(parseFloat(val), decimals, dectimalSeparator, thousandthSeparator) + postfix;
        }
        return val;
    }
    , addPlaceholder: function (input, placeholder) {
        input.attr('placeholder', placeholder);
    }
};