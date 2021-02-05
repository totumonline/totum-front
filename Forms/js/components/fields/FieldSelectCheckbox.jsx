import React from 'react';
import {FieldSelect} from "./FieldSelect";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

export class FieldSelectCheckbox extends FieldSelect {
    constructor(props) {
        super(props);
        let {format} = props;
        if (format.selects) {
            this.state.indexed = format.selects.indexed;
            this.state.list = format.selects.list;
            this.state.loaded = true;
        } else {
            this.state.loading = true
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.state.loaded) {
            this.load();
        } else {
            if (this.props.field.codeSelectIndividual && 'selects' in this.props.format && this.props.format.selects.indexed != this.state.indexed) {
                this.setState({
                    indexed: this.props.format.selects.indexed,
                    list: this.props.format.selects.list
                })
                return false;
            }
        }
    }

    load() {
        this.props.model.getEditSelect([], this.props.field.name, this.state.search, null, this.props.format.viewtype).then((json) => {
            let newState = {
                list: json.list,
                indexed: json.indexed,
                loading: false,
                loaded: true
            };
            this.setState(newState)
        })
    }

    __getControl(val, blocked) {
        let params = {};
        if (blocked)
            params.disabled = true
        else {
            params.onChange = this.changed;
            params.value = val
        }
        return <Checkbox
            checked={this.isChecked(val)}
            {...params} />
    }

    isChecked(val) {
        return this.state.val === val || (this.state.val && this.state.val.indexOf && this.state.val.indexOf(val) !== -1)
    }

    render() {
        if (this.state.loading) {
            return <div><CircularProgress color="inherit" size={20}/></div>
        }
        let {field, data, format} = this.props;
        let blocked = !field.editable || format.block;
        let controls = [];
        let group = null;
        format.viewdata = format.viewdata || {};
        this.state.list.map((val, i) => {
            let indval = this.state.indexed[val];
            if (group !== indval[2]) {
                group = indval[2];
                let styles = {}
                if (format.viewdata.section_weight) {
                    styles.fontWeight = format.viewdata.section_weight
                    if(styles.fontWeight.toString().match(/^\d+$/)){
                        styles.fontWeight+='px'
                    }
                }
                if (format.viewdata.section_size) {
                    styles.fontSize = format.viewdata.section_size;
                    if(styles.fontSize.toString().match(/^\d+$/)){
                        styles.fontSize+='px'
                    }
                }
                controls.push(<div key={"section" + i} style={styles} className="ttm-select-section-name"
                >{group}</div>)
            }

            let label = <span className="ttm-value">{indval[0]}</span>;
            if (format.viewdata.right_preview_name) {
                indval[4].some((row) => {
                    if (row[0] === format.viewdata.right_preview_name) {
                        label = <><span className="ttm-right-preview">{row[2]}</span><span
                            className="ttm-value">{indval[0]}</span></>
                        return true;
                    }
                })

            }
            let classes = this.isChecked(val) ? 'ttm-checked' : '';

            controls.push(<FormControlLabel className={classes} key={i}
                                            control={this.__getControl(val, blocked)}
                                            label={label}
            />)
        });

        let prefix;


        return <div>
            {prefix}
            <FormControl component="fieldset">
                <FormGroup>
                    {controls}
                </FormGroup>
            </FormControl>
        </div>
    }

    changed(event) {
        let {field} = this.props;
        let val;
        if (field.multiple) {
            let prevState = [...this.state.val];
            if (prevState === null)
                prevState = [];
            let index = prevState.indexOf(event.target.value);
            if (event.target.checked) {
                if (index === -1)
                    val = [...prevState, event.target.value]
            } else {
                if (index !== -1) {
                    val = prevState;
                    val.splice(index, 1)
                }
            }
        } else {
            if (event.target.checked) {
                val = event.target.value
            } else {
                val = null;
            }
            if (this.props.field.withEmptyVal === undefined && val === null) {
                return;
            }
        }

        this.save(val);
    }
}