(function () {
    App.copyMe = function (str) {
        let tmp = document.createElement('textarea');
        tmp.value = str;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
    }

})();