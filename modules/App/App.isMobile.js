(function () {
    let bodyClassSetted = false;

    App.isMobile = function (indeed) {
        let byScreenIsMobile = screen.width < 800 ||
            !(window.matchMedia("(any-pointer: fine)").matches && window.matchMedia("(hover: hover)").matches);

        if (!bodyClassSetted) {
            bodyClassSetted = true;
            if (App.isMobile()) {
                $('body').addClass('ttm-body-mobile')
            } else {
                $('body').addClass('ttm-body-desktop')
            }
        }

        if (indeed === 'isButton') {
            return screen.width >= 800;
        } else if (indeed) {
            return byScreenIsMobile;
        }

        if (screen.width < 800) {
            return true;
        }

        if (byScreenIsMobile) {
            if (localStorage.getItem('notMobileView') === 'true') {
                return false;
            }
        } else {
            if (localStorage.getItem('notMobileView') === 'false') {
                return true;
            }
        }
        return byScreenIsMobile;
    };

})();