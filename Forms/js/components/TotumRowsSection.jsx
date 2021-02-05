import fa from "../../../../bower_components/moment/src/locale/fa";

let React = require('react');
import model from "../App";
import {UNPIN} from "./TotumForm";
import FieldField from "./FieldField";

class TotumRowsSection extends React.Component {
    constructor(props) {
        super(props);
        this.fields = this.props.form.fields;
        this.saveInsertField = this.saveInsertField.bind(this);
        this.addInsertRow = this.addInsertRow.bind(this);
        this.saveInsertRow = this.saveInsertRow.bind(this);
        this.saveRowField = this.saveRowField.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.state = {
            inserting: false,
            insertRow: {}
        };
        this.insertRowHandledFields = {};
    }

    saveInsertField(name, val) {
        let row = {};
        for (const i in this.fields) {
            let field = this.fields[i];
            if (!field.code || this.insertRowHandledFields[field.name]) {
                row[field.name] = this.state.insertRow[field.name].v;
            }
        }
        row[name] = val;
        this.insertRowHandledFields[name] = true;
        model.checkInsert(row).then((json) => {
            this.setState({inserting: true, insertRow: json.row})
        });
        return Promise.resolve()
    }

    saveRowField(name, val, extraData) {
        let change = {};
        change[extraData.id] = {};
        change[extraData.id][name] = val;
        return new Promise((resolve, reject) => {
            let action;
            if (typeof val === "object" && (val instanceof UNPIN)) {
                change[extraData.id][name] = null;
                change.setValuesToDefaults = true;
                action = model.saveData(change)
            } else {
                action = model
                    .saveData(change, this.props.data.map((item) => item.id))
            }
            action.then(this.props.updateDataFunction)
                .then(() => {
                    resolve()
                })
        });
    }

    addInsertRow() {
        if (!this.state.inserting) {
            model.checkInsert({}).then((json) => {
                this.setState({inserting: true, insertRow: json.row})
            });

        } else {
            this.setState({inserting: false, insertRow: {}})
        }
    }

    saveInsertRow() {
        let row = {};
        for (const i in this.fields) {
            let field = this.fields[i];
            if (!field.code || this.insertRowHandledFields[field.name]) {
                row[field.name] = this.state.insertRow[field.name].v;
            }
        }
        model
            .saveInsert(row)
            .then(this.props.updateDataFunction)
            .then(() => {
                this.setState({inserting: false, insertRow: {}})
            })
    }

    insertRow() {
        if (!this.state.inserting) return;
        let tds = [];
        this.fields.forEach((field) => {
            let format = Object.assign({}, this.state.insertRow.f, this.state.insertRow[field.name].f);
            if (!field.insertable) {
                format.block = true;
            }
            tds.push(<FieldField key={field.name}
                                 tag = "td"
                                 field={field}
                                 data={{v: this.state.insertRow[field.name].v}}
                                 format={format}
                                 saveFunction={this.saveInsertField}
            />);

        });
        return <tr className="insert-row">
            {tds}
        </tr>
    }

    header() {
        let head = [];
        let width = 0;
        this.fields.forEach((field) => {
            let css = {width: field.width};
            head.push(<th style={css} key={field.name}>
                {this.props.titles[field.name]}
            </th>);
            width += field.width;
        });
        if (!this.props.tableFormat.blockdeleting) {
            let css = {width: 40};
            head.push(<th style={css} key="__manage">
            </th>);
            width += css.width;
        }
        return [head, width];
    }

    getRow(item) {
        let tds = [];
        let format = Object.assign({}, this.tableFormat, this.props.format[item.id].f);
        for (const field of this.fields) {
            let format = Object.assign({}, format, this.props.format[item.id][field.name]);
            if (this.props.status !== 'edit') format.block = true;
            tds.push(<FieldField key={field.name}
                                 tag = "td"
                                 field={field}
                                 data={item[field.name]}
                                 format={format}
                                 saveFunction={this.saveRowField}
                                 extraData={{id: item.id}}
            />);

        }
        let deleteButton;
        if (!this.props.tableFormat.blockdeleting && !format.blockdelete) {
            deleteButton = <button onClick={this.deleteRow} data-id={item.id}><i className="fa fa-times"/></button>
        }
        tds.push(<td key="__manage" className="section-field">
            <div>
                {deleteButton}
            </div>
        </td>);
        return <tr key={item.id}>{tds}</tr>
    }

    render() {
        if (this.props.status === "hidden") return null;
        let insertRow;
        let title = '';
        if (this.props.title) {
            title = <div className="rows-title">{this.props.title}</div>
        }
        let table = '';
        let buttons = [];

        if (this.props.status !== "close") {
            let head, width;
            [head, width] = this.header();


            let style = {width: width};

            if (this.props.status === 'edit' && !this.props.tableFormat.blockadd) {
                buttons.push(<button onClick={this.addInsertRow} key="add"
                                     disabled={this.state.inserting}>Добавить</button>);
                if (insertRow = this.insertRow()) {
                    buttons.push(<button onClick={this.addInsertRow} key="remove"><i className="fa fa-times"></i>
                    </button>);
                    buttons.push(<button onClick={this.saveInsertRow} key="save"><i className="fa fa-save"></i>
                    </button>);
                }
            }
            let rows = [];
            for (const item of this.props.data) {
                rows.push(this.getRow(item))
            }
            if (rows.length === 0 && null == insertRow) {
                rows.push(<tr key={0}>
                    <td colSpan={this.fields.length}>Таблица пуста</td>
                </tr>)
            }

            table = <table style={style}>
                <thead>
                <tr>{head}</tr>
                </thead>
                <tbody>{insertRow}{rows}</tbody>
            </table>
        }
        let beforeSpace = <>{title}{buttons}</>;
        return <div className="totum-section rows-section">
            {beforeSpace}
            {table}
        </div>
    }

    deleteRow(event) {
        let target = event.target;

        if (target.tagName !== "BUTTON") {
            target = target.parentNode;
        }
        model.delete([target.getAttribute('data-id')]).then(this.props.updateDataFunction);


    }
}

export default TotumRowsSection;