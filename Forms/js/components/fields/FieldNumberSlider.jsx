import React from 'react';
import {FieldNumber} from "./FieldNumber";
import Slider from "@material-ui/core/Slider";
import ValueLabel from "@material-ui/core/Slider/ValueLabel";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

export class FieldNumberSlider extends FieldNumber {
    static prepareInputVal(val) {

        if (val === null) val = 0;
        return parseFloat(val)
    }

    static getDerivedStateFromProps(props, state) {
        let propsVal = FieldNumberSlider.prepareInputVal(props.data.v);
        if (propsVal !== state.inVal) {
            return {
                val: propsVal,
                inVal: propsVal,
                focus: false
            }
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        let prepared = this.constructor.prepareInputVal(nextProps.data.v)
        if (this.props.model.elseData !== nextProps.model.elseData || JSON.stringify(nextProps.data.v) !== JSON.stringify(this.props.data.v) || (!this.state.focus && !nextState.focus && JSON.stringify(prepared) !== JSON.stringify(nextState.val))) {
            this.setState({
                val: prepared,
                inVal: prepared,
            });
            return false;
        }

        return true;
    }

    checkFocus(event) {

    }

    setVal(event, val) {
        if (this.props.field.withEmptyVal === undefined && val === null) {
            return;
        }
        this.setState({val: val, focus: true});
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this._save(this.state.val, this.state.val !== this.state.inVal);
        }, 500)
    }

    getVal(style, format, blocked) {
        let unitType = this.props.field.unitType || '';
        if (unitType) unitType = ' ' + unitType;

        const valueLabelFormat = (value) => {
            return value + unitType;
        }
        let prefix;

        format.viewdata = format.viewdata || {};

        let marks = format.viewdata.marks;

        if (!marks) {
            marks = [];
            if (format.viewdata.min) {
                marks.push(
                    {
                        value: format.viewdata.min,
                        label: format.viewdata.min + unitType,
                    });
            }
            if (format.viewdata.max) {
                marks.push(
                    {
                        value: format.viewdata.max,
                        label: format.viewdata.max + unitType,
                    });
            }
        }


        let params = {}, styles = {};
        if (format.viewdata.orientation === 'vertical') {
            params.orientation = format.viewdata.orientation;
            styles.height = 200 + "px";
        }

        if (blocked) {
            params.disabled = true;
        } else {
            params.onChange = this.setVal
        }


        switch (format.viewdata.label) {
            case true:
                params.valueLabelDisplay = "on"
                break;
            case false:
                params.valueLabelDisplay = "off"
                break;
            default:
                params.valueLabelDisplay = "auto"
                break;
        }

        let step = 1;
        if ('step' in format.viewdata)
            step = format.viewdata.step;

        if ('max' in format.viewdata) {
            params.max = format.viewdata.max;
        }
        if ('min' in format.viewdata) {
            params.min = format.viewdata.min;
        }

        return (
            <div>
                {prefix}
                <Slider
                    style={styles}
                    color='secondary'
                    {...params}
                    value={this.state.val}
                    step={step}
                    ValueLabelComponent={ValueLabel}


                    aria-labelledby="non-linear-slider"
                    marks={marks}
                />
            </div>);
    }
};