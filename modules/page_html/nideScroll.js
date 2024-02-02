$(function () {
    if (!App.isMobile()) {
        let $div = $('#main-page');
        if ($div.length) {
            const checkScroll = function () {
                $div.height(window.innerHeight - $div.offset().top - 20 - parseInt($div.css('paddingTop')))
            };

            $('#tables_tabls').on('hidden.bs.tab', (e) => {
                checkScroll();
            })

            const targetNode = document.getElementsByClassName('page_content')[0];
            const config = {attributes: true, childList: false, subtree: false};
            const observer = new MutationObserver(checkScroll);
            observer.observe(targetNode, config);

            $(window).on('resize', checkScroll)
            checkScroll();
        }
    }
});
