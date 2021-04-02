import React from 'react';

export const TableTitle = ({title, format}) => {
    let _title=title;
    if("tabletitle" in format) {
        _title=format.tabletitle;
    }
    return <div className="ttm-tableTitle">{_title}</div>
};