let React = require('react');

class TotumSection extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // console.log(this.props);
        if (this.props.status === "hide") return '';

        let title = '';

        if (this.props.form.title) {
            title = <div className="sectionTitle">{this.props.form.title} {this.props.status}</div>
        }
        let fields = [];

        if (this.props.status !== "close") {

            this.props.form.fields.forEach((field) => {
                let data = this.props.data[field.name];

                if (typeof this.props.format[field.name] === 'undefined') return '';

                let format = Object.assign({}, this.props.tableFormat, (this.props.format[field.name] || {}));
                if (this.props.status !== 'edit') {
                    format.block = true;
                }

                fields.push(
                    <FieldField key={field.name}
                                tag="div"
                                i={fields.length}
                                field={field}
                                title={this.props.titles[field.name]}
                                data={data}
                                format={format}
                                saveFunction={this.props.saveFunction}/>
                )
            });
        }
        return <div className="totum-section">
            {title}
            {fields}
        </div>
    }
}

export default TotumSection;