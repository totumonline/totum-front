/*!
* TOTUM LOCALIZATION
* */
App.langs = App.langs || {};
App.langs.en =
    {
        "locale": "en-EN",
        "localeDatetimepicker": "en",
        "dateFormat":'DD/MM/YY',
        "dateTimeFormat":'DD/MM/YY HH:mm',
        "timeDateFormatNoYear": 'HH:mm DD/MM',
        modelMethods: {
            'edit': 'Editing',
            'checkInsertRow': 'Pre-addition',
            'duplicate': 'Duplicating',
            'refresh_rows': 'Rows refreshing',
            'loadPage': 'Page loaging',

            'getTableData': 'Table ingo loading',
            'refresh': 'Table data refreshing',
            'checkEditRow': 'Panel pre-calculating',
            'saveEditRow': 'Panel saving',
            'save': 'Field changing',
            'click': 'Button click',
            'selectSourceTableAction': 'Select source panel',
            'add': 'Row adding',
            'getEditSelect': 'Select loading',
            'delete': 'Deleting'
        },
        "search_prepare_function": function (string1, string2) {
            string1 = string1.toLowerCase();
            if (string2) {
                string2 = string2.toLowerCase();
            }
            return [string1, string2];
        },
        "translates": {
            'Creator-tableEditButtons-default_action': 'Action',
            'Creator-tableEditButtons-on_duplicate': 'Duplicate',
            'Creator-tableEditButtons-row_format': 'Row format',
            'Creator-tableEditButtons-table_format': 'Table format',

            "PATH-TO-DOCUMENTATION":"http://docs.totum.online/",

            'Close context data': '<b>Close</b> context data',
            'Open context data': '<b>Open</b> context data',

            '__clock_shelve_panel': '<span className="clocks-na">For</span> <input type="number" step="1" value="10" className="form-control"/> <select className="form-control"><option  selected value="1">minutes</option><option value="2">hours</option><option value="3">days</option></select>',
            'Log is empty': 'Log is empty. Enable logging and reload the page',
            'ApplyShort': 'Apply',
            'InvertShort': 'Invert',
            'CancelShort': 'Cancel',
            'ActionShort': 'Action',
            'FormatShort': 'Format',
            'SelectShort': 'Select',
            'treeAddTable': 'Table',
            'treeAddFolder':'Folder/Link',

            'isCreatorSelector-NotCreatorView':'User View',
            'isCreatorSelector-CommonView':'Table View',

        }
    }
;