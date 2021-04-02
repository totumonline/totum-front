import model from "../App";
import {TableTitle} from "./TableTitle";
import {TableText} from "./TableText";
import {TableParams} from "./TableParams";
import {TableFooters} from "./TableFooters";
import {TableColumns} from "./columnsComponents/TableColumns";
import {AlertModal} from "./uiComponents/AlertModal";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import {Trobber} from "./Trobber";
import Backdrop from "@material-ui/core/Backdrop";
import ReactHtmlParser from "react-html-parser";

let React = require('react');


export class TotumForm extends React.Component {
    promises = [];

    constructor(props) {
        super(props);
        let tableLoadedData = props.data;


        this.state = {
            width: props.container.offsetWidth,
            format: props.data.f,
            data_params: props.data.data_params,
            data: props.data.data,
            controls: props.data.c,
            mainError: props.data.error,
            interfaceDatas: []
        };

        let timeout;
        let TotumForm = this;
        if (window.ResizeObserver) {

            const ro = new ResizeObserver(entries => {
                if (timeout) clearTimeout(timeout);
                setTimeout(() => {
                    TotumForm.setState({width: props.container.offsetWidth});
                }, 1200);
            });
            ro.observe(props.container);

        }


        this.fields = tableLoadedData.fields;
        this.sections = {};
        let panelColor;
        Object.keys(tableLoadedData.sections).forEach((keyCategory) => {
            switch (keyCategory) {
                case 'rows':
                    let fields = [];
                    this.sections[keyCategory] = {...tableLoadedData.sections[keyCategory], fields: fields};
                    panelColor = null;
                    tableLoadedData.sections[keyCategory].fields.forEach((field) => {
                        let _field = {...field};
                        if (_field.panelColor) panelColor = _field.panelColor;
                        else _field.panelColor = panelColor;
                        fields.push(_field)
                    });

                    break;
                default:
                    this.sections[keyCategory] = [];
                    let secList = tableLoadedData.sections[keyCategory];
                    panelColor = null;
                    secList.forEach((sec) => {
                        let fields = [];
                        this.sections[keyCategory].push(
                            {...sec, fields: fields}
                        );
                        sec.fields.forEach((fieldName) => {
                            let _field = {...this.fields[fieldName]};
                            if (_field.panelColor) panelColor = _field.panelColor;
                            else _field.panelColor = panelColor;
                            fields.push(_field)
                        })
                    });
            }
        });
        this.setFieldValue = this.setFieldValue.bind(this);
        this.updateStateData = this.updateStateData.bind(this);
        this.setChanges = this.setChanges.bind(this);

        this.props.model.setChangesToForm = this.setChanges;
        this.props.model.setChangesToForm = this.props.model.setChangesToForm.bind(this);
    }

    setChanges(changes, json) {

        if (changes && "promice" in changes) {
            let {promice} = changes;
            promice.done = false;
            promice.finally(() => {
                promice.done = true;
            })
            setTimeout(() => {
                if (!promice.done) {
                    if (!this.state.loading)
                        this.setState({loading: true});
                    this.promises.push(promice);
                    Promise.allSettled(this.promises).then((data) => {
                        let len = this.promises.length;
                        let loadingOff = true;
                        this.promises.forEach((promice, i) => {
                            if (promice.done)
                                delete this.promises[i];
                            else
                                loadingOff = false;
                        })

                        if (loadingOff && this.state.loading) {
                            this.setState({loading: false})
                        }
                    })
                }
            }, 300)

            return
        }

        if (json) {
            if (json.interfaceDatas) {
                this.setState((state) => {
                    return {interfaceDatas: [...state.interfaceDatas, ...json.interfaceDatas]}
                })

            }
            if (json.links) {
                this.setState((state) => {
                    return {links: [...json.links]}
                })
            }
            if (json.chdata)
                changes = {data_params: json.chdata.params, format: json.chdata.f, data: json.chdata.rows}
        }

        if (this.state.mainError && json.updated && json.updated !== this.props.data.updated) {
            changes.mainError = null;
        }

        this.setState(changes);
    }

    __getPathFromObject(obj, path, def) {
        let cur = obj;
        for (let i = 0; i < path.length; i++) {
            let key = path[i];
            if ((typeof cur !== 'object') || !(key in cur)) return def;
            cur = cur[key];
        }
        return cur;
    }

