(function () {
    Object.getPath = function (obj, path, def) {
        let cur = obj;
        for (let i = 0; i < path.length; i++) {
            let key = path[i];
            if ((typeof cur !== 'object') || !(key in cur)) return def;
            cur = cur[key];
        }
        return cur;
    }

})();