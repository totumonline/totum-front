(function () {
    restModel=function(url){

        return {
            url: url,
            create: function(){
                return $.ajax({
                    url: this.url,
                    method: 'post',
                    data: data
                })
            },
            get: function(id){
                return $.ajax({
                    url: this.url,
                    method: 'get',
                    data: {id:id}
                })
            },
            save: function(id, data){
                return $.ajax({
                    url: this.url,
                    method: 'PUT',
                    data: $.extend(data, {id:id})
                })
            }
        }
    }


})();