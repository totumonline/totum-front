import React from 'react';

export const TableText = ({format}) => {
    if("tabletext" in format){
        return <div className="ttm-tableText">{format.tabletext}</div>
    }
    return <></>;
};