import React from 'react';
import {FloatLine} from "./FloatLine";

export const getFieldGap = function (gap, blockNum, field) {
    let _gap = 0;
    if (gap) {
        if (typeof gap === "string") {
            _gap = gap;
        } else {
            if (blockNum in gap) {
                _gap = gap[blockNum]
            } else if (field.name in gap) {
                _gap = gap[field.name]
            }
        }
        _gap = parseInt(_gap)
    }
    return _gap;
}


export const FloatBlock = ({fields, plateh, platemh, Plates, outline, format, data, Titles, sectionWithPannels, width, fillAll, setFillTrue, model, gap}) => {
    let innerBlocks = [], innerBlock, innerBlockNum;
    let glueBlocks = [], glueBlock;
    let blockPassed = false;
    /* fields = fields.map((field)=>{
         let row={};
         if (format[field.name].breakwidth) {
             row.minwidth = field.width;
             row.width = format[field.name].breakwidth;
         }
         return {...field, row}
     });*/

    fields.forEach((field) => {
        field = {...field};


        let _format = format[field.name];
        let blockNum = (_format.blocknum || 0).toString();
        if (!innerBlockNum || innerBlockNum !== blockNum) {
            innerBlockNum = blockNum;

            glueBlocks = [];
            glueBlock = null;
            innerBlock = {glueBlocks: glueBlocks};

            innerBlocks.push(innerBlock);
        }

        if (!glueBlock || !_format.glue) {
            glueBlock = {
                width: format[field.name].breakwidth || field.width,
                minwidth: field.width,
                fields: [field],
                line: !glueBlock ? 0 : (_format.nextline ? glueBlock.line + 1 : glueBlock.line)
            };
            glueBlocks.push(glueBlock);
        } else {

            glueBlock.width += (format[field.name].breakwidth || field.width) - 1;
            glueBlock.minwidth += field.width - 1;
            glueBlock.fields.push(field);

        }
    });

    let sumWidth = 0;
    let line, lines = [];
    const getAddWidthes = function (sumWidth) {
        let margins = (sumWidth && sectionWithPannels) ? 10 : 0;
        let paddings = sectionWithPannels ? 20 : 0;
        return paddings + margins
    };
    const getFieldsGaps = function (isNotFirst, fields) {
        let _gap = 0
        fields.forEach((field, i) => {
            if (isNotFirst || i) {
                _gap += getFieldGap(gap, (format[field.name].blockNum || 0).toString(), field);
            }
        })
        return _gap
    }
    /*const getGaps = function (isNotFirst, innerBlock) {
        let fields = [...innerBlock.glueBlocks].reduce(((i, block)=>{
            i.push(...block.fields)
            return i;
        }), []);
        return getFieldsGaps(isNotFirst, fields)
    };*/


    if (innerBlocks.some((innerBlock) => {
        innerBlock.width = getWidthInner(innerBlock.glueBlocks, getFieldsGaps);
        innerBlock.minwidth = getWidthInner(innerBlock.glueBlocks, getFieldsGaps, true);

        let blockWidth = innerBlock.width + getAddWidthes(sumWidth);

        if (!line) {
            line = [innerBlock];
            lines.push(line);
            sumWidth = blockWidth;
            return;
        }
        if ((sumWidth + blockWidth) > width) {
            let maxWidth = getMaxWidthInner(innerBlock.glueBlocks, getFieldsGaps, getAddWidthes);
            if (!fillAll) {
                setTimeout(function () {
                    setFillTrue();
                });
            }
            /*Если самый широкий участок поместился - оставляем его на этой линии и начинаем новую со следующего*/
            if ((sumWidth + maxWidth) <= width) {
                innerBlock.smallerView = width - sumWidth;
                line.push(innerBlock);
                line = null;
            } else {
                blockPassed = true;
                /* Если не поместился - переносим его на следующую линию */
                line = [innerBlock];
                lines.push(line);
                sumWidth = blockWidth;
            }
            return;
        }

        line.push(innerBlock);
        sumWidth += blockWidth;
    })) {
        return <></>
    }
    let $lines = [];

    lines.forEach((innerBlocks, i) => {
        //if ($lines.length) $lines.push(<br key={"br" + i}/>);

        $lines.push(<div key={i} data-type="line"><FloatLine key={i}
                                                             Plates={Plates}
                                                             plateh={plateh}
                                                             platemh={platemh}
                                                             outline={outline}
                                                             innerBlocks={innerBlocks}
                                                             Titles={Titles} format={format} data={data}
                                                             getAddWidthes={getAddWidthes}
                                                             getGaps={getFieldsGaps}
                                                             fillAll={fillAll}
                                                             width={width}
                                                             model={model}
                                                             gap={gap}
                                                             blockPassed={blockPassed}
        /></div>)
    });

    return <div
        className="ttm-floatBlock">{$lines}
    </div>
};

const getMaxWidthInner = function (innerBlockGlues, getGaps, getAddWidthes) {
    let maxWidth = 0;
    innerBlockGlues.forEach((glueBlock, i) => {
        let addWidth = getGaps(0, glueBlock.fields) + getAddWidthes(0)
        if (maxWidth < glueBlock.width + addWidth) maxWidth = glueBlock.width + addWidth;
    });
    return maxWidth;
};
const getWidthInner = function (innerBlockGlues, getGaps, isMin) {
    let maxWidth = 0;
    let line = -1;
    let sumWidth = 0;

    innerBlockGlues.forEach((glueBlock) => {
        if (line !== glueBlock.line) {
            if (maxWidth < sumWidth)
                maxWidth = sumWidth;
            sumWidth = 0;
            line = glueBlock.line;
        }
        sumWidth += (isMin?glueBlock.minwidth:glueBlock.width) + getGaps(sumWidth, glueBlock.fields);
    });
    if (maxWidth < sumWidth)
        maxWidth = sumWidth;
    return maxWidth;
};