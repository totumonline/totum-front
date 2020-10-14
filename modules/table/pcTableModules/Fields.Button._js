fieldTypes.button = {
    icon: 'fa-hand-pointer-o',
    getPanelText: function (fieldValue, td, item) {
        let $btn = this.getCellText(fieldValue, td, item);
        $btn.on('click', () => {
            this.pcTable.selectedCells.empty();
            this.pcTable.selectedCells.selectPanelDestroy();
            this.pcTable._buttonClick(td, this, item);
            return false;
        })
        $btn.wrap('<div>');
        return $btn.parent();
    },
    getCellText: function (fieldValue, td, item) {
        let field = this, format = {};
        if (this.category === 'column') {
            if (item.id) {
                format = $.extend({}, (field.pcTable.f || {}), (item.f || {}), (item[field.name].f || {}));
            } else {
                format.block = true;
                if(item[field.name] && item[field.name].f && item[field.name].f.icon){
                    format.icon = item[field.name].f.icon;
                }
            }
        } else {
            format = $.extend({}, (field.pcTable.f || {}), (item[field.name].f || {}));
        }
        if (td) {
            td.addClass('cell-button');
        }
        const NoBorderColorizer = function (btn) {
            if (field.td_style && typeof field.td_style === 'function') {
                let btnStyle = field.td_style(format).Button;
                if (btnStyle) {
                    btn.css(btnStyle);
                }
            } else if (field.pcTable.isMobile && field.category!=='column') {
                let css = {};
                if (format.background) {
                    css.backgroundColor = format.background;
                }
                if (format.color) {
                    css.color = format.color;
                }
                btn.css(css)
            }
        };


        if (format.block || (!this.pcTable.control.editing && !this.pressableOnOnlyRead)) {
            let btn = $('<button class="btn btn-default btn-xxs button-field" tabindex="-1" disabled>').text(this.buttonText || '');
            NoBorderColorizer(btn);
            if (format.text) {
                btn.text(format.text)
            }


            if (format.comment) {
                let i;
                i = $('<i class="cell-icon fa fa-info"></i>');
                btn.prepend(i);
                i.attr('title', format.comment)
            } else if (format.icon) {
                let icon = $('<i class="cell-icon fa fa-' + format.icon + '"></i>');
                btn.prepend(icon);
                if (btn.text() === "") {
                    btn.css('text-align', 'center');
                    icon.css('float', 'none');
                }
            }

            return btn;
        }


        let btn = $('<button class="btn btn-default btn-xxs button-field" tabindex="-1">').text(this.buttonText || '');
        NoBorderColorizer(btn);
        if (format.text) {
            btn.text(format.text)
        }
        if (format.comment) {
            let i;
            i = $('<i class="cell-icon fa fa-info"></i>');
            btn.prepend(i);
            i.attr('title', format.comment)
        } else if (format.icon) {
            let icon = $('<i class="cell-icon fa fa-' + format.icon + '"></i>');
            btn.prepend(icon);
            if (btn.text() === "") {
                btn.css('text-align', 'center');
                icon.css('float', 'none');
            }
        }


        return btn;
    },
    btnOK: function ($td, item) {
        let btn = $td.find('button.button-field');
        let field = this;
        btn.text('Выполнено');
        $td.data('clicked', true);

        setTimeout(function () {
            $td.removeData('clicked');
            btn.replaceWith(field.getCellText.call(field, item[field.name], $td, item));
        }, BUTTONS_TIMEOUT)
    }
};