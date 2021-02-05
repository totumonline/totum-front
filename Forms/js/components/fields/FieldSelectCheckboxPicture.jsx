import React from 'react';
import {FieldSelectCheckbox} from "./FieldSelectCheckbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import PageviewIcon from '@material-ui/icons/Pageview';

export class FieldSelectCheckboxPicture extends FieldSelectCheckbox {
    constructor(props) {
        super(props);
        this.itemClick = this.itemClick.bind(this)
    }

    render() {
        if (this.state.loading) {
            return <div><CircularProgress color="inherit" size={20}/></div>
        }

        let {field, data, format} = this.props;
        let blocked = !field.editable || format.block;
        format.viewdata = format.viewdata || {};

        let controls = [], group;
        this.state.list.map((val, i) => {

            let indval = this.state.indexed[val];

            if (group !== indval[2]) {
                group = indval[2];
                let styles = {}
                if (format.viewdata.section_weight) {
                    styles.fontWeight = format.viewdata.section_weight
                }
                if (format.viewdata.section_size) {
                    styles.fontSize = format.viewdata.section_size + "px"
                }
                controls.push(<div key={"section" + i} style={styles} className="ttm-select-section-name"
                >{group}</div>)
            }


            let url = '';
            try {
                url = indval[4][this.props.format.viewdata.picture_name];
            } catch (e) {
            }

            let style = {};

            if (this.props.format.viewdata) {
                if (this.props.format.viewdata.picture_width) {
                    style.width = this.props.format.viewdata.picture_width + 'px';
                }
                if (this.props.format.viewdata.picture_height) {
                    style.height = this.props.format.viewdata.picture_height + 'px';
                }
            }


            let params = {};
            if (this.props.format.viewdata.picture_variant) {
                params.variant = this.props.format.viewdata.picture_variant
            }
            let controller;
            {
                let controller_params = {};
                controller_params.checked = this.state.val === val || (this.state.val && this.state.val.indexOf && this.state.val.indexOf(val) !== -1);

                if (blocked) {
                    controller_params.disabled = true;
                } else {
                    controller_params.onChange = this.changed;
                    controller_params.value = val;
                }

                switch (this.props.format.viewdata.controller_type) {
                    case 'switch':
                        controller = <Switch
                            {...controller_params}
                        />
                        break;
                    default:
                        controller = <Checkbox
                            edge="end"
                            {...controller_params}
                        />
                }
            }

            controls.push(<ListItem key={i} onClick={this.itemClick} data-val={val}>
                <ListItemAvatar>
                    <Avatar {...params} style={style}
                            src={url}
                    ><PageviewIcon/></Avatar>
                </ListItemAvatar>
                <ListItemText primary={indval[0]}/>
                <ListItemSecondaryAction>
                    {controller}
                </ListItemSecondaryAction>
            </ListItem>)
        });

        let prefix;


        return <div>
            {prefix}
            <List dense>
                {controls}</List>
        </div>
    }

    itemClick(event) {
        let val = event.currentTarget.getAttribute('data-val');
        this.changed({
            target: {
                value: val,
                checked: !(typeof this.state.val === 'object' && this.state.val !== null ? this.state.val.indexOf(val) !== -1 : this.state.val === val)
            }
        })
    }

};