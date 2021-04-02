import React from 'react';
import FieldDefault from './FieldDefault';
import Datetime from 'react-datetime';

import ('moment/locale/ru');

class FieldDate extends FieldDefault {
    onChange(Momento, ext) {
        if (typeof Momento !== "string")
            this.onChangeVal(Momento.format('YYYY-MM-DD HH:mm'))
    }

    getBlockedElement() {
        return this.props.data.v
    }

    getEditElement() {
        let className = '';
        if ((this.props.data.v || '') !== this.state.val) {
            className = 'changed'
        }

        return <span className="input-inline"><Datetime className={className}
                                                        value={this.state.val}
                                                        onChange={this.onChange}
                                                        onBlur={this.onBlur}
                                                        dateFormat="YYYY-MM-DD"
                                                        timeFormat="HH:mm"
                                                        locale="ru"
        /></span>
    }

    onBlur(val) {
        if (typeof val !== "string")
            this.checkVal(val.format('YYYY-MM-DD HH:mm'));
        else {
            this.setState({val: '1900-01-01'});
            setTimeout(()=>{this.setState({val: this.props.data.v})}, 10)
        }
    }
}

export default FieldDate;