/*!
* TOTUM LOCALIZATION
* */
App.langs = App.langs || {};
App.langs.en =
    {
        "locale": "en-EN",
        "localeDatetimepicker": "en",
        "dateFormat": 'DD/MM/YY',
        "dateTimeFormat": 'DD/MM/YY HH:mm',
        "timeDateFormatNoYear": 'HH:mm DD/MM',
        filtersExtenders: App.commonFiltersExtenders,
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
        css: {
            table: '.pcTable-container .loading-row td {background: url("/imgs/loading_en.png") repeat #fff;}'
        },
        "search_prepare_function": function (string1, string2) {string1 = string1.toLowerCase();if (string2) {string2 = string2.toLowerCase();} return [string1, string2];},
        "translates": {
            'Creator-tableEditButtons-default_action': 'Action',
            'Creator-tableEditButtons-on_duplicate': 'Duplicate',
            'Creator-tableEditButtons-row_format': 'Row format',
            'Creator-tableEditButtons-table_format': 'Table format',

            "PATH-TO-DOCUMENTATION": "https://docs.totum.online/",

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
            'treeAddFolder': 'Folder/Link',

            'isCreatorSelector-NotCreatorView': 'Switch off admin layer',
            'isCreatorSelector-CommonView': 'Switch off special view',
            'isCreatorSelector-MobileView': 'Switch to desktop view',

            'mobileToDesctopWarning': 'This display type is only for PCs with a small screen. Do not turn it on if you have a mobile device such as a phone or *PAD',
            'mobileToDesctopUserWarning': 'We detected the page type automatically.\n' +
                '\n' +
                'If we made a mistake, you can switch the mobile/desktop view manually.\n' +
                '\n' +
                'You have to be sure of the action you\'re performing!\n' +
                '\n' +
                'If you switch to desktop view on your mobile device, the page will not work!',
        }
    }
;