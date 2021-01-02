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
        "warningEditText": {"isOn": false, "Val": "Точно изменить?"},
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
//=include pcTableModules/HorizontalDraggable._js
//=include pcTableModules/RowPanel._js
//=include pcTableModules/Csv._js
//=include pcTableModules/FieldsHidding._js
//=include pcTableModules/Print._js
//=include pcTableModules/SortingN._js
//=include pcTableModules/formatFunctions._js
//=include pcTableModules/TableTreeView._js
//=include pcTableModules/TablePanelView._js


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
                if (!this.isMobile)
                    this._innerContainer.width(this.width - 80);
                else {
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


                let navTopLine = $('#nav-top-line');
                navTopLine.addClass('pcTable-type-' + this.tableRow.type);
                if (this.tableRow.type === 'tmp') {
                    navTopLine.text('Будьте внимательны - это временная таблица');
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

                if (this.isCreatorView) {
                    this._container.on('click', '.creator-icons:not([aria-describedby])', function (event) {
                        let self = $(this);
                        if (self.closest('.popover').length === 0) {
                            let div = $('<div style="width:200px" class="creator-icons">');


                            self.find('i').each(function (i, icon) {
                                let el = $('<div>').append(icon.outerHTML);

                                if (i === 0) {
                                    el.append(' ' + self.closest('th').find('.field_name').text());
                                }

                                if (icon.title) el.append(' ' + icon.title);
                                div.append(el)
                            });


                            App.popNotify({
                                isParams: true,
                                $text: div,
                                element: self,
                                trigger: 'manual',
                                placement: 'top'
                            });
                            setTimeout(function () {
                                pcTable.closeCallbacks.push(function () {
                                    if (self && self.length) self.popover('destroy');
                                })
                            }, 200);
                        }
                    })
                }
                pcTable._container.on('contextmenu', function (event) {
                    let self = $(event.target);
                    if (!(self.closest('.popover').length || self.closest('.edit-row-panel').length)) {
                        return false;

                    }
                });


                this._container.append(this._innerContainer);

                this.addReOrderRowBind();

                this.initRowsData()


                if (!this.isMobile) {
                    let timeoutResize;
                    $(window).resize(function () {
                        if (timeoutResize) clearTimeout(timeoutResize);
                        timeoutResize = setTimeout(function () {
                            pcTable.setWidthes();
                        }, 500);
                    });
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

                    if (withoutCategories.indexOf(field.category) !== -1) return;

                    if (fieldTypes[field.type]) {
                        field = $.extend({}, defaultField, fieldTypes[field.type], field);
                    } else {
                        field = $.extend({}, defaultField, field);
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
            render: function (addVars) {
                let pcTable = this;

                this.loadVisibleFields(this.f && this.f.fieldhide ? this.f.fieldhide : undefined);


                if(this.viewType==='panels')
                    this._renderTablePanelView();

                this.ScrollClasterized = this.Scroll();

                this._renderTable();
                if (this._sorting.addSortable) {
                    this._sorting.addSortable(this);
                }
                this._addSelectable();
                this._addEditable();
                this._addSave();

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
            _addSave: function () {
                $('body').on('keyup', function (event) {
                    if (event.ctrlKey || event.metaKey) {
                        if (String.fromCharCode(event.which).toLowerCase() === 's' && $('#bigOneCodemirror').length === 0) {
                            $('body').trigger('ctrlS')
                        }
                    }
                });

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
            checkTableIsChanged: function (timeout) {
                let pcTable = this;

                if (document.hidden) {
                    setTimeout(function () {
                        pcTable.checkTableIsChanged.call(pcTable, timeout);
                    }, 1000);
                } else {
                    pcTable.model.checkTableIsChanged.call(pcTable.model).then(function (json) {
                        if (json.no || pcTable.model.tableData.updated.code === json.code) {
                            pcTable.checkTableIsChanged.call(pcTable, timeout);

                        } else {
                            let checkIsNotAlreadyChanged = function () {
                                if (pcTable.model.tableData.updated.code === json.code) {
                                    pcTable.checkTableIsChanged.call(pcTable, timeout);
                                } else {

                                    $.notify({
                                        message: '<div id="refresh-notify"><button class="btn btn-warning btn-sm" style="margin-right: 20px;">' +
                                            'Обновить</button> <span>Таблица была изменена пользователем <b>' +
                                            json.username + '</b> в <b>' + App.dateFormats.covert(json.dt, 'YY-MM-DD HH:mm', 'HH:mm DD.MM')
                                            + '</b> </span></div>'
                                    }, {
                                        type: 'warning',
                                        allow_dismiss: false,
                                        delay: 0
                                    });

                                    $('#refresh-notify button').on('click', function () {
                                        pcTable.model.refresh()
                                    });
                                }
                            };
                            pcTable.model.doAfterProcesses(
                                function () {
                                    setTimeout(checkIsNotAlreadyChanged, 200)
                                }
                            )

                        }
                    });
                }

            }
            ,
            _getTableMainFieldName: function (fields, mainFieldId) {
                let fieldName;
                Object.keys(fields).some(function (f) {
                    let field = fields[f];
                    if (field.id == mainFieldId) {
                        fieldName = field.name;
                        return true;
                    }
                });
                return fieldName;
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

                ['dataSorted', 'dataSortedVisible', '__checkedRows'].some(function (array) {
                    let ind = this[array].indexOf(id);
                    if (ind !== -1) {
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
    );


})
(window, jQuery);