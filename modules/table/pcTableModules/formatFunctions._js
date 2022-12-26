App.pcTableMain.prototype.__formatFunctions = {
    interlace: function (firstStart) {

        if (firstStart && !this.f.interlace) return;
        let interlaceStyle = $('#ttmTableStyles').length ? $('#ttmTableStyles') : $('<style>').attr('id', 'ttmTableStyles').appendTo(this._container);

        let text = '';
        if (this.f.interlace.toString().match(/^[0-9]{1,3}$/) && parseInt(this.f.interlace) <= 100) {
            text += ' tr.DataRow:nth-of-type(odd) td {box-shadow: inset 0 0 100px 100px rgba(0,0,0,' + (parseInt(this.f.interlace) / 100) + ')}'
        } else {
            let colors = this.f.interlace.split('/');
            colors.forEach((v, i) => {
                if (v.match(/\#?[0-9A-F]+/i)) {
                    if (i == 1) {
                        text += ' tr.DataRow:nth-of-type(odd) td {background-color: ' + App.theme.getColor(v) + ';}'
                    } else {
                        text += ' tr.DataRow:nth-of-type(even) td {background-color: ' + App.theme.getColor(v) + ';}'
                    }
                }
            })
        }
        interlaceStyle.text(text)

    },
    fieldhide: function () {
        if (this.f && this.f.fieldhide && Object.keys(this.f.fieldhide).length) {
            this.loadVisibleFields(this.f.fieldhide);
            this._refreshHead();
            this._refreshContentTable(true);
        }
    },
    kanban_html: function () {
        this._refreshContentTable();
    },
    blockadd: function () {
        this._closeInsertRow();
        this._rowsButtons();
    }, hideadd: function () {
        this._closeInsertRow();
        this._rowsButtons();
    },
    tablecomment: function () {
        this._rowsButtons();
    },
    browsertitle: function () {
        this._setBrowserTitle();
    },
    buttons: function () {
        this._rerendParamsblock();
        this._rerendBottomFoolers();
        this._rerenderColumnsFooter();
        this._rowsButtons();
    },
    topbuttons: function () {
        let btns = this._beforeSpace_title.find('.common-table-title');
        if(this.f.topbuttons === false){
            if(this.isCreatorView){
                btns.addClass('admin-hidden')
            }else{
                btns.hide()
            }
        }else{
            if(this.isCreatorView){
                btns.removeClass('admin-hidden')
            }else{
                btns.show()
            }
        }
    },
    blockorder: function () {
        this._refreshHead();
    },
    block: function () {
        this._refreshParamsBlock();
        this._refreshContentTable(true);
        this._refreshFootersBlock();
    }, tabletitle: function () {
        this._refreshTitle();
    },
    tabletext: function () {
        this._refreshTableText();
    }
    , text: function () {
        this._refreshTableText();
    }
    , rowstitle: function () {
        this._container.find('.pcTable-rowsTitle:first').replaceWith(this._createRowsTitle());
    }, fieldtitle: function (newvals, oldVals) {
        let categories = {};

        const getCat = function (field) {
            return field.category == 'footer' && field.column ? 'tableFooter' : field.category;
        };

        for (const fieldName in newvals) {
            if (this.fields[fieldName] && newvals[fieldName] !== oldVals[fieldName]) {
                categories[getCat(this.fields[fieldName])] = true;
            }
        }
        for (const fieldName in oldVals) {
            if (this.fields[fieldName] && newvals[fieldName] !== oldVals[fieldName]) {
                categories[getCat(this.fields[fieldName])] = true;
            }
        }
        for (const category in categories) {
            switch (category) {
                case 'param':
                    this._rerendParamsblock();
                    break;
                case 'filter':
                    this._rerendFiltersBlock();
                    break;
                case 'column':
                    this._refreshHead();
                    break;
                case 'footer':
                    this._rerendBottomFoolers();
                    break;
                case 'tableFooter':
                    this._rerenderColumnsFooter();
                    break;
            }
        }
    },
};