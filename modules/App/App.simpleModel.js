(function(){
    let simpleModel
    App.getSimpleModel = function (){
        if (!simpleModel){
            simpleModel = App.models.table('/Table/');
            simpleModel.addPcTable({model: simpleModel});
        }
        return simpleModel
    }


})();