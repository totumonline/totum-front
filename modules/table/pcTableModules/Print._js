App.pcTableMain.prototype._print = function () {
    "use strict";
    let $printSettings = $('<div class="hidding-form">');

    const isAnyPrinfField = function (field) {
        if (field.showMeWidth) return true;
    };

    if (this.fieldCategories.param.length && this.fieldCategories.param.some(isAnyPrinfField)) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="params" class="form-check-input" checked="checked"> '+App.translate('Parameters')+'</label></div>');
    }
    if (this.fieldCategories.filter.length)
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="filters" class="form-check-input" checked="checked"> '+App.translate('Filters')+'</label></div>');
    if (this.fieldCategories.column.length && this.fieldCategories.column.some(isAnyPrinfField) && this.dataSortedVisible.length) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="rows" class="form-check-input" checked="checked"> '+App.translate('Rows part')+'</label></div>');
        $printSettings.append('<div class="form-check no-bold" style="padding-left: 20px;"><label class="form-check-label"><input type="checkbox" name="with-id" class="form-check-input"> '+App.translate('with id')+'</label></div>');
    }

    if (this._footersBlock.find('.val').length) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="column-footers" class="form-check-input" checked="checked"> '+App.translate('Column footers')+'</label></div>');
    }
    if (this._footersSubTable.find('.val').length) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="other-footers" class="form-check-input" checked="checked"> '+App.translate('Out of column footers')+'</label></div>');
    }

    let pcTable = this;
    let buttons = [
        {
            label: App.translate('Print'),
            action: function (dialogRef) {
                let settings = [];
                $printSettings.find('input:checked').each(function () {
                    settings.push($(this).attr('name'));
                });
                dialogRef.close();
                pcTable._printTable.call(pcTable, settings);
            }
        },
        {
            label: App.translate('Cancel'),
            action: function (dialogRef) {
                dialogRef.close();
            }
        }
    ];

    window.top.BootstrapDialog.show({
        message: $printSettings,
        type: null,
        title: App.translate('Print'),
        buttons: buttons,
        draggable: true
    })
};
App.pcTableMain.prototype._printTable = function (settings){

    let pcTable = this;
    let settingsObject = {
        fields: {}
    };
    if (settings.indexOf('with-id') !== -1)
        settingsObject.fields.id = 50;

    let categories = {
        params: pcTable.fieldCategories.param,
        filters: pcTable.fieldCategories.filter,
        rows: pcTable.fieldCategories.column,
        "column-footers": pcTable.fieldCategories.footer.filter(function (field) {
            return field.column!=="";
        }),
        "other-footers": pcTable.fieldCategories.footer.filter(function (field) {
            return field.column==="";
        }),

    };
    Object.keys(categories).forEach(function (category) {
        if (settings.indexOf(category) !== -1) {
            categories[category].forEach(function (field) {
                if (field.type === 'button' || field.showMeWidth<1 || !field.showMeWidth) return;
                settingsObject.fields[field.name] = field.showMeWidth;
            })
        }
    });

    if (settings.indexOf('rows') !== -1){
        settingsObject.ids = pcTable.dataSortedVisible;
    }
    settingsObject.sosiskaMaxWidth = 1100;

    pcTable.model.printTable(settingsObject);

};

