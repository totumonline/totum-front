$(function (){
    window.top.lastCtrl = window.top.lastCtrl || 0;


    $('body').on('keydown', (event) => {
        if (event.ctrlKey || event.altKey) {
            window.top.lastCtrl = Date.now();
        }
        if (event.shiftKey) {
            window.top.lastShift = Date.now();
        }
        if (window.top.wasCtrl(event) || event.metaKey || event.altKey) {
            if (!window.top.wasShift(event) && String.fromCharCode(event.which).toLowerCase() === 's') {
                let events=$._data(document.body, 'events')['ctrlS'];
                if(events && events.length){
                    let lastEvent = events[events.length - 1];
                    lastEvent.handler.bind(document.body)();
                    return false;
                }
            }
        }
    });
    window.top.wasCtrl = (event) => {
        return event.ctrlKey || event.altKey || (window.top && window.top.lastCtrl > 0 && (Date.now() - window.top.lastCtrl < 500));
    }
    window.top.wasShift = (event) => {
        return event.shiftKey || (window.top && window.top.lastShift > 0 && (Date.now() - window.top.lastShift < 500));
    }
});