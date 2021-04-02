import React from 'react';
import {FieldString} from "./FieldString";

export class FieldText extends FieldString {
    constructor(props) {
        super(props);
        this.isText=true;
    }
};