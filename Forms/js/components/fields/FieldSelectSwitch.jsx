import React from 'react';
import {FieldSelectCheckbox} from "./FieldSelectCheckbox";
import Switch from "@material-ui/core/Switch";

export class FieldSelectSwitch extends FieldSelectCheckbox {

    __getControl(val, blocked){
        let params={};
        if (blocked)
            params.disabled=true
        else {
            params.onChange=this.changed;
            params.value=val
        }
        return <Switch
            checked={this.state.val === val || (this.state.val && this.state.val.indexOf && this.state.val.indexOf(val) !== -1)}
            {...params} />
    }
};