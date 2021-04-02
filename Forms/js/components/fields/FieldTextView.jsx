import React from 'react';
import ReactHtmlParser from 'react-html-parser';

export const FieldTextView = ({data, format})=>{
    let val = data.v || '';
    switch (format.viewtype) {
        case 'text':
            return <div className={"text"}>{val}</div>
        case 'html':
            return <div className={"text"}>{ReactHtmlParser(val)}</div>
    }
};