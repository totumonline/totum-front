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
                inVal: propsVal
            }
        }
        return null;
    }

    setVal(event, val) {

        if (this.props.field.withEmptyVal === undefined && val === null) {
            return;
        }
        this.setState({val: val});
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this._save(this.state.val, this.state.val !== this.state.inVal);
        }, 1000)
    }

    getVal(style, format, blocked) {
        let unitType = this.props.field.unitType || '';
        if (unitType) unitType = ' ' + unitType;

        const valueLabelFormat = (value) => {
            return value + unitType;
        }
        let prefix;

        format.viewdata = format.viewdata || {};

        let marks = format.viewdata.marks || [
            {
                value: format.viewdata.min,
                label: format.viewdata.min + unitType,
            },
            {
                value: format.viewdata.max,
                label: format.viewdata.max + unitType,
            }
        ];
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


        return (
            <div>
                {prefix}
                <Slider
                    style={styles}
                    color='secondary'
                    {...params}
                    value={this.state.val}
                    min={format.viewdata.min}
                    step={step}
                    max={format.viewdata.max}
                    ValueLabelComponent={ValueLabel}


                    aria-labelledby="non-linear-slider"
                    marks={marks}
                />
            </div>);
    }
};