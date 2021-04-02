import React from 'react';
import TextField from "@material-ui/core/TextField";

import {FieldDefault} from "./FieldDefault";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

export class FieldString extends FieldDefault {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.addBindings();
    }

    addBindings() {
        this.setVal = this.setVal.bind(this)
        this.save = this.save.bind(this)
        this._blur = this._blur.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onFocus = this.onFocus.bind(this)
    }

    onFocus() {
        this.setState({
            focus: true
        })
    }

    static prepareInputVal(val) {
        return val === null || val === undefined ? "" : val.toString()
    }

    onKeyDown(event) {
        switch (event.key) {
            case 'Enter':
                if (!this.isText) {
                    this.save(true)
                    return false;
                }
                break;
            case 'Escape':
                this._blur();
                return false;
        }

    }

    static getDerivedStateFromProps(props, state) {
        let propsVal = FieldString.prepareInputVal(props.data.v);
        if (propsVal !== state.inVal) {
            return {
                val: propsVal,
                inVal: propsVal
            }
        }
        return null;
    }

    setVal(event) {
        let position = this.inputRef.current.selectionStart;
        let val = event.target.value;

        let func = () => {
        };
        if (!this.isText && /[\n|\r]+/.test(val)) {
            val = event.target.value.replace(/[\n|\r]+/g, '');
            func = () => {
                this.inputRef.current.selectionStart = this.inputRef.current.selectionEnd = position - 1
            };
        }
        let state = {
            val: val,
            error: null
        };
        if (this.props.field.regexp) {
            var r = new RegExp(this.props.field.regexp);
            if (!r.test(val)) {
                state.error = this.props.field.regexpErrorText || 'regexp не проходит — "' + this.props.field.regexp + '"'
            }
        } else if (this.props.field.required) {
            if (!val) {
                state.error = "Значение не должно быть пустым"
            }
        }

        this.setState(state, func)

    }

    save(force) {
        if (force || this.state.inVal !== this.state.val) {
            if (this.state.error) {
                this._blur()
            } else {
                let val;
                if (this.isText)
                    val = this.state.val
                else
                    val = this.state.val.replace(/[\n|\r]+/g, '');
                this._save(val, this.state.inVal !== this.state.val)
            }
        }
    }

    getVal(style, format, blocked) {
        let prefix, postfix;
        if (format.icon) {
            prefix = <InputAdornment position="start"><i className={"fa fa-" + format.icon}></i></InputAdornment>;
        }

        if (this.props.field.unitType) {
            postfix = <InputAdornment position="end"
                                      style={this.getUnitTypeStyle(format)}>{this.props.field.unitType}</InputAdornment>
        }
        let error, helperText;

        if (format.height || format.maxheight) {
            if (this.state.error) {
                helperText = this.state.error;
                error = true;
            }
        }
        const getErroredField = (field) => {
            if (!(format.height || format.maxheight)) {
                error = false;
                if (this.state.error) {
                    error = true;
                }
                return <Tooltip title={this.state.error || ""} open={error}>{field}</Tooltip>
            }
            return field;
        }
        let params = {};
        if (blocked) {
            params.disabled = true
        } else {
            params.onKeyDown = this.onKeyDown;
            params.onChange = this.setVal;
            params.onFocus = this.onFocus;
            params.onBlur = this.save;
        }
        params.multiline = !!(style.height || this.isText);

        let pref;


        if (this.isText) {
            if (format.height)
                params.rows = Math.round(format.height / 29);
            if (format.maxheight)
                params.rowsMax = Math.round(format.maxheight / 29);

        }


        return <div>{pref}{getErroredField(<TextField error={error} variant="outlined"

                                                      required={this.props.field.required}
                                                      size="small"
                                                      type={this.props.field.type}
                                                      key={this.props.field.name}
                                                      InputProps={{
                                                          startAdornment: prefix,
                                                          endAdornment: postfix,
                                                          style: {
                                                              color: style.color,
                                                              align: style.align,
                                                              fontWeight: style.fontWeight,
                                                              textDecoration: style.textDecoration,
                                                              fontStyle: style.fontStyle,
                                                              helperText: helperText
                                                          }
                                                      }}
                                                      fullWidth={true}
                                                      helperText={helperText}
                                                      value={this.state.val}
                                                      inputRef={this.inputRef}
                                                      {...params}
        />)}</div>
    }


    getUnitTypeStyle(format) {
        let style = {};
        if (format.viewdata.unit_type_size) {
            style.fontSize = format.viewdata.unit_type_size
            if(style.fontSize.toString().match(/^[\d.]+$/)){
                style.fontSize+='px'
            }
        }
        if (format.viewdata.unit_type_weight) {
            style.fontWeight = format.viewdata.unit_type_weight
        }
        return style;
    }
};