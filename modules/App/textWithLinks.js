(function () {
    App.textWithLinks = function (text) {
        let div = $('<div>').text(text);
        let regExp = /(https?:\/\/[^\s]+)/g;

        return div.html().replace(regExp, function (url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        });
    }
})();