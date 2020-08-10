(function () {
    App.isTopWindow = function () {
        let isFramed = false;
        try {
            isFramed = window != window.top || document != top.document || self.location != top.location;
        } catch (e) {
            isFramed = true;
        }

        return !isFramed
    }
})();