    getFieldTitle(name, def) {
        return this.__getPathFromObject(this.state.f.t, ['fieldtitle', name], def)
    }

    updateStateData(json) {
        let data = [];
        let chrows = json.chdata.rows || [];
        let deleted = json.chdata.deleted || [];

        for (const n in this.state.data) {
            if (deleted.indexOf(this.state.data[n].id) == -1) {
                let change = chrows[this.state.data[n].id] || {};
                data.push(Object.assign({}, this.state.data[n], change))
                if (change.id) {
                    delete chrows[this.state.data[n].id];
                }
            }
        }
        for (const id in json.chdata.rows) {
            data.unshift(Object.assign({}, json.chdata.rows[id]))
        }

        this.rowsSection.title = json.chdata.f.t.rowsTitle || '';
        this.rowsSection.name = json.chdata.f.t.rowsName || '';

        this.setState({
            f: json.chdata.f,
            data: data,
            params: json.chdata.params
        });

    }

    setFieldValue(name, val) {
        let change = {};
        change[name] = val;

        return new Promise((resolve, reject) => {
            let action;
            if (typeof val === "object" && (val instanceof UNPIN)) {
                change[name] = null;
                action = model.saveData({params: change, setValuesToDefaults: true})
            } else if (typeof val === "object" && (val instanceof CLICK)) {
                change[name] = null;
                action = model.click({params: change})
            } else {
                action = model.saveField(name, val)
            }
            action.then(this.updateStateData).then(() => {
                resolve()
            })
        });
    }

