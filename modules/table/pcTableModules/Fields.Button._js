fieldTypes.button = {
    icon: 'fa-hand-pointer-o',
    required: false,
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
            } else if (!this.buttonActiveOnInsert) {
                format.block = true;
                if (item[field.name] && item[field.name].f && item[field.name].f.icon) {
                    format.icon = item[field.name].f.icon;
                }
            } else {
                format = $.extend({}, (item[field.name].f || {}));
            }
        } else {
            format = $.extend({}, (field.pcTable.f || {}), (item[field.name].f || {}));
        }
        if (td) {
            td.addClass('cell-button');
        }


        const NoBorderColorizer = (btn) => {
            if (field.td_style && typeof field.td_style === 'function') {
                let btnStyle = field.td_style(format).Button;
                if (btnStyle) {
                    btn.css(btnStyle);
                }
            } else if (item.__td_style && typeof item.__td_style === 'function') {
                let style = item.__td_style(format);
                if (style.Button) {
                    btn.css(style.Button);
                }
                if (style.td) {
                    td.css(style.td);
                }
            } else if (td && td.is('.button-wrapper')) {
                let css = {};
                if (format.background) {
                    css.backgroundColor = format.background;
                }
                if (format.color) {
                    css.color = format.color;
                }
                btn.css(css)

                let width;
                if (this.pcTable.isMobile) {
                    width = this.width > $('#table').width() - 30 ? $('#table').width() - 30 : this.width;
                    td.width(width);
                    btn.width(width);
                } else {
                    this.pcTable.rowButtonsCalcWidth();
                    width = this.width > this.pcTable.__$rowsButtons.width() - 10 ? this.pcTable.__$rowsButtons.width() - 10 : this.width;
                    td.width(width);
                    btn.width(width);
                    if (width === 20) {
                        setTimeout(() => {
                            this.pcTable.rowButtonsCalcWidth();
                            width = this.width > this.pcTable.__$rowsButtons.width() - 20 ? this.pcTable.__$rowsButtons.width() - 20 : this.width;
                            td.width(width);
                            btn.width(width - 16);
                        }, 40)
                    }
                }
            } else if (field.pcTable.isMobile && field.category !== 'column') {
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


            if (format.comment && !td.is('.cell')) {
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
        if (format.comment && !td.is('.cell')) {
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
    getEditElement: function ($oldInput, oldValue, item, enterClbk, escClbk, blurClbk, tabindex) {
        var $input = this.getCellText(undefined, undefined, item);
        if (typeof tabindex !== 'undefined') $input.attr('tabindex', tabindex);

        let clicked = false;
        const clickFunc = (event) => {
            if (clicked) return;
            clicked = true;
            let html = $input.html();
            $input.html('<i class="fa fa-spinner"></i>');
            this.pcTable.model.doAfterProcesses(() => {
                this.pcTable.model.click({
                    item: this.pcTable._insertRowHash,
                    fieldName: this.name
                }).then(() => {
                    $input.html(html);
                    clicked = false;
                    enterClbk($input, event, true)
                })
            })
        };
        $input.on('click', clickFunc).removeClass('btn-xxs').addClass('btn-sm text-edit-button').on('keydown', (event) => {
            switch (event.key) {
                case 'Tab':
                    enterClbk($input, event);
                    break;
                case 'Enter':
                    enterClbk($input, clickFunc);
                    break;
            }
        })

        return $input;
    },
    btnOK: function ($td, item) {
        let btn = $td.find('button.button-field');
        let field = this;
        btn.text(App.translate('Done'));
        $td.data('clicked', true);

        setTimeout(function () {
            if ($td.length)
                $td.removeData('clicked');
            if (item) {
                btn.replaceWith(field.getCellText.call(field, item[field.name], $td, item));
            }
        }, BUTTONS_TIMEOUT)
    }
};