$.extend(App.pcTableMain.prototype, {
    _addHorizontalDraggable: function () {
        this._innerContainer.off('mousedown.HorizontalDraggable mouseout').on('mousedown.HorizontalDraggable', function (event) {


            var originalEvent = event;
            while (originalEvent) {
                if ($(event.target).is('input')) return true;
                if (originalEvent == event.originalEvent)
                    break;
                originalEvent = event.originalEvent;
            }

            $(this)
                .data('x', event.clientX)
                .data('scrollLeft', this.scrollLeft);
            return false;
        }).on('mousemove', function (event) {
            if ($(event.target).closest('.InsertRow').length===0 && event.target.tagName!=="INPUT" && event.buttons===1 && event.button === 0) {
                if (Math.abs($(this).data('x') - event.clientX) > 20) {
                    $(this).data('moved', true);
                    let timeout;
                    if (timeout) {
                        clearTimeout(timeout)
                    }
                    timeout = setTimeout(function () {
                        $(this).data('moved', false);
                    }, 200);

                    this.scrollLeft = $(this).data('scrollLeft') + $(this).data('x') - event.clientX;
                }
            }
        })
    }
});