import {CLICK} from "../TotumForm";
import FieldDefault from "./FieldDefault";

let React = require('react');

class FieldButton extends FieldDefault {
    constructor(props) {
        super(props);
        this.click = this.click.bind(this);
    }
    isBlocked() {
        return !this.props.field.pressableOnOnlyRead && this.props.format.block;
    }
    getIcon() {
        return null;
    }

    getEditElement() {
        return <button onClick={this.click}>{super.getIcon()}{this.props.format.text || this.props.field.buttonText}</button>;
    }
    getBlockedElement() {
        return <button disabled="true">{super.getIcon()}{this.props.format.text || this.props.field.buttonText}</button>;
    }

    click() {
        let val = new CLICK;
        this.props.saveFunction(this.props.field.name, val, this.props.extraData)
    }
}

export default FieldButton;