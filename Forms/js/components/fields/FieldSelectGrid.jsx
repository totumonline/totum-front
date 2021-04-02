import React from 'react';
import {FieldSelectCheckbox} from "./FieldSelectCheckbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import PageviewIcon from "@material-ui/icons/Pageview";

export class FieldSelectGrid extends FieldSelectCheckbox {
    render() {
        if (this.state.loading) {
            return <div><CircularProgress color="inherit" size={20}/></div>
        }
        let {field, data, format} = this.props;
        let blocked = !field.editable || format.block;

        let controls = this.state.list.map((val, i) => {
            let control_params = {};
            let params = {};
            let style = {}

            control_params.checked = this.state.val === val || (this.state.val && this.state.val.indexOf && this.state.val.indexOf(val) !== -1);

            if (blocked) {
                control_params.disabled = true
            } else {
                control_params.onChange = this.changed;
                control_params.value = val;

                style.cursor = "pointer";
                params.onClick = () => {
                    let event = {
                        target: {
                            value: val,
                            checked: !control_params.checked
                        }
                    };
                    this.changed(event)
                };
            }

            let previews = [];
            this.props.format.viewdata.previews_settings = this.props.format.viewdata.previews_settings || {};
            if (this.state.indexed[val][4] && this.state.indexed[val][4].forEach) {
                this.state.indexed[val][4].forEach((list, iP) => {
                    let val = list[2];
                    let title = <Typography variant={"subtitle1"}>{list[1]}</Typography>;

                    if (list[3] === 'file') {
                        let params = {}, style = {}, settings;
                        if (this.props.format.viewdata && this.props.format.viewdata.previews_settings && (settings = this.props.format.viewdata.previews_settings[list[0]])) {
                            if (settings.picture_variant)
                                params.variant = settings.picture_variant
                            if (settings.picture_height)
                                style.height = settings.picture_height
                            if (settings.picture_width)
                                style.width = settings.picture_width
                        }

                        val = list[2].map((file, i) => <Avatar {...params} style={style} key={i} src={file}><PageviewIcon/></Avatar>);
                    }
                    this.props.format.viewdata.previews_settings[list[0]] = this.props.format.viewdata.previews_settings[list[0]] || {};
                    if (this.props.format.viewdata && this.props.format.viewdata.previews_settings && this.props.format.viewdata.previews_settings[list[0]] && this.props.format.viewdata.previews_settings[list[0]].title===false) {
                        title = null
                    }
                    let styles = {}
                    if (this.props.format.viewdata.previews_settings[list[0]] && this.props.format.viewdata.previews_settings[list[0]].padding) {
                        styles.padding = this.props.format.viewdata.previews_settings[list[0]].padding;
                    }
                    previews.push(
                        <div key={iP} data-name-preview={list[0]} style={styles}>
                            {title}
                            <Typography variant={"body2"}>{val}</Typography>
                        </div>
                    )
                })
            }


            if (this.props.format.viewdata.width) {
                style.width = this.props.format.viewdata.width + 'px';
            }
            if (this.props.format.viewdata.outer_padding) {
                style.padding = this.props.format.viewdata.outer_padding;
            }


            if (previews.length) {
                previews = <div className="previews">{previews}</div>
            }

            let paperParams = {};
            if (control_params.checked) {
                paperParams.className = "ttm-checked"
            }

            let control;
            if (this.props.format.viewdata.control !== false)
                control = <Checkbox {...control_params}/>
            let title;
            if (this.props.format.viewdata.title !== false || this.props.format.viewdata.control !== false) {
                title = <Typography
                    variant={"subtitle1"}>{control} {this.props.format.viewdata.title !== false ? this.state.indexed[val][0] : null}
                </Typography>
            }

            return <Grid key={i} item style={style} {...params}>
                <Paper {...paperParams}>{title}
                    {previews}
                </Paper></Grid>
        });

        let changing;
        if (this.state.changing) {
            changing = <div key="changing" style={{position: 'absolute', top: '5px', left: "5px", zIndex: 1000}}>
                <CircularProgress
                    color="inherit" size={15}/></div>
        }

        return <div>{changing}
            <Grid container spacing={4}>
                {controls}
            </Grid>
        </div>
    }
};