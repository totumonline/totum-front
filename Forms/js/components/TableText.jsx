import React from 'react';
import ReactHtmlParser from "react-html-parser";

export const TableText = ({format}) => {
    if("tabletext" in format){
        return <div className="ttm-tableText">{ReactHtmlParser(format.tabletext)}</div>
    }
    return <></>;
};