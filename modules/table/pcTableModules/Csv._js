$.extend(App.pcTableMain.prototype, {
    _csvExport: function (type) {
        "use strict";
        let pcTable = this;
        this.model.csvExport(pcTable.dataSortedVisible, type, Object.keys(App.filter(pcTable.fields, (x, field) => !!field.showMeWidth))).then(function (json) {
            if (json.csv) {
                let blob = new Blob([json.csv], {type: "text/csv;charset=utf-8"});
                saveAs(blob, pcTable.tableRow.title + '.' + pcTable.model.tableData.updated.dt + '.csv');
            }
        })
    },
    _csvImportClick: function (type) {
        let pcTable = this;
        $('<input type="file" accept="text/csv">').on('change', function () {
            if (this.files && this.files[0]) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let csv = e.target.result;
                    pcTable._csvImportUpload.call(pcTable, csv, type);
                };
                reader.onerror = function (evt) {
                    console.log(evt.target.error);
                };
                reader.readAsDataURL(this.files[0]);
            }

        }).click();
    },
    _csvImportUpload: function (csv, type) {
        let pcTable = this;
        let answers = {};

        let fields = Object.keys(App.filter(pcTable.fields, (x, field) => (!!field.showMeWidth) && field.category === 'column' && ['file', 'button', 'chart'].indexOf(field.type)===-1));

        let csvImport = function () {
            pcTable.model.csvImport(csv, type, answers, type == 'full' ? [] : fields).then(function (json) {
                if (json.question) {
                    App.modal(json.question[1], App.translate('Csv-loading question'), {
                        [App.translate("Cancel")]: 'close',
                        [App.translate('Load')]: function (block) {
                            "use strict";
                            block.modal('hide')
                            answers[json.question[0]] = 1;
                            csvImport();
                        }
                    })
                } else if (json.ok) {
                    App.windowReloadWithHash(pcTable.model)
                }
            })
        }
        if (type === 'rows') {
            let $text = $('<div></div>')
            fields.forEach((f) => {
                $text.append($('<div>').text(pcTable.fields[f].title || pcTable.fields[f].name));
            })
            let dialog = App.confirmation($text, {
                [App.translate('Cancel')]: function (dialog) {
                    dialog.close();
                }, [App.translate('Load')]: (dialog) => {
                    csvImport();
                    dialog.close()
                }
            }, App.translate('Check matching the structure of the loaded file to the sequence of fields'));
        } else {
            csvImport();
        }
    }
})