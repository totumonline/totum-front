(function(){
    $.fn.extend({
    isAttached: function(){
        return $(this).closest('html').length===1;
        }
    });
    
})();