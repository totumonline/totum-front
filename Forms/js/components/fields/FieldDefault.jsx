import React from 'react';
import {AlertModal} from "../uiComponents/AlertModal";

export class FieldDefault extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.val = this.state.inVal = this.constructor.prepareInputVal(props.data.v);
        this.wrapperClasses = '';
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (JSON.stringify(nextProps.data.v) !== JSON.stringify(this.props.data.v)) {
            let prepared = this.constructor.prepareInputVal(nextProps.data.v)
            this.setState({
                val: prepared,
                inVal: prepared,
            });
            return false;
        }
        return true;
    }

    static prepareInputVal(val) {
        return val
    }

    _blur() {
        if (this.state.inVal !== this.state.val) {
            this.setState({
                val: this.state.inVal,
                focus: false,
                error: null,
                changing: false
            })
        } else {
            this.setState({
                focus: false,
            })
        }
    }

    _save(val, isChanged) {
        if (this.props.format.warningEditPanel) {
            if (isChanged) {
                if (this._checkEditRegExp(val)) {
                    this.setState({checkEdit: {val: val}})
                } else {
                    return this.__save(val);
                }
            }
        } else {
            return this.__save(val);
        }
    }

    _checkEditRegExp(val) {
        if (!this.props.format.warningEditRegExp) return true;
        try {
            if (this.props.field.multiple && Array.isArray(val)) {
                return val.some((v) => (new RegExp(this.props.format.warningEditRegExp)).test(val))
            }
            return (new RegExp(this.props.format.warningEditRegExp)).test(val);
        } catch (e) {
            return true;
        }
    }

    __save(val) {

        this.setState({
            val: this.constructor.prepareInputVal(val),
        });
        let promise = this.props.model.saveData({[this.props.item]: {[this.props.field.name]: val}}).then((json) => {
            if (json && !json.error) {
                this.setState({
                    focus: false
                })
                this.props.model.setChangesToForm(null, json);

            } else this._blur()
        })

        this.props.model.setChangesToForm({promice: promise});
        return promise
    }

    getVal(style, format, blocked) {
        return "defFieldEdit"
    }

    checkEditDialog() {
        if (this.state.checkEdit) {
            let buttons = [];
            buttons.push({
                label: "OK",
                action: () => {
                    this.__save(this.state.checkEdit.val)
                }
            });
            buttons.push({
                label: "Отмена",
                action: this._blur
            });
            return <AlertModal handleClose={() => {
                this.setState({checkEdit: null})
            }} title="Подтверждение" content={this.props.field.warningEditText || 'Точно изменить?'} buttons={buttons}/>
        }
    }

    render() {
        let {field, data, format} = this.props;


        let val;
        let style = {};

        if (format.height) {
            style.height = format.height;
        }
        if (format.maxheight) {

            style.maxHeight = format.maxheight;

            if (style.height) {
                style.minHeight = style.height;
            }
            style.height = "auto";
            style.overflow = "auto";
        }

        if (format.color) {
            style.color = format.color;
        }
        if (format.background) {
            style.backgroundColor = format.background;
        }
        if (format.progress) {
            style.boxShadow = (format["progresscolor"] || "green") + " " + Math.round(format.width * format.progress / 100) + "px 0px 0px 0px inset";
        }
        if (format.bold) {
            style.fontWeight = "bold";
        }

        if (format.decoration) {
            style.textDecoration = "underline"
        }
        if (format.italic) {
            style.fontStyle = "italic"
        }
        let checkEdit, blocked = !field.editable || format.block || false;
        val = this.getVal(style, format, blocked)

        if (blocked) {
            if (style.height) {
                style.whiteSpace = "normal";
                style.wordBreak = "break-all";
            }
        } else {
            checkEdit = this.checkEditDialog();
        }

        if (style.maxHeight && /^\d+$/.test(style.maxHeight)) {
            style.maxHeight += 'px';
        }
        if (style.height && /^\d+$/.test(style.height)) {
            style.height += 'px';
        }

        return <>
            <div key="val" className={"ttm-cellValueWrapper " + this.wrapperClasses}
                 style={style}>{checkEdit}{val}</div>
        </>
    }
}
;