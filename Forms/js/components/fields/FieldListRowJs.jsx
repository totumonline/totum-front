import React from 'react';
import {FieldString} from "./FieldString";

export class FieldListRowJs extends React.Component {
    render() {
        let $func = (event) => {
            let data
            try {
                data = JSON.parse(event.target.value)
            } catch (e) {
                data = event.target.value;
            }

            let promise = this.props.model.saveData({[this.props.item]: {[this.props.field.name]: data}}).then((json) => {
                if (json && !json.error) {
                    this.props.model.setChangesToForm(null, json);

                } else this._blur()
            })

            this.props.model.setChangesToForm({promice: promise});
        }
        let myRef = React.createRef();


        setTimeout(() => {
            let input = myRef.current;
            if (input && (!input.setTotumValue || typeof input.setTotumValue !== "function")) {
                input.setTotumValue = function (value) {
                    let nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                    nativeValueSetter.call(input, value);
                    input.dispatchEvent(new Event('input', {bubbles: true}));
                }
            }
        })
        let params = {};
        if (this.props.format.viewdata && this.props.format.viewdata.id) {
            params.id = this.props.format.viewdata.id
        }

        return <textarea ref={myRef} onChange={$func} {...params}/>
    }
};