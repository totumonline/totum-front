import React from 'react';
import {FieldFileImage} from "./FieldFileImage";

export const FieldSelectViewImage = (props) => {
    props={...props, data: {v_: [props.data.v_]}};
    return <FieldFileImage {...props}></FieldFileImage>
};