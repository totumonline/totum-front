(function () {
    $.expr.pseudos.multiincludes = function (obj, index, meta) {
        let $obj = $(obj).find('a');
        let haystack = ($obj.data('tokens') || $obj.text()).toString();
        let qs = meta[3];

        [haystack, qs] = App.lang.search_prepare_function(haystack, qs);
        qs = qs.split(" ");
        return !qs.some(function (q) {
            return haystack.indexOf(q) === -1
        });
    };

})();