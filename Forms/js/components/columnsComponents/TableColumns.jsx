import React from 'react';
import {TableColumnsTitle} from "./TableColumnsTitle";

export const TableColumns = ({table_format, format}) => {
    return <div className="ttm-rowsWrapper">
        <TableColumnsTitle title={table_format.rowsTitle}/>
    </div>
};