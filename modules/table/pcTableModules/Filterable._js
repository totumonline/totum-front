App.pcTableMain.prototype.filters = {};


App.pcTableMain.prototype.__getFilterButton = function (fieldName) {
    var colorClass = 'btn-default';
    var isFilters = (this.filters[fieldName] && this.filters[fieldName].length) || this.filters[fieldName + "/h"];
    if (isFilters) colorClass = 'btn-warning';
    var btn = $('<button class="btn btn-xxs btn-filter"><span class="fa fa-filter"></span></button>').addClass(colorClass);

    let pcTable = this;

    return $('<span class="filter-in-head">').append(btn);
};
App.pcTableMain.prototype.filtersEmpty = function () {
    this.filters = {};
    this._refreshHead();
    this.__applyFilters();
};
App.pcTableMain.prototype.sessionStorageFilters = {
    url: location.protocol + '//' + location.host + location.pathname,
    setFilters: function (filters) {
        let sessionFilters = {};
        filters = filters || {};
        try {
            sessionFilters = JSON.parse(sessionStorage.getItem('pcTableFilters')) || {};
        } catch (error) {

        }
        sessionFilters[this.url] = filters;
        sessionStorage.setItem('pcTableFilters', JSON.stringify(sessionFilters));
    },
    getFilters: function () {
        let sessionFilters = {};

        try {
            sessionFilters = JSON.parse(sessionStorage.getItem('pcTableFilters'));
            sessionFilters = sessionFilters[this.url] || {};
        } catch (error) {

        }
        return sessionFilters;
    }
};
let isFirstStart = true;
App.pcTableMain.prototype.__applyFilters = function (forse = false) {
    let pcTable = this;
    App.fullScreenProcesses.show();

    if (this.filtersClearButton) {
        if (pcTable.tableRow['type'] !== "tmp") {
            this.sessionStorageFilters.setFilters(this.filters);
        }
        if (this.selectedCells)
            this.selectedCells.empty();

        if (Object.equals(this.filters, {})) {
            this.filtersClearButton.addClass('btn-default').removeClass('btn-warning').attr('disabled', true)
        } else {
            this.filtersClearButton.removeClass('btn-default').addClass('btn-warning').removeAttr('disabled');
            if (isFirstStart) {
                App.blink(pcTable.filtersClearButton, 8, '#fff');
                isFirstStart = false;
            }
        }
    }


    let old = [];
    if (!this.isTreeView) {
        old = this.dataSortedVisible.slice();
    }
    let new_ = [];
    let new_check = [];

    if (this.isTreeView) {
        if (this.filters && Object.keys(this.filters).length) {

            let expands = [];
            this.dataSorted.forEach((v) => {
                if (typeof v === 'object' && !v.opened) {
                    expands.push(v)
                }
            })
            expands.forEach((v) => {
                this._expandTreeFolderRow(v, true)
            })
            for (let i = 0; i < this.dataSorted.length; i++) {
                let element = this.dataSorted[i];
                let row = element.row;
                if (typeof element !== 'object') {
                    row = this.data[element];
                }
                if (row && this.__applyFiltersToItem(row)) {
                    let parents = [];


                    let ip = i - 1;
                    while (typeof this.dataSorted[ip] !== 'object') {
                        ip--;
                    }
                    let p;
                    if (typeof element === 'object') {
                        p = element.p
                    } else {
                        parents.push(this.dataSorted[ip]);
                        p = this.dataSorted[ip].p;
                    }

                    while (p && ip) {
                        while (typeof this.dataSorted[ip] !== 'object') {
                            ip--;
                        }
                        if (this.dataSorted[ip] === this.getElementInTree(p)) {
                            parents.push(this.dataSorted[ip])
                            p = this.dataSorted[ip].p;
                        }
                        ip--;
                    }
                    while (parents.length) {
                        new_.push(parents.pop());
                    }
                    new_.push(element);
                }
            }

        } else {
            this.dataSorted.forEach((v) => {
                new_.push(v);
            })
        }
    } else {
        for (let i = 0; i < this.dataSorted.length; i++) {
            let element = this.dataSorted[i];
            let item = this.data[element];
            this.__applyFiltersToItem(item);
            if (item.$visible) {
                new_.push(element);
                new_check.push(element);
            }
        }
    }


    if (this.isTreeView || forse || JSON.stringify(old) !== JSON.stringify(new_check)) {
        this.dataSortedVisible = new_;
        this._refreshContentTable(false, true);
        this._headCellIdButtonsState();
    }
    this.selectedCells && this.selectedCells.summarizer.check();
    App.fullScreenProcesses.hide();
};
App.pcTableMain.prototype.__applyFiltersToItem = function (item) {
    let pcTable = this;
    let visible = true;

    for (let fieldName in pcTable.filters) {
        if (!pcTable.filters[fieldName] || pcTable.filters[fieldName].length === 0) continue;

        let filterVals = pcTable.filters[fieldName];
        if (fieldName === 'id') {
            if (filterVals.indexOf(item['id'].toString()) === -1) {
                visible = false;
            }
        } else {
            let lst = fieldName.toString().split("/");
            fieldName = lst[0];

            if (!pcTable.fields[fieldName]) continue;

            let type = lst[1] || "v";
            switch (type) {
                case "v":
                    let field = pcTable._getFieldbyName(fieldName);
                    if (!field.checkIsFiltered(item[fieldName], filterVals)) {
                        visible = false;
                    } else {
                        field.checkIsFiltered(item[fieldName], filterVals)
                    }
                    break;
                case "h":
                    switch (filterVals) {
                        case 'h':
                            if (item[fieldName].h !== true) {
                                visible = false;
                            }
                            break;
                        case 'n':
                            if (item[fieldName].h === true) {
                                visible = false;

                            }
                            break;
                        case 'hf':
                            if (!(item[fieldName].h === true
                                && !item[fieldName].hasOwnProperty("c"))) {
                                visible = false;
                            }
                            break;
                        case 'hc':
                            if (!(item[fieldName].h === true
                                && item[fieldName].hasOwnProperty("c"))) {
                                visible = false;
                            }
                            break;

                    }
            }
        }
        if (!visible) break;
    }
    if (!(item.$visible = visible)) {
        this.row_actions_uncheck(item);
    }
    return item.$visible;
};
App.pcTableMain.prototype.addValueToFilters = function (fieldName, valObj) {
    const pcTable = this;
    if (!pcTable.filters[fieldName]) pcTable.filters[fieldName] = [];
    let field = pcTable.fields[fieldName];
    pcTable.filters[fieldName].push(...field.getFilterDataByValue.call(field, valObj));
    if (field.$th) {
        field.$th.find('.btn-filter').parent().replaceWith(pcTable.__getFilterButton.call(pcTable, fieldName));
    }
    pcTable.__applyFilters.call(pcTable);
};
App.pcTableMain.prototype.isValInFilters = function (fieldName, valObj) {
    const pcTable = this;
    if (!pcTable.filters[fieldName]) return false;
    let field = pcTable.fields[fieldName];
    let val = field.getFilterDataByValue.call(field, valObj);

    return pcTable.filters[fieldName].some((v) => {
        return val.indexOf(v) !== -1;
    });
};
App.pcTableMain.prototype.removeValueFromFilters = function (fieldName, valObj) {

    const pcTable = this;
    if (!pcTable.filters[fieldName]) pcTable.filters[fieldName] = [];
    let field = pcTable.fields[fieldName];

    let val = field.getFilterDataByValue.call(field, valObj);
    let spliced = 0;
    let newFiled = [...pcTable.filters[fieldName]];
    pcTable.filters[fieldName].forEach((v, i) => {
        if (val.indexOf(v) !== -1) {
            newFiled.splice(i - spliced, 1);
            spliced++;
        }
    })

    pcTable.filters[fieldName] = newFiled;

    if (pcTable.filters[fieldName].length === 0) {
        delete pcTable.filters[fieldName];
    }


    if (field.$th) {
        field.$th.find('.btn-filter').parent().replaceWith(pcTable.__getFilterButton.call(pcTable, fieldName));
    }
    pcTable.__applyFilters.call(pcTable);

};
App.pcTableMain.prototype.loadFilters = function () {
    var filters = {};
    if (this.tableRow['type'] != "tmp")
        filters = this.sessionStorageFilters.getFilters();
    if (filters)
        this.filters = filters;
    else this.filters = {};
}
App.pcTableMain.prototype.__addFilterable = function () {
    const pcTable = this;

    this.loadFilters();

    /*!panelView*/
    if (!this.viewType) {
        this._header.on('click', '.pcTable-filters > span button.btn-filter:not(#checkS)', function (event) {

            let btn = $(this);
            if (btn.attr('aria-describedby')) return true;

            let th = btn.closest('th');
            let fieldName = th.is('.id') ? 'id' : th.data('field');

            let selectDiv = $('<div class="filter-div-button">');
            let select = $('<select class="selectpicker" data-size="6" multiple title="'+App.translate("Select values")+'" data-style="btn-sm btn-default" data-width="css-width" data-live-search="true" data-selected-text-format="count">').appendTo(selectDiv);

            const popoverDestroy = function () {
                try {
                    btn.popover('destroy');
                } catch (e) {

                }
            };

            const setSelectedFilters = function () {
                popoverDestroy();
                if (!select.data('add-options')) {
                    vals = select.selectpicker('val');
                } else {
                    vals = select.data('add-options');
                    select.data('add-options', null);
                }
                let j1 = JSON.stringify(pcTable.filters[fieldName] || []);
                let j2 = JSON.stringify(vals);
                if (j1 !== j2) {
                    pcTable.filters[fieldName] = vals;
                    if (pcTable.filters[fieldName].length === 0) delete pcTable.filters[fieldName];
                    if (fieldName === 'id' && !btn.closest('.pcTable-table').is(".pcTable-table:first")) {
                        pcTable._header.find('th.id .btn-filter').parent().replaceWith(pcTable.__getFilterButton.call(pcTable, fieldName));
                    }
                    btn.parent().replaceWith(pcTable.__getFilterButton.call(pcTable, fieldName));
                    pcTable.__applyFilters.call(pcTable);
                }

            };
            const filterRemove = function () {
                popoverDestroy();

                delete pcTable.filters[fieldName];
                btn.removeClass('btn-warning').addClass('btn-default');
                pcTable.__applyFilters.call(pcTable);
            };

            let isDeleteAction = false;
            let objTimeout;

            const actionIt = function (actionName) {
                if (objTimeout) clearTimeout(objTimeout);

                if (isDeleteAction) return;
                if (actionName === 'filterRemove') {
                    isDeleteAction = true;
                    filterRemove();
                    return;
                }
                if (actionName === 'setInvertFilters') {
                    let selected = Object.values(select.selectpicker('val'));
                    let newSelected = [];

                    $.each(select.data('options'), function (k, v) {
                        if (selected.indexOf(v) === -1) {
                            newSelected.push(v);
                        }
                    });
                    select.data('add-options', newSelected)
                }
                objTimeout = setTimeout(function () {
                    setSelectedFilters();
                }, 10);
            };


            selectDiv = $('<div class="pcTable-filter-select" style="height: 220px;">').append(selectDiv);
            select.data('container', selectDiv);

            var vals = {};

            if(pcTable.isTreeView){
                Object.values(pcTable.data).forEach(function (row) {
                    if (fieldName === 'id') {
                        vals[row.id.toString()] = row.id.toString();
                    } else {
                        pcTable.fields[fieldName].addDataToFilter(vals, row[fieldName]);
                    }
                });
            }else{
                Object.values(pcTable.dataSorted).forEach(function (_id) {
                    if (fieldName === 'id') {
                        vals[_id.toString()] = _id.toString();
                    } else {
                        pcTable.fields[fieldName].addDataToFilter(vals, pcTable.data[_id][fieldName]);
                    }
                });
            }


            var filterOptions = {};

            $.each(vals, function (k, v) {
                filterOptions[v] = k;
            });
            filterOptions = App.ksort(filterOptions);


            let optgroups = {};

            let cutLength = 100;

            let filterVal = pcTable.filters[fieldName] ? [...pcTable.filters[fieldName]] : [];
            let chousenVisible = 0;

            const randOptions = function (q) {
                optgroups = {[App.translate('Selected')]: $('<optgroup label="'+App.translate('Selected')+'">'), '': $('<optgroup label="">')};

                let isLikedFunc = function () {
                    return true;
                };
                if (q && q !== '') {
                    let qs = q;

                    [qs] = App.lang.search_prepare_function(qs);

                    qs=qs.split(" ");
                    isLikedFunc = function (v) {
                        let text;
                        if(v === null){
                            text="";
                        }else{
                            text = v.toString();
                            [text] = App.lang.search_prepare_function(text);
                        }


                        return !qs.some(function (q) {
                            return text.indexOf(q) === -1
                        })
                    }
                }
                let isCutted = false;
                let notChoised = 0;

                $.each(filterOptions, function (k, v) {
                    if (k === 'null') k = 'null ';

                    if (filterVal.indexOf(v.toString()) !== -1) {
                        let isVisible = isLikedFunc(k);
                        optgroups[App.translate('Selected')].append('<option data-content="' + k + '" ' + (isVisible ? '' : 'style="display: none"') + '>' + v + '</option>');
                        chousenVisible += isVisible ? 1 : 0;
                    } else {
                        if (!isLikedFunc(k)) return true;

                        if (notChoised >= cutLength) {
                            isCutted = true;
                        } else {
                            optgroups[''].append('<option data-content="' + k + ' ">' + v + '</option>');
                            notChoised++;
                        }
                    }
                });
                select.empty();
                if (!chousenVisible) {
                    optgroups[App.translate('Selected')].attr('label', '');
                }
                select.append(optgroups[App.translate('Selected')]);
                select.append(optgroups['']);
                if (isCutted) {
                    select.append('<option data-content="'+App.translate('The data is incomplete. Use the search!')+'" disabled = disabled style="text-align: center; cursor: pointer">0</option>');
                }
                select.data('options', filterOptions);
                select.selectpicker('val', filterVal);
                select.selectpicker('refresh');
            };

            select.on('change.bs.select', function () {
                filterVal = select.val();
            });
            randOptions();

            let popover = btn.popover({
                html: true,
                content: selectDiv,
                trigger: 'manual',
                container: pcTable._container,
                placement: 'auto bottom',
                template: '<div class="popover" role="tooltip" style=""><div class="arrow" style="left: 50%;"></div><div class="popover-content" style=" padding: 3px 5px;"></div></div>'
            });

            select.selectpicker('render').selectpicker('toggle');

            btn.one('remove', () => {
                setTimeout(() => {
                    let $p;
                    if (popover && popover.length && popover.attr('aria-describedby') && ($p = $('#' + popover.attr('aria-describedby')))) {
                        $p.remove();
                    }
                }, 10)
            })


            let $buttons = $('<div class="buttons" style="position: absolute; bottom: -10px; width: 100%; text-align: center">');

            $('<span class="btn btn-default btn-xxs button-ok" style="margin-right: 4px; margin-top: 3px;">'+App.translate('ApplyShort')+'</span></span>').appendTo($buttons).on('click', function () {
                actionIt('setSelectedFilters');
            });
            $('<span class="btn btn-default btn-xxs button-ok" style="margin-right: 4px; margin-top: 3px;">'+App.translate('InvertShort')+'</span></span>').appendTo($buttons).on('click', function () {
                actionIt('setInvertFilters');
            });
            $('<span class="btn btn-default btn-xxs button-ok" style="margin-right: 4px; margin-top: 3px">'+App.translate('CancelShort')+'</span>').appendTo($buttons).on('click', function () {
                actionIt('filterRemove');
            });


            if (pcTable.fields[fieldName] && pcTable.fields[fieldName].code && !pcTable.fields[fieldName].codeOnlyInAdd) {
                let h_select = $('<select data-title="'+App.translate('All')+'" data-dropup-auto="false" class="dropup" data-container=".popover" data-style="btn btn-xxs filter-by-hand '
                    + (pcTable.filters[fieldName + "/h"] ? 'btn-warning' : 'btn-default') + ' ">' +
                    '<option value="">'+App.translate('All')+'</option>' +
                    '<option value="n">'+App.translate('Without hand')+'</option>' +
                    '<option value="h">'+App.translate('With hand all')+'</option>' +
                    '<option value="hf">'+App.translate('With hand equals calc')+'</option>' + //<i class="fa fa-hand-rock-o pull-right"></i>
                    '<option value="hc">'+App.translate('With hand different')+'</option>' + //<i class="fa fa-hand-paper-o pull-right"></i>
                    '</select>')
                    .appendTo($buttons)
                    .on('change', function () {
                        pcTable.filters[fieldName + "/h"] = h_select.selectpicker('val');
                        if (pcTable.filters[fieldName + "/h"] === "") {
                            delete pcTable.filters[fieldName + "/h"];
                        }
                        popoverDestroy();
                        btn.parent().replaceWith(pcTable.__getFilterButton.call(pcTable, fieldName));
                        pcTable.__applyFilters.call(pcTable);
                        return false;
                    })
                    .wrap('<span id="filterHand">');

                setTimeout(function () {
                    h_select.selectpicker('render').selectpicker("val", pcTable.filters[fieldName + "/h"] || "");
                    try {
                        h_select.data('selectpicker').$menu.offset({
                            bottom: 15,
                            left: -90
                        }).css('border', '1px solid grey');
                    } catch (e) {

                    }
                }, 100)
            }

            if (pcTable.PageData && pcTable.PageData.onPage && pcTable.PageData.allCount > pcTable.PageData.onPage) {
                if (chousenVisible)
                    selectDiv.height(260)
                else
                    selectDiv.height(220)
                $buttons.append('<div class="text-center ttm-paging-danges">'+App.translate('Filtering by current page')+'</div>');
            } else {
                if (chousenVisible)
                    selectDiv.height(220)
                else
                    selectDiv.height(200)
            }
            $buttons.appendTo(selectDiv);

            select.on('hidden.bs.select', function () {
                actionIt('setSelectedFilters');
            });

            if (pcTable.filters[fieldName]) select.selectpicker('val', pcTable.filters[fieldName]);

            setTimeout(function () {

                if (popover && popover.length) {
                    popover.popover('show');
                    selectDiv.on('mouseenter', 'li', function () {
                        let self = $(this);
                        if (!self.attr('title')) {
                            self.attr('title', self.text());
                        }
                    });

                    if (fieldName === 'id') {
                        $('#' + btn.attr('aria-describedby')).position({
                            my: "left top",
                            at: "left-3px bottom+10px",
                            of: btn
                        }).find('.arrow').css('left', '12px')
                    }
                    select.data('selectpicker')._searchStyle = function () {
                        return 'multiincludes';
                    };



                    let searchTimeout;

                    select.data('selectpicker').$searchbox.off().on('click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api', function (e) {
                        e.stopPropagation();
                    });

                    select.data('selectpicker').$searchbox.on('keydown', function (e) {
                        if (e.key === 'Escape') {
                            select.data('selectpicker').$button.click();
                            return true;
                        }
                    });
                    let Q = '';
                    select.data('selectpicker').$searchbox.on('keyup', function (e) {
                        let q = $(this).val();
                        if (Q !== q) {
                            Q = q;
                            if (searchTimeout) {
                                clearTimeout(searchTimeout)
                            }
                            searchTimeout = setTimeout(function () {
                                randOptions(Q);
                            }, 750);
                        }
                    });

                    pcTable._container.on('click.filter filterPressed.filter', function (e) {
                        if ($(e.target).closest("#filterHand").length === 0 && (e.type === "filterPressed" || e.altKey !== undefined) && $('#' + btn.attr('aria-describedby')).is(':visible')) { //Это чтобы не отлавливать всякие технические события
                            pcTable._container.off('.filter');
                            actionIt('setSelectedFilters');
                        }
                    });
                    pcTable._innerContainer.one('scroll.filter', function (e) {
                        if ($('#' + btn.attr('aria-describedby')).is(':visible')) {
                            pcTable._container.off('.filter');
                            actionIt('setSelectedFilters');
                        }
                    });

                    select.data('selectpicker').$searchbox.focus();
                }
            }, 50);
            pcTable._container.trigger('filterPressed');
        });
    }
};

