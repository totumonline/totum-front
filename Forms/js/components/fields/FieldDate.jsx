import React from 'react';
import {FieldString} from "./FieldString";
import InputAdornment from "@material-ui/core/InputAdornment";
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
    DatePicker,
    TimePicker,
    DateTimePicker, KeyboardDateTimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import ruLocale from "date-fns/locale/ru";
import enLocale from "date-fns/locale/en-US";
import zhLocale from "date-fns/locale/zh-CN";

import TextField from "@material-ui/core/TextField";
import moment from "moment";


export class FieldDate extends FieldString {
    constructor(props) {
        super(props);
        this.state.inVal = props.data.v
        this.state.valString = props.data.v

        switch (this.props.model.lang.name) {
            case 'ru':
                this.locale = ruLocale;
                break;
            case 'zh':
                this.locale = zhLocale;
                break;
            default:
                this.locale = enLocale;
        }
    }

    static getDerivedStateFromProps(props, state) {
        let propsVal = FieldDate.prepareInputVal(props.data.v);

        if ((propsVal ? propsVal.toString() : '') !== (state.val ? state.val.toString() : '')) {
            return {
                val: propsVal,
                inVal: props.data.v,
                valString: props.data.v
            }
        }
        return null;
    }

    addBindings() {
        super.addBindings();
        this.renderInput = this.renderInput.bind(this);
    }

    static prepareInputVal(val) {
        if (val && val.indexOf(' ')) {
            val = moment(val).utc().format();
        }
        return val === null || val === undefined ? null : new Date(val)
    }

    renderInput(props, format, style) {
        let onChange = props.onChange;

        if (props.error && (props.value === "" || props.value === undefined)) {
            let {required} = this.props.field;
            if (required) {
                props.helperText = this.lng('Mandatory Field');
            } else {
                props = {...props, error: false, helperText: ""}
            }
        }

        props = {
            ...props, onKeyDown: this.onKeyDown, onFocus: () => {
                if (!this.state.focus) {
                    this.setState({focus: true})
                }
            }
        };
        if (this.state.focus) {
            props.inputRef = (input) => {
                input && input.focus()
            }
        }
        props.InputProps.style = props.InputProps.style || {};
        if (style.color) props.InputProps.style.color = style.color;
        if (style.align) props.InputProps.style.align = style.align;
        if (style.fontWeight) props.InputProps.style.fontWeight = style.fontWeight;
        if (style.textDecoration) props.InputProps.style.textDecoration = style.textDecoration;
        if (style.fontStyle) props.InputProps.style.fontStyle = style.fontStyle;

        if (format.icon) {
            props.InputProps.startAdornment =
                <InputAdornment position="start"><i className={"fa fa-" + format.icon}></i></InputAdornment>;
        }

        props.variant = "outlined"

        return <TextField
            onKeyDown={this.onKeyDown}

            {...props}
        />
    }

    onKeyDown(event) {
        switch (event.key) {
            case 'Enter':
                this.save(this.state.val)
                return false;
                break;
            case 'Escape':
                this._blur();
                return false;
        }
    }

    setVal(d) {
        if (d instanceof Date && !isNaN(d)) {
            this.setState({
                val: d,
                valString: this._getValString(d)
            })
        } else {
            this.setState({
                val: null,
                valString: ""
            })
        }
    }

    _pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    _getValString(d) {
        let val;
        if (d instanceof Date && !isNaN(d)) {
            let month = d.getMonth() + 1;
            let day = d.getDate();

            val = d.getFullYear() + '-' + this._pad(month) + '-' + this._pad(day);
            if (this.props.field.dateTime) {
                val += ' ' + this._pad(d.getHours()) + ':' + this._pad(d.getMinutes())
            }
        } else {
            val = null;
        }
        return val;
    }


    save(d) {
        let val = this._getValString(d);

        if (this.state.inVal !== val) {
            if (this.state.error) {
                this._blur()
            } else {
                this._save(val, val !== this.state.val)
            }
        }
    }


    __getDivParams() {
        let divParams = {};
        if (this.props.model.elseData === 'saveButtonClicked' && this.props.field.required && (this.state.val === null)) {
            divParams.className = "ttm-required-empty-field";
        }
        return divParams;
    }

    getVal(style, format, blocked) {
        let params = {};

        if (blocked) {
            params.disabled = true
        } else {
            params.onChange = this.setVal;
        }

        let Model, dateFormat = this._getDateFormat();
        let classes = "ttm-form ttm-dateDialog ";
        if (!this.props.field.dateTime) {
            Model = KeyboardDatePicker;
        } else if (format.viewtype === 'time') {
            Model = KeyboardTimePicker;
            classes = "ttm-form ttm-timeDialog ";
            params.ampm = false;
        } else {
            Model = KeyboardDateTimePicker;
            params.ampm = false;
        }

        return <div {...this.__getDivParams()}><MuiPickersUtilsProvider utils={DateFnsUtils} locale={this.locale}>
            <Model
                clearable={!this.props.field.required}
                required={this.props.field.required}
                format={dateFormat}
                autoOk={false}
                fullWidth={true}
                value={this.state.val}
                onAccept={this.save}
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                }}
                DialogProps={{
                    className: classes,
                    disableBackdropClick: true,
                    BackdropProps: {style: {opacity: 0.3}}
                }}
                TextFieldComponent={(params) => this.renderInput(params, format, style)}
                {...params}

                clearLabel={this.lng('Clear')}
                cancelLabel= {this.lng('Cancel')}
            /></MuiPickersUtilsProvider></div>
    }

    _getDateFormat() {
        let format = this.props.field.dateFormat;
        if (!format) {
            if (this.props.field.dateTime) {
                format = 'd.m.y H:i';
            } else {
                format = 'd.m.y';
            }
        }
        let replaces = {
            'd': 'dd',
            'D': 'ddd',
            'j': 'M',
            'z': 'ddd',
            'W': 'w',
            'm': 'MM',
            'M': 'MMM',
            'n': 'M',
            'y': 'yy',
            'Y': 'yyyy',
            'H': 'HH',
            'i': 'mm',
            's': 'ss',
        };
        let formatNew = '';
        for (let i = 0; i < format.length; i++) {
            let letter = format[i];
            formatNew += replaces[letter] || letter;
        }
        return formatNew;
    }
};