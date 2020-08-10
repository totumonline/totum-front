(function () {
    App.ksort = function(obj){
        var keys = Object.keys(obj).sort()
            , sortedObj = {};
        for(var i in keys) {
            sortedObj[keys[i]] = obj[keys[i]];
        }
        return sortedObj;
    };

    App.values = function (obj) {
        let list=[];
        for (let i in obj){
            list.push(obj[i])
        }
        return list;
    };
    App.keys = function (obj) {
        let list=[];
        for (let i in obj){
            list.push(i)
        }
        return list;
    };
    App.isEmpty = function(obj) {
        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // If it isn't an object at this point
        // it is empty, but it can't be anything *but* empty
        // Is it empty?  Depends on your application.
        if (typeof obj !== "object") return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    };
    App.filter = function (obj, func) {
        let objReturn={};
        Object.keys(obj).forEach(function (key) {
            if(func(key, obj[key])){
                objReturn[key]=obj[key]
            }
        });
        return objReturn;
    }
})();