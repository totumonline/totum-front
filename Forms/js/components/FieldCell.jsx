import React from 'react';
import {FieldValue} from "./FieldValue";
import ReactHtmlParser from "react-html-parser";
import Typography from "@material-ui/core/Typography";

export const FieldCell = ({field, noTitles, data, format, model, item, gap}) => {
    let style = {width: field.newwidth || field.width};
    let title, $title, titleStyle = {};
    title = format.fieldtitle || field.title;

    /*if (field.panelColor) {
        titleStyle = {backgroundColor: field.panelColor}
    }*/

    let classes = "ttm-fieldCell";
    if (!noTitles)
        $title = <div className="ttm-fieldTitle" style={titleStyle}><span
            className="ttm-fieldTitleInner">{title}</span></div>
    else {
        if (noTitles === 'empty') {
            $title = <div className="ttm-fieldTitle" style={titleStyle}><span
                className="ttm-fieldTitleInner"></span></div>
        } else {
            if (format.height) {
                if (/^\d+$/.test(format.height)) {
                    format.height -= 50;
                }
            }
            if (format.maxheight) {
                if (/^\d+$/.test(format.maxheight)) {
                    format.maxheight -= 50;
                }
            }
        }
    }

    if (format.tab) {
        style.paddingLeft = format.tab + "px";
    }
    if (format.align) {
        style.align = format.align
    }

    if (gap) {
        style.marginLeft = gap;
    }
    format = {...format, width: style.width};

    let text;
    if (format.comment) {
        text = <>{text}
            <div className="ttm-format-text"><i
                className={"fa fa-info"}></i> {ReactHtmlParser(format.comment)}</div>
        </>
    }
    if (field.type !== 'button' && format.text) {
        text = <>{text}
            <div className="ttm-format-text">{ReactHtmlParser(format.text)}</div>
        </>
    }
    if (field.help) {
        text = <>{text}
            <div className="ttm-help">
                {ReactHtmlParser(field.help)}
            </div>
        </>
    }
    if (text) {
        text = <div>{text}</div>
    }

    return <>
        <div className={classes} style={style} data-field-type={field.type} data-field-name={field.name}
             data-field-viewtype={format.viewtype}>
            {$title}
            <FieldValue item={item} field={field} data={data} format={format} model={model}/>
            {text}
        </div>
    </>
};