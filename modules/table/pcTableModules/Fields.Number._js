fieldTypes.number = {
    icon: 'fa-hashtag',
    getEditVal: function (input) {

        let val = input.val().trim();

        if ((val === undefined || val === '' || val === null)) {
            if (this.required) {
                throw 'Поле ' + this.title + ' должно быть заполнено';
            }
            return '';
        }else if (this.regexp) {
            var r = new RegExp(this.regexp);
            if (!r.test(val)) {
                let notify = this.regexpErrorText || 'regexp не проходит - "' + this.regexp + '"';
                notify = 'Ошибка заполнения поля "' + (this.title || this.name) + '": ' + notify;
                throw notify;
            }
        }

        let valNew = val.replace(/[^\-()\d/*+.,%:\/]/g, '');
        if (!/^(\+|\*|\%|\/|\:)?(\-?[\d]+((\.|\,)[\d]+)?)%?$/.test(valNew)) {
            throw 'Здесь должно быть число';
        }
        val = val.replace(/,/, '.');
        return val;

    },
    getCopyText: function (val, td, item) {
        if (val === null || val === undefined || val === '' || val.v === null) return '';

        return (val.v).toString().replace(/\./g, ',');
    },
    getCellText: function (val, td, item) {
        if (val === null || val === undefined || val === '') return '';

        if (this.currency) {
            let options = {};
            if (this.dectimalPlaces) {
                options.minimumFractionDigits = this.dectimalPlaces;
            }
            return parseFloat(val).toLocaleString('ru-RU', options);
        }
        return val;
    }
    , addPlaceholder: function (input, placeholder) {
        input.attr('placeholder', placeholder);
    }
};