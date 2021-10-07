fieldTypes.select = {
    icon: 'fa-th-list',
    getEditVal: function (div) {
        if (div.data('input')) {
            var val = div.data('input').selectpicker('val');
            if (val === null) {
                if (this.multiple) val = [];
            }
            return val;
        }
    },
    loadPreviewPanel(panel, fieldName, item, val) {
        let $def = $.Deferred();
        panel.html('<div class="center"><i class="fa fa-spinner fa-spin"></i></div>');
        this.pcTable.model.loadPreviewHtml(fieldName, item, val).then(function (json) {
            if (panel) {

                let html = $('<div>');
                json.previews.forEach(
                    function (preview) {
                        let $_html = $('<div class="preview">');

                        switch (preview[2]) {
                            case 'file':
                                window.imgRand = window.imgRand || Math.random();

                                if (Array.isArray(preview[1])) {
                                    preview[1].forEach(function (file) {
                                        if (['jpg', 'png'].indexOf(file.ext) !== -1) {
                                            $_html.append($('<a href="/fls/' + file.file + '" target="_blank">').html('<img src="/fls/' + file.file + '_thumb.jpg?rand=' + window.imgRand + '"/><br/>'));
                                        }
                                        $_html.append($('<a href="/fls/' + file.file + '" target="_blank">').text(file.name + ' ' + Math.round(file.size / 1024).toLocaleString(App.langLocale) + ' Kb'));
                                    });
                                }
                                break;
                            case 'html':
                                $_html.text(preview[0]);
                                break;
                            case 'text':
                                $_html.text(App.textWithLinks(preview[1]));
                                break;
                            case 'currency':
                            case 'number':
                                if (preview[2] === 'currency') {
                                    try {
                                        $_html.text(parseFloat(preview[1]).toLocaleString(App.lang.locale));
                                    } catch (e) {
                                        $_html.text(preview[1]);
                                    }
                                } else {
                                    $_html.text(preview[1]);
                                }

                                if (preview[3]['unitType']) {
                                    $_html.append(' ' + preview[3]['unitType']);
                                }

                                break;
                            case 'url':
                                $_html = $('<div>').append($('<a target="_blank">').text(preview[1]).attr('href', preview[1]));
                                break;
                            default:
                                $_html = $('<div>').text(preview[1]);
                        }

                        html.append($('<div class="title">').text(preview[0]));
                        html.append($_html);
                    }
                );
                if(json.previews.length===0){
                    html.text(App.translate('Element preview is empty'))
                }
                panel.empty().append(html);
            }
            $def.resolve()
        }).fail(function () {
            $def.reject();
        });
        return $def;
    },
    previewPanel: function (span, li) {

        let panel = $('<div id="selectPanel" class="text preview" style="white-space: pre-wrap; height: 200px;">');
        let field = this;

        let item = {};
        if (this.category === 'column') {
            if (span.data('id')) {
                item = this.pcTable._getItemById(span.data('id'));
            } else {
                item = this.pcTable._insertItem;
            }
        } else {
            item = this.pcTable.data_params;
        }

        li.popover({
            html: true,
            content: panel,
            trigger: 'manual',
            container: 'body',
            placement: 'auto right',
            animation: false
        }).popover('show');
        let popover = $('#' + li.attr('aria-describedby')).css('z-index', 10000);

        const destroyPopover = function () {
            if (li.attr('aria-describedby')) {
                if (popover.length) {
                    li.off('.preview');
                    popover.off('.preview');
                    popover.remove();
                }
            }
        };

        li.on('mouseout.preview', function () {
            setTimeout(function () {
                if (popover && !popover.is(':hover')) destroyPopover();
            }, 300);
        });
        popover.on('mouseout.preview', function () {
            if (!popover.is(':hover') && li && !li.is(':hover')) destroyPopover();
        });


        li.one('remove destroy', function () {
            if (li.attr('aria-describedby')) {
                li.popover('destroy');
            }
        });


        field.loadPreviewPanel(panel, span.data('field'), item, span.data('val')).then(function () {
            const _t = function () {
                if (li && !li.height()) destroyPopover();
                else setTimeout(_t, 500);
            };
            _t();
        });

    },
    getEditElement: function ($oldParent, oldValue, item, enterClbk, escClbk, blurClbk, tabindex, _, cell) {
        "use strict";

        if (!oldValue) oldValue = {};
        oldValue = $.extend(true, {}, oldValue);

        let field = this,
            input,
            divParent,
            LISTs,
            val = oldValue.v || null;

        if (field.multiple && typeof val === 'string') {
            try {
                val = JSON.parse(val);
            } catch (e) {
                val = [];
            }
        }

        if ($oldParent && $oldParent.data('input')) {
            divParent = $oldParent;
            input = divParent.data('input');
            input.data('is-rendered', true);

            LISTs = input.data('LISTs');
        } else {
            divParent = $('<div>');
            LISTs = {
                isListForLoad: true,
                innerList: [],
                innerIndexed: [],
                isSliced: true,
                isPreview: false
            };
            if (field.list) {
                LISTs = field.list;
            }
        }

        let selectQueries = [];
        divParent.on('remove', () => {
            selectQueries.forEach((RequestObject) => {
                if (RequestObject.jqXHR && RequestObject.jqXHR.abort) {
                    RequestObject.jqXHR.abort();
                } else {
                    RequestObject.aborted = true;
                }
            })
        })
        let GetLoadListDeffered = function (q) {
            
            let def = $.Deferred();
            let itemTmp = {};
            Object.keys(item).forEach(function (k) {
                //Фильтруем jquery-объекты из item
                if (!/^\$/.test(k)) {
                    if (k === 'id') {
                        itemTmp[k] = item[k];
                    } else if (k === field.name) {
                        itemTmp[k] = val
                    } else {
                        if (item[k] !== null && typeof item[k] === 'object' && Object.keys(item[k]).indexOf('v') !== -1) {
                            itemTmp[k] = item[k]['v'];
                        } else {
                            itemTmp[k] = item[k];
                        }
                    }
                }
            });
            if (divParent.isAttached()) {
                divParent.append('<i class="fa fa-cog fa-spin fa-3x loading" style="position: absolute; z-index: 1' +
                    '    right: 1px;' +
                    '    top: 1px;' +
                    '    font-size: 8px;"/>');
            }
            let RequestObject = {};
            selectQueries.push(RequestObject);

            field.pcTable.model.getEditSelect(itemTmp, field.name, q, null, null, RequestObject).then(function (json) {
                divParent.find('.loading').remove();

                LISTs.innerList = json.list ? json.list : [];
                LISTs.innerIndexed = json.indexed ? json.indexed : {};
                LISTs.isSliced = json.sliced;
                LISTs.isPreview = json.previewdata;

                if (!field.codeSelectIndividual && (q === null || q === '' || q === undefined) && !LISTs.isSliced) {
                    field.list = LISTs;
                    LISTs.isListForLoad = false;
                }


                def.resolve()
            }, function () {
                def.reject();
            });
            return def.promise();
        };


        setTimeout(function () {
            if (divParent.length && divParent.isAttached() && divParent.find('.mark-loading').length) {
                divParent.find('.mark-loading').html('<i class="fa fa-spinner"></i>');
            }
        }, 200);


        let iRenered = 0;
        const renderMe = function () {

                if (item[field.name] && item[field.name].replaceViewValue && LISTs.innerIndexed[item[field.name].v]) {
                    item[field.name].replaceViewValue(LISTs.innerIndexed[item[field.name].v]);
                    delete item[field.name].replaceViewValue;
                }

                let td = divParent.closest('body');
                if (td && td.length) {

                    let $ = td.get(0).ownerDocument == document ? window.$ : window.top.$;


                    const addValues = function (val, q) {
                        "use strict";
                        let optgroups = {
                            [App.translate('Selected')]: $('<optgroup label="' + App.translate('Selected') + '">'),
                            '': $('<optgroup label="">')
                        };
                        let checked = optgroups[App.translate('Selected')];
                        const createOption = function (val, text, deleted, subtext) {
                            subtext = subtext ? $('<small class="text-muted">').text(subtext) : '';

                            let option = $('<option>').attr("value", val);
                            let content = $('<div>').text((text === null || text === '' ? '[' + val + ']' : text));
                            if (subtext) {
                                content.append(subtext);
                            }
                            content = content.html();

                            if (deleted) {
                                option.attr('data-content', '<span class="text" style="text-decoration: line-through">' + content + '</span>');
                            } else {
                                let $span = $('<span class="text" >' + content + '</span>');
                                if (LISTs.isPreview) {
                                    $span.addClass('select-with-preview');
                                    $span.attr('data-id', item.id);
                                    $span.attr('data-field', field.name);
                                    $span.attr('data-val', val);
                                }
                                option.data('content', $span.get(0).outerHTML);
                            }
                            return option;
                        };

                        let isLikedFunc = function () {
                            return true;
                        };
                        if (q && q !== '') {
                            let [qs] = App.lang.search_prepare_function(q);

                            qs = qs.split(" ");
                            isLikedFunc = function (v) {
                                let text = "";
                                if (v !== null) {
                                    [text] = App.lang.search_prepare_function(v.toString());
                                }
                                return !qs.some(function (q) {
                                    return text.indexOf(q) === -1
                                })
                            }
                        }

                        let vals = {};
                        let checkedVal;

                        if (val || field.category === 'filter') {
                            const addCheckedOpts = function (key) {

                                if (key === null) key = "";

                                let v = LISTs.innerIndexed[key], opt;
                                if (!v) {
                                    opt = createOption(key, key, true, null);
                                } else {
                                    opt = createOption(key, v[0], false, v[1]);
                                }

                                checked.append(opt);
                                vals[key] = 1;
                                if (v) {
                                    if (!isLikedFunc(v[0])) opt.addClass('hidden');
                                    return true;
                                } else return false;
                            };

                            if (field.multiple) {

                                if (Array.isArray(val)) {
                                    val.forEach(addCheckedOpts);
                                    checkedVal = Object.keys(vals);
                                } else {
                                    if (val !== undefined) {
                                        addCheckedOpts(val);
                                        checkedVal = [val];
                                    }
                                }
                            } else {
                                addCheckedOpts(val);
                                checkedVal = val;
                            }

                        }


                        if (q !== 'onlyVals') {

                            if (!field.multiple) {
                                if (field.withEmptyVal && field.withEmptyVal.trim() !== '' && field.category !== 'filter') {
                                    optgroups[''].append($('<option>').data('content', field.withEmptyVal).text(""));
                                }
                            }

                            for (let i in LISTs.innerList) {
                                let iList = LISTs.innerList[i];
                                if (vals[iList] === 1) continue;
                                let v = LISTs.innerIndexed[iList];

                                if (!LISTs.isSliced) {
                                    if (!isLikedFunc(v[0])) continue;
                                }

                                let opt = createOption(iList, v[0]);
                                let groupName = v[1] ? v[1] : '';

                                if (!optgroups[groupName]) {
                                    optgroups[groupName] = $('<optgroup label="' + groupName + '">');
                                }
                                optgroups[groupName].append(opt);
                            }
                        }
                        input.empty();

                        Object.keys(optgroups).forEach(function (groupName) {
                            input.append(optgroups[groupName]);
                        });

                        if (LISTs.isSliced === true) {
                            let opt = createOption(0, App.translate('The data is incomplete. Use the search!'));
                            opt.prop('disabled', true);
                            opt.css('text-align', 'center');
                            input.append(opt);
                        }

                        input.selectpicker('refresh');
                        input.selectpicker('val', checkedVal);
                        return checkedVal
                    };
                    if (!($oldParent && $oldParent.data('input'))) {
                        let onlyElements = false;
                        const getTitle = function () {


                            let title = '-----';
                            if (field.category === 'filter') {
                                title = App.translate('Empty');
                                if (field.selectFilterWithEmptyText) {
                                    title = field.selectFilterWithEmptyText
                                }
                            } else if (field.withEmptyVal && field.withEmptyVal.trim() !== '') title = field.withEmptyVal;
                            else if (field.multiple && cell && cell.closest('.InsertPanel').length) {
                                title = App.translate('Select');
                                onlyElements = true;
                            }
                            return title;
                        };

                        input = $('<select class="form-control" ' + (field.multiple == true ? 'multiple ' : '') + ' data-size="auto" style="display: none;" name="cell_insert" data-style="btn-sm btn-default" data-width="css-width" data-live-search="true" data-title="' + getTitle() + '">').width(field.width);

                        if (onlyElements) {
                            input.attr('data-selected-text-format', 'static');
                        }

                        divParent.append(input);
                        divParent.append('<div class="text-center mark-loading"></div>');
                        if (tabindex) input.attr('tabindex', tabindex);
                        input.data('AppUin', App.getUn());
                        divParent.data('input', input);

                        input.data('LISTs', LISTs);
                    }


                    divParent.find('.mark-loading').remove();
                    let container = input.closest('.modal-body').length === 0 ? field.pcTable._container : input.closest('.modal-body');
                    input.data('container', container);


                    addValues(val);


                    if (!input.data('is-rendered')) {

                        let searchTimeout;

                        input.data('selectpicker').$searchbox.off().on('click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api', function (e) {
                            e.stopPropagation();
                        });

                        let Q = '';


                        input.data('selectpicker').$searchbox.on('keyup', function (e) {
                            if (e.key === 'Escape') {
                                input.data('selectpicker').$button.click();
                                return true;
                            }

                            let q = $(this).val();
                            if (Q !== q) {
                                Q = q;
                                if (searchTimeout) {
                                    clearTimeout(searchTimeout)
                                }
                                searchTimeout = setTimeout(function () {
                                    if (LISTs.isListForLoad || LISTs.isSliced) {
                                        GetLoadListDeffered.call(field, q).then(function () {
                                            addValues.call(field, val, q);
                                        });
                                    } else {
                                        addValues.call(field, val, q);
                                    }
                                }, 750);
                            }
                        });


                        let $td = $(field).closest('td, .cell');

                        if (input.closest('.InsertRow, .InsertPanel').length === 0) {

                            let $selectContainer = input.data('container');

                            input.on('remove', function () {
                                $selectContainer.off('click.selectContainer.' + input.data('AppUin'));
                                $selectContainer.off('keydown.selectContainer.' + input.data('AppUin'));
                            });

                            $selectContainer.on('click.selectContainer.' + input.data('AppUin'), function (event) {
                                let target = $(event.target);
                                if (!target.closest('td').is('.editing') && !target.closest('.bootstrap-select').length) {
                                    blurClbk(divParent, event)
                                }
                            });
                            $selectContainer.on('keydown.selectContainer.' + input.data('AppUin'), function (event) {
                                if (event.key === 'Tab') {
                                    enterClbk(divParent, event);
                                    return false;
                                }
                                if (event.keyCode === 27) {
                                    input.data('keyPressed', 'Esc');
                                    escClbk(divParent, event);
                                    return false;
                                }
                                if (event.keyCode === 13) {
                                    input.data('enterPressed', true);

                                }

                                if (event.keyCode !== 9 && event.keyCode !== 16) {
                                    $td.data('edited')
                                }
                                if (event.altKey || event.shiftKey) {
                                    let key = event.altKey ? 'altKey' : (event.shiftKey ? 'shiftKey' : false);
                                    input.data('keyPressed', key);
                                }

                            }).on('keyup', function (event) {
                                input.removeData('keyPressed');
                                input.removeData('enterPressed');


                            });

                            setTimeout(function () {
                                if (input.data('selectpicker').$bsContainer.offset()['top'] > divParent.find('button').offset()['top']) {
                                    let cdiv = input.closest('td').find('.cdiv')
                                    let popover = cdiv.data('bs.popover');

                                    popover.applyPlacement(popover.getCalculatedOffset('top', popover.getPosition(), popover.$tip.width() + 8, popover.$tip.height() + 33), 'top');
                                    popover.$tip.removeClass('bottom').addClass('top')
                                }

                            }, 10)
                        } else if (input.closest('.InsertRow').length === 1) {
                            let $selectContainer = input.data('container');
                            $selectContainer.on('keydown.selectContainer.' + input.data('AppUin'), function (event) {
                                if (event.key === 'Tab') {
                                    if ((input.data('selectpicker').$newElement.get(0).contains(event.originalEvent.target) || input.data('selectpicker').$menu.get(0).contains(event.originalEvent.target))) {
                                        if (input.data('selectpicker').$menu.is('.open')) {
                                            input.selectpicker('toggle')
                                        }
                                        enterClbk(divParent, event);
                                    }
                                    return false;
                                }
                            });

                            input.data('selectpicker').$newElement.on('keydown', (ev) => {
                                if (ev.code === 'Tab') {
                                    enterClbk(divParent, event);
                                    ev.stopPropagation();
                                }
                            })
                        }

                        input.on('hidden.bs.select', function () {
                            let changed = input.data('changed');
                            let event = {};
                            let keyPressed = input.data('keyPressed');
                            if (keyPressed) event[keyPressed] = true;

                            if (!field.multiple) {
                                setTimeout(function () {
                                    "use strict";
                                    enterClbk(divParent, event)
                                }, 200);

                            } else if (changed && input.closest('td.edt').length === 0) {
                                enterClbk(divParent, event);
                            }
                            input.data('changed', false);
                        });
                        input.on('show.bs.select', function () {
                            addValues(val);
                        });
                        input.on('shown.bs.select', function () {
                            let selectPicker = input.data('selectpicker');
                            selectPicker.$bsContainer.addClass('pcTable-selectpicker');
                            if (LISTs.isPreview) {
                                selectPicker.$bsContainer.addClass('select-with-preview');
                            }

                            if (selectPicker.$menuInner.height() < 100 && selectPicker.$menuInner.find('li').length > 6) {
                                selectPicker.$menuInner.height(300)
                            }
                            let position = selectPicker.$menu.get(0).getBoundingClientRect();
                            if (position.right > window.innerWidth - 20) {
                                let diff = position.right - window.innerWidth + 20;
                                let width = selectPicker.$menuInner.width();
                                selectPicker.$menuInner.width(width - diff).css('overflow-x', 'scroll');
                            } else {
                                selectPicker.$menuInner.width('auto')
                            }


                            if (!selectPicker.cropped) {
                                selectPicker.cropped = true;
                                if (input.data('container').is('.pcTable-container')) {
                                    selectPicker.$menuInner.height(selectPicker.$menuInner.height() - 4)
                                }
                            }
                        });
                        input.on('changed.bs.select', function () {
                            input.data('changed', true);
                            let oldVal = [];
                            if (val && val.forEach) {
                                val.forEach(function (v) {
                                    oldVal.push(v);
                                });
                            }
                            val = input.val();


                            if (field.category === 'filter') {
                                if (field.multiple) {
                                    let len = val.length;

                                    if (oldVal.length > val.length) {
                                        if (val.length === 0) {
                                            val.push('*NONE*');
                                        }
                                    } else {
                                        let newElement;
                                        val.some(function (el) {
                                            if (oldVal.indexOf(el) === -1) {
                                                newElement = el;
                                                return true;
                                            }
                                        });
                                        if (['*NONE*', '*ALL*'].indexOf(newElement) !== -1) {
                                            val = [newElement];
                                        } else {
                                            ['*NONE*', '*ALL*'].some(function (SpecialValue) {
                                                let SpecialIndex;
                                                if ((SpecialIndex = val.indexOf(SpecialValue)) !== -1) {
                                                    val.splice(SpecialIndex, 1);
                                                    return true;
                                                }
                                            })
                                        }
                                    }

                                    if (val.length !== len) {
                                        input.selectpicker('val', val);
                                    }
                                }
                            }

                        });

                        input.on('remove', function () {
                            input.data('selectpicker').$bsContainer.remove();
                            input.data('container')
                                .off('keydown.selectContainer.' + input.data('AppUin'))
                                .off('click.selectContainer.' + input.data('AppUin'))
                        })

                        if (input.closest('.InsertRow, .InsertPanel').length === 0) {
                            divParent.find('button').click();
                        }
                    }

                } else {
                    if (iRenered < 50) {
                        setTimeout(function () {
                            renderMe(input, val)
                        }, iRenered * 10 + 1);
                        iRenered++;
                    }
                }
            }
        ;


        if (!LISTs || LISTs.isListForLoad) {
            GetLoadListDeffered().then(function () {
                renderMe.call(field);
            });
        } else {
            renderMe();
        }

        return divParent;
    },
    getEditPanelText:
        function (fieldValue, item) {
            if (this.multiple)
                return this.getPanelText(fieldValue.v, null, item)
            
        }

    ,
    getPanelText: function (fieldValue, td, item) {
        let field = this;
        let $div = $('<div>');
        let listVals = item[field['name']].v_;
        if (!field.multiple && item[field['name']].v_) {
            listVals = [item[field['name']].v_];
        }
        if (listVals) {
            $.each(listVals, function (k, val) {
                "use strict";
                let d = $('<div class="select-val">').text(val[0] + (field.multiple && field.unitType ? ' ' + field.unitType : ''));

                if (val[1]) {
                    d.addClass('deleted_value')
                } else if (listVals.length !== 1) {
                    d.add('select-item');
                }
                if (field.withPreview && listVals.length !== 1) {
                    let eye = $('<button class="btn btn-xxs btn-default "><i class="fa fa-eye"></i></button>').on('click', () => {

                        if (eye.data('opened')) {
                            eye.data('pr').hide();
                            eye.data('opened', false)
                        } else {
                            if (!eye.data('pr')) {
                                let pr = $('<div class="loaded-preview">').appendTo(d);
                                field.loadPreviewPanel(pr, field.name, item, [item[field['name']].v[k]]).then(function () {
                                });
                                eye.data('pr', pr)
                            }else{
                                eye.data('pr').show()
                            }
                            eye.data('opened', true)
                        }
                    });
                    d.prepend(eye)
                }

                $div.append(d);
            });
        } else {
            if (fieldValue === null || fieldValue === '') {
                if (field.withEmptyVal) return field.withEmptyVal;
                else return '';
            }

            let fieldValues = fieldValue;
            if (!field.multiple) {
                fieldValues = [fieldValues];
            }

            if (!fieldValues) fieldValues = [];

            if (field.list) {
                let vals = [];
                for (let i = 0; i < fieldValues.length; i++) {
                    vals[i] = fieldValues[i].toString();
                }

                for (let i = 0; i < field.list.length; i++) {
                    let v = field.list[i];
                    if (vals.indexOf(v[2].toString()) !== -1) {
                        let d = $('<span>').text(v[0])
                        if (v[1]) {
                            d.addClass('deleted_value')
                        } else if (vals.length !== 1) {
                            d.add('select-item');
                        }
                        $div.append(d);
                    }
                }
            }
        }
        return $div.children();
    }
    ,
    getCellText: function (fieldValue, td, item) {
        let field = this;
        let text = '';
        let $div = $('<div>');
        let listVals = item[field['name']].v_;
        if (!field.multiple && item[field['name']].v_) {
            listVals = [item[field['name']].v_];
        }

        if (listVals) {
            if (field.multiple && listVals.length > 1 && (field.multySelectView == 0)) {
                $div.append('<span class="select-item">' + App.translate('%s elements', listVals.length) + '<span>');
            } else {
                if (listVals.length === 0) {
                    $div.append('<span class="select-item">' + this.getElementString(null) + '</span>');
                } else {
                    $.each(listVals, function (k, val) {
                        "use strict";
                        let d = $('<span>');
                        let id = null;
                        if (fieldValue) {
                            if (typeof fieldValue === 'object') {
                                id = fieldValue[k];
                            } else {
                                id = fieldValue;
                            }
                        }

                        d.text(field.getElementString(id, val));

                        if (val[1]) {
                            d.addClass('deleted_value')
                        } else if (listVals.length !== 1) {
                            d.add('select-item');
                        }
                        $div.append(d);
                    });
                }
            }
        } else {
            if (fieldValue === null || fieldValue === '') {
                if (field.withEmptyVal) return field.withEmptyVal;
                else return '';
            }

            let fieldValues = fieldValue;
            if (!field.multiple) {
                fieldValues = [fieldValues];
            }

            if (!fieldValues) fieldValues = [];

            if (field.list) {
                let vals = [];
                for (let i = 0; i < fieldValues.length; i++) {
                    vals[i] = fieldValues[i].toString();
                }

                for (let i = 0; i < field.list.length; i++) {
                    let v = field.list[i];
                    if (vals.indexOf(v[2].toString()) !== -1) {
                        let d = $('<span>').text(field.getElementString(v[2], v));
                        if (v[1]) {
                            d.addClass('deleted_value')
                        } else if (vals.length !== 1) {
                            d.add('select-item');
                        }
                        $div.append(d);
                    }
                }
            }
        }
        return $div.children();
    }
    ,
    focusElement: function (div) {
        let button = div.find('button');
        let field = this;
        if (button.length == 0) {
            setTimeout(function () {
                field.focusElement(div)
            }, 50)
        } else
            button.focus();
        if (div.closest('tr').is('.InsertRow')) {
            this.pcTable._insertRow.find('.active').removeClass('active');
            div.closest('td').addClass('active');
        }
    }
    ,
    isDataModified: function (edited, fromItem) {

        if ([null, ''].indexOf(edited) !== -1 && [null, ''].indexOf(fromItem) !== -1) return false;
        if ([null, ''].indexOf(edited) !== -1 || [null, ''].indexOf(fromItem) !== -1) return true;

        return !Object.equals(fromItem, edited);
    }
    ,
    checkEditRegExp: function (val) {
        if (!this.warningEditRegExp) return true;
        try {
            if (this.multiple && Array.isArray(val)) {
                return val.some((v) => (new RegExp(this.warningEditRegExp)).test(val))
            }
            return (new RegExp(this.warningEditRegExp)).test(val);
        } catch (e) {
            return true;
        }
    }
    ,
    addDataToFilter: function (filterVals, valObj) {

        const addFiltersData = function (valObjElem) {
            let hash;
            let str = valObjElem[0];
            let val = App.translate('Empty');
            if (str === null || str === '') {
                hash = ''.hashCode();
            } else {
                hash = str.toString().hashCode();
                val = str.replace(/"/g, "&quot;");
            }
            filterVals[hash] = val;
        };
        if (this.multiple) {
            if (valObj && valObj.v_.length) {
                valObj.v_.forEach(function (valObj) {
                    addFiltersData(valObj);
                })
            } else {
                addFiltersData({0: ''});
            }
        } else {
            addFiltersData(valObj.v_)
        }

    }
    ,
    getElementString: function (val, arrayVal) {
        "use strict";
        let r;
        if (val === null || val === undefined) {
            if (!arrayVal || !arrayVal[0]) r = this.withEmptyVal || '';
        }

        if (r === undefined && (arrayVal[0] === null || arrayVal[0] === '')) {

            r = '[' + (this.withEmptyVal || '') + ']';
        }

        if (r === undefined) {
            r = arrayVal[0];
        }

        if (this.multiple && this.unitType) {
            r += ' ' + this.unitType;
        }

        return r;
    }
    ,
    sourceButtonClick: function (item, isAdd) {
        let $d = $.Deferred();
        let ee = {}, field = this, pcTable = this.pcTable;

        $.each(item, function (k, v) {
            if (k.substring(0, 1) !== '$') {
                ee[k] = v;
            }
        });
        if (isAdd) {
            ee[field.name] = null;
        }
        let opened = 0;

        let LastData;

        $(window.top.document.body)
            .on('pctable-opened.select-' + field.name, function () {
                opened++;
            })
            .on('pctable-closed.select-' + field.name, function (event, data) {
                opened--;
                if (data && data.json) {
                    LastData = data;
                }
                let isAdded = (data /*&& data.tableId === field.selectTableId*/ && data.method === 'insert' && data.json && data.json.chdata && data.json.chdata.rows);
                const refreshInputAndPage = function () {
                    if (opened === 0 || isAdded) {
                        $('body').off('.select-' + field.name);
                        $d.resolve(LastData);
                    }
                };
                setTimeout(refreshInputAndPage, 100);//Чтобы успело открыться окошко слещующей панели, если оно есть
            });

        pcTable.model.selectSourceTableAction(field.name, ee);

        return $d;
    }
};