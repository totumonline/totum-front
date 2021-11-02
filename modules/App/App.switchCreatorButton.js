$(function () {
    App.switchCreatorButton = function () {
        if ($('#isCreator').length === 0) {
            let isMobile = screen.width <= window.MOBILE_MAX_WIDTH;
            let checkbox = $('<span id="isCreator" class="btn btn-sm"><i class="fa-user-circle fa"></i></span>');
            let input = checkbox;
            if (!isMobile && !localStorage.getItem('notCreator')) {
                input.addClass('btn-danger');
            } else {
                input.addClass('btn-warning');
                $('.plus-top-branch').hide();
            }
            input.on('click', () => {
                if (!localStorage.getItem('notCreator')) {
                    localStorage.setItem('notCreator', true)
                } else {
                    localStorage.removeItem('notCreator')
                }
                window.location.reload(true);
            })
            $('#docs-link').before(checkbox)
        }
    };
    if(App.isTopWindow()){
        App.switchCreatorButton();
    }
});