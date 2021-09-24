(function () {
    if (!App.models)
        App.models = {};

    App.models.table = function (url, tableData, extraData) {

        let Processes = {}, ProcessesId = 0;

        let iframeNum = 0;
        let dataRows, offset, onPage;
        let pcTable;
        let startedQuery = null;

        const getFilteredItem = function (item) {
            let itemTmp = {};
            Object.keys(item).forEach(function (k) {
                //Фильтруем jquery-объекты из item
                if (!/^\$/.test(k)) {
                    if (k === 'id') {
                        itemTmp[k] = item[k];
                    } else {
                        if (item[k] !== null && typeof item[k] === 'object' && Object.keys(item[k]).indexOf('v') !== -1) {
                            itemTmp[k] = item[k]['v'];
                        } else {
                            itemTmp[k] = item[k];
                        }
                    }
                }
            });
            return itemTmp;
        };


        extraData = extraData || {};
        var obj = {
            getUri: function () {
                return this.url;
            },
            setLoadedTableData: function (data, _offset, _onPage) {
                dataRows = data;
                offset = _offset;
                onPage = _onPage
            },
            addExtraData: function (filters) {
                "use strict";
                extraData = $.extend(true, {}, extraData, filters);
            },
            tableData: tableData,
            url: url,
            doAfterProcesses: function (func) {
                let model = this;
                setTimeout(function () {
                    model.getDefferedProcess().then(func);
                }, 170);
            },
            getDefferedProcess: function () {
                return new Promise((resolve, reject) => {
                    Promise.all(Object.values(Processes)).then(() => {
                        resolve();
                    })
                });
            },
            showLinks: function (json) {
                App.showLInks(json.links, pcTable.model);
                delete json.links;
            }, shoInterfaceDatas: function (json) {
                App.showDatas.call(pcTable.model, json.interfaceDatas, null, window);
                delete json.interfaceDatas;
            }, showPanels: function (json) {
                App.showPanels(json.panels, pcTable);
                delete json.panels;
            },
            addPcTable: function (pcTableIn) {
                pcTable = pcTableIn;
            },
            __ajax: function ($method, $data, RequestObject, withoutLoading, filters) {
                "use strict";
                let url = this.url;

                let inProcess = false;


                let $d = $.Deferred();
                filters = filters || {};
                let isDone = false;
                let isShownCog = false;

                let data_tmp = $.extend(true, {}, $data, {tableData: tableData, ajax: true}, extraData, filters);

                if ($data.method === 'checkTableIsChanged' || $data.method === 'checkForNotifications') {
                    if ($data.method !== 'checkForNotifications') {
                        data_tmp = $.extend({}, $data, {code: tableData.updated.code, ajax: true}, extraData);
                        if (tableData.sess_hash) {
                            data_tmp.tableData = {sess_hash: tableData.sess_hash};
                        }
                    }
                } else {
                    inProcess = true;
                    if (!withoutLoading)
                        setTimeout(function () {
                            if (!isDone) {
                                App.fullScreenProcesses.showCog();
                                isShownCog = true;
                            }
                        }, 1000);

                }
                if (data_tmp.data !== undefined && typeof data_tmp.data === 'object') {
                    data_tmp.data = JSON.stringify(data_tmp.data);
                }
                if (dataRows) {
                    data_tmp.ids = JSON.stringify(Object.keys(dataRows));
                }
                if (!('offset' in $data) && offset !== undefined) {
                    data_tmp.offset = offset;
                    data_tmp.onPage = onPage;
                }

                if (pcTable && pcTable.isRestoreView) {
                    data_tmp.restoreView = true;
                }

                let Model = this;
                let success = function (json) {

                    let methods = App.lang.modelMethods;

                    let pcTableObj = $('#table').data('pctable');
                    if (pcTableObj) {

                        if (json.LOGS) {
                            if (!pcTableObj.LOGS) pcTableObj.LOGS = {};
                            pcTableObj.LOGS = $.extend(pcTableObj.LOGS, json.LOGS);
                        }
                        if (json.FullLOGS) {
                            if (!pcTableObj.FullLOGS) pcTableObj.FullLOGS = [];

                            let logs = {'text': (methods[data_tmp['method']] || data_tmp['method'])};
                            logs.children = json.FullLOGS;
                            if (json.FullLOGS.length) {
                                pcTableObj.FullLOGS.push(logs);
                                App.blink(pcTableObj.LogButton, 8, '#fff');
                            }
                        }
                        if (json.FieldLOGS && Object.keys(json.FieldLOGS).length) {
                            pcTableObj.FieldLOGS = pcTableObj.FieldLOGS || [];
                            pcTableObj.FieldLOGS.push({
                                'data': json.FieldLOGS,
                                'name': (methods[data_tmp['method']] || data_tmp['method'])
                            });
                        }
                        if (data_tmp['method'] !== 'loadPage' && pcTableObj.PageData && json.allCount !== undefined) {
                            let changed = false;
                            if ('offset' in json && json.offset !== null && pcTableObj.PageData.offset !== json.offset) {
                                changed = true;
                                pcTableObj.PageData.offset = json.offset;
                            }
                            if ('allCount' in json && json.allCount !== null && pcTableObj.PageData.allCount !== json.allCount) {
                                changed = true;

                                if (pcTableObj.tableRow.pagination.match(/desc\s*$/)) {
                                    pcTableObj.PageData.offset += json.allCount - pcTableObj.PageData.allCount;
                                }

                                pcTableObj.PageData.allCount = json.allCount

                            }
                            if (changed) {
                                pcTableObj.PageData.$block.empty().append(pcTableObj._paginationCreateBlock.call(pcTableObj))
                            }
                        }
                    }


                    if (json.tableChanged) {
                        pcTable.showRefreshButton(json.tableChanged)
                    }

                    if (!json.error) {
                        if (json.reload) window.location.href = window.location.href;
                        else {
                            if (json.links && json.links.length > 0) Model.showLinks(json);
                            if (json.interfaceDatas && json.interfaceDatas.length > 0) Model.shoInterfaceDatas(json);
                            if (json.panels && json.panels.length > 0) Model.showPanels(json);
                        }
                        $d.resolve(json);

                        setTimeout(() => {
                            if (json.chdata && json.updated && pcTable.editPanels) {
                                pcTable.editPanels.forEach((panel) => {
                                    panel.refresh();
                                })
                            }
                        }, 10)


                    } else {
                        var errorText = $('<div>').html(json.error.replace(/\[\[(.*?)\]\]/g, '<b>$1</b>'));

                        if (json.log) {
                            let btn = $('<button class="btn btn-xxs btn-danger"><i class="fa fa-info" style="padding-top: 3px;" aria-hidden="true"> c</i></button>');
                            btn.on('click', function () {
                                BootstrapDialog.show({
                                    message: $('<pre style="max-height: ' + ($('body').height() - 200) + 'px; overflow: scroll">').css('font-size', '11px').text(JSON.stringify(json.log, null, 1)),
                                    type: BootstrapDialog.TYPE_DANGER,
                                    title: App.translate('Calculate log'),
                                    buttons: [{
                                        'label': null,
                                        icon: 'fa fa-times',
                                        cssClass: 'btn-m btn-default btn-empty-with-icon',
                                        'action': function (dialog) {
                                            dialog.close();
                                        }
                                    }],
                                    draggable: true,
                                    onshown: function (dialog) {
                                        dialog.$modalContent.position({
                                            of: window
                                        })
                                    },
                                    onshow: function (dialog) {
                                        dialog.$modalHeader.css('cursor', 'pointer')
                                        dialog.$modalContent.css({
                                            width: 1200
                                        });
                                    }

                                });

                            });
                            errorText.append(' ');
                            errorText.append(btn)
                        }
                        App.notify(errorText)
                        $d.reject(json);
                    }
                }, fail = function (obj) {
                    let error, timeout;
                    if (obj && obj.status === 200) {
                        if (obj.responseJSON && obj.responseJSON.error) error = obj.responseJSON.error;
                        else {
                            error = $('<div>' + App.translate('Operation execution error') + '  </div>');
                            if (pcTable && pcTable.isCreatorView) {
                                error.append('<button class="btn danger-backg btn-xs" data-toggle="collapse" data-target="#notify-texh"><i class="fa fa-angle-down"></i><i class="fa fa-angle-up"></i></button>');
                                error.append($('<div id="notify-texh" class="collapse">').append($('<code>').text(obj.responseText)));
                            }
                        }
                    } else {

                        if (!RequestObject && obj && obj.statusText != "abort" && obj.statusText != "error") {
                            error = obj.statusText;
                            timeout = 200;

                        } else if (RequestObject && RequestObject.jqXHR) {
                            if (RequestObject.jqXHR.statusText !== "abort") {
                                error = App.translate('No server connection');
                                timeout = 200;
                            }
                        }
                    }

                    if (error && ['checkTableIsChanged', 'checkForNotifications'].indexOf($data.method) === -1) {
                        if (timeout) {
                            setTimeout(function () {
                                App.notify(error);
                            }, timeout)
                        } else {
                            App.notify(error);
                        }
                        if (!obj.responseText) {
                            //console.log(obj, RequestObject);

                        }
                    }

                    $d.reject(obj);
                };


                let ajax = function () {

                    //Чтобы не блокировала защищенная подсеть
                    if (true) {
                        if (((new Date()).getTime() - startedQuery) < 150) {
                            setTimeout(ajax, 50);
                            return;
                        }
                        startedQuery = (new Date()).getTime();
                        if (/\?/.test(url)) {
                            url += '&';
                        } else url += '?';
                        url += 'rn=' + Math.round(Math.random() * 100000) + (data_tmp['method'] || '');
                    }
                    if (!RequestObject || RequestObject.aborted !== true) {
                        $.ajax({
                            url: url,
                            method: $method,
                            data: data_tmp,
                            dataType: 'json',
                            beforeSend: function (jqXHR, settings) {
                                if (RequestObject) {
                                    RequestObject.jqXHR = jqXHR;
                                }

                            }
                        }).then(success).fail(fail)
                    } else {
                        fail({statusText: "abort"});
                    }
                };
                ajax();

                let id = ++ProcessesId;
                let rzlv;
                Processes[id] = new Promise((resolve) => {
                    rzlv = resolve;
                })

                let cleanProcess = function () {

                    setTimeout(() => {
                        delete Processes[id];
                    }, 1000);

                    isDone = true;
                    if (isShownCog) {
                        App.fullScreenProcesses.hideCog();
                    }
                };

                if (!inProcess) {
                    rzlv();
                    rzlv = () => {
                    };
                }

                $d.always(function () {
                    setTimeout(cleanProcess, 100);
                    setTimeout(rzlv, 50);
                });

                return $d.promise();

            },
            delete: function (ids) {
                if (ids.length === 0)
                    return false;

                return this.__ajax('post', {delete_ids: JSON.stringify(ids), method: 'delete'});
            },
            restore: function (ids) {
                if (ids.length === 0)
                    return false;

                return this.__ajax('post', {restore_ids: JSON.stringify(ids), method: 'restore'});
            },
            duplicate: function (ids, unic_replaces, insertAfter) {
                if (ids.length === 0)
                    return false;

                return this.__ajax('post', {
                    duplicate_ids: JSON.stringify(ids),
                    data: unic_replaces,
                    insertAfter: insertAfter,
                    method: 'duplicate'
                });
            },
            dblClick: function (rowId, fieldName) {
                return this.__ajax('post', {field: fieldName, id: rowId, method: 'dblClick'});
            },
            getFieldLog: function (fieldName, rowId, rowName) {
                return this.__ajax('post', {field: fieldName, id: rowId, method: 'getFieldLog', rowName: rowName});
            },
            refresh_rows: function (ids) {
                if (ids.length === 0)
                    return false;

                return this.__ajax('post', {refreash_ids: JSON.stringify(ids), method: 'refresh_rows'});
            },
            refresh_cycles: function (ids) {
                if (ids.length === 0)
                    return false;

                return this.__ajax('post', {refreash_ids: JSON.stringify(ids), method: 'refresh_cycles'});
            },
            checkUnic: function (fieldName, val) {
                "use strict";
                return this.__ajax('post', {fieldName: fieldName, fieldVal: val, method: 'checkUnic'});
            },
            add: function (hash, data) {
                return this.__ajax('post', {hash: hash, method: 'add', data: data});
            },
            getValue: function (data, table_id) {
                return this.__ajax('post', {data: data, method: 'getValue', table_id: table_id});
            },
            getNotificationsTable: function () {
                return this.__ajax('post', {method: "getNotificationsTable"});
            },
            get: function (id) {
                return this.__ajax('get', {id: id});
            },
            setTableFavorite: function (status) {
                return this.__ajax('post', {status: status, method: 'setTableFavorite'});
            },
            checkInsertRow: function (data, hash, clearField) {
                var sendData = {};
                $.each(data, function (k, v) {
                    if (v != undefined) {
                        sendData[k] = v;
                    }
                });
                return this.__ajax('post', {
                    data: sendData,
                    hash: hash,
                    clearField: clearField,
                    method: 'checkInsertRow'
                });
            },
            checkEditRow: function (data) {
                var sendData = {};
                $.each(data, function (k, v) {
                    if (v != undefined) {
                        sendData[k] = v;
                    }
                });
                return this.__ajax('post', {data: sendData, method: 'checkEditRow'});
            },
            viewRow: function (id) {
                return this.__ajax('post', {id: id, method: 'viewRow'});
            },
            checkTableIsChanged: function (RequestObject) {
                return this.__ajax('post', {
                    method: 'checkTableIsChanged',
                    table_id: pcTable.tableRow.id,
                    cycle_id: pcTable.tableRow.cycle_id,
                }, RequestObject);
            },
            checkForNotifications: function (periodicity, activeNotifications, RequestObject) {
                return this.__ajax('post', {
                    method: 'checkForNotifications',
                    periodicity: periodicity,
                    activeIds: activeNotifications,
                }, RequestObject);
            }
            , notificationUpdate: function (id, type, num, item) {
                return this.__ajax('post', {
                    method: 'notificationUpdate',
                    id: id,
                    num: num,
                    item: item,
                    type: type,
                });
            },
            seachUserTables: function (searchString, excludeTop) {
                return this.__ajax('post', {
                    method: 'seachUserTables',
                    q: searchString,
                    et: excludeTop
                });
            },
            selectSourceTableAction: function (field_name, data) {
                return this.__ajax('post', {
                    field_name: field_name,
                    data: data,
                    method: 'selectSourceTableAction'
                });
            },
            saveEditRow: function (data) {
                var sendData = {};
                $.each(data, function (k, v) {
                    if (v !== undefined) {
                        sendData[k] = v;
                    }
                });
                return this.__ajax('post', {data: sendData, method: 'saveEditRow'});
            },
            getEditSelect: function (item, fieldName, q, parentid, withLoading, RequestObject) {
                var sendData = {};
                return this.__ajax('post', {
                    data: {item: item, field: fieldName},
                    q: q,
                    parentId: parentid,
                    method: 'getEditSelect'
                }, RequestObject, !withLoading);
            },
            loadPreviewHtml: function (fieldName, item, val) {
                return this.__ajax('post', {
                    data: {item: getFilteredItem(item), field: fieldName, val: val},
                    method: 'loadPreviewHtml'
                }, null, true);
            },
            save: function (data) {
                let _filters = {};
                if (data.params) {
                    Object.keys(data.params).some(function (fName) {
                        if (pcTable.fields[fName].category === 'filter') {
                            if (pcTable._filtersBlock.data('cryptoFilters')) {
                                _filters.filters = pcTable._filtersBlock.data('cryptoFilters');
                            }
                            return true;
                        }
                    });
                }
                return this.__ajax('post', {data: data, method: 'edit'}, null, null, _filters);
            },
            click: function (data) {
                return this.__ajax('post', {data: data, method: 'click'});
            },
            csvExport: function (idsVisibleSorted, type, visibleFields) {
                return this.__ajax('post', {
                    method: 'csvExport',
                    type: type,
                    sorted_ids: JSON.stringify(idsVisibleSorted),
                    visibleFields: JSON.stringify(visibleFields)
                });
            },
            csvImport: function (csv, type, answers, visibleFields) {
                return this.__ajax('post', {
                    csv: csv, type: type,
                    answers: answers,
                    method: 'csvImport',
                    visibleFields: JSON.stringify(visibleFields)
                });
            },
            getTableData: function (sess_hash) {
                return this.__ajax('post', {method: 'getTableData', tableData: {sess_hash: sess_hash}});
            },
            panelsView: function (switcher) {
                return this.__ajax('post', {method: 'panelsViewCookie', switcher: switcher ? 1 : 0});
            },
            refresh: function (func, refreshType, withoutIds, getList) {

                func = func || function (json) {
                    pcTable.table_modify.call(pcTable, json);
                    pcTable.reloaded.call(pcTable);
                };
                let tree;
                if (pcTable.treeIndex) {
                    tree = {};
                    Object.keys(pcTable.treeIndex).forEach((k) => {
                        tree[k] = pcTable.treeIndex[k].l ? 1 : 0;
                    })
                    tree = JSON.stringify(tree);
                }
                this.__ajax('post', {
                    method: 'refresh',
                    tree: tree,
                    recalculate: refreshType === 'recalculate' ? true : null,
                    withoutIds: withoutIds,
                    getList: getList
                }).then(function (json) {
                    try {
                        func(json)
                    } catch (e) {
                        window.location.reload();
                    }
                })
            },
            saveOrder: function (ids) {
                return this.__ajax('post', {method: 'saveOrder', orderedIds: JSON.stringify(ids)});
            },
            setCommentsViewed: function (nums, field_name, id) {
                return this.__ajax('post', {method: 'setCommentsViewed', nums: nums, field_name: field_name, id: id});
            },
            AddEyeGroupSet: function (name, fields) {
                return this.__ajax('post', {method: 'addEyeGroupSet', name: name, fields: fields});
            },
            removeEyeGroupSet: function (index) {
                return this.__ajax('post', {method: 'removeEyeGroupSet', index: index});
            },
            leftEyeGroupSet: function (index) {
                return this.__ajax('post', {method: 'leftEyeGroupSet', index: index});
            },
            reUser: function (userId) {
                return this.__ajax('post', {method: 'reuser', userId: userId, location: window.location.pathname});
            },
            printTable: function (settings) {
                return this.__ajax('post', {method: 'printTable', settings: JSON.stringify(settings)});
            }
            ,
            getAllTables: function () {
                return this.__ajax('post', {method: 'getAllTables'});
            },
            calcFieldsLog: function (data, name) {
                return this.__ajax('post', {method: 'calcFieldsLog', calc_fields_data: data, name: name})
            },
            renameField: function (name) {
                return this.__ajax('post', {method: 'renameField', name: name})
            },

            panelButtonsClick: function (hash, index) {
                return this.__ajax('post', {method: 'panelButtonsClick', hash: hash, index: index})
            },
            panelButtonsClear: function (hash) {
                return this.__ajax('post', {method: 'panelButtonsClear', hash: hash})
            },
            linkJsonClick: function (hash, json) {
                return this.__ajax('post', {method: 'linkJsonClick', hash: hash, json: json})
            },
            buttonsClick: function (hash, index) {
                return this.__ajax('post', {method: 'linkButtonsClick', hash: hash, index: index})
            }, inputClick: function (hash, val) {
                return this.__ajax('post', {method: 'linkInputClick', hash: hash, val: val})
            },
            getChartTypes: function () {
                return this.__ajax('post', {method: 'getChartTypes'})
            },
            getPanelFormats: function (fName, id) {
                return this.__ajax('post', {method: 'getPanelFormats', field: fName, id: id})
            }, loadUserButtons: function () {
                return this.__ajax('post', {method: 'loadUserButtons'})
            }, userButtonsClick: function (hash, index) {
                return this.__ajax('post', {method: 'userButtonsClick', hash: hash, index: index})
            }, filesUpload: function (files, hash) {
                return this.__ajax('post', {method: 'filesUpload', "files": JSON.stringify(files), hash: hash});
            },
            loadPage: function (pcTable, lastId, count, prevLastId, offset) {
                let _filters = {};
                if (pcTable && pcTable.filtersString) {
                    _filters.filters = pcTable.filtersString;
                }
                pcTable.PageData.loading = true;

                return this.__ajax('post', {
                    method: 'loadPage',
                    lastId: lastId,
                    offset: offset,
                    pageCount: count,
                    prevLastId: prevLastId
                }, null, null, _filters).then(function (json) {
                    pcTable.applyPage(json)
                })
            }


        };
        return obj
    }
})();