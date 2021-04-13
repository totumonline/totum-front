$(function () {
    if (screen.width > window.MOBILE_MAX_WIDTH) {
        let $div = $('#main-page');
        if ($div.length) {
            let $PageContent = $('.page_content');
            let niceScroll = false;
            const setScroll = function () {
                let $diff = $('#tables_tabls').length ? 200 : 100;
                $div.height(window.innerHeight - $diff).niceScroll({
                    cursorwidth: 7,
                    mousescrollstep: 190,
                    mousescroll: 190,
                    autohidemode: false,
                    enablekeyboard: true,
                    cursoropacitymin: 1,
                    railoffset: {left: 4},
                    cursorcolor: '#e1e0df'
                });
                niceScroll = true;
            };
            const unsetScroll = function () {
                $div.height('').getNiceScroll().remove();
                niceScroll = false;
            };

            const checkScroll = function () {
                if ($PageContent.is('.tree-minifyed') && niceScroll) unsetScroll();
                else if (!$PageContent.is('.tree-minifyed') && !niceScroll) setScroll();
            };

            const targetNode = document.getElementsByClassName('page_content')[0];
            const config = {attributes: true, childList: false, subtree: false};
            const observer = new MutationObserver(checkScroll);
            observer.observe(targetNode, config);

            checkScroll();
        }
    }
});
