(function () {
    let Img = 'fa-cog';
    let processStack = {};
    let $image = $('#big_loading i');
    let iCog = 0;

    App.fullScreenProcesses = {
        showCog: function () {
            iCog++;
            if (iCog === 1) {
                App.fullScreenProcesses.show('fa-cog', true)
            }
        },
        hideCog: function () {
            iCog--;
            if (iCog < 1) {
                iCog = 0;
                App.fullScreenProcesses.hide();
            }
        }
    };
    let animationTimer;
    App.fullScreenProcesses.show = function (image, withRotate) {
        withRotate = withRotate || false;
        $('body').addClass('lock');

        if (withRotate && !$image.is('.fa-spin')) {
            $image.addClass('fa-spin')
        } else if (!withRotate && $image.is('.fa-spin')) {
            $image.removeClass('fa-spin')
        }

        if (Img != image) {
            $image.removeClass(Img).addClass(image);
            Img = image;
        }
        let Layer = $('#big_loading').show();
        if (animationTimer) {
            clearTimeout(animationTimer);
        }
        animationTimer = setTimeout(() => {
            Layer.animate({opacity: 1}, 250);
        }, 1000)
    };
    App.fullScreenProcesses.hide = function (uin) {
        $('body').removeClass('lock');
        if (animationTimer) {
            clearTimeout(animationTimer)
        }
        let Layer = $('#big_loading').stop().animate({opacity: 0}, 250, function () {
            $('#big_loading').hide();
        });
    }
})();