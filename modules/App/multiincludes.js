(function () {
    $.expr.pseudos.multiincludes = function (obj, index, meta) {
        let $obj = $(obj).find('a');
        let haystack = ($obj.data('tokens') || $obj.text()).toString().toUpperCase().replace('ё', 'е');
        let qs = meta[3].toUpperCase().replace('ё', 'е').split(" ");
        return !qs.some(function (q) {
            return haystack.indexOf(q)===-1
        });
    };

})();