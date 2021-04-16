(function () {

    App.pcTableMain.prototype.fixColumn = function (name) {

        if (this.fixedColumn) {
            this._innerContainer.off('scroll.fixed-column');
            this._container.off('scrolled.fixed-column');
            this._innerContainer.find('.fixed-column').remove();

        }

        if (name) {

            setTimeout(() => {
                let pcTable = this;
                let div = $('<tbody class="fixed-column"></tbody>');
                let timeout;
                let attached;

                const func = () => {

                    let $th = pcTable.fields[name].$th;
                    let i = $th.index();
                    let width = $th.outerWidth();
                    let fieldOffset = $th.offset().left;


                    div.width(width);
                    div.css('max-height', pcTable._innerContainer.height());

                    let left = false;

                    if ((left = fieldOffset - pcTable._innerContainer.offset().left + 5 < width * -1) || (fieldOffset - pcTable._innerContainer.offset().left + 5) > pcTable._innerContainer.width()) {
                        if (!attached) {
                            attached = true;
                            div.appendTo(this._innerContainer.find('.pcTable-table:first'));
                        }

                        /*Левая колонка*/
                        if (left) {
                            div.css('left', pcTable._innerContainer.scrollLeft());
                        } else {
                            div.css('left', pcTable._innerContainer.scrollLeft() + pcTable._innerContainer.width() - width + 70);
                        }


                        let column = $('<div>');
                        pcTable._innerContainer.find('.pcTable-table:first tbody.dataRows tr').each(function () {
                            let tr = $(this);
                            if (tr.is('.loading-row')) {
                                let cl = tr.clone();
                                column.append(cl);
                            } else {
                                let td = $(tr.find('td')[i]);
                                if(td.length){
                                    column.append(td.clone(true));
                                }else{
                                    column.append('<td></td>');
                                }
                            }
                        })
                        let clTh = $('<th class="top-head"></th>').text($th.find('.cell-title').clone().children().remove().end().text()).height($th.outerHeight());
                        div.css({'padding-top': $th.outerHeight() + 1});
                        clTh.css('top', pcTable._innerContainer.offset().top > 0 ? 0 : -1 * (pcTable._innerContainer.offset().top - 70))
                        div.empty().append(clTh).append(column)
                    } else {
                        div.detach();
                        attached = false;
                    }


                };

                pcTable._innerContainer.on('scroll.fixed-column', () => {
                    if (timeout) clearTimeout(timeout);
                    timeout = setTimeout(func, 200)
                })
                pcTable._container.on('scrolled.fixed-column', () => {

                    if (timeout) clearTimeout(timeout);
                    timeout = setTimeout(func, 200)
                })
            }, 50)

        }
        this.fixedColumn = name;

        this._refreshHead();
        this._refreshContentTable();
    };

})();