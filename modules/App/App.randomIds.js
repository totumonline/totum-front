(function () {
    let randomIds = {};
    App.randomIds = {
        get: function () {
            let id;
            do {
                id = Math.round(Math.random() * 1000000);
            } while (id in randomIds);
            randomIds[id] = true;
            this.current = id;
            return id;
        },
        delete: function (id) {
            delete randomIds[id];
        },
        current: 0,
    }

})();