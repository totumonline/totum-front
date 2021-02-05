import {UNPIN} from "../TotumForm";

let React = require('react');

class FieldDefault extends React.Component {
    constructor(props) {
        super(props);
        this.props.data.v = this.props.data.v || '';
        this.state = {
            val: this.props.data.v,
            error: this.props.data.e || ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.pinFunc = this.pinFunc.bind(this);

    }

    pinFunc() {
        let val;
        if ('h' in this.props.data) {
            val = new UNPIN;
        } else {
            val = this.props.data.v;
        }
        this.props.saveFunction(this.props.field.name, val, this.props.extraData)
            .then(() => this.checkValChanged());
    }

    revert() {
        this.setState({val: this.props.data.v});
    }

    componentDidUpdate(prevProps, prevState) {
        this.props.data.v = this.props.data.v || '';
        if (this.props.data.v !== prevProps.data.v) {
            this.setState({val: this.props.data.v})
        }
    }

    getIcon() {
        let icon;
        if (this.props.format.icon) {
            let iconClasses = "fa fa-" + this.props.format.icon;
            icon = <i className={iconClasses}></i>
        }
        return icon;
    }

    getPinHand() {
        let pin;

        if (this.props.field.code && !this.props.field.codeOnlyInAdd) {

            let hand = 'fa ';
            let btnClass;
            if ('h' in this.props.data) {
                hand += ('c' in this.props.data ? 'fa-hand-paper-o' : 'fa-hand-grab-o');
                btnClass = ' active-hand'
            } else {
                hand += 'fa-hand-paper-o';
            }

            pin = <button onClick={this.pinFunc} className={btnClass}><i className={hand}></i></button>
        }
        return pin;
    }

    isBlocked() {
        return !this.props.field.editable || this.props.format.block;
    }

    render() {

        let element, icon = this.getIcon(), spanClass = '',
            label;
        if (icon) {
            spanClass += ' with-icon'
        }
        let extraClasses;

        if (this.isBlocked()) {
            element = <span>{this.getBlockedElement()}</span>;
        } else {
            extraClasses = this.props.field.required ? 'required' : '';

            let error = '';
            if (this.state.error) {
                error = <span className={"field-error"}>{this.state.error}</span>
            }
            let pin = this.getPinHand();
            if (pin) {
                spanClass += ' with-code';
            }

            element = <span className={spanClass}>{this.getEditElement()}{pin}{error}</span>
        }

        return this.props.wrapFunction(<>{icon}{element}</>, extraClasses);
    }

    getBlockedElement() {
        return this.props.format.text || this.props.data.v
    }

    getEditElement() {
        let className = '';
        if ((this.props.data.v || '') !== this.state.val) {
            className = 'changed'
        }

        return <input type="text" className={className}
                      value={this.state.val}
                      onChange={this.handleChange}
                      onBlur={this.handleBlur}
                      onKeyUp={this.handleKeyUp}
        />
    }

    handleKeyUp(event) {

        const getFocusFunction = function () {
            let activeElement = event.target;
            let focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
            let focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
                function (element) {
                    return element.offsetWidth > 0 || element.offsetHeight > 0 || element === activeElement
                });
            let index = focussable.indexOf(activeElement);
            return function () {
                focussable[index + 1].focus();
            };
        };

        switch (event.key) {
            case 'Enter':
                this.checkVal(event.target.value, getFocusFunction());

                break;
            case 'Escape':
            case 'Esc':
                this.revert();
                this.notHandleBlur = true;
                getFocusFunction()();
                this.notHandleBlur = false;
                break;
        }
    }

    handleChange(event) {
        let val = event.target.value;
        this.onChangeVal(val)
    }

    onChangeVal(val) {
        this.setState({val: val});
    }

    handleBlur(event) {
        if (!this.notHandleBlur)
            this.checkVal(event.target.value)
    }

    isChanged(val) {
        return val !== this.props.data.v.toString()
    }

    checkVal(val, focusNextElement) {
        const error = this.checkIsError(val);
        if (error !== this.state.error)
            this.setState({error: error});
        if (!error && this.isChanged(val)) {
            this.props.saveFunction(this.props.field.name, val, this.props.extraData)
                .then(() => this.checkValChanged())
                .then(() => focusNextElement())
            ;
        }
    }

    checkValChanged() {
        if (this.state.val !== this.props.data.v) {
            this.setState({val: this.props.data.v})
        }
        if (this.state.error !== this.props.data.e) {
            this.setState({error: this.props.data.e})
        }
    }

    checkIsError(val) {
        if (this.props.field.required && (val === undefined || val === "")) return 'Это обязательное поле';
    }
}

export default FieldDefault;