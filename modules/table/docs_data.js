$(function () {

    let DocsButton = $('#docs-link');


    const addDocsClick = function () {
        let type = $(this).data('type');

        let selectDiv = $('<div class="tech-table" id="DocsPopover" data-type="' + type + '" style="min-height: 250px"></div>');


        const get = (host) => {
            $.get(host + 'index_' + type + '.json', function (json) {
                if (json && json.length) {
                    json.forEach(function (row) {
                        selectDiv.append('<div style="' + (row[2] || "") + '"><i class="fa fa-external-link"></i> <a href="' + host.substr(0, host.length - 1) + row[1] + '" target="totum-docs">' + row[0] + '</a></div>');
                    });
                }
                selectDiv.prepend('<div><button data-name="totum-ai"><i class="fa fa-comment"></i> AI TOTUM</button></div>')
                selectDiv.on('click', 'button[data-name="totum-ai"]', () => {

                    let $Block = $('<div class="With-AI"><div class="AI-Block"><div class="AI-Dialog"></div><div class="AI-Input"><textarea placeholder=">"></textarea></div><div class="AI-Buttons"><button name="send">Send</button><button name="stop">Stop</button><button name="new">New</button></div></div>')
                    window.top.BootstrapDialog.show({
                        message: $Block,
                        type: null,
                        title: App.translate('TOTUM AI'),

                        cssClass: 'fieldparams-edit-panel',
                        draggable: true,
                        onshown: function (dialog) {

                            dialog.$modalContent.position({
                                my: 'center top',
                                at: 'center top+30px',
                                of: window.top
                            });

                            /*let lastHeight = $htmlBlock.height()
                            new ResizeObserver(() =>{
                                    if (Math.abs($htmlBlock.height() - lastHeight) > 50){
                                        $AIBlock.height((lastHeight = $htmlBlock.height()) - 45)
                                    }
                                }).observe($htmlBlock.get(0))*/

                            const sendMessage = window.AIINtegrate($Block.find('.AI-Dialog').get(0), $Block.find('textarea').get(0), $Block.find('button[name="send"]').get(0), $Block.find('button[name="stop"]').get(0), $Block.find('button[name="new"]').get(0), undefined)

                        }
                    })
                })

            }).fail(() => {
                if (host !== 'https://docs.totum.online/') {
                    get('https://docs.totum.online/')
                }
            })
        }
        get(App.translate('PATH-TO-DOCUMENTATION'));


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