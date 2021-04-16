(function () {
    const JSTREE = {...$.jstree};
    fieldTypes.tree = {
        icon: 'fa-tree',
        FullView: false,
        getEditVal: function (div) {
            return div.data('val');
        },
        getEditElement: function ($oldInput, oldValueParam, item, enterClbk, escClbk, blurClbk, tabindex, editNow) {
            let field = this;
            let div = $oldInput || $('<div>');
            let dialog = div.data('dialog') || $('<div>').css('min-height', 200);
            div.data('dialog', dialog);
            let buttons, btn;

            oldValueParam = oldValueParam.v || '';

            const save = function (dlg, event, notEnter) {
                let checked_ids = [];
                let checked = dialog.data('jstree').jstree("get_selected", true);
                checked.forEach(function (node) {
                    checked_ids.push(node.id);
                });

                if (!field.multiple) {
                    checked_ids = checked_ids[0] || '';
                }

                div.data('val', checked_ids);
                if (!notEnter) {
                    enterClbk(div, {});
                    dlg.close();
                }
            };
            let formFill = function (dlg) {
                field.treePanel.call(field, dialog, item, oldValueParam);
            };


            buttons = [];

            let btnsSave = {
                'label': "Сохранить",
                cssClass: 'btn-m btn-warning',
                action: save
            }, btnsClose = {
                'label': null,
                icon: 'fa fa-times',
                cssClass: 'btn-m btn-default btn-empty-with-icon',
                'action': function (dialog) {
                    escClbk(div, {});
                    dialog.close();
                }
            };

            let title = '<b>' + (this.title) + '</b>';
            let eventName = 'ctrlS.commentdialog';
            const onshown = function (dialog) {
                if (!field.pcTable.isMobile) {
                    dialog.$modalHeader.css('cursor', 'pointer');
                    dialog.$modalContent.css({
                        width: $('body').width() * 0.8 > 800 ? 800 : $('body').width() * 0.8
                    });
                }

                if (dialog.$modalBody.find('textarea').length === 0) {
                    formFill(dialog);
                }
                $('body').on(eventName, function (event) {
                    save(dialog, event, false);
                });

            };
            if (editNow) {
                let btnClicked = false;
                setTimeout(function () {

                    let cdiv = div.closest('td').find('.cdiv');
                    if (cdiv.length > 0) {
                        cdiv.data('bs.popover').options.content.find('.btn').each(function () {
                            btn = $(this);
                            let buttn = {};
                            buttn.label = btn.data('name');
                            buttn.cssClass = btn.attr('class').replace('btn-sm', 'btn-m');
                            buttn.icon = btn.find('i').attr('class');
                            buttn.save = btn.data('save');
                            buttn.click = btn.data('click');
                            buttn.action = function (dialog) {
                                if (buttn.save) {
                                    save(dialog, {}, true);
                                }
                                buttn.click({});
                                btnClicked = true;
                                dialog.close();
                            };

                            buttons.push(buttn)
                        });
                        cdiv.popover('destroy');
                    } else {
                        buttons.push(btnsSave);
                        buttons.push(btnsClose)
                    }

                    if (field.pcTable.isMobile) {
                        App.mobilePanel(title, dialog, {
                            buttons: buttons,
                            onhide: function (dialog) {
                                $('body').off(eventName);
                                if (!btnClicked) {
                                    blurClbk(div, {});
                                }
                            },
                            onshow: onshown
                        })
                    } else {
                        BootstrapDialog.show({
                            message: dialog,
                            type: null,
                            title: title,
                            cssClass: 'fieldparams-edit-panel',
                            draggable: true,
                            buttons: buttons,
                            onhide: function (dialog) {
                                $('body').off(eventName);
                                if (!btnClicked) {
                                    blurClbk(div, {});
                                }
                            },
                            onshown: function (dialog) {
                                dialog.$modalContent.position({
                                    of: $('body'),
                                    my: 'top+50px',
                                    at: 'top'
                                });
                            },
                            onshow: onshown

                        });
                    }
                }, 1);


                div.text('Редактирование в форме').addClass('edit-in-form');
            } else {
                let showned = false;
                div.off().on('focus click', 'button', function () {
                    if (showned) return false;
                    showned = true;
                    let buttonsClick = buttons.slice(0);
                    buttonsClick.push(btnsSave);
                    buttonsClick.push(btnsClose);

                    var div = $(this).closest('div');

                    if (field.pcTable.isMobile) {
                        App.mobilePanel(title, dialog, {
                            buttons: buttonsClick,
                            onhide: function (event) {
                                showned = false;
                                $('body').off(eventName);
                                escClbk(div, event);
                            },
                            onshow: onshown
                        })
                    } else {
                        BootstrapDialog.show({
                            message: dialog,
                            type: null,
                            cssClass: 'fieldparams-edit-panel',
                            title: title,
                            draggable: true,
                            size: BootstrapDialog.SIZE_WIDE,
                            buttons: buttonsClick,
                            onhide: function (event) {
                                showned = false;
                                $('body').off(eventName);
                                escClbk(div, event);
                            },
                            onshow: onshown
                        })
                    }

                });

                if (div.find('button').length === 0) {
                    btn = $('<button class="btn btn-default btn-sm text-edit-button">').text('Редактирование в форме');
                    if (tabindex) btn.attr('tabindex', tabindex);

                    div.append(btn);


                }

            }
            return div.data('val', oldValueParam);//.attr('data-category', category).attr('data-category', category);

        },
        treePanel: function ($treeblock, itemIn) {
            let field = this;
            let item = $.extend(true, {}, itemIn);


            let plugins = ["themes", 'json_data', 'search'];//, 'massload'
            if (field.multiple) {
                plugins.push('checkbox');
            }
            let $search = $('<div class="tree-search"><input class="form-control" type="text"></div>');
            let $searchInput = $search.find('input');

            setTimeout(() => {
                $searchInput.focus()
            }, 200);

            let $mes = $('<div></div>');


            let closed = 0;
            let to = false;
            let pastSearch = "";

            $searchInput.keyup(function () {
                if (to) {
                    clearTimeout(to);
                }
                to = setTimeout(function () {

                    if ($mes.closest('body').length) {
                        let v = $searchInput.val();
                        if (pastSearch !== v) {
                            pastSearch = v;
                            $mes.jstree(true).search(v, closed === 0);
                        }
                    }
                }, 750);
            });


            $treeblock.html($search).append($mes);
            $treeblock.data('jstree', $mes);

            if (!this.multiple && this.withEmptyVal) {
                $mes.on("click", 'li.jstree-node[aria-selected="true"]', function (e) {
                    $mes.jstree(true).deselect_node($(this));
                    return false;
                })

            }
            let reloadStates = null;

            $mes.on("init.jstree", function (e, data) {
                data.instance.settings.checkbox.cascade = '';

                let c = $.jstree.core.prototype.redraw_node

                if (field.changeSelectTable) {
                    $mes.jstree(true).redraw_node = function (node, deep, is_callback, force_render) {
                        let _node = c.bind(this)(node, deep, is_callback, force_render);
                        let data = $mes.jstree(true).get_node(node);
                        let canEdit = true;
                        let canAdd = field.changeSelectTable === 2 && field.parentName;
                        if (!field.treeAutoTree) {
                            if (!data.original.id.toString().match(/^\d+$/)) {
                                canEdit = false;
                            } else {
                                canAdd = false;
                            }
                        }
                        const redraw = function () {
                            $mes.jstree(true).refresh(false, true);
                        }
                        let $icon = $(_node).find('>a i:first');
                        if (canEdit) {
                            $icon1 = $('<i class="fa fa-edit edit-tree-icon"></i>');
                            $icon.after($icon1);
                            $icon1.on('click', () => {
                                (new EditPanel(field.selectTable, null, {id: data.id})).then(() => {
                                    reloadStates = {}
                                    Object.values($mes.jstree(true)._model.data).forEach((v) => {
                                        reloadStates[v.id] = !!v.state.opened;
                                    })
                                    redraw()
                                })
                                return false
                            })
                            $icon = $icon1;
                        }
                        if (canAdd) {
                            let $icon2 = $('<i class="fa fa-plus edit-tree-icon"></i>');
                            $icon.after($icon2);
                            $icon2.on('click', () => {

                                (new EditPanel(field.selectTable, null, {[field.parentName]: {v: data.id.replace('PP/', '')}})).then((json) => {
                                    reloadStates = {}
                                    Object.values($mes.jstree(true)._model.data).forEach((v) => {
                                        reloadStates[v.id] = !!v.state.opened;
                                    })
                                    reloadStates[data.id] = true;

                                    if (json.chdata.rows && Object.keys(json.chdata.rows).length) {
                                        let v = Object.keys(json.chdata.rows)[0];
                                        if (field.multiply) {
                                            item[field.name]['v'].push(v)
                                        } else {
                                            item[field.name]['v'] = v;
                                        }
                                    }
                                    redraw()
                                })
                                return false
                            })
                        }
                        return _node;
                    };
                }
            }).jstree({
                "search": {
                    "show_only_matches": true,
                    "case_insensitive": true,
                    "show_only_matches_children": true,
                    search_callback: function (q, title) {
                        if (!title) return false;

                        let qs = q.toLowerCase().replace('ё', 'е').split(" ");
                        let text = title.text.toLowerCase().replace('ё', 'е');

                        return !qs.some(function (q) {
                            return text.indexOf(q) === -1
                        })
                    },
                    'ajax': function (q, cd) {
                        var self = this;
                        field.getEditSelect(item, q, null).then(function ($data) {
                            cd.call(self, $data[0])
                        });
                    },
                },
                "massload": function (ids, cd) {
                    var self = this;
                    closed -= 1;
                    field.getEditSelect(item, "", ids).then(function ($data) {
                        Object.values($data[0]).forEach(function (children) {
                            children.forEach(function (v) {
                                if (v.children === true) {
                                    closed += 1;
                                }
                            });
                        });

                        cd.call(self, $data[0])
                    });

                },
                'core': {
                    'check_callback': true,
                    "open_parents": true,
                    'data': function (obj, cd) {
                        var self = this;
                        closed -= 1;
                        field.getEditSelect(item, "", obj.id == "#" ? null : obj.id).then(function ($data) {
                            $data[0].forEach(function (v) {
                                    if (reloadStates && reloadStates[v.id]) {
                                        v.state = {
                                            ...{opened: true}
                                            , ...v.state || {}
                                        };
                                        if (v.children === true) {
                                            closed += 1;
                                        }
                                    }
                                }
                            );
                            cd.call(self, $data[0])
                        });
                    },
                    themes: {
                        "icons": false,
                        'name': 'default'
                    }
                }
                , checkbox: {
                    //  three_state: false,
                },
                "plugins": plugins
            });

            if (field.multiple) {
                if (field.category === "filter") {
                    $mes.on("select_node.jstree", function (evt, data) {
                        if (["*ALL*", "*NONE*"].indexOf(data.node.id) !== -1) {
                            if (data.selected.length > 1) {
                                data.selected.forEach(function (nodeId) {
                                    if (nodeId !== data.node.id) {
                                        data.instance.deselect_node($mes.jstree(true).get_node(nodeId));
                                    }
                                });

                            }
                        } else {
                            ["*ALL*", "*NONE*"].forEach(function (nodeId) {
                                if (data.selected.indexOf(nodeId) !== -1) {
                                    data.instance.deselect_node($mes.jstree(true).get_node(nodeId));
                                }
                            })

                        }

                    })
                }
            }
        },
        getEditPanelText(fieldValue, item) {
            return this.getCellText(fieldValue.v, null, item);
        },
        getEditSelect: function (item, q, parentId) {
            let field = this;
            let d = $.Deferred();

            let itemTmp = {};
            Object.keys(item).forEach(function (k) {
                //Фильтруем jquery-объекты из item
                if (!/^\$/.test(k)) {
                    if (k === 'id' || !(item[k] !== null && typeof item[k] === 'object' && Object.keys(item[k]).indexOf('v') !== -1)) {
                        itemTmp[k] = item[k];
                    } else {
                        itemTmp[k] = item[k]['v'];
                    }
                }
            });

            this.pcTable.model.getEditSelect(itemTmp, this.name, q, parentId, true).then(function (json) {
                let lists = [json.list, json.indexed];
                if (!field.codeSelectIndividual)
                    field.list = lists;
                field.parentName = json.parent;
                d.resolve(lists);
            });
            return d;
        },
        getPanelText: function (fieldValue, td, item) {
            this.FullView = true;
            let r = this.getCellText(fieldValue, td, item);
            delete this.FullView;
            return r;
        },
        getCellText: function (fieldValue, td, item) {
            let field = this;

            if (field.name === 'tree' && item.__tree && (field.treeViewType === 'self' || (item.tree_category && item.tree_category.v))) {
                let row = item.__tree;
                let format = item.tree.f || {}
                let icon = format.icon || (row.opened ? 'folder-open' : 'folder');
                let folder = $('<i class="fa fa-' + icon + '"></i>').data('treeRow', row.v);


                let span = $('<span class="tree-view">').css('padding-left', row.level * 22).append(folder);
                if (format.expand !== false) {
                    folder.addClass('treeRow');
                    span.append($('<button class="btn btn-default btn-xxs treeRow dbl"><i class="fa fa-arrows-v"></i></button>').data('treeRow', row.v));
                }else{
                    folder.css('margin-right', 8)
                }

                if (this.treeViewType === 'self' && this.pcTable.isInsertable()) {
                    span.append($('<button class="btn btn-default btn-xxs treeRow ins"><i class="fa fa-plus"></i></button>'));
                }

                span.append(format.text || row.t);
                return span;
            } else {
                let arrayVals = item[field.name].v_;
                if (fieldValue) {
                    if (field.multiple) {
                        if (Array.isArray(fieldValue)) {
                            if (fieldValue.length === 0) return field.getElementSpan(null);
                            else if (fieldValue.length === 1) return field.getElementSpan(fieldValue[0], arrayVals[0]);
                            else {
                                if (field.multySelectView === "0" && !field.FullView) {
                                    return $('<span class="select-item">' + fieldValue.length + ' эл.<span>')
                                } else {
                                    let span = $('<span class="select-item">');
                                    fieldValue.forEach((fVal, i) => span.append(field.getElementSpan(fVal, arrayVals[i])));
                                    return span;
                                }
                            }
                        } else {
                            return field.getElementSpan(fieldValue, [fieldValue, 0]);
                        }
                    } else return field.getElementSpan(fieldValue, arrayVals);
                } else return field.getElementString(null);
            }

        },
        checkIsFiltered: function (fieldVal, filters) {
            let val, check;
            if (this.multiple) {
                val = [];
                if (fieldVal && fieldVal.v_ && fieldVal.v_.length) {
                    fieldVal.v_.forEach(function (v) {
                        val.push(v[0].hashCode().toString())
                    })
                }
                check = function (v) {
                    if (val.indexOf(v) !== -1) {
                        return true;
                    }
                }
            } else {
                val = fieldVal.v_[0] === null ? 'null' : fieldVal.v_[0].toString();
                val = val.hashCode().toString();
                check = function (v) {
                    if (v === val) {
                        return true;
                    }
                }
            }
            return filters.some(check);
        },
        addDataToFilter: function (filterVals, valObj) {

            const addFiltersData = function (valObjElem) {
                let hash;
                if (valObjElem[0] === null) {
                    hash = 'null'.hashCode();
                } else {
                    hash = valObjElem[0].toString().hashCode();
                }
                filterVals[hash] = valObjElem[0].replace(/"/g, "&quot;");
            };
            if (this.multiple) {
                if (valObj && valObj.v_.length) {
                    valObj.v_.forEach(function (valObj) {
                        addFiltersData(valObj);
                    })
                }
            } else {
                addFiltersData(valObj.v_)
            }

        },
        getElementSpan: function (val, arrayVal) {
            let span = $('<span>');

            if (val !== null) {
                span.text(this.getElementString(val, arrayVal));
                if (arrayVal[1] === 1) {
                    span.addClass('deleted_value')
                }
            }
            return span;
        },
        getElementString: function (val, arrayVal) {
            "use strict";
            if (val === null || val === undefined) {
                if (!arrayVal || !arrayVal[0]) return this.withEmptyVal || '';
            }

            if (arrayVal[0] === null || arrayVal[0] === '') {

                return '[' + (this.withEmptyVal || '') + ']';
            }
            if (this.FullView) {
                return arrayVal[2] || arrayVal[0];
            }
            return arrayVal[0];
        }
    };
})();