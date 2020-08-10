(function () {
    App.dateFormats = {
        'base': 'DD.MM.YY',
        'db': 'YYYY-MM-DD',
        covert: function (date, from, to) {
            return moment(date, from).format(to);
        },
        covertToDb: function (date, from) {
            var from = from || this.base;
            return moment(date, from).format(this.db);
        },
        covertFromDb: function (date, to) {
            var to = to || this.base;
            return moment(date, this.db).format(to);
        },
        isValid: function (date, format) {
            var format = format || this.base;
            return moment(date, format).isValid();
        }
    };
    App.dateTimeFormats = {
        'base': 'DD.MM.YY HH:mm',
        'db': 'YYYY-MM-DD HH:mm',
        covert: function (date, from, to) {
            return moment(date, from).format(to);
        },
        covertToDb: function (date, from) {
            var from = from || this.base;
            return moment(date, from).format(this.db);
        },
        covertFromDb: function (date, to) {
            var to = to || this.base;
            return moment(date, this.db).format(to);
        },
        isValid: function (date, format) {
            var format = format || this.base;
            return moment(date, format).isValid();
        }
    };
})
();