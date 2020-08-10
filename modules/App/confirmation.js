(function () {

    App.confirmation = function (text, btns, title) {
        let _btns = [];
        Object.keys(btns).forEach(function (k) {
            _btns.push({
                label: k,
                action: btns[k]
            })
        });

        return BootstrapDialog.show({
            /*cssClass: 'edit-row-panel',*/
            type: 'edit',
            title: title,
            message: text,
            buttons: _btns,
            draggable: true,
            onshow: function (dialog) {
                dialog.$modalContent.css({
                    width: "70vw",
                    maxWidth: "800px"
                });
            },
            onshown: function (dialog) {
            dialog.$modalContent.position({
                of: window
            })
        }
        })
    };

   // return App.modal(text, title, btns);


})();