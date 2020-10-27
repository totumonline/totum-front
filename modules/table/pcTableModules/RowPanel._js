App.pcTableMain.prototype._addRowPanel = function (panelId, row, buttons) {
    var panel = $('<div style="width: 165px;"><div class="buttons insert-row-buttons"></div></div>');
    if (buttons !== undefined) {
        var buttonsDiv = panel.find('.buttons').empty();
        $.each(buttons, function (text, $var) {
            if (typeof $var == 'function') {
                var btn = $('<button class="btn btn-sm btn-default">')
                    .html(text)
                    .on('click', $var);
            } else {
                if (typeof $var == 'object') {
                    if ($var.type == 'checkbox') {
                        btn = $('<input type="checkbox">');
                        if ($var.id) {
                            btn.attr('id', $var.id);
                        }
                        if ($var.func) {
                            btn.on('change', $var.func);
                        }
                        btn=btn.wrap('<span style="font-size: 10px; padding-left: 8px;" >').parent().append(' <span style="padding-top: 2px;">'+text+'</span>');
                    }
                }
            }
            buttonsDiv.append(' ');
            buttonsDiv.append(btn)
        })
    }
    row.on('remove', function () {
        panel.remove();
    });

    let pcTable = this;
    setTimeout(function () {
        let params = {
            'isParams': true,
            '$text': panel,
            'element': row,
            'container': pcTable._container,
            'placement': 'bottom',
            'trigger': 'manual'
        };
        App.popNotify(params);
        let popoverId = row.attr('aria-describedby');
        let popover = $('#' + popoverId).addClass('warning-bg');
        popover.find('.arrow').css('left', '80%');
       pcTable._positionPanel.call(pcTable, popover, row);
        panel.show()
    }, 50);

    return panel;

};
App.pcTableMain.prototype._positionPanel = function (panel, row) {
    let p = row.position();
    let left = this.tableWidth-120;
    if (this._innerContainer.width()>this.tableWidth){
        panel.css({left: left})
    }else{
        panel.css({left: this._innerContainer.width()-120})
    }

    /*if (this._innerContainer.width()>this.tableWidth){
        return panel.position({
            my: "right top",
            at: "right+2px bottom+"+12+"px",
            of: row
        })
    }else{
        return panel.position({
            my: "right top",
            at: "right+2px top+"+(p.top+47)+"px ",
            of: this._innerContainer
        })
    }*/

};