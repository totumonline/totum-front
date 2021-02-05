import React from 'react';
import {FloatBlock} from "./FloatBlock";

export class TableSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fillAll: false,
        };
        this.setFillTrue = this.setFillTrue.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.width && prevProps.width !== this.props.width && this.state.fillAll) {
            this.setState({fillAll: false})
        }
    }

    setFillTrue() {
        this.setState({fillAll: true});
    }


    render() {

        let {sec, data, format, width, model} = this.props;

        let {name, title, fields, status} = sec;
        width = width - 8;

        if (status !== 'view' && status !== "close" && status !== "edit") return <></>;

        let _title = "", $title, Titles = {_ALL:true}, Plates = false, fillAll = false, outline = false, platemh = false,
            plateh = false;
        let sectionParams = {};

        if (title) {

            {
                let sectionParamsMatch = title.match(/\*\*(.*)/);
                if (sectionParamsMatch) {
                    sectionParamsMatch[1].trim().split(/\s*;\s*/).forEach((param) => {
                        let split = param.trim().split(/\s*:\s*/);
                        split[0] = split[0].toLowerCase();

                        if (split.length === 1) {
                            sectionParams[split[0]] = true;
                        } else {

                            switch (split[0]) {
                                case 'outline':
                                    outline = addSectionParam(outline, split, ((str) => str === true ? "#e4e4e4" : str), true)
                                    break;
                                case 'title':
                                    sectionParams.title = sectionParams.title || {_ALL: true};
                                    let title = addSectionParam({}, split, ((str) => str))
                                    if (typeof title === 'boolean')
                                        sectionParams.title._ALL = title;
                                    else {
                                        sectionParams.title = {...sectionParams.title, ...title}
                                    }
                                    break;

                                case 'plate':
                                    Plates = addSectionParam(Plates, split, (str) => str === false ? "transparent" : str, true)
                                    break;
                                case 'platemh':
                                    platemh = addSectionParam(platemh, split, (str) => typeof str === 'string' && /^\d+$/.test(str) ? str + 'px' : str, true)
                                    break;
                                case 'plateh':
                                    plateh = addSectionParam(plateh, split, (str) => typeof str === 'string' && /^\d+$/.test(str) ? str + 'px' : str, true)
                                    break;
                                case 'gap':
                                    sectionParams.gap = addSectionParam(sectionParams.gap, split, (str) => str)
                                    break;
                                default:
                                    switch (split[1]) {
                                        case 'true':
                                        case 'TRUE':
                                            sectionParams[split[0]] = true;
                                            break;
                                        case 'false':
                                        case 'FALSE':
                                            sectionParams[split[0]] = false;
                                            break;
                                    }
                            }
                        }
                    })
                }
            }

            _title = title;

            if ("title" in sectionParams) {
                Titles = sectionParams.title;
            }

            if (sectionParams.lable === false) {
                _title = "";
            } else {
                _title = title.replace(/\*\*(.*)/, '')
            }
            if (_title)
                $title = <div className="ttm-sectionTitle">{_title}</div>
        }

        let classes = "ttm-section";
        //if (noTitles) classes += " ttm-secNoTitles";
        let _floatBlocks = [];

        if (status === "view" || status === "edit") {
            let floatBlocks = [], floatBlock;
            let sectionWithPannels = false;
            fields.forEach((field) => {
                if (!format[field.name]) return;
                let fName=field.name;
                let _format = format[field.name];
                if ((!_format.hide || !_format.hide.form) && !_format.viewdata.hide) {
                    if (field.tableBreakBefore || !floatBlock) {
                        floatBlock = [];
                        floatBlocks.push(floatBlock);
                    }
                    if (_format.blocknum !== undefined) {
                        sectionWithPannels = true;
                    }
                    floatBlock.push(field);
                }
            });

            if (sectionWithPannels) {
                classes += ' ttm-sectionWithPannels';
                width -= 20;
            } else {
                width -= 10;
            }

            floatBlocks.forEach((fields, i) => {
                let _data = {};

                fields.forEach((field) => {
                    _data[field.name] = data[field.name];
                });


                _floatBlocks.push(<FloatBlock fillAll={this.state.fillAll} key={i} data={_data} format={format}
                                              fields={fields}
                                              Titles={Titles}
                                              outline={outline}
                                              Plates={Plates}
                                              sectionWithPannels={sectionWithPannels}
                                              width={width}
                                              setFillTrue={this.setFillTrue}
                                              platemh={platemh}
                                              plateh={plateh}
                                              gap={sectionParams.gap}
                                              model={model}/>)
            });

        } else if (status === "close") {
            classes += " closed-section";
        }


        return <div className={classes}>
            {$title}
            {_floatBlocks}
        </div>
    }
}

const addSectionParam = (param, splitted, ValReplace, isArrayValue) => {
    if (!param)
        param = {};
    const splitVal = (param) => {
        if (isArrayValue) {
            let split = param.split(/\s*\/\s*/);
            if (split.length > 1) {
                return {big: replaceVal(split[0]), small: replaceVal(split[1])}
            } else {
                return {big: replaceVal(param), small: replaceVal(param)}
            }
        }
        return replaceVal(param)
    }
    const replaceVal = (param) => {
        switch (param) {
            case 'false':
            case 'FALSE':
                param = false;
                break;
            case 'true':
            case 'TRUE':
                param = true;
                break;
        }
        param = ValReplace(param);
        return param;
    }

    if (splitted.length === 2) {
        param = splitVal(splitted[1])
    } else if (/^([a-z_0-9]+\s*,?\s*)+$/.test(splitted[1])) {
        splitted[1].split(/\s*,\s*/).forEach((num) => {
            param[num] = splitVal(splitted[2])
        })
    } else {
        param = splitVal(splitted[1])
    }
    return param;
};