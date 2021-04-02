import React from 'react';
import FieldDefault from "./fields/FieldDefault";
import FieldString from "./fields/FieldString";
import FieldDate from "./fields/FieldDate";
import FieldButton from "./fields/FieldButton";


export default class FeidlField extends React.Component {
    constructor(props) {
        super(props);
        this.getFieldField=this.getFieldField.bind(this);
    }

    getField(field) {
        let Module = FieldDefault;
        switch (field.type) {
            case 'string':
                Module = FieldString;
                break;
            case 'date':
                Module = FieldDate;
                break;
            case 'button':
                Module = FieldButton;
                break;
        }
        return Module;
    }

    getFieldField(TotumField, extraClasses) {
        let field = this.props.field;
        let sectionClass = 'section-field';
        let format = this.props.format;

        if (this.props.format.classes) {
            if (typeof this.props.format.classes === 'object') {
                sectionClass += ' ' + this.props.format.classes.join(' ')
            } else {
                sectionClass += ' ' + this.props.format.classes
            }
        }
        sectionClass += ' ' + (extraClasses || '');
        sectionClass = sectionClass.trim();

        switch (this.props.tag) {
            case 'td':
                return <td key={this.props.field.name} className={sectionClass} data-name={field.name}
                           data-ftype={field.type}>
                    <div>{TotumField}</div>
                </td>;
            case 'div':
                let br;
                let css = {width: format.width || field.width};
                if (format.height) {
                    css.height = format.height
                }
                if (field.tableBreakBefore && this.props.i) {
                    br = <br key={'br/' + field.name}/>;
                }

                return <>
                    {br}
                    <div className={sectionClass} style={css} key={field.name} data-name={field.name}
                         data-ftype={field.type}>
                        <label>{this.props.title}</label>
                        {TotumField}
                    </div>
                </>;
        }
    }

    render() {
        let Module = this.getField(this.props.field);
        let field = this.props.field;
        return <Module field={field}
                                 data={this.props.data}
                                 format={this.props.format}
                                 saveFunction={this.props.saveFunction}
                                 extraData={this.props.extraData}
                                 wrapFunction={this.getFieldField}
        />;


    }
}