(function (window, $) {

    let BUTTONS_TIMEOUT = 2000;

    const pcTABLE_ROW_HEIGHT = 35;
    const MOBILE_MAX_WIDTH = window.MOBILE_MAX_WIDTH = 1199;

    const pcTable_DATA_KEY = 'pctable';
    const pcTable_DATA_INDEX = 'pctablettemtndex';
    const pcTable_ROW_ItemId_KEY = 'pctableitemid';
    const pcTable_default_field_data_src = {
        "type": {"isOn": true, "Val": "string"},
        "width": {"isOn": true, "Val": 100},
        "default": {"isOn": false, "Val": ""},
        "regexp": {"isOn": false, "Val": ""},
        "regexpErrorText": {"isOn": false, "Val": ""},
        "required": {"isOn": true, "Val": false},
        "showInWeb": {"isOn": true, "Val": true},
        "insertable": {"isOn": true, "Val": true},
        "dropdownView": {"isOn": true, "Val": true},
        "addRoles": {"isOn": false, "Val": ["1"]},
        "editable": {"isOn": true, "Val": true},
        "editRoles": {"isOn": false, "Val": ["1"]},
        "hidden": {"isOn": true, "Val": false},
        "warningEditPanel": {"isOn": true, "Val": false},
        "warningEditText": {"isOn": false, "Val": App.translate('Surely to change?')},
        "warningEditRegExp": {"isOn": false, "Val": "/^someValue$/"},
        "url": {"isOn": true, "Val": false},
        "openIn": {"isOn": false, "Val": "iframe"},
        "tableBreakBefore": {"isOn": true, "Val": false},
        "sectionTitle": {"isOn": false, "Val": ""},
        "panelColor": {"isOn": false, "Val": ""},
        "webRoles": {"isOn": false, "Val": ["1"]},
        "logRoles": {"isOn": false, "Val": ["1"]},
        "showInWebOtherPlace": {"isOn": true, "Val": false},
        "showInWebOtherPlacement": {"isOn": false, "Val": "param"},
        "showInWebOtherOrd": {"isOn": false, "Val": null},
        "showInXml": {"isOn": true, "Val": false},
        "apiEditable": {"isOn": false, "Val": false},
        "xmlEditRoles": {"isOn": false, "Val": ["1"]},
        "xmlRoles": {"isOn": false, "Val": ["1"]},
        "logging": {"isOn": true, "Val": true},
        "code": {"isOn": false, "Val": "= : "},
        "codeOnlyInAdd": {"isOn": false, "Val": false},
        "errorText": {"isOn": false, "Val": ""},
        "codeAction": {"isOn": false, "Val": "= :"},
        "CodeActionOnAdd": {"isOn": false, "Val": false},
        "CodeActionOnChange": {"isOn": false, "Val": false},
        "format": {"isOn": false, "Val": "f1=:"},
        "help": {"isOn": false, "Val": ""}
    };
    const pcTable_COLORS = {
        'blured': '#ee0c1f'
        , 'saved': '#3fbf46'
        , 'savedAndChaged': '#eeec0b'
    };

    const pcTable_TYPES = {
        'data': 'data',
        'system': 'syst',
        'global': 'glob',
        'project': 'proj'
    };

    const pcTable_PANNEL_IDS = {
        'insert': 'pcTableInsertRowPanel'
    };

    var technicalFunctions = {
        stopPropagationByKeyCode: function (event, keyCode) {
            var originalEvent = event;
            while (originalEvent) {
                if (originalEvent.keyCode == keyCode)
                    originalEvent.stopPropagation();

                if (originalEvent == event.originalEvent)
                    break;

                originalEvent = event.originalEvent;
            }
        }
    };

    var pcTableIds = 0;

//=include pcTableModules/CodemirrorSections._js
//=include pcTableModules/CodemirrorOptions._js
//=include pcTableModules/CodemirrorAutoFormat._js


    let fieldTypes = {};

//=include pcTableModules/Fields.Default._js
//=include pcTableModules/Fields.Text._js
//=include pcTableModules/Fields.Checkbox._js
//=include pcTableModules/Fields.String._js
//=include pcTableModules/Fields.Number._js
//=include pcTableModules/Fields.Date._js
//=include pcTableModules/Fields.Unic._js
//=include pcTableModules/Fields.File._js
//=include pcTableModules/Fields.N._js
//=include pcTableModules/Fields.listRow._js

//=include pcTableModules/Fields.Password._js
//=include pcTableModules/Fields.Select._js
//=include pcTableModules/Fields.Tree._js
//=include pcTableModules/Fields.Json._js
//=include pcTableModules/Fields.FieldParams._js
//=include pcTableModules/Fields.Button._js
//=include pcTableModules/Fields.Link._js
//=include pcTableModules/Fields.Comments._js
//=include pcTableModules/Fields.Chart._js

    $.each(fieldTypes, function (k, v) {
        fieldTypes[k] = $.extend({}, defaultField, v);
    });

    App.pcTableMain = function (element, config) {

        this.data_params = config.params || null;

        config = $.extend({},
            {
                tableRow: {},
                nSorted: true,
                isCreatorView: false,
                withCsvButtons: false,
                withCsvEditButtons: false,
                noDataRowClass: 'pcTable-noDataRow',
                contanerClass: 'pcTable-container',
                tableClass: 'pcTable-table',
                width: null,

                /*TreeView*/
                isTreeView: false,
                treeReloadRows: [],
                tree: [],
                treeIndex: {},
                treeSort: [],


                checkIsUpdated: 0,
                _containerId: '',
                scrollWrapper: null,
                tableWidth: 0,
                control: {
                    adding: false,
                    sorting: false,
                    deleting: false,
                    duplicating: false
                },
                dataSorted: [],
                data: [],
                dataSortedVisible: [],
                mainFieldName: 'id',

                insertRow: null,
                _container: null,
                _content: null,

                openedPanels: {},

                extraClastersBottom: null,
                extraClastersTop: null,
                dataSortedClasters: {'t': [], 'm': [], 'b': []},
                ScrollClasterized: null,

                _innerContainer: null,
                _header: null,
                _table: null,

                LogButton: null,

                model: null,
                fields: {},
                hidedFields: [],
                fieldCategories: {
                    column: [],
                    params: [],
                    footer: []
                },
                sorted: {
                    field: '',
                    direction: 'asc'
                },
                _sorting: {},
                _filterable: false,
                filtersClearButton: null,
                _indexes: {
                    fieldByName: {}
                },
                beforeSpaceHide: true
            }, config);
        $.extend(this, config, true);

        if (screen.width <= MOBILE_MAX_WIDTH) {
            this.isCreatorView = false;
            this.isMobile = true;
        }

        if (this.isCreatorView) {
            if ($('#isCreator').length === 0) {
                let checkbox = $('<span id="isCreator" class="btn btn-sm"><i class="fa-user-circle fa"></i></span>');
                let input = checkbox;
                if (!this.isMobile && !localStorage.getItem('notCreator')) {
                    input.addClass('btn-danger');
                } else {
                    input.addClass('btn-warning');
                    $('.plus-top-branch').hide();
                }
                input.on('click', () => {
                    if (!localStorage.getItem('notCreator')) {
                        localStorage.setItem('notCreator', true)
                    } else {
                        localStorage.removeItem('notCreator')
                    }
                    window.location.reload(true);
                })
                $('#docs-link').before(checkbox)
            }
            if (this.isMobile || localStorage.getItem('notCreator')) {
                this.isCreatorView = false;
            }
        }

        if (!this.isCreatorView) {
            Object.keys(this.fields).forEach((fName) => {
                if (this.fields[fName].webRoles && this.fields[fName].webRoles.length === 1 && parseInt(this.fields[fName].webRoles[0]) === 1) {
                    delete this.fields[fName];
                }
            })
        }

        this.hidden_fields = this.hidden_fields || {};
        if (this.hidden_fields.length === 0) this.hidden_fields = {};

        if (App.isTopWindow()) {
            this.beforeSpaceHide = false;
        }


        if (element) {
            this.refreshArraysFieldCategories(true);
            let $element = $(element);
            $element.data(pcTable_DATA_KEY, this);
            this._container = $element;
            if (!this.isCreatorView) {
                this._container.addClass('worker-view');
            }
            this._containerId = this._container.attr('id');
            if (!this._containerId) {
                this._containerId = 'pcTable' + (pcTableIds++);
                this._container.attr('id', this._containerId)
            }
            this._init();
            this.render(config.addVars);
            this.applyHideRows(this.f.hideRows, this.f.showRows)
        } else {
            this.initForPanel(config)
        }

        this.model.addPcTable(this);
        //if (this.tableRow.type === 'tmp') {}
        return this;
    };

//=include pcTableModules/EditPanel._js
//=include pcTableModules/scrolls._js

//=include pcTableModules/Sorting._js
//=include pcTableModules/Selectable._js
//=include pcTableModules/Filterable._js
//=include pcTableModules/Edit._js
//=include pcTableModules/RowActions._js
//=include pcTableModules/Insert._js
//=include pcTableModules/baseHtml._js
//=include pcTableModules/FixColumn._js
//=include pcTableModules/FloatBlocks._js
//=include pcTableModules/HorizontalDraggable._js
//=include pcTableModules/RowPanel._js
//=include pcTableModules/Csv._js
//=include pcTableModules/FieldsHidding._js
//=include pcTableModules/Print._js
//=include pcTableModules/SortingN._js
//=include pcTableModules/formatFunctions._js
//=include pcTableModules/TableTreeView._js
//=include pcTableModules/TablePanelView._js
//=include pcTableModules/TableRotatedView._js
//=include pcTableModules/TableRestoreView._js


    $.extend(App.pcTableMain.prototype, {

            setWidthes: function () {
                "use strict";
                let TreeWidth;

                if (this.isMobile) {
                    TreeWidth = 5;
                    this.switchContainerNideScroll(false)
                } else {
                    TreeWidth = $('body>.page_content:first').is('.tree-minifyed') ? 5 : 300;
                    this.switchContainerNideScroll(true)
                }


                this.width = $('body').width() - TreeWidth;
                this._container.width(this.width);
                if (!this.isMobile) {
                    this._innerContainer.width(this.width - 80);
                    this.addInnerContainerScroll();
                } else {
                    this._innerContainer.width('auto');
                }

                let $block;

                this._rerendParamsblock();
                if (this.isCreatorView) {
                    this._refreshHiddenFieldsBlock()
                }
                this._rerendFiltersBlock();
                this._refreshHead();
                this._rerendBottomFoolers();

                this.rowButtonsCalcWidth();

                if (this._container.width() < this._table.width()) {
                    this._addHorizontalDraggable();
                }
                this._container.height(window.innerHeight - this._container.offset().top - 10);
            },
            addInnerContainerScroll: function () {

                if (this._innerContainer.width() < this._innerContainer.find('>table:first, >div:first').width()) {

                    const scrollPosition = () => {
                        let innConTop = this._innerContainer.offset().top - this._container.offset().top - 3;
                        let innHeight = this._innerContainer.innerHeight() + parseInt($('#table').data('pctable')._innerContainer.css('paddingBottom'))
                        let connHeight = this._container.innerHeight();
                        /*Иннер не ниже высоты окна и не выше*/

                        if (this._innerContainerPS) {
                            let old = this._innerContainerPS.scrollbarXBottom;
                            this._innerContainerPS.scrollbarXBottom = 0;

                            if (innConTop < connHeight && (innConTop + innHeight > connHeight)) {
                                let scrollTop = innConTop + this._innerContainer.innerHeight();
                                /*Скролл ниже высоты окна*/
                                if (scrollTop > connHeight) {
                                    this._innerContainerPS.scrollbarXBottom = scrollTop - connHeight
                                }
                            }

                            if (old != this._innerContainerPS.scrollbarXBottom) {
                                this._innerContainerPS.update();
                            }
                        }
                    }
                    if (!this._innerContainerPS) {
                        this._innerContainerPS = new PerfectScrollbar(this._innerContainer.get(0), {
                            useBothWheelAxes: false,
                            scrollbarYActive: false,
                            scrollbarXActive: true
                        });
                        let timeout;
                        this._container.on('scroll.scroller', () => {
                            if (timeout) clearTimeout(timeout);
                            timeout = setTimeout(scrollPosition, 30);
                        })
                        new ResizeObserver(scrollPosition).observe(this.scrollWrapper.get(0))
                    }
                    setTimeout(scrollPosition, 500)


                } else if (this._innerContainerPS) {
                    this._container.off('scroll.scroller');
                    this._innerContainerPS.destroy();
                    this._innerContainerPS = null;
                }
            },
            initForPanel: function (config) {
                $.extend(true, this, config);
                this.refreshArraysFieldCategories(false);
                let data = {};
                this.__checkedRows = [];
                this.rows.map(function (item) {
                    this.dataSorted.push(item.id);
                    this.dataSortedVisible.push(item.id);
                    data[item.id] = item;
                    data[item.id].$checked = -1 !== this.__checkedRows.indexOf(item.id) ? true : false;
                }, this);
                this.data = data;
                this.model.setLoadedTableData(this.data);
            },
            closeCallbacks: [],
            _init: function () {
                let pcTable = this;

                $(document).on({
                    dragover: function () {
                        return false;
                    },
                    drop: function () {
                        return false;
                    }
                });

                this._container.addClass(this.contanerClass).addClass('pcTable-type-' + this.tableRow.type);

                if (this.isCreatorView) {
                    this._container.addClass('pcTable-creatorView')
                }

                let navTopLine = $('#nav-top-line');

                if (this.tableRow.type === 'tmp' && this.isCreatorView) {
                    navTopLine.text(App.translate('Attention, please - this is a temporary table'));
                    navTopLine.addClass('pcTable-type-' + this.tableRow.type);
                }

                this._innerContainer = $('<div class="innerContainer">');


                let closeCallbacksActive = false;
                const closeCallbacksFunc = function () {
                    if (!closeCallbacksActive) {
                        closeCallbacksActive = true;
                        let cnt = pcTable.closeCallbacks.length;
                        pcTable.closeCallbacks.forEach(function (func) {
                            func();
                        });
                        pcTable.closeCallbacks.splice(0, cnt);
                        closeCallbacksActive = false;
                    }
                };

                $('body').on('keyup', function (event) {
                    if (event.which === 27) {
                        pcTable._container.trigger('escPressed');
                        closeCallbacksFunc();
                    }
                });
                $('body').on('click', closeCallbacksFunc);


                pcTable._container.on('scroll', closeCallbacksFunc);
                pcTable._innerContainer.on('scroll', closeCallbacksFunc);

                /*top th panel*/
                if (this.viewType !== 'panels') {
                    if (this.isCreatorView) {

                        this._container.on('click contextmenu', 'th', function (event) {

                            if (event.originalEvent && event.originalEvent.target.nodeName === 'BUTTON' || event.originalEvent.target.parentElement.nodeName === 'BUTTON') ;
                            else {
                                let th = $(this);
                                if (!th.attr('aria-describedby')) {
                                    setTimeout(() => {
                                        pcTable.creatorIconsPopover(th)
                                    })
                                }
                            }
                        })
                        /*this._container.on('contextmenu', 'th .field_name.copy_me', function (event) {
                            let self = $(this);
                            let icons = self.closest('th').find('.creator-icons');
                            if (!icons.is('[aria-describedby]')) {
                                pcTable.creatorIconsPopover(icons);
                            }
                            return false;
                        })*/
                    } else {
                        this._container.on('click contextmenu', 'th', function (event) {
                            if (event.originalEvent && event.originalEvent.target.nodeName === 'BUTTON' || event.originalEvent.target.parentElement.nodeName === 'BUTTON') ;
                            else {
                                let th = $(this);
                                if (!th.attr('aria-describedby')) {
                                    setTimeout(() => {
                                        pcTable.workerIconsPopover(th)
                                    })
                                }
                            }
                        })
                    }
                }
                pcTable._container.on('contextmenu', function (event) {
                    let self = $(event.target);
                    closeCallbacksFunc();
                    if (!(self.closest('.popover').length || self.closest('.edit-row-panel').length)) {
                        return false;
                    }
                });


                this._container.append(this._innerContainer);

                this.saveFilterAndPage();

                this.initRowsData()


                if (!this.isMobile) {
                    let timeoutResize;
                    $(window).resize(function () {
                        if (timeoutResize) clearTimeout(timeoutResize);
                        timeoutResize = setTimeout(function () {
                            pcTable.setWidthes();
                        }, 500);
                    });
                } else {
                    $(window).resize(function () {
                        window.location.reload();
                    });
                }
            },
            saveFilterAndPage: function () {
                if (this.tableRow.type === 'cycles') {
                    if (this.filtersString || this.PageData)
                        sessionStorage.setItem('cycles_filter', JSON.stringify({
                            id: this.tableRow.id,
                            filter: this.filtersString,
                            offset: this.PageData ? this.PageData.offset : null,
                            onPage: this.PageData ? this.PageData.onPage : null
                        }))
                    else
                        sessionStorage.removeItem('cycles_filter')
                }
            },
            refreshArraysFieldCategories: function () {
                "use strict";

                let pcTable = this;
                pcTable.hidden_fields = pcTable.hidden_fields || {};

                $.each(pcTable.hidden_fields, function (k, field) {
                    pcTable.hidden_fields[k] = $.extend({}, field, fieldTypes[field.type], field);
                    pcTable.hidden_fields[k].isHiddenField = true;
                });

                pcTable.mainFieldName = 'id';

                pcTable.fieldCategories = {};

                ['param', 'column', 'filter', 'footer', 'panel_fields'].forEach(function (category) {
                    pcTable.fieldCategories[category] = [];
                });

                let withoutCategories = [];
                try {
                    withoutCategories = JSON.parse(decodeURIComponent(window.location.hash.substring(1)) || '[]');
                    if (!withoutCategories || !withoutCategories.wc) {
                        withoutCategories = [];
                    } else {
                        withoutCategories = withoutCategories.wc;
                    }
                } catch (e) {
                }

                let reorderedFields = false;

                const initField = function (name, field) {
                    field.pcTable = pcTable;


                    if (fieldTypes[field.type]) {
                        field = $.extend({}, defaultField, fieldTypes[field.type], field);
                    } else {
                        field = $.extend({}, defaultField, field);
                    }

                    if (field.type == 'button' && field.buttonActiveOnInsert) {
                        field.insertable = true;
                    }

                    if (field.showInWebOtherOrd) {
                        field._ord = field.ord;
                        field.ord = field.showInWebOtherOrd;
                        reorderedFields = true;
                    }
                    if (field.showInWebOtherPlacement) {
                        field._category = field.category;
                        field.category = field.showInWebOtherPlacement;
                        reorderedFields = true;
                    }


                    pcTable.fields[name] = field;

                    if (withoutCategories.indexOf(field.category) !== -1) return;

                    if (field.showInWeb) {
                        if (field.category === 'column') {
                            if (field.name !== 'n') {
                                pcTable.fieldCategories['panel_fields'].push(field);
                            }
                            if ((field.name === 'tree' && field.category === 'column' && field.treeViewType)) {
                                pcTable.isTreeView = true;
                                pcTable.fieldCategories[field.category].unshift(field);
                            } else {
                                pcTable.fieldCategories[field.category].push(field);
                            }
                        } else {
                            pcTable.fieldCategories[field.category].push(field);
                        }
                    } else if (field.name) {
                        pcTable.hidden_fields[field.name] = field;
                    }
                };

                let n = {type: "n"};
                initField('n', n);
                let _fields = $.extend({}, this.fields);
                delete _fields.n;
                $.each(_fields, initField);


                if (reorderedFields) {
                    ['param', 'column', 'filter', 'footer'].forEach(function (category) {
                        pcTable.fieldCategories[category].sort(function (field_a, field_b) {
                            return field_a.ord - field_b.ord;
                        })
                    });
                }
                pcTable.notTableFooterFields = [];
                pcTable.fieldCategories['footer'].forEach(function (field) {
                    if (!field.column) {
                        pcTable.notTableFooterFields.push(field);
                    }
                });

                if (this.tableRow.main_field && this.fields[this.tableRow.main_field]) {
                    pcTable.mainFieldName = this.tableRow.main_field;
                }

            },
            workerIconsPopover: async function (th, title) {
                title = title || this.fields[th.data('field')].title;
                if (!th.attr('aria-describedby') && title) {
                    let div = $('<div style="width:200px" class="creator-icons">');
                    div.append($('<div class="full-title">').text(title || this.fields[th.data('field')].title));

                    let placement = 'top';

                    if (th.get(0).getBoundingClientRect().top < 100) {
                        placement = 'bottom'
                    }

                    App.popNotify({
                        isParams: true,
                        $text: div,
                        element: th,
                        trigger: 'manual',
                        placement: placement,
                        container: $('body')
                    });

                    this.closeCallbacks.push(function () {
                        if (th && th.length) th.popover('destroy');
                    })
                }
            },
            creatorIconsPopover: async function (th) {
                if (!th.attr('aria-describedby')) {
                    let div = $('<div style="width:200px" class="creator-icons">');
                    div.append($('<div class="full-title">').text(this.fields[th.data('field')].title));

                    th.find('i:not(.fa-caret-down):not(.fa-info)').each((i, icon) => {
                        if (['fa-star', 'fa-star-o', 'fa-cogs'].some((c) => {
                            return $(icon).hasClass(c)
                        })) return;
                        let el = $('<div>').append(icon.outerHTML);

                        if (i === 0) {
                            el.append(' ' + th.data('field'));
                            let btnCopy = $('<button class="btn btn-sm btn-default copy-me" title="' + App.translate('Copy') + ' "><i class="fa fa-copy"></i></button>');
                            btnCopy.on('click', function () {
                                App.copyMe(th.data('field'));
                                let button = $(this);
                                button.width(button.width());
                                button.html('<i class="fa fa-cog"></i>');
                                setTimeout(function () {
                                    button.html('<i class="fa fa-copy"></i>');
                                }, 1000);
                                return false;
                            }).appendTo(el);
                        }

                        if (icon.title) el.append(' ' + icon.title);
                        div.append(el)
                    });

                    let buttons = [];
                    let field = this.fields[th.closest('th').data('field')];
                    let settingsData;
                    const getSettings = async function () {
                        return new Promise((resolve, reject) => {
                            App.getPcTableById(2).then(function (pcTableTablesFields) {
                                resolve(pcTableTablesFields.fields.data_src.jsonFields)
                            })
                        })
                    }


                    let codes = {
                        "code": App.translate('Code'),
                        "codeAction": App.translate('ActionShort'),
                        "codeSelect": App.translate('SelectShort'),
                        "format": App.translate('FormatShort')
                    };
                    let codesKeys = Object.keys(codes);
                    for (let i = 0; i < codesKeys.length; i++) {
                        let name = codesKeys[i];
                        let nameCode = name === 'format' ? 'formatCode' : '';

                        if (nameCode ? field[nameCode] : field[name]) {
                            buttons.push($('<button class="btn btn-default btn-xxs" data-action="' + name + '">' + codes[name] + '</button>'))
                        } else {
                            if (!settingsData) {
                                settingsData = await getSettings();
                            }
                            if (settingsData.fieldListParams[field.type].indexOf(name) !== -1) {
                                buttons.push($('<button class="btn btn-default btn-xxs offed" data-action="' + name + '">' + codes[name] + '</button>'))
                            }
                        }
                    }

                    if (buttons.length) {
                        let divButtons = $('<div class="buttons">');
                        buttons.forEach((btn) => {
                            divButtons.append(btn);
                        })
                        divButtons.appendTo(div);
                        let pcTable = this;

                        divButtons.on('click', 'button', async function () {
                            let btn = $(this);
                            if (!settingsData) {
                                settingsData = await getSettings();
                            }
                            pcTable.editFieldCode(field.name, btn.data('action'), settingsData).then((refresh) => {
                                if (refresh) {
                                    switch (field.category) {
                                        case 'param':
                                            pcTable._rerendParamsblock();
                                            break;
                                        case 'footer':
                                            if (field.column) {
                                                pcTable._rerenderColumnsFooter();
                                            } else {
                                                pcTable._rerendBottomFoolers();
                                            }
                                            break;
                                        case 'filter':
                                            pcTable._rerendFiltersBlock();
                                            break;
                                        case 'column':
                                            pcTable._refreshHead();
                                            break;
                                    }
                                    setTimeout(() => {
                                        App.blink(field.$th.find('.creator-icons i'), 3, "green", 'color');
                                    }, 100)
                                } else {
                                    App.blink(th.find('i'), 3, "green", 'color')
                                }

                            }, () => {
                            })
                        })
                    }


                    let placement = 'top';

                    if (th.get(0).getBoundingClientRect().top < 100) {
                        placement = 'bottom'
                    }

                    App.popNotify({
                        isParams: true,
                        $text: div,
                        element: th,
                        trigger: 'manual',
                        placement: placement,
                        container: $('body')
                    });
                    this.closeCallbacks.push(function () {
                        if (th && th.length) th.popover('destroy');
                    })
                }
            },
            editTableCode: function (fieldName, codeType) {
                return new Promise((resolve, reject) => {
                    let pcTable = this;
                    App.getPcTableById(1).then(function (pcTableTable) {
                        pcTableTable.model.checkEditRow({id: pcTable.tableRow.id}).then(function (json) {

                            let title = '<span style="">' + pcTableTable.fields[fieldName].title + '</span>';


                            App.totumCodeEdit(
                                json.row[fieldName].v, title, pcTable.tableRow.name,
                                [],
                                false
                            )
                                .then((data) => {
                                    pcTableTable.model.save({[pcTable.tableRow.id]: {[fieldName]: data.code}}).then(() => {
                                        pcTable.tableRow[fieldName] = data.code;
                                        if (codeType === 'format') {
                                            pcTable.model.refresh();
                                        }
                                        resolve();
                                    }).fail(reject);
                                }, function (e) {
                                    reject()
                                })


                        });
                    })
                })

            },
            editFieldCode: function (fieldName, codeType, settings) {
                return new Promise((resolve, reject) => {
                    let field = this.fields[fieldName];
                    let fieldSettingsList = settings.fieldListParams[field.type];
                    let pcTable = this;
                    App.getPcTableById(2).then(function (pcTableTablesFields) {
                        pcTableTablesFields.model.checkEditRow({id: field.id}).then(function (json) {
                            let checkboxes = [];
                            let chList = [];

                            switch (codeType) {
                                case 'code':
                                    chList = ["codeOnlyInAdd"];
                                    break;
                                case 'codeAction':
                                    chList = ["CodeActionOnAdd", "CodeActionOnChange", "CodeActionOnDelete", "CodeActionOnClick"]
                                    break;
                                case
                                'codeSelect':
                                    chList = ["codeSelectIndividual", "multiple"];
                                    break;
                            }
                            if (chList) {
                                chList.forEach((name) => {
                                    if (fieldSettingsList.indexOf(name) !== -1) {
                                        let fieldSettings = settings.fieldSettings[name];
                                        if (fieldSettings['categories']) {
                                            if (fieldSettings['categories'].indexOf(field.category) === -1) return false;
                                        }
                                        checkboxes.push([name, fieldSettings.title, json.row.data_src.v[name] ? json.row.data_src.v[name].Val : false]);
                                    }
                                })
                            }


                            let title = '<span style="">' + settings.fieldSettings[codeType].title + '</span>'
                                + ' ' + field.name;


                            App.totumCodeEdit(
                                json.row.data_src.v[codeType].Val, title, field.pcTable.tableRow.name,
                                checkboxes,
                                (codeType !== 'codeSelect' && json.row.data_src.v[codeType] && json.row.data_src.v[codeType].isOn)
                            )
                                .then((data) => {
                                    pcTableTablesFields.model.checkEditRow({id: field.id}).then(function (json) {
                                        let data_src = json.row.data_src.v
                                        //data.code
                                        //data.checkboxes

                                        data_src[codeType].Val = data.code;
                                        let refresh = false

                                        if (!data_src[codeType].isOn) {
                                            data_src[codeType].isOn = true;
                                            refresh = true;
                                        } else if (data.switchoff) {
                                            data_src[codeType].isOn = false;
                                            refresh = true;
                                        }


                                        Object.keys(data.checkboxes).forEach((name) => {
                                            if (!data_src[name] || data_src[name].Val !== data.checkboxes[name]) {

                                                data_src[name] = data_src[name] || {};

                                                data_src[name].Val = data.checkboxes[name];
                                                data_src[name].isOn = data.checkboxes[name];
                                                refresh = true;
                                            }
                                        })

                                        pcTableTablesFields.model.save({[field.id]: {data_src: data_src}}).then(() => {

                                            Object.keys(data.checkboxes).forEach((name) => {
                                                pcTable.fields[field.name][name] = data.checkboxes[name];
                                            })
                                            if (codeType === 'format') {
                                                if (data.switchoff)
                                                    pcTable.fields[field.name].formatCode = false;
                                                else
                                                    pcTable.fields[field.name].formatCode = true;
                                                pcTable.model.refresh();
                                            } else if (codeType === 'codeSelect') {

                                                window.location.reload()

                                            } else {

                                                if (data.switchoff)
                                                    pcTable.fields[field.name][codeType] = false;
                                                else
                                                    pcTable.fields[field.name][codeType] = true;
                                                pcTable.model.refresh(null, 'recalculate');
                                            }
                                            resolve(refresh);

                                        }).fail(reject);
                                    }).fail(reject);
                                }, function (e) {
                                    reject()
                                })


                        });
                    })
                })

            },
            render:

                function (addVars) {
                    let pcTable = this;

                    this.loadVisibleFields(this.f && this.f.fieldhide ? this.f.fieldhide : undefined);


                    if (this.viewType === 'panels' && !this.isMobile)
                        this._renderTablePanelView();
                    else if (!this.isTreeView && this.tableRow.rotated_view) {
                        this._renderRotatedView();
                    }

                    this.ScrollClasterized = this.Scroll();

                    this._renderTable();
                    if (this._sorting.addSortable) {
                        this._sorting.addSortable(this);
                    }
                    this._addSelectable();
                    this._addEditable();

                    this.row_actions_add();


                    this.__addFilterable();
                    this._refreshHead();


                    if (pcTable.checkIsUpdated > 0) {
                        let timeout = parseInt(pcTable.checkIsUpdated) * 2000;
                        setTimeout(function () {
                            pcTable.checkTableIsChanged.call(pcTable, timeout)
                        }, timeout);
                    }


                    this.refresh();
                    this.setWidthes();
                    this.__applyFilters();
                    if (addVars) {
                        if (this.isMobile)
                            pcTable._addInsertWithPanel(addVars);
                        else
                            pcTable._addInsert(addVars);
                    }

                }

            ,
            reloaded: function () {

                let notify = $('#refresh-notify');
                if (notify.length) {
                    notify.closest('.alert').remove();
                    this.checkTableIsChanged(parseInt(this.checkIsUpdated) * 2000);
                }
            }
            ,
            showRefreshButton(tableUpdated) {
                this.checkTableIsChangedObject.abort();
                if (this.checkTableIsChangedObject.changed) return;
                this.checkTableIsChangedObject.changed = true;

                let nft = $.notify({
                    message: '<div id="refresh-notify"><span>' + App.translate('The table was changed by the user <b>%s</b> at <b>%s</b>', [tableUpdated.username, App.dateFormats.covert(tableUpdated.dt, 'YY-MM-DD HH:mm', App.lang.timeDateFormatNoYear)]) + '</span> <button class="btn btn-warning btn-sm" style="margin-right: 20px;">' +
                        App.translate("Refresh") + '</button></div>'
                }, {
                    type: 'warning',
                    allow_dismiss: false,
                    delay: 0
                });
                nft.$ele.find('#refresh-notify button').on('click', () => {
                    delete this.checkTableIsChangedObject.changed;
                    let pagination = undefined;
                    if (this.PageData) {
                        if (this.PageData.offset === 0) {
                            pagination = 'page';
                        } else if (this.PageData.offset >= Math.ceil(this.PageData.allCount / this.PageData.onPage) * this.PageData.onPage) {
                            if (Object.keys(this.data).length === this.PageData.onPage)
                                pagination = -1;
                            else
                                pagination = 'page';
                        }

                    }

                    let func;
                    if (pagination) {
                        func = (json) => {
                            this.applyPage(json.chdata, json.allCount, pagination === -1 ? (json.allCount - this.PageData.onPage) : undefined)
                            delete json.chdata.rows;
                            this.table_modify(json);
                            this.reloaded();
                        }
                    } else {
                        func = (json) => {
                            /*this.PageData = {
                                 ...this.PageData, ...{
                                     offset: json.chdata.offset
                                     , allCount: json.allCount
                                     , loading: false
                                 }
                             }
                             this.PageData.$block.empty().append(this._paginationCreateBlock());*/

                            this.table_modify(json);
                            this.reloaded();
                        }
                    }

                    this.model.refresh(func, undefined, pagination, pagination ? true : false);
                });
            }
            ,
            checkTableIsChanged: function () {
                if (!this.checkTableIsChangedObject) {
                    this.checkTableIsChangedObject = {
                        abort: () => {
                            if (this.checkTableIsChangedObject.jqXHR && this.checkTableIsChangedObject.jqXHR.abort)
                                this.checkTableIsChangedObject.jqXHR.abort();
                            this.checkTableIsChangedObject.aborted = true;

                        }

                    };
                    document.addEventListener("visibilitychange", () => {
                        if (this.checkTableIsChangedObject.changed) return;

                        switch (document.visibilityState) {
                            case 'hidden':
                                this.checkTableIsChangedObject.abort();
                                break;
                            case 'visible':
                                this.checkTableIsChanged();
                                break;
                        }
                    });
                }

                this.checkTableIsChangedObject.abort();
                delete this.checkTableIsChangedObject.aborted;

                this.model.checkTableIsChanged(this.checkTableIsChangedObject).then((json) => {
                    if (json.no || this.model.tableData.updated.code === json.code) {
                        this.checkTableIsChanged();
                    } else {
                        let checkIsNotAlreadyChanged = () => {
                            if (this.model.tableData.updated.code === json.code) {
                                this.checkTableIsChanged();
                            } else {
                                this.showRefreshButton(json);
                            }
                        };
                        this.model.doAfterProcesses(
                            function () {
                                setTimeout(checkIsNotAlreadyChanged, 200)
                            }
                        )

                    }
                });
            }
            ,
            _getRowTitleByMainField: function (item, format) {
                let itemTitle = '';
                if (item.id) {
                    let mainField = this.mainFieldName;
                    if (item[mainField]) {
                        if (item[mainField].v_ !== undefined) {
                            if (typeof item[mainField].v_ === 'array') {
                                item[mainField].v_.forEach(function (v_, i) {
                                    let d = $('<span>').text(this.fields[mainField].getElementString((item[mainField].v ? item[mainField].v[i] : null), v_));
                                    if (v_[1]) {
                                        d.addClass('deleted_value')
                                    }
                                    itemTitle = d.html();
                                })
                            } else {
                                itemTitle = $('<div>').text(this.fields[mainField].getElementString(item[mainField].v, item[mainField].v_)).html();
                            }
                        } else if (item[mainField].v !== undefined) {
                            itemTitle = $('<div>').text(item[mainField].v).html();
                        }
                    } else {
                        itemTitle = 'id: ' + item.id;
                    }
                }

                if (format && itemTitle) {
                    itemTitle = format.replace('%s', itemTitle);
                }
                return itemTitle;
            }
            ,
            _getFieldbyName: function (fieldName) {
                return this.fields[fieldName];
            }
            ,
            _getColumnIndexByTd: function (td, tr) {
                var tr = tr || td.closest('tr');
                return tr.find('td').index(td);
            }
            ,
            _fieldByTd: function (td, tr) {
                let cIndex = this._getColumnIndexByTd(td, tr);
                return this.fieldCategories.visibleColumns[cIndex - 1];
            }
            ,
            _getRowIndexById: function (id) {
                var index = null;
                let p = this;
                for (let i in p.data) {
                    if (p.data[i].id == id) {
                        return i;
                        break;
                    }
                }
                return null;
            }
            ,
            _getFieldBytd: function (td) {
                if (!td.closest('tr').is('.DataRow')) {
                    return this.fields[td.data('field')]
                } else {
                    return this.fieldCategories.visibleColumns[td.closest('tr').find(td.prop('tagName')).index(td) - 1]
                }

            }
            ,
            _isParamsArea: function ($obj) {
                return $obj.closest('table').is('.pcTable-paramsTable')
            }
            ,
            _isFootersArea: function ($obj) {
                return $obj.closest('tbody').is('.pcTable-footers')
            }
            ,
            _getItemBytd: function (td) {
                let tr = td.closest('tr');
                return this._getItemByTr(tr);
            }
            ,
            _getItemByTr: function (tr) {
                if (!tr.is('.DataRow')) {
                    return this.data_params;
                }
                return this.data[tr.data(pcTable_ROW_ItemId_KEY)];
            }
            ,
            _getItemById: function (id) {
                return this.data[id];
            }
            ,
            _deleteItemById: function (id) {
                let item = this._getItemById(id);
                if (item && item.$tr) {
                    item.$tr.remove();
                }
                if (this.openedPanels[id]) {
                    this.openedPanels[id].close();
                }

                ['dataSorted', 'dataSortedVisible', '__checkedRows'].forEach(function (array) {
                    let ind;
                    this[array].forEach((v, k) => {
                        if (v.toString() === id.toString()) {
                            ind = k
                        } else if (typeof v === 'object') {
                            if (v.row && v.row.id.toString() === id.toString())
                                ind = k
                        }
                    })

                    if (ind !== undefined) {
                        this[array].splice(ind, 1);
                    }
                }, this);

                if (this.isTreeView) {
                    this.treeDeletingRow(id)
                }
                delete this.data[id];
            }
            ,
            _getTdByFieldName: function (fieldName, tr) {
                let fieldIndex = 0;
                this.fieldCategories.visibleColumns.every(function (field, index) {
                    if (fieldName == field.name) {
                        fieldIndex = index;
                        return false;
                    }
                    return true;
                });
                return this._getTdByColumnIndex(tr, fieldIndex + 1);
            }
            ,
            _getTdByColumnIndex: function (tr, index) {
                return tr.find('td:eq(' + index + ')');
            }
            ,
            refresh: function () {
                this._refreshTitle();
                this._refreshParamsBlock();
                this._refreshFiltersBlock(this.data_params);
                this._refreshFootersBlock();

                this._refreshContentTable();

            }
            ,

            initRowsData: function () {

                this.__checkedRows = [];
                this.dataSorted = [];
                this.dataSortedVisible = [];
                if (this.ScrollClasterized)
                    this.ScrollClasterized.emptyCache();

                if (this.isTreeView) {

                    this.tree.forEach((tv, i) => {
                        this.getTreeBranch(tv, i);
                    })

                    if (this.rows) {
                        this._treeApplyRows(this.rows);
                    }

                    setTimeout(() => {
                        this.treeApply();
                    })
                    this.model.setLoadedTableData(this.data);

                } else {
                    let data = {};
                    if (this.rows) {
                        this.rows.map(function (item) {
                            this.dataSorted.push(item.id);
                            this.dataSortedVisible.push(item.id);
                            data[item.id] = item;
                            data[item.id].$checked = -1 !== this.__checkedRows.indexOf(item.id) ? true : false;
                        }, this);
                    }
                    this.data = data;
                    this.model.setLoadedTableData(this.data, this.PageData ? this.PageData.offset : undefined, this.PageData ? this.PageData.onPage : undefined);
                }
            }
        }
    )
    ;


})
(window, jQuery);