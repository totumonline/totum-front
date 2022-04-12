fieldTypes.number = {
    icon: 'fa-hashtag',
    getEditVal: function (input) {

        let val = input.val().trim();

        val = val.replace(/\s+/, ' ');

        if ((val === undefined || val === '' || val === null)) {
            if (this.required) {
                throw App.translate('The field %s must be entered', this.title);
            }
            return '';
        }

        if (val.match(/,/)) {
            let dectimalSeparator = this.dectimalSeparator || App.dS;
            if (dectimalSeparator === ',') {
                val = val.replace(/,/, '.');
            } else {
                val = val.replace(/,/g, '');
            }
        }

        if (this.regexp) {
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

        return val;

    },
    getCopyText: function (val, td, item) {
        if (val === null || val === undefined || val === '' || val.v === null) return '';

        return (val.v).toString().replace(/\./g, ',');
    },
    getCellText: function (val, td, item) {
        if (val === null || val === undefined || val === '') return '';
        if (this.currency) {
            return App.numberFormat(val, this.dectimalPlaces, this.dectimalSeparator, this.thousandthSeparator, this.prefix, this.postfix);
        }
        return val;
    }
    , addPlaceholder: function (input, placeholder) {
        input.attr('placeholder', placeholder);
    }
};