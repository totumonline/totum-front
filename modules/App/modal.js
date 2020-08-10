(function(){

    App.modal=function($text, $title, $footer){

        var div = $('<div class="modal fade" id="appNotify" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
            + ' <div class="modal-dialog">'
            + ' <div class="modal-content">'
            + ' <div class="modal-header">'
            + ' <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
            + '<h4 class="modal-title"></h4>'
            + ' </div>'
            + ' <div class="modal-body">'
            + ' </div>'
            + ' <div class="modal-footer">'
            + ' </div>'
            + ' </div>'
            + ' </div>'
            + ' </div>');


        var modal={
            body: div.find('.modal-body'),
            header: div.find('.modal-header'),
            title: div.find('.modal-title'),
            footer: div.find('.modal-footer'),
            block: div
        }

       modal.block.on('hidden.bs.modal', function(){
            $(this).remove();
        });

        if (typeof $text == 'object' && $text instanceof jQuery){
            modal.body.empty().append($text);
        }else{
            modal.body.html($text);
        }
        if ($title)  {
            modal.title.html($title);
        }
        else {
            modal.header.hide();
        }
        if ($footer)  {
            if (typeof $footer == 'object'){
                var ftr=$('<div>');
                var modal=modal;
                $.each($footer, function(btnName, func){
                    if (func == 'close'){
                        ftr.append('<button type="button" class="btn btn-default" data-dismiss="modal">'+btnName+'</button>')
                        return;
                    }
                    var btnClass='default';

                    if (typeof func == 'object'){
                        if (func.class) btnClass=func.class;
                        if (func.func) func=func.func;
                    }
                    var btn=$('<button type="button" class="btn btn-'+btnClass+'">'+btnName+'</button>');
                    ftr.append(btn);

                    if (func && typeof func =='function'){
                        btn.on('click', function(){
                            func(modal.block);
                        });
                    }
                });
                modal.footer.html(ftr.children());
            }
            else modal.footer.html($footer);
        }
        else modal.footer.hide();

        modal.block.modal('show').css('z-index', '10000');
        return modal.block;
    }
})();