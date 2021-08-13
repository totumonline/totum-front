(function () {

    const slimThs = function (tdNoTitles) {
        tdNoTitles.forEach((f) => {
            let h = f.th.outerHeight();
            f.th.remove();
            if (f.tdWrapper.data('height')) {
                f.tdWrapper.css('height', f.tdWrapper.data('height') + parseInt(h));
            }
        })
    }

    const addSectionParam = (param, splitted, ValReplace, isArrayValue) => {
        if (!param)
            param = {};
        const splitVal = (param) => {
            if (isArrayValue) {
                let split = param.split(/\s*\/\s*/);
                if (split.length > 1) {
                    return {_big: replaceVal(split[0]), _small: replaceVal(split[1])}
                } else {
                    return {_big: replaceVal(param), _small: replaceVal(param)}
                }
            }
            return replaceVal(param)
        }
        const replaceVal = (param) => {
            switch (param) {
                case 'false':
                case 'FALSE':
                    param = false;
                    break;
                case 'true':
                case 'TRUE':
                    param = true;
                    break;
            }
            param = ValReplace(param);
            return param;
        }


        if (splitted.length === 3 && /^([a-z_0-9]+\s*,?\s*)+$/.test(splitted[1])) {
            if (typeof param !== 'object') {
                param = {_ALL: param}
            }

            splitted[1].split(/\s*,\s*/).forEach((num) => {
                param[num] = splitVal(splitted[2])
            })
        } else if (typeof param === 'object' && Object.keys(param).length) {

            param['_ALL'] = splitVal(splitted[1])

        } else {
            param = splitVal(splitted[1])
        }
        return param;
    };

    const getSectionOrFormatParam = function (param, fieldName, section, format) {


        if (param in format) return format[param];
        else if ((param in section) && section[param]) {

            if (typeof section[param] === 'object') {
                if (fieldName in section[param]) return section[param][fieldName]
                else return section[param]['_ALL']
            }
            return section[param];
        }

        return null;
    }


    App.pcTableMain.prototype.__fillFloatBlock = function ($paramsBlock, fields) {
        let pcTable = this;
        let panelColor;
        let sectionTitle = '';

        let sectionDiv, sectionWithTitles = {_ALL: true}, sectionGap = 0;

        let plate = false;
        let outline = false;
        let border = false;
        let platemh = false;
        let plateh = false;
        let formatsFromSection = {};
        let sections = [];
        let sectionField;
        let blocktitle = {};


        $.each(fields, function (k, field) {

            if (!pcTable.isCreatorView && pcTable.isReplacedToRowsButtonsField(field.name))
                return;

            /*if (field.panelColor !== undefined) {
                panelColor = field.panelColor;
            } else field.panelColor = panelColor;*/

            let lableLowOpacity = false;
            if (field.sectionTitle !== undefined) {
                sectionWithTitles = {_ALL: true}
                sectionTitle = field.sectionTitle.trim();
                sectionGap = 0;
                plate = false;
                outline = false;
                border = false;
                platemh = false;
                sectionField = field;
                blocktitle = {};
                formatsFromSection = {};


                let sectionParams = {};
                let sectionParamsMatch = sectionTitle.match(/\*\*(.*)/);
                if (sectionParamsMatch) {
                    sectionParamsMatch[1].trim().split(/\s*;\s*/).forEach((param) => {
                        let split = param.trim().split(/\s*:\s*/);
                        split[0] = split[0].toLowerCase();

                        if (split.length > 1) {
                            switch (split[0]) {
                                case 'maxheight':
                                case 'height':
                                case 'maxwidth':
                                case 'nextline':
                                case 'blocknum':
                                case 'glue':
                                case 'fill':
                                case 'breakwidth':
                                case 'titleleft':
                                case 'titleright':
                                    let func;
                                    if (['titleleft', 'titleright'].indexOf(split[0]) !== -1) {
                                        func = ((str) => str.toString().trim().match(/^\d+$/) ? str.toString().trim() + 'px' : str)
                                    } else {
                                        func = ((str) => str)
                                    }

                                    formatsFromSection[split[0]] = addSectionParam(formatsFromSection[split[0]], split, func, false);


                                    break;

                                case 'outline':
                                    outline = addSectionParam(outline, split, ((str) => str === true ? "#e4e4e4" : str), true)
                                    break;
                                case 'blocktitle':
                                    blocktitle = addSectionParam(blocktitle, split, ((str) => str === false ? "" : str), false)
                                    break;
                                case 'title':
                                    sectionParams.title = sectionParams.title || {_ALL: true};
                                    let title = addSectionParam({}, split, ((str) => str))
                                    if (typeof title === 'boolean')
                                        sectionParams.title._ALL = title;
                                    else {
                                        sectionParams.title = {...sectionParams.title, ...title}
                                    }
                                    break;
                                case 'border':
                                    border = addSectionParam(border, split, (str) => str === false ? "transparent" : str, true)
                                    break;
                                case'plate':
                                    plate = addSectionParam(plate, split, (str) => str === false ? "transparent" : str, true)
                                    break;
                                case 'platemh':
                                    platemh = addSectionParam(platemh, split, (str) => typeof str === 'string' && /^\d+$/.test(str) ? str + 'px' : str, true)
                                    break;
                                case 'plateh':
                                    plateh = addSectionParam(plateh, split, (str) => typeof str === 'string' && /^\d+$/.test(str) ? str + 'px' : str, true)
                                    break;
                                case 'gap':
                                    sectionParams.gap = addSectionParam(sectionParams.gap, split, (str) => str)
                                    break;
                                default:
                                    switch (split[1]) {
                                        case 'true':
                                        case 'TRUE':
                                            sectionParams[split[0]] = true;
                                            break;
                                        case 'false':
                                        case 'FALSE':
                                            sectionParams[split[0]] = false;
                                            break;
                                    }
                            }
                        }
                    })

                    sectionGap = sectionParams.gap || sectionGap;
                }

                sectionWithTitles = "title" in sectionParams ? sectionParams.title : sectionWithTitles;

                if (!pcTable.isCreatorView) {
                    if (sectionParams.label === false) {
                        sectionTitle = "";
                    } else {
                        sectionTitle = sectionTitle.replace(/(\*\*.*)/, '')
                        sectionTitle = $('<div>').text(sectionTitle.trim()).html();
                    }
                } else {
                    sectionTitle = sectionTitle.replace(/(\*\*.*)/, '')
                    lableLowOpacity = sectionParams.label === false || sectionTitle === ''
                }
            }

            if (!sectionDiv || (field.tableBreakBefore && field.sectionTitle)) {
                sectionDiv = [];


                sections.push({
                    title: sectionTitle,
                    lableLowOpacity: lableLowOpacity,
                    formatsFromSection: formatsFromSection,
                    fields: sectionDiv,
                    withTitles: sectionWithTitles,
                    sectionGap: sectionGap,
                    plate: plate,
                    sectionField: sectionField,
                    outline: outline,
                    blocktitle: blocktitle,
                    border: border,
                    plateh: plateh,
                    platemh: platemh
                });
                sectionTitle = '';
            }
            if (!field.showMeWidth) return;

            sectionDiv.push({
                field: field,
                panelColor: panelColor
            })
        });

        const addFieldGap = (field, sectionGap) => {
            let _gap = -1;
            let $div = field.fieldCell;
            if (sectionGap) {
                if (!$div.prev().is('br') && !($div.is(':first-child') || $div.prev().is('[data-type="blocknum"]'))) {
                    if (typeof sectionGap !== 'object') {
                        _gap = sectionGap;
                    } else {
                        if (field.format.blocknum in sectionGap) {
                            _gap = sectionGap[field.format.blocknum]
                        } else if (field.field.name in sectionGap) {
                            _gap = sectionGap[field.field.name]
                        }
                    }
                    if (_gap) {
                        if (/^\d+$/.test(_gap)) {
                            _gap = parseInt(_gap) - 1;
                            _gap += 'px';
                        }
                    }
                }
            }
            $div.css('marginLeft', _gap)
        }
        sections.forEach((sec) => {
            if (!sec.fields || !sec.fields.length) return;

            //' + (sec.isNoTitles ? 'sec-no-titles' : '') + '
            let sDv = $('<div class="pcTable-section ">').appendTo($paramsBlock);
            let sectionGap = sec.sectionGap;

            if (sec.title || (pcTable.isCreatorView && sec.sectionField)) {
                let $title = $('<span>').html(sec.title);
                if (pcTable.isCreatorView) {

                    $('<span class="danger"> <i class="fa fa-edit" style="font-size: 14px; padding-left: 10px;"></i></span>').on('click', () => {

                        this.__editSectionTitle(sec.sectionField)
                        return false;
                    }).appendTo($title);
                    $('<span class="danger"> <i class="fa fa-times" style="font-size: 14px; padding-left: 5px;"></i></span>').on('click', () => {

                        this.__deleteSection(sec.sectionField)
                        return false;
                    }).appendTo($title)
                }
                pcTable.___createClosedSection(sDv, $('<div class="pcTable-sectionTitle"></div>').html($title).appendTo(sDv), fields[0].category === 'param' ? 'p' : 'f');
                if (sec.lableLowOpacity) {
                    sDv.find('.pcTable-sectionTitle').addClass('lowOpacity')
                }
            }
            let floatBlock = $('<div class="pcTable-floatBlock">').appendTo(sDv);

            if (!floatBlock.is(':visible')) {
                sDv.data('closedrender', true);
                return;
            }

            let headHeight = 0;
            let FloatInners = [];
            let FlowLines = [
                FloatInners
            ];
            let FlowBlocks = [FlowLines];

            let floatInner;
            let sectionMarked = false;


            sec.fields.forEach((field, ind) => {

                if (field.field.tableBreakBefore && ind !== 0) {
                    floatBlock = $('<div class="pcTable-floatBlock">').appendTo(sDv);

                    FloatInners = [];
                    FlowLines = [FloatInners];
                    FlowBlocks.push(FlowLines);
                }

                pcTable.data_params[field.field.name] = pcTable.data_params[field.field.name] || {}

                field.format = pcTable.data_params[field.field.name].f || {};

                Object.keys(sec.formatsFromSection).forEach((k) => {
                    let val = getSectionOrFormatParam(k, field.field.name, sec.formatsFromSection, field.format);
                    if (val !== null) {
                        field.format[k] = val
                    }
                })

                let blockNum = field.format.blocknum || 0;
                if (typeof field.format.blocknum !== "undefined" && !sectionMarked) {
                    sDv.addClass('sectionWithPannels');
                }
                if (FloatInners.length === 0 || FloatInners[FloatInners.length - 1].num != blockNum || (field.field.tableBreakBefore && ind !== 0)) {
                    floatInner = $('<div class="pcTable-floatInner">').appendTo(floatBlock);
                    if (blockNum) {
                        if (pcTable.isCreatorView) {
                            floatInner.append('<div data-type="blocknum" style="position:absolute;z-index: 100; color: #ff8585; background-color: #fff; padding: 3px; font-size: 10px; right: 4px; top: 4px;">' + blockNum + '</div>')
                        }
                    }
                    if (sec.outline) {
                        if (blockNum in sec.outline)
                            floatInner.data('border-color', sec.outline[blockNum])
                        else {
                            floatInner.data('border-color', sec.outline)
                        }
                    }
                    if (sec.plate) {
                        if (blockNum in sec.plate)
                            floatInner.data('plate', sec.plate[blockNum])
                        else {
                            floatInner.data('plate', sec.plate)
                        }
                    }
                    if (blockNum && sec.blocktitle[blockNum]) {
                        let blocktitle = $('<div class="blocktitle"></div>').append($('<span>').text(sec.blocktitle[blockNum]))
                        floatInner.prepend(blocktitle)

                    }


                    if (sec.plateh) {
                        if (blockNum in sec.plateh)
                            floatInner.data('plateh', sec.plateh[blockNum])
                        else {
                            floatInner.data('plateh', sec.plateh)
                        }
                    }
                    if (sec.platehm) {
                        if (blockNum in sec.platehm)
                            floatInner.data('platehm', sec.platehm[blockNum])
                        else {
                            floatInner.data('platehm', sec.platehm)
                        }
                    }


                    FloatInners.push({
                        div: floatInner,
                        num: blockNum,
                        isWrappable: false,
                        sec: sec,
                        fields: [],
                    })
                }

                let inner = FloatInners[FloatInners.length - 1];
                if (inner.fields.length > 0 && !field.format.nextline)
                    inner.isWrappable = true;
                inner.fields.push(field);


                field._showMeWidth = field.field.showMeWidth;

                if (field.format.breakwidth) {
                    field.field.showMeWidth = parseInt(field.format.breakwidth);
                }

                if (field.format.nextline && ind > 0) floatInner.append('<br/>');

                let fieldCell = $('<div>').appendTo(floatInner);
                fieldCell.width(field.field.showMeWidth + 1);
                fieldCell.attr('data-field-type', field.field.type);

                field.field.isNoTitles = false;
                if ('withTitles' in sec) {
                    if (field.field.name in sec.withTitles) {
                        field.field.isNoTitles = !sec.withTitles[field.field.name];
                    } else if (blockNum && blockNum in sec.withTitles) {
                        field.field.isNoTitles = !sec.withTitles[blockNum];
                    } else if ('_ALL' in sec.withTitles) {
                        field.field.isNoTitles = !sec.withTitles['_ALL'];
                    }
                }

                let th = pcTable._createHeadCell(null, field.field, field.panelColor).appendTo(fieldCell);
                let tdWrapper = $('<div class="td-wrapper">').appendTo(fieldCell);

                if (field.format.titleleft || field.format.titleright) {
                    fieldCell.css('display', 'inline-grid');
                    if (pcTable.isCreatorView) {
                        tdWrapper.css('margin-top', '18px')
                    }

                    if (field.format.titleleft) {
                        fieldCell.css('grid-template-columns', field.format.titleleft + ' 1fr')
                    } else {
                        tdWrapper.prependTo(fieldCell)
                        fieldCell.css('grid-template-columns', '1fr ' + field.format.titleright)
                    }
                }


                let td = pcTable._createCell(pcTable.data_params, field.field).appendTo(tdWrapper);

                if (pcTable.isCreatorView) {
                    let extraHeight = 33;
                    if (!field.field.isNoTitles) {
                        extraHeight = 68;
                    }
                    if (field.format.maxheight) {
                        field.format.maxheight = parseInt(field.format.maxheight) + extraHeight
                    }
                    if (field.format.height) {
                        field.format.height = parseInt(field.format.height) + extraHeight
                    }

                } else {
                    if (!field.field.isNoTitles) {
                        let extraHeight = 35;
                        if (field.format.maxheight) {
                            field.format.maxheight = parseInt(field.format.maxheight) + extraHeight
                        }
                        if (field.format.height) {
                            field.format.height = parseInt(field.format.height) + extraHeight
                        }
                    }
                }

                if (field.format.maxheight) {
                    let style = {'maxHeight': field.format.maxheight};
                    if (field.format.height) {
                        style.minHeight = field.format.height;
                        tdWrapper.css('minHeight', field.format.height);
                    }
                    td.height('');
                    fieldCell.css(style);
                    fieldCell.addClass('nonowrap');
                } else if (field.format.height) {
                    td.height('');
                    fieldCell.addClass('nonowrap');
                    fieldCell.height(field.format.height);
                }
                if (field.field.isNoTitles) {
                    if (!pcTable.isCreatorView)
                        th.empty();
                    else {
                        th.addClass('no-titled')
                    }
                } else {
                    th.css('display', 'table-cell')
                    field.th = th;
                    if (th.height() > headHeight) headHeight = th.height();
                }
                field.td = td;
                field.th = th.width('');
                field.tdWrapper = tdWrapper;
                field.fieldCell = fieldCell;


                if (pcTable.isCreatorView) {
                    if (field.format.glue) {
                        fieldCell.addClass('f-glue')
                    }
                    if (field.format.fill) {
                        fieldCell.addClass('f-fill')
                    }
                }


            });
            sec.fields.forEach((field) => {
                let thHeight = 0;
                if (field.th) {
                    field.th.css('display', '');
                    let h = 21;
                    if (pcTable.isCreatorView) {
                        h = 40;
                    }
                    field.th.height(h);
                    thHeight = field.th.outerHeight();
                }

                if (field.format.maxheight) {
                    field.tdWrapper.css('maxHeight', field.format.maxheight - thHeight - 10);
                } else if (field.format.height && !field.format.maxheight) {
                    field.tdWrapper.css('height', field.format.height - thHeight);
                    field.tdWrapper.data('height', field.format.height - thHeight);
                }
                addFieldGap(field, sectionGap)
            });


            const getDiff = function (FlInners) {
                if (!FlInners.length) return 0;
                let floatBlock = FlInners[0].div.parent();
                let rightParent = floatBlock.position().left + parseInt(floatBlock.css('paddingLeft')) + floatBlock.width();
                let lastLeft;
                let widestLine;
                for (let f in FlInners) {
                    let inner = FlInners[FlInners.length - 1].div;
                    inner.w = false;
                    let leftLast = inner.position().left + inner.outerWidth();
                    if (!lastLeft || leftLast > lastLeft) {
                        lastLeft = leftLast;
                        widestLine = FlInners[FlInners.length - 1];
                    }
                }
                widestLine.w = true;
                return rightParent - lastLeft;
            };


            const growFieldsfnc = function (FloatInners, isSmallerSize) {
                if (!FloatInners.length) return;


                if (/Safari/.test(navigator.userAgent)) {
                    FloatInners.forEach(function (inner) {
                        inner.div.width(100);
                        inner.div.width('');
                    });
                }

                let diff = getDiff(FloatInners);
                let LineTop = 0 + parseInt(FloatInners[0].div.css('paddingTop'));

                let firstLines = [];
                let otherLines = [];
                let minWidthFirstLines = 0;

                FloatInners.forEach(function (inner) {
                    let lineTop = null;
                    let lineObj = {width: 0, fields: []};
                    let lastField;

                    inner.fields.forEach(function (field) {
                        if ((field.format.maxwidth && field.field.width < field.format.maxwidth) || (field.format.fill && (isSmallerSize || field.fieldCell.position().top !== LineTop || LineTop === null))) {
                            if (lineTop != field.fieldCell.position().top) {
                                lineTop = field.fieldCell.position().top;
                                lineObj = {width: 0, fields: []};
                                if (lineTop !== LineTop) {
                                    otherLines.push(lineObj)
                                } else {
                                    firstLines.push(lineObj)
                                }
                            }
                            lineObj.fields.push(field);
                            lineObj.width += field.field.width;
                            if (lineTop === LineTop) {
                                minWidthFirstLines += field.field.width;
                            }

                        }
                        lastField = field.fieldCell;
                    });

                });

                const fillLines = function (line) {
                    let parent = line.fields[0].fieldCell.parent();

                    let top = line.fields[0].fieldCell.position().top;
                    let left;
                    let lastField;
                    parent.find('>div').each(function (i, field) {
                        let $field = $(field);
                        let position = $field.position();
                        if (position.top === top && (!left || position.left > left)) {
                            left = position.left;
                            lastField = $field;
                        }
                    });
                    let addDiff = parent.width() + parseInt(parent.css('paddingLeft')) - left - lastField.outerWidth(true);


                    let grow = 0;
                    let nn = 0;
                    while (nn++ < 100 && line.fields.length && addDiff > 1) {
                        line.fields.forEach(function (field, iFields) {
                            if (addDiff > grow) {
                                let _grow = Math.round(addDiff / line.width * field.field.width);
                                if (!field.format.fill) {
                                    if ((field.format.maxwidth <= (field.fieldCell.width() + _grow))) {
                                        _grow = field.format.maxwidth - field.fieldCell.width();
                                        line.fields.splice(iFields, 1);
                                        line.width -= field.field.width;
                                    }
                                }
                                grow += _grow;
                                field.fieldCell.width(field.fieldCell.width() + _grow);
                            }
                        });
                        addDiff -= grow;
                        grow = 0;
                    }
                };


                firstLines.forEach(fillLines);

                let addDiff = diff;
                let grow = 0;
                let nn = 0;
                while (addDiff > 1 && nn++ < 6 && firstLines.length) {
                    firstLines.forEach(function (lineObj, iLines) {

                        lineObj.fields.forEach(function (field, iFields) {
                            if (addDiff > grow) {
                                let _grow = Math.round(addDiff / minWidthFirstLines * field.field.width);
                                if (_grow > addDiff - grow) _grow = addDiff - grow;
                                if (!(isSmallerSize && field.format.fill) && field.format.maxwidth <= (field.fieldCell.width() + _grow)) {
                                    _grow = field.format.maxwidth - field.fieldCell.width();
                                    lineObj.fields.splice(iFields, 1);
                                    minWidthFirstLines -= field.field.width;
                                }
                                grow += _grow;
                                field.fieldCell.width(field.fieldCell.width() + _grow);
                            }
                        });
                        if (lineObj.fields.length === 0) {
                            firstLines.splice(iLines, 1);
                        }
                    });
                    addDiff -= grow;
                    grow = 0;
                }

                otherLines.forEach(fillLines)

            };
            const checkDiffs = function (FlowLines) {
                let result = true;
                FlowLines.some((FloatInners, i) => {
                    if (getDiff(FloatInners) < 0) {
                        result = false;
                        return true;
                    }
                });
                return result;
            };


            let isSmallerSize = false;
            FlowBlocks.forEach(function (FlowLines, fInd) {
                let diffItt = 0;
                while ((++diffItt < 400) && !checkDiffs(FlowLines)) {
                    FlowLines.forEach(function (FloatInners, i) {
                        let diff = getDiff(FloatInners);
                        if (diff < 0) {
                            isSmallerSize = true;
                            /!*Cносим поля в блоках*!/;
                            for (let iF = FloatInners.length - 1; iF >= 0; iF--) {
                                /!*Cносим поля в блокe*!/;
                                let inner = FloatInners[iF];
                                if (inner.isWrappable && inner.w) {
                                    let leftField;
                                    let leftFieldI;
                                    let leftPosition;
                                    for (let i = inner.fields.length - 1; i >= 1; i--) {
                                        let field = inner.fields[i];
                                        field.i = i
                                        if (!leftPosition || field.fieldCell.position().left > leftPosition) {
                                            leftPosition = field.fieldCell.position().left;
                                            leftField = field;
                                            leftFieldI = i;
                                        }
                                    }
                                    if (leftField && !leftField.format.nextline && !leftField.fieldCell.prev().is('br')) {
                                        if (leftField.format.glue) {
                                            while (true) {
                                                if (!leftField.i) {
                                                    leftField = null;
                                                    break;
                                                }
                                                leftField = inner.fields[leftField.i - 1];
                                                leftFieldI = leftField.i
                                                if (leftField.format.nextline || leftField.fieldCell.is(':first-child') || leftField.fieldCell.prev().is('br')) {
                                                    leftField = null;
                                                    break;
                                                } else if (!leftField.format.glue) {
                                                    break;
                                                }
                                            }
                                        }
                                        if (leftField) {
                                            leftField.fieldCell.before('<br class="wrapped"/>');
                                            leftField.fieldCell.nextAll('br.wrapped').remove();
                                            for (let i = leftFieldI; i <= inner.fields.length - 1; i++) {
                                                addFieldGap(inner.fields[i], sectionGap)
                                            }
                                            return;
                                        }
                                    }
                                }
                            }


                            /!*Сносим блоки*!/
                            let LastFirstLineInner = FlowLines[0].length - 1;

                            if (LastFirstLineInner > 0) {
                                let fInner = FlowLines[0][LastFirstLineInner];
                                let inner = fInner.div;
                                inner.before('<br/>');
                                FlowLines.push([fInner]);
                                FlowLines[0].splice(LastFirstLineInner, 1);
                                FlowLines.forEach(function (inners) {
                                    inners.forEach(function (inner) {
                                        inner.div.find('br.wrapped').remove();
                                        inner.fields.forEach((field) => addFieldGap(field, sectionGap))
                                    });

                                });
                            }
                        }
                    });
                }

                FlowLines.forEach(function (FloatInners, i) {
                    FloatInners.forEach(({div, fields}) => {
                        fields.forEach((field) => {
                            if (field.format.breakwidth) {
                                field.fieldCell.css('width', field._showMeWidth);
                                field.field.showMeWidth = field._showMeWidth
                            }
                        })
                    })

                    growFieldsfnc(FloatInners, isSmallerSize);

                    FloatInners.forEach(({div, fields, sec, blocknum}) => {
                        let tdNoTitles = [];
                        let isAllNoTitles = true;
                        fields.forEach((field) => {
                            if (field.fieldCell.prev().is('br')) {
                                if (!pcTable.isCreatorView && tdNoTitles.length)
                                    slimThs(tdNoTitles)
                                tdNoTitles = [];
                                isAllNoTitles = true;
                            }
                            if (field.field.isNoTitles) {
                                if (isAllNoTitles) {
                                    tdNoTitles.push(field)
                                }
                            } else {
                                tdNoTitles = [];
                                isAllNoTitles = false;
                            }


                            if (sec.border) {
                                let _border;
                                if (field.field.name in sec.border) {
                                    _border = sec.border[field.field.name];
                                } else if (blocknum in sec.border) {
                                    _border = sec.border[blocknum];
                                } else {
                                    _border = sec.border;
                                }
                                if (_border) {

                                    let func_format = (format) => {
                                        let _b = isSmallerSize ? _border['_small'] : _border['_big'];
                                        let style = {'borderColor': _b};
                                        if (_b === 'transparent') {
                                            if (!format.background && !field.panelColor) {
                                                style.backgroundColor = "transparent"
                                            }
                                            if (field.field.type === 'button') {
                                                field.fieldCell.addClass('no-border')
                                                style.Button = {};
                                                if (format.background) {
                                                    style.Button.backgroundColor = format.background
                                                }
                                                if (format.color) {
                                                    style.Button.color = format.color
                                                }
                                                field.td.find('button').css(style.Button);
                                                style.backgroundColor = "transparent"
                                            }
                                        } else if (_b === true) {
                                            style.borderColor = ""
                                            style.backgroundColor = ""
                                            if (field.field.type === 'button') {
                                                field.fieldCell.removeClass('no-border')
                                                style.Button = {};
                                                style.Button.backgroundColor = ''
                                                style.Button.color = format.color
                                                field.td.find('button').css(style.Button);
                                            }
                                        }
                                        return style;
                                    }
                                    field.td.css(func_format(field.format))
                                    field.field.td_style = func_format;
                                } else {
                                    field.td.css(func_format(field.format))
                                    field.field.td_style = func_format;
                                }
                            }
                        })

                        if (!pcTable.isCreatorView && tdNoTitles.length) {
                            slimThs(tdNoTitles)
                        }


                        let style = {};

                        if (div.data('plateh')) {
                            let heights = div.data('plateh');
                            let height = isSmallerSize ? heights["_small"] : heights['_big']
                            if (height !== false) {
                                style.height = height;
                                style.overflow = 'auto';
                            }
                        }
                        if (div.data('platemh')) {
                            let heights = div.data('platemh');
                            let height = isSmallerSize ? heights["_small"] : heights['_big']

                            if (height !== false) {
                                style.maxHeight = height;
                                style.overflow = 'auto';
                            }
                        }
                        if (div.data('border-color')) {
                            style.borderColor = isSmallerSize ? div.data('border-color')["_small"] : div.data('border-color')['_big'];
                        }
                        if (div.data('plate')) {
                            style.backgroundColor = isSmallerSize ? div.data('plate')["_small"] : div.data('plate')['_big'];
                        }
                        div.css(style);

                    })
                });

            });
        });


    }
})();