import React from 'react';
import {FieldDefault} from "./FieldDefault";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export class FieldCheckbox extends FieldDefault {
    constructor(props) {
        super(props);
        this.addBindings();
    }

    addBindings() {
        this.onChange = this.onChange.bind(this);
    }

    onChange(event) {
        this._save(event.target.checked, true)
    }
    getModel(){
        return Checkbox;
    }

    getVal(style, format, blocked) {
        let prefix;

        format.viewdata=format.viewdata || {};
        if (format.icon) {
            prefix = <i className={"fa fa-" + format.icon} style={{paddingRight: "5px", paddingLeft: "5px"}}></i>;
        }
        let params = {};
        if (blocked) {
            params.disabled = true;
        } else {
            params.onChange = this.onChange;
        }
        let Model=this.getModel();

        if(format.viewdata.right_text){
            return <div>{prefix}<FormControlLabel control={<Model checked={this.state.val} {...params} />} label={format.viewdata.right_text}/></div>
        }
        return <div>{prefix}<Model checked={this.state.val} {...params}></Model></div>
    }
};