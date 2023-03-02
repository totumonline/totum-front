App.pcTableMain.prototype._printSelect = function () {
    if (this.isCreatorView || !this.f || !this.f.printbuttons || !this.f.printbuttons.length) {
        this._print();
        return;
    }
    let dialog;
    let $printSettings = $('<div class="print-choosing"></div>');

    let pcTable = this;

    this.f.printbuttons.forEach((name) => {
        let field = this.fields[name];
        if (field && field.type === 'button') {
            let td = $('<div class="button-wrapper no-width">').data('field', name).appendTo($printSettings);
            let $btn = field.getCellText(null, td, this.data_params).appendTo(td)
            $btn.wrap('<span class="cell-value">').on('click', function () {
                pcTable._buttonClick(td, field);
                dialog.close();
            })
        }
    })

    let td = $('<div class="button-wrapper no-width">').appendTo($printSettings);
    let $btn = $('<span class="cell-value"><button class="btn btn-default btn-xxs button-field">' + App.translate('Default printing') + '</button></span>').appendTo(td)
    $btn.wrap('<span class="cell-value">').on('click', function () {
        pcTable._print();
        dialog.close();
    })

    let buttons = [
        {
            label: App.translate('Cancel'),
            action: function (dialogRef) {
                dialogRef.close();
            }
        }
    ];


    dialog = window.top.BootstrapDialog.show({
        message: $printSettings,
        type: null,
        title: App.translate('Print'),
        buttons: buttons,
        draggable: true
    })

}

App.pcTableMain.prototype._print = function () {
    "use strict";
    let $printSettings = $('<div class="hidding-form">');

    const isAnyPrinfField = function (field) {
        if (field.showMeWidth) return true;
    };

    if (this.fieldCategories.param.length && this.fieldCategories.param.some(isAnyPrinfField)) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="params" class="form-check-input" checked="checked"> ' + App.translate('Parameters') + '</label></div>');
    }
    if (this.fieldCategories.filter.length)
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="filters" class="form-check-input" checked="checked"> ' + App.translate('Filters') + '</label></div>');
    if (this.fieldCategories.column.length && this.fieldCategories.column.some(isAnyPrinfField) && this.dataSortedVisible.length) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="rows" class="form-check-input" checked="checked"> ' + App.translate('Rows part') + '</label></div>');
        $printSettings.append('<div class="form-check no-bold" style="padding-left: 20px;"><label class="form-check-label"><input type="checkbox" name="with-id" class="form-check-input"> ' + App.translate('with id') + '</label></div>');
    }

    if (this._footersBlock.find('.val').length) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="column-footers" class="form-check-input" checked="checked"> ' + App.translate('Column footers') + '</label></div>');
    }
    if (this._footersSubTable.find('.val').length) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="other-footers" class="form-check-input" checked="checked"> ' + App.translate('Out of column footers') + '</label></div>');
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

    if (this.tableRow.__withPDF) {
        buttons.splice(0, 0, {
            label: App.translate('Print PDF'),
            action: function (dialogRef) {
                let settings = [];
                $printSettings.find('input:checked').each(function () {
                    settings.push($(this).attr('name'));
                });
                dialogRef.close();

                $printSettings = $('<div id="pdfPrintForm">' +
                    '<div class="pdfFormLabel">'+App.translate('Page')+':</div><div><select id="PdfPageType" class="form-control"><option>A4</option><option>A5</option></select></div>' +
                    '<div class="pdfFormLabel">'+App.translate('Orientation')+':</div><div><select id="PdfPageOrientaion" class="form-control"><option>Portrate</option><option>Landscape</option></select></div>' +
                    '</div>');

                buttons = [
                    {
                        label: App.translate('Print'),
                        action: function (dialogRef) {
                            pcTable._printTable.call(pcTable, settings, {
                                page: $('#PdfPageType').val(),
                                orientation: $('#PdfPageOrientaion').val().substring(0, 1)
                            });

                            dialogRef.close();
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

            }
        })
    }

    window.top.BootstrapDialog.show({
        message: $printSettings,
        type: null,
        title: App.translate('Print'),
        buttons: buttons,
        draggable: true
    })
};
App.pcTableMain.prototype._printTable = function (settings, pdfSettings) {

    let pcTable = this;
    let settingsObject = {
        fields: {},
        pdf: pdfSettings
    };
    if (settings.indexOf('with-id') !== -1)
        settingsObject.fields.id = 50;

    let categories = {
        params: pcTable.fieldCategories.param,
        filters: pcTable.fieldCategories.filter,
        rows: pcTable.fieldCategories.column,
        "column-footers": pcTable.fieldCategories.footer.filter(function (field) {
            return field.column !== "";
        }),
        "other-footers": pcTable.fieldCategories.footer.filter(function (field) {
            return field.column === "";
        }),

    };
    Object.keys(categories).forEach(function (category) {
        if (settings.indexOf(category) !== -1) {
            categories[category].forEach(function (field) {
                if (field.type === 'button' || field.showMeWidth < 1 || !field.showMeWidth) return;
                settingsObject.fields[field.name] = field.showMeWidth;
            })
        }
    });

    if (settings.indexOf('rows') !== -1) {
        let ids = [];
        pcTable.dataSortedVisible.forEach((r) => {
            if (typeof r === 'object') {
                if (pcTable.fields.tree.treeViewType === 'other') {
                    //ids.push({tree: r.v})
                } else {
                    ids.push(r.row.id)
                }
            } else {
                ids.push(r)
            }
        })

        settingsObject.ids = ids;
    }
    settingsObject.sosiskaMaxWidth = 1100;

    if (pcTable.viewType === 'rotated') {
        settingsObject.rotated = pcTable.tableRow.rotated_view;
    }

    pcTable.model.printTable(settingsObject);

};

