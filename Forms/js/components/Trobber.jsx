import React from 'react';
import CircularProgress from "@material-ui/core/CircularProgress";

export const Trobber = ({hidden}) => {
    return <div key="changing" hidden={hidden} className="ttm-trobber-wrapper">
        <CircularProgress
            color="inherit" className="ttm-trobber" style={{width: '100px', height: '100px'}}/></div>
};