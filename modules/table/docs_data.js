$(function () {

    let DocsButton= $('#docs-link');



    const addDocsClick = function () {
        let type = $(this).data('type');

        let selectDiv = $('<div class="tech-table" id="DocsPopover" data-type="'+type+'" style="min-height: 250px"></div>');

        $.post('https://docs.totum.online/index_'+type+'.json', function (json) {
            if (json && json.length){
                json.forEach(function(row){
                    selectDiv.append('<div style="'+(row[2] || "")+'"><i class="fa fa-external-link"></i> <a href="http://docs.totum.online'+row[1]+'" target="totum-docs">'+row[0]+'</a></div>');
                });
            }
        });

        DocsButton.popover({
            html: true,
            content: selectDiv,
            trigger: 'manual',
            container: 'body',
            placement: 'auto bottom',
            template: '<div class="popover" role="tooltip" style=""><div class="arrow" style="left: 50%;"></div><div class="popover-content" style=" padding: 3px 5px;"></div></div>'
        });

        setTimeout(function () {
            DocsButton.popover('show');
            let popover = $('#' + DocsButton.attr('aria-describedby'));
            popover.css('top', '45px');
            $('body').one('click.DocsPopover', function (e) {
                if (e.altKey !== undefined) {
                    DocsButton.popover('destroy');
                    DocsButton.one('click', addDocsClick);
                }
            });
        }, 50);
    };

    DocsButton.one('click', addDocsClick);
});