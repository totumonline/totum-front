(function () {
    App.setSessionStorage=function (name, data) {
        sessionStorage.setItem(name, JSON.stringify(data))
    }

})();