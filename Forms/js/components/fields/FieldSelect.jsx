import React from 'react';
import {FieldDefault} from "./FieldDefault";
import Autocomplete, {createFilterOptions} from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Typography from "@material-ui/core/Typography";

export class FieldSelect extends FieldDefault {
    constructor(props) {
        super(props);
        this.addBindings();


        this.selectLength = this.props.field.selectLength || 50;
        this.state.loaded = false;

        this.state.filter = "";

        this.limitTags = 5;
        this.state = {...this.state, ...this.getStateValsInOptions()};
    }

    getStateValsInOptions(props) {
        let options = [];
        let datas = {};
        let propsIn = props || this.props;

        if (this.props.field.multiple) {
            propsIn.data.v.forEach((val, i) => {
                options.push(val)
                datas[val] = propsIn.data.v_[i];
            })
        } else {
            if (propsIn.data.v !== null) {
                options.push(propsIn.data.v)
                datas[propsIn.data.v] = [...propsIn.data.v_, null];
            }
        }
        return {
            list: options,
            indexed: datas,
            loaded: false,
            sliced: true,
            globalSliced: true
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.constructor === FieldSelect) {
            if (this.state.globalSliced && this.state.sliced && (nextProps.data.v && nextProps.data.v.toString()) !== (this.props.data.v && this.props.data.v.toString())) {
                let states = this.getStateValsInOptions(nextProps);
                this.setState(states);
                return false;
            }
        } else {
            return super.shouldComponentUpdate(nextProps, nextState, nextContext)
        }
        return true;
    }

    static getDerivedStateFromProps(props, state) {
        let propsVal = FieldSelect.prepareInputVal(props.data.v);
        if (propsVal !== state.inVal) {
            return {
                val: propsVal,
                inVal: propsVal
            }
        }
        return null;
    }


    addBindings() {
        this.openMe = this.openMe.bind(this);
        this.blurMe = this.blurMe.bind(this);
        this.changed = this.changed.bind(this);
        this.filterAndLoad = this.filterAndLoad.bind(this);
        this.groupBy = this.groupBy.bind(this);
        this.getOptionLabel = this.getOptionLabel.bind(this);
        this.getOptionDisabled = this.getOptionDisabled.bind(this);
        this.renderOption = this.renderOption.bind(this);
    }


    openMe() {
        this.load();
    }

    save(val) {
        if (this.state.inVal !== val) {
            if (this.state.error) {
                this._blur()
            } else {
                this._save(val, true);
            }
        }
    }

    blurMe() {
        this.save(this.state.val);
    }

    changed(event, val) {
        if (this.props.field.withEmptyVal === undefined && val === null) {
            return;
        }
        this.save(val);
    }

    filterAndLoad(options, data) {
        let {inputValue, getOptionLabel} = data;
        let {field} = this.props;
        let {filter, loaded, sliced, globalSliced, list, indexed} = this.state;
        let vals = [];

        if (field.multiple) {
            vals = this.state.val || [];
        } else {
            if (this.state.val) {
                vals.push(this.state.val)
            }
        }
        let filteredOptions = [...vals, ...options.filter(x => !vals.includes(x))];

        inputValue = inputValue.toLowerCase();

        if (this.loadData !== inputValue || (!this.loading && !loaded)) {
            this.loading = true;
            this.loadData = inputValue;

            if (globalSliced && (filter === "" || !(inputValue.indexOf(filter) !== -1 && !sliced))) {
                if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
                this.loadingTimeout = setTimeout(() => {
                    this.setState({loading: true});
                    this.props.model.getEditSelect([], this.props.field.name, inputValue, null).then((json) => {
                        let newState = {
                            list: json.list,
                            indexed: json.indexed,
                            loading: false,
                            loaded: true
                        };
                        if (inputValue === "")
                            newState.globalSliced = json.sliced;
                        newState.filter = inputValue
                        newState.sliced = json.sliced;
                        this.loading = false;
                        this.setState(newState)
                    })
                }, this.state.loaded ? 30 : 0)
            }
        }

        if(!this.state.loaded){
            filteredOptions.push({text: 'Загрузка данных'})
        }
        else if (this.state.sliced) {
            filteredOptions.push({text: 'Данные не полны, воспользуйтесь поиском'})
        }

        return filteredOptions;
    }

    groupBy(val) {
        return (typeof val !== "object")
        &&
        this.state.indexed[val] ?
            (val === this.state.inVal || (this.state.inVal && typeof this.state.inVal === 'object' && this.state.inVal.indexOf(val) !== -1) ? "Выбранное" : this.state.indexed[val][1] || '')
            : ""
    }

    getPrefix(format) {
        let prefix;
        if (format.icon) {
            prefix = <i className={"fa fa-" + format.icon} style={{paddingRight: "5px", paddingLeft: "5px"}}></i>;
        }

        return prefix
    }

    getOptionDisabled(val) {
        return typeof val === "object" ||
            (this.state.indexed[val] ? this.state.indexed[val][2] !== null : true)

    }

    getVal(style, format, blocked) {
        let params = {}, prefix = this.getPrefix(format), inputParams = {}, postfix;

        if (this.props.field.multiple) {
            params.multiple = true;
            params.disableCloseOnSelect = true;
            if (this.state.val && this.state.val.length === 0) {
                inputParams.placeholder = this.props.field.withEmptyVal
            }
        } else {
            if (this.props.field.unitType && this.state.val) {
                postfix = this.props.field.unitType
            }
            params.blurOnSelect = true
            inputParams.placeholder = this.props.field.withEmptyVal
        }

        if (this.props.field.withEmptyVal === undefined)
            params.disableClearable = true;


        if (this.state.list.some((v) => this.state.indexed[v][1] !== null)) {
            params.groupBy = this.groupBy
        } else {
            params.renderOption = (option, {selected}) => {
                return (
                    <>
                        {selected ? <i className={"fa fa-check"} style={{paddingRight: "5px"}}></i> : ""}
                        {this.getOptionLabel(option)}
                    </>
                )
            }
        }
        if (blocked) {
            params.disabled = true
        } else {
            params.onChange = this.changed;
            params.onBlur = this.blurMe;
            params.filterOptions = this.filterAndLoad;
            params.clearOnBlur = true;
            params.autoComplete = true;
        }
        return <div><Autocomplete
            freeSolo={false}
            clearOnEscape={true}
            options={this.state.list}
            value={this.state.val}
            noOptionsText={"Ничего не найдено"}
            limitTags={this.limitTags}
            {...params}
            size={"small"}
            placeholder={this.props.field.withEmptyVal}
            getOptionDisabled={this.getOptionDisabled}
            getOptionLabel={this.getOptionLabel}
            fullWidth={true}
            renderOption={this.renderOption ? this.renderOption : null}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        ...inputParams,
                        endAdornment: (
                            <>
                                {postfix}
                                {this.state.loading ? <CircularProgress color="inherit" size={20}/> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                        startAdornment: (
                            <>
                                {prefix}
                                {params.InputProps.startAdornment}
                            </>
                        ),
                    }}
                />
            )}
        /></div>
    }

    renderOption(val, {selected}) {
        if (typeof val === "object") return val.text
        let icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
        let checkedIcon = <CheckBoxIcon fontSize="small"/>;

        return (
            <><Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{marginRight: 8}}
                checked={selected}
            />
                {(this.state.indexed[val] ? this.state.indexed[val][0] : "")}
            </>
        )
    }

    getOptionLabel(val) {
        return typeof val === "object" ? val.text :
            (this.state.indexed[val] ? this.state.indexed[val][0] : "")
    }
}