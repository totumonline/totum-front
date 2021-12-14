(function () {
    App.windowReloadWithHash = function (model) {
        if (model.getSessHash() && !(new URLSearchParams(window.location.search)).has('sess_hash')) {
            let params = new URLSearchParams(window.location.search);
            params.append('sess_hash', model.getSessHash());
            window.location.href = window.location.pathname + '?' + params.toString();
        } else {
            window.location.reload();
        }
    }
})();