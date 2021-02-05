import React from 'react';
import {FieldCheckbox} from "./FieldCheckbox";
import Switch from "@material-ui/core/Switch";

export class FieldCheckboxSwitch extends FieldCheckbox {
    getModel(){
        return Switch;
    }
};