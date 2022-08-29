(function () {
    let bodyClassSetted = false;

    App.isMobile = function (indeed) {
        let byScreenIsMobile = screen.width <= window.MOBILE_MAX_WIDTH;

        if (!bodyClassSetted) {
            bodyClassSetted = true;
            if (App.isMobile()) {
                $('body').addClass('ttm-body-mobile')
            } else {
                $('body').addClass('ttm-body-desktop')
            }
        }

        if (indeed) {
            return byScreenIsMobile;
        }
        if (byScreenIsMobile && localStorage.getItem('notMobileView')) {
            return false;
        }
        return byScreenIsMobile;
    };

})();