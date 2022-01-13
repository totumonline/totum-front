(function () {
    App.clickToCyclesTabButton=function (id) {
        let [_, cyclesId, cycleId, btnName] = /^(\d+)\/(\d+)\/(.+)$/.exec(id)

        let model = App.models.table('/Table/0/'+cyclesId, {}, {});
        model.addPcTable({model: model});
        model.click({
            item: cycleId,
            fieldName: btnName
        })

    };

})();