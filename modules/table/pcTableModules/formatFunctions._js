App.pcTableMain.prototype.__formatFunctions = {
    interlace: function (firstStart) {
        
        if (firstStart && !this.f.interlace) return;
        let interlaceStyle = $('#ttmTableStyles').length ? $('#ttmTableStyles') : $('<style>').attr('id', 'ttmTableStyles').appendTo(this._container);

        let colors=this.f.interlace.split('/');
        let text='';
        colors.forEach((v, i)=>{
            if(v.match(/\#?[0-0A-F]+/i)){
                if(i==0){
                    text+=' tr.DataRow:nth-child(odd) td {background-color: '+v+';}'
                }else{
                    text+=' tr.DataRow:nth-child(even) td {background-color: '+v+';}'
                }
            }
        })
        interlaceStyle.text(text)

    },
    fieldhide: function () {
        if (this.f && this.f.fieldhide && Object.keys(this.f.fieldhide).length) {
            this.loadVisibleFields(this.f.fieldhide);
        }
    },
    kanban_html: function () {
        this._refreshContentTable();
    },
    blockadd: function () {
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
        this._rowsButtons();
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