    render() {
        let model = this.props.model;

        let {tableRow} = this.props.data;
        let {format, data_params, data, errorNotification, controls} = this.state;


        let addEditBlockFormat = {};
        let editingBlock = {};
        if (controls.editing === false) {
            addEditBlockFormat = {editable: false}
        } else if (format.t.block) {
            editingBlock = {block: true}
        }
        const section_reducer = (acc, sec) => {
            let status = format.t.s[sec.name] ? format.t.s[sec.name].status : "edit";
            let blockSec = format.t.s[sec.name] ? (format.t.s[sec.name].status === 'edit' ? {block: false} : {block: true}) : {};

            let sectionViewtype;
            if (format.t.s[sec.name]) {
                sectionViewtype = {
                    view: format.t.s[sec.name].viewtype || 'plain',
                    parallel: format.t.s[sec.name].parallel
                }
            } else {
                sectionViewtype = {view: 'plain', parallel: true}
            }

            /*Уточнить*/


            blockSec = {...editingBlock, ...blockSec};

            sec.fields = sec.fields.map((f) => {
                let width = format.p[f.name] && format.p[f.name].width ? {width: format.p[f.name].width} : {};
                return {...blockSec, ...f, ...width, ...addEditBlockFormat}
            });

            acc.push({...sec, status: status, viewtype: sectionViewtype});
            return acc;
        };

        let params_sections = (this.sections.param || []).reduce(section_reducer, []);
        let footers_sections = (this.sections.footer || []).reduce(section_reducer, []);

        let format_headers = {};
        let format_footers = {};
        let columns_format = {};
        let rows_footer_format = {};
        let data_sections = {params: {}, footers: {}};
        let paramsItem = {};


        for (let fName in format.p) {

            if (format.p.hasOwnProperty(fName)) {
                let _field_format = this.__getFieldFormatViewdata(format.p[fName]);


                switch (this.fields[fName].category) {
                    case 'param':
                        format_headers[fName] = _field_format;
                        if (format.t.fieldtitle && format.t.fieldtitle.hasOwnProperty(fName)) format_headers[fName].fieldtitle = format.t.fieldtitle[fName];

                        data_sections.params[fName] = {...data_params[fName]};
                        paramsItem[fName] = data_params[fName].v;

                        break;
                    case 'footer':
                        format_footers[fName] = _field_format;
                        if (format.t.fieldtitle && format.t.fieldtitle.hasOwnProperty(fName)) format_footers[fName].fieldtitle = format.t.fieldtitle[fName];
                        data_sections.footers[fName] = {...data_params[fName]};
                        paramsItem[fName] = data_params[fName].v;
                        break;
                    case "rows_footer":
                        rows_footer_format[fName] = _field_format;
                        if (format.t.fieldtitle && format.t.fieldtitle.hasOwnProperty(fName)) rows_footer_format[fName].fieldtitle = format.t.fieldtitle[fName];
                        paramsItem[fName] = data_params[fName].v;
                        break;
                }
            }
        }
        /*
        Обработать поля строк?!
        * */

        let $errorNotification, $interfaceData;
        if (errorNotification) {
            $errorNotification = <AlertModal content={errorNotification}
                                             className="ttm-form ttm-errorException"
                                             handleClose={() => {
                                                 this.setState({errorNotification: null})
                                             }} BackdropProps={{style: {opacity: 0.3}}}/>
        }
        if (this.state.interfaceDatas && this.state.interfaceDatas.length) {
            this.state.interfaceDatas.some((row, i) => {
                if (row[0] === 'text' || row[0] === 'html') {
                    let buttons = [{
                        label: "ОК",
                        action: () => {
                        }
                    }]
                    let text = (row[0] === 'text') ? row[1].text : ReactHtmlParser(row[1].text);

                    let content = <div>{text}</div>


                    $interfaceData = <AlertModal content={content} title={row[1].title} handleClose={() => {
                        this.setState((state) => {
                            let new_state = [...state.interfaceDatas];
                            new_state.splice(i, 1);
                            return {interfaceDatas: new_state};
                        })
                        if (row[1].refresh) {
                            this.props.model.refresh();
                        }
                    }} BackdropProps={{style: {opacity: 0.3}}}
                                                 className="ttm-form ttm-linkto"

                                                 buttons={buttons}
                    />


                    return true;
                } else {
                    $interfaceData =
                        <AlertModal content={"Отображение типа " + row[0] + " в формах недоступно"} title={"Ошибка"}
                                    handleClose={() => {
                                        this.setState((state) => {
                                            let new_state = [...state.interfaceDatas];
                                            new_state.splice(i, 1);
                                            return {interfaceDatas: new_state};
                                        })
                                        if (row[1].refresh) {
                                            this.props.model.refresh();
                                        }
                                    }} BackdropProps={{style: {opacity: 0.3}}}
                                    className="ttm-form ttm-linkto"

                                    buttons={buttons}
                        />


                    return true;
                }
            })
        }
        if (this.state.links && this.state.links.length) {
            $interfaceData =
                <AlertModal content={"Отображение  links в формах недоступно"} title={"Ошибка"} handleClose={() => {
                    this.setState((state) => {
                        return {links: []};
                    })
                }}
                            BackdropProps={{style: {opacity: 0.3}}}
                            className="ttm-form ttm-linkto"
                />
        }


        let tableErrorMessage;
        if (this.state.mainError) {
            tableErrorMessage =
                <Alert severity="error">{this.state.mainError}</Alert>
        }

        let trobber = <Backdrop open={!!this.state.loading}
                                style={{zIndex: 10000, position: "fixed", opacity: 0.3}}>
            <Trobber/>
        </Backdrop>


        return <>{$errorNotification}{$interfaceData}{trobber}
            <TableTitle title={tableRow.title} format={format.t}/>
            <TableText format={format.t}/>
            {tableErrorMessage}
            <TableParams item={paramsItem}
                         data={data_sections.params}
                         sections={params_sections}
                         format={format_headers}
                         width={this.state.width}
                         model={model}/>
            {/*<TableColumns table_format={format.t} format={columns_format} footers_item={paramsItem}  data={data}/>*/}
            <TableFooters item={paramsItem}
                          data={data_sections.footers} sections={footers_sections} format={format_footers}
                          width={this.state.width}
                          model={model}
            />
        </>;

    }

    __getFieldFormatViewdata(format) {
        format = {...format}
        if (format.viewdata && typeof format.viewdata === 'object') {
            let width = this.state.width;
            let pxlsMax;
            for (let param in format.viewdata) {
                if (/^\d+$/.test(param) && parseInt(param) >= width) {
                    if (!pxlsMax || param > pxlsMax) {
                        pxlsMax = param;
                    }
                }
            }
            if (pxlsMax) {
                format.viewdata = {...format.viewdata};

                for (let _ in format.viewdata[pxlsMax]) {
                    format.viewdata[_] = format.viewdata[pxlsMax][_];
                }
            }
        }
        format.viewdata = format.viewdata || {};
        return format;
    }
}
