(function () {
    App.panelTimer=function(title, numStart, func){
        let i=numStart;
        let $div = $('<div>');
        $div.html(i);
        let TimeObject;

        let panelTimer = BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DANGER,
            title:title ,
            message: $div,
            onhide: function(){
                if (TimeObject){
                    clearTimeout(TimeObject);
                }
            },
            buttons: [
                {
                    action: function (panelTimer) {
                        if (TimeObject){
                            clearTimeout(TimeObject);
                        }
                        panelTimer.close();
                    },
                    label: App.translate('Cancel')
                }]
        });
        let timeoutFunc = function () {
            if (--i<=0){
                panelTimer.close();
                func();
            }else{
                $div.html(i);
                TimeObject=setTimeout(timeoutFunc, 1000);
            }
        };
        timeoutFunc();
    }

})();