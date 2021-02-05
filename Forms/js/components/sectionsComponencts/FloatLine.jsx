import React from 'react';
import {FieldCell} from "../FieldCell";
import {getFieldGap} from "./FloatBlock";

const getFormatHeight = function (plateh, blocknum, passBlock) {
    let heights = plateh, height;
    if (typeof plateh === 'boolean') return null;

    if (typeof plateh === 'object' && blocknum && blocknum in plateh) {
        heights = plateh[blocknum]
    } else {
        heights = plateh
    }
    if (heights) {
        height = passBlock ? heights['small'] : heights['big']
        if (height) {
            return height;
        }
    }
    return null;
};

const getBlockGrows = function (fields, format) {
    let growFieldsWidth = 0;
    let growFields = [];
    fields.forEach((field) => {
        let fFormat = format[field.name];
        if (fFormat.maxwidth || fFormat.fill === true) {
            growFieldsWidth += field.width;
            growFields.push(field);
        }
    });
    return [growFields, growFieldsWidth];
};

export const FloatLine = ({innerBlocks, plateh, platemh, Plates, outline, data, Titles, format, getAddWidthes, getGaps, width, fillAll, model, gap, blockPassed}) => {
    let $innerBlocks = [];

    let sumWidth = 0;
    let blocksLines = [];


    const fillLine = function (fields, width, _fillAll, widthPlus) {
        _fillAll = fillAll || (_fillAll || false);

        let fieldsWidth = 0;
        let growFields = [];
        let growFieldsWidth = 0;

        fields.forEach((field) => {
            field.newwidth = field.newwidth || field.width;
            fieldsWidth += field.newwidth;
            let fFormat = format[field.name];
            if (fFormat.maxwidth || (_fillAll && fFormat.fill === true)) {
                growFields.push(field);
                growFieldsWidth += field.width;
            }
        });
        let diff = widthPlus || width - fieldsWidth;

        diff -= getGaps(0, fields);

        let dii = 0;

        const diffApply = function (growFieldsI, allInOne) {
            let field = growFields[growFieldsI];
            let fFormat = format[field.name];

            let fdiff = allInOne ? diff : Math.floor(diff * field.width / growFieldsWidth);

            if (!_fillAll && fFormat.maxwidth) {
                if ((fFormat.maxwidth - field.newwidth) <= fdiff) {
                    fdiff = fFormat.maxwidth - field.newwidth;
                    growFieldsWidth -= field.width;
                    growFields.splice(growFieldsI, 1);
                }
            }
            field.newwidth += fdiff;
            return fdiff;
        };

        while (diff > 0 && dii++ < 20 && growFields.length) {
            let added = 0;
            growFields.some((field, i) => {
                let fdiff = diffApply(i);
                if (fdiff > 0) {
                    added += fdiff;
                    if (added >= diff) return true;
                }
            });
            if (!added && growFields.length > 0) {
                growFields.some((field, i) => {
                    let fdiff = diffApply(i, true);
                    if (fdiff > 0) {
                        added += fdiff;
                        if (added >= diff) return true;
                    } else {

                    }
                });
            }
            diff -= added;
        }
        return diff > 20 ? diff : 0;
    };


    /*Сформировать линии в блоках*/
    innerBlocks.forEach((innerBlock, i) => {
            let addWidthes = getAddWidthes(sumWidth, innerBlock);
            delete innerBlock.smaller;
            delete innerBlock.lastWidth;
            delete innerBlock.linesFields;

            if ((width - sumWidth - addWidthes) < innerBlock.width || innerBlock.smallerView) {
                innerBlock.smaller = width - sumWidth - addWidthes;
            }

            if (innerBlock.smaller) {

                let glueLines = [];
                let nowLine;
                innerBlock.glueBlocks.forEach((block) => {
                    let lastLine = glueLines.length - 1;
                    if (nowLine !== block.line || glueLines[lastLine].width && glueLines[lastLine].width + block.width > innerBlock.smaller) {
                        glueLines.push({width: 0, glueBlocks: []});
                        lastLine = glueLines.length - 1;
                        nowLine = block.line;
                    }
                    glueLines[lastLine].width += block.width;
                    glueLines[lastLine].glueBlocks.push(block);
                })
                /* glueLines.forEach((line) => {
                     line.width = line.glueBlocks.reduce((sum, block) => sum + block.width, 0)
                 });*/

                let maxGlueLineWidth = innerBlock.width;
                let maxLineInd = 0;
                const funcGetMaxLine = function (glueLines) {
                    let lineIndex, lineWidth;
                    glueLines.forEach((line, i) => {
                        if (!lineWidth || line.width > lineWidth) {
                            lineWidth = line.width;
                            lineIndex = i;
                        }
                    });
                    return [lineWidth, lineIndex]
                };
                let rind = 0;

                [maxGlueLineWidth, maxLineInd] = funcGetMaxLine(glueLines);

                while (rind++ < 25 && innerBlock.smaller < maxGlueLineWidth) {
                    let maxLine = glueLines[maxLineInd];
                    if (maxLine.glueBlocks.length === 1) break;

                    let blockInd = maxLine.glueBlocks.length - 1;
                    let block = maxLine.glueBlocks[blockInd];
                    let nextLineInd = maxLineInd + 1;
                    /*Если следующей линии нет*/
                    if (!glueLines[nextLineInd]) {
                        glueLines[nextLineInd] = {width: block.width, glueBlocks: [block]};
                    } else {
                        glueLines[nextLineInd].width += block.width;
                        glueLines[nextLineInd].glueBlocks = [block, ...glueLines[nextLineInd].glueBlocks];

                        //Схлопываем последующие линии
                        let iiL = 0, nowInd = nextLineInd + 1;
                        while (iiL++ < 20 && nowInd < glueLines.length) {
                            let firstLineFieldName = glueLines[nowInd].glueBlocks[0].fields.name;
                            let formatField = format[firstLineFieldName];
                            if (!formatField.nextLine) {
                                glueLines[nowInd - 1].width += glueLines[nowInd].width;
                                glueLines[nowInd - 1].glueBlocks = [glueLines[nowInd].glueBlocks, ...glueLines[nowInd].glueBlocks];
                                glueLines.splice(nowInd, 1);
                            }
                            nowInd++;
                        }
                    }

                    maxLine.glueBlocks.splice(blockInd, 1);
                    maxLine.width -= block.width;

                    [maxGlueLineWidth, maxLineInd] = funcGetMaxLine(glueLines);

                }

                let linesFields = [];
                glueLines.forEach((glueLine, gi) => {
                    let lineFields = [];
                    glueLine.glueBlocks.forEach((block) => {
                        lineFields.push(...block.fields);
                    });
                    linesFields.push(lineFields);
                });
                blocksLines.push({lines: linesFields, block: innerBlock});
                innerBlock.linesFields = linesFields;
                fillLine(linesFields[0], innerBlock.smaller, true);
                sumWidth += addWidthes + innerBlock.smaller

                // smaller view
            } else {
                //simple view
                let linesFields = [];
                let line;


                innerBlock.glueBlocks.forEach((glueBlock) => {
                    if (!line || format[glueBlock.fields[0].name].nextline) {
                        line = [];
                        linesFields.push(line);
                    }
                    line.push(...glueBlock.fields);
                });

                blocksLines.push({lines: linesFields, block: innerBlock});
                sumWidth += addWidthes + innerBlock.width;
                /*Заполнить первые линии*/
                fillLine(linesFields[0], innerBlock.minwidth);
                innerBlock.linesFields = linesFields;
            }
            innerBlock.lastWidth = innerBlock.smaller || (innerBlock.minwidth);

        }
    );


    /*Увеличить блоки*/

    (function () {

        let summWidth = 0;
        let grows = [];
        let summGrows = 0;
        innerBlocks.map((block) => {
            summWidth += block.lastWidth + getAddWidthes(summWidth, block);
            let firstLine = block.linesFields[0];

            let [growFields, growWidth] = getBlockGrows(firstLine, format);
            if (growWidth) {
                summGrows += growWidth;
                grows.push([block, growFields, growWidth])
            }

        });

        let diff = width - summWidth;

        let ii = 0;
        while (ii++ < 20 && diff > 0 && grows.length) {
            let add = 0;
            grows.some((grow, i) => {
                let widthPlus = Math.round(diff * grow[2] / summGrows) || (diff - add);
                if (widthPlus) {
                    let restOfWidth = fillLine(grow[1], null, false, widthPlus);
                    if (restOfWidth) {
                        grow[0].lastWidth += widthPlus - restOfWidth;
                        grows.splice(i, 1);
                        summGrows -= grow[2];
                    } else {
                        grow[0].lastWidth += widthPlus;
                    }
                    add += widthPlus - restOfWidth;
                }
                if (diff <= add) return true;
            });
            diff -= add;
        }
    })();


    /*Заполнить непервые линии*/

    innerBlocks.forEach((block) => {
        //  console.log(JSON.stringify(block.glueBlocks.map((b)=>b.fields.map((f)=>f.name))));
        // console.log(JSON.stringify(block.linesFields.map((fields)=>fields.map((f)=>f.name))));
        block.linesFields.forEach((fields, i) => {
            if (i) {
                fillLine(fields, block.lastWidth, true);
            }
        })
    });

    let heightSlash = new RegExp(/\//)

    /*Вывести*/
    blocksLines.forEach(({lines, block}, ib) => {
        let $lines = lines.map((fields, iL) => {
            let $fields = [];

            let AllLineNotitles = true;

            fields.forEach((field) => {
                field.fieldNoTitles = !(field.name in Titles ? Titles[field.name] :
                    (format[field.name].blocknum in Titles ? Titles[format[field.name].blocknum] : Titles['_ALL']));

                if (!field.fieldNoTitles)
                    AllLineNotitles = false;
            });


            fields.forEach((field, iF) => {
                let fieldNoTitles = false;

                if (field.fieldNoTitles) {
                    if (AllLineNotitles)
                        fieldNoTitles = true;
                    else {
                        fieldNoTitles = "empty";
                    }
                }
                let _gap;
                if (iF && gap) {
                    _gap = getFieldGap(gap, blocknum, field)
                    if (_gap) {
                        if (/^\d+$/.test(_gap)) {
                            _gap = parseInt(_gap) - 1;
                            _gap += 'px'
                        }
                    }
                }
                if (format[field.name].height && heightSlash.test(format[field.name].height)) {
                    format[field.name].height = format[field.name].height.split('/')[blockPassed ? 1 : 0]
                }
                if (format[field.name].maxheight && heightSlash.test(format[field.name].maxheight)) {
                    format[field.name].maxheight = format[field.name].maxheight.split('/')[blockPassed ? 1 : 0]
                }

                $fields.push(<FieldCell item="params"
                                        noTitles={fieldNoTitles}
                                        key={field.name}
                                        field={field}
                                        data={data[field.name]}
                                        format={format[field.name]} model={model} gap={_gap}/>)
            });
            return <div key={iL}>{$fields}</div>
        });
        let cln = "ttm-floatInner";
        let blocknum = format[lines[0][0].name].blocknum || 0;
        let styles = {};
        if (outline) {

            if (blocknum in outline) {
                styles.borderColor = blockPassed ? outline[blocknum]['small'] : outline[blocknum]['big'];
            } else {
                styles.borderColor = blockPassed ? outline['small'] : outline['big'];
            }
        }
        if (Plates) {
            if (blocknum in Plates) {
                styles.backgroundColor = blockPassed ? Plates[blocknum]['small'] : Plates[blocknum]['big'];
            } else {
                styles.backgroundColor = blockPassed ? Plates['small'] : Plates['big'];
            }
        }
        {
            let height = getFormatHeight(plateh, blocknum, blockPassed)
            if (height) {
                styles.height = height;
                styles.overflow = "auto";
            }
        }
        {
            let height = getFormatHeight(platemh, blocknum, blockPassed)
            if (height !== null) {
                styles.maxHeight = height;
                styles.overflow = "auto";
            }
        }


        $innerBlocks.push(<div key={ib} className={cln} style={styles}>{$lines}</div>)
    });


    return <>{$innerBlocks}</>
};