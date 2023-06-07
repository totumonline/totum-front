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

App.pcTableMain.prototype._excelExportSettingForm = function (exportFunction, $formBlock) {

    let mainExportFunction = exportFunction;
    let tableFormats = JSON.parse(localStorage.getItem('Excel-formats') || '{}')[this.tableRow.id] || {};

    exportFunction = (settings) => {
        let formats = JSON.parse(localStorage.getItem('Excel-formats') || '{}');
        formats[this.tableRow.id] = formats[this.tableRow.id] || {};
        settings.forEach((v) => {
            if (typeof v === 'object') {
                if (v[0] === 'dates-format') {
                    formats[this.tableRow.id].d = v[1]
                } else if (v[0] === 'number-format') {
                    formats[this.tableRow.id].n = v[1]
                }
            }
        })
        localStorage.setItem('Excel-formats', JSON.stringify(formats));
        mainExportFunction(settings);
    }


    let df, nf;
    if (!tableFormats.d) {
        this.model.__ajax('post', {"method": "getSchemaFormats"}).then((json) => {
            if (json.formats) {
                if (json.formats.dectimalSeparator && !nf.data('changed')) {
                    nf.val('.')
                }
                if (json.formats.date && !df.data('changed')) {
                    df.val(json.formats.date)
                }
            }
        })
    }

    let grid = $('<div class="label-grid no-bold">');
    $formBlock.append(grid)
    grid.append('<label class="form-check-label">' + App.translate('Date formats') + '</label> <input type="text" name="dates-format" class="form-control"/>');
    df = $formBlock.find('input[name="dates-format"]').val(tableFormats.d || App.lang.dateFormat).on('change', function () {
        $(this).data('changed', true)
    });
    grid.append('<label class="form-check-label">' + App.translate('Number dectimal delimiter') + '</label> <input type="text" name="number-format" class="form-control"/>');
    nf = $formBlock.find('input[name="number-format"]').val(tableFormats.n || (1.1).toLocaleString().substring(1, 2)).on('change', function () {
        $(this).data('changed', true)
    });

    return exportFunction;
}

App.pcTableMain.prototype._excelCopyExportForm = function (exportFunction) {
    let $printSettings = $('<div class="hidding-form">');
    exportFunction = this._excelExportSettingForm(exportFunction, $printSettings);
    let title = 'Xlsx export';
    let Button = 'Export';

    let buttons = [
        {
            label: Button,
            action: function (dialogRef) {
                let settings = ['rows'];
                $printSettings.find('input[type="text"]').each(function () {
                    settings.push([$(this).attr('name'), $(this).val()]);
                });
                dialogRef.close();
                exportFunction(settings)
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
        title: title,
        buttons: buttons,
        draggable: true
    })
}
App.pcTableMain.prototype._print = function (exportFunction) {
    "use strict";
    let $printSettings = $('<div class="hidding-form">');

    const isAnyPrinfField = field => !!field.showMeWidth;

    if (this.fieldCategories.param.length && this.fieldCategories.param.some(isAnyPrinfField)) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="params" class="form-check-input" checked="checked"> ' + App.translate('Parameters') + '</label></div>');
    }
    if (this.fieldCategories.filter.length && this._content.find('.pcTable-filtersTable td:visible').length) {
        $printSettings.append('<div class="form-check no-bold"><label class="form-check-label"><input type="checkbox" name="filters" class="form-check-input" checked="checked"> ' + App.translate('Filters') + '</label></div>');
    }
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

    if (exportFunction) {
        exportFunction = this._excelExportSettingForm(exportFunction, $printSettings)
    }

    let pcTable = this;
    let title = App.translate(exportFunction ? 'Xlsx export' : 'Print');
    let Button = App.translate(exportFunction ? 'Export' : 'Print');
    let buttons = [
        {
            label: Button,
            action: function (dialogRef) {
                let settings = [];
                $printSettings.find('input:checked, input[type="text"]').each(function () {
                    if ($(this).is('input:checked')) {
                        settings.push($(this).attr('name'));
                    } else {
                        settings.push([$(this).attr('name'), $(this).val()]);
                    }
                });
                dialogRef.close();
                if (exportFunction) {
                    exportFunction(settings)
                } else {
                    pcTable._printTable.call(pcTable, settings);
                }
            }
        },
        {
            label: App.translate('Cancel'),
            action: function (dialogRef) {
                dialogRef.close();
            }
        }
    ];

    if (!exportFunction && this.tableRow.__withPDF) {
        buttons.splice(0, 0, {
            label: App.translate('Create PDF'),
            action: function (dialogRef) {
                let settings = [];
                $printSettings.find('input:checked').each(function () {
                    settings.push($(this).attr('name'));
                });
                dialogRef.close();

                $printSettings = $('<div id="pdfPrintForm">' +
                    '<div class="pdfFormLabel">' + App.translate('Page') + ':</div><div><select id="PdfPageType" class="form-control"><option>A4</option><option>A5</option></select></div>' +
                    '<div class="pdfFormLabel">' + App.translate('Orientation') + ':</div><div><select id="PdfPageOrientaion" class="form-control"><option value="Portrate">' + App.translate('Portrate') + '</option><option value="Landscape">' + App.translate('Landscape') + '</option></select></div>' +
                    '</div>');

                let storageData = JSON.parse(localStorage.getItem('printPdfSettings') || '{}');

                $printSettings.on('change', 'select', function () {
                    storageData[pcTable.tableRow.id] = storageData[pcTable.tableRow.id] || {}
                    storageData[pcTable.tableRow.id] = {
                        page: $('#PdfPageType').val(),
                        orientation: $('#PdfPageOrientaion').val()
                    }
                    localStorage.setItem('printPdfSettings', JSON.stringify(storageData))
                })
                if (storageData[pcTable.tableRow.id]) {
                    setTimeout(() => {
                        $('#PdfPageType').val(storageData[pcTable.tableRow.id].page)
                        $('#PdfPageOrientaion').val(storageData[pcTable.tableRow.id].orientation)
                    })
                }


                buttons = [
                    {
                        label: App.translate('Download'),
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
                    title: App.translate('Create PDF'),
                    buttons: buttons,
                    draggable: true
                })

            }
        })
    }

    window.top.BootstrapDialog.show({
        message: $printSettings,
        type: null,
        title: title,
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

