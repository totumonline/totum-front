import React from 'react';
import {AlertModal} from "../uiComponents/AlertModal";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

export class FieldButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false
        };
        this.clickCheck = this.clickCheck.bind(this);
    }

    clickCheck() {
        if (!this.state.clicked) {
            let {field} = this.props;
            if (field.warningEditPanel) {
                this.setState({
                    checkClick: true
                })
            } else {
                this.click()
            }
        }
    }

    click() {
        if (!this.state.clicked) {
            this.setState({
                clicked: "click"
            });
            let {field} = this.props;
            return this.props.model.click(this.props.item, field.name).then((json) => {

                this.props.model.setChangesToForm(null, json);
                this.setState({
                    clicked: "done"
                });
                setTimeout(() => {
                    this.setState({
                        clicked: false
                    });
                }, 1000)
            })
        }
    }

    checkClickDialog() {
        if (this.state.checkClick) {
            let buttons = [];
            buttons.push({
                label: "OK",
                action: this.click.bind(this)
            });
            buttons.push({
                label: "Отмена"
            });
            return <AlertModal handleClose={() => {
                this.setState({checkClick: null})
            }} title="Подтверждение" content={this.props.field.warningEditText || 'Точно изменить?'} buttons={buttons}/>
        }
    }

    render() {
        let {field, format} = this.props;
        let btn;
        let prefix;

        let text = format.text || field.buttonText || null;
        let params = {}, icon;

        let style={};

        if(format.background){
            style.backgroundColor=format.background
        }
        if(format.color){
            style.color=format.color
        }

        switch (this.state.clicked) {
            case "click":
                params.disabled = true;
                text = <i className="fa fa-spinner" style={{"float": "none"}}></i>
                style.textAlign="center";
                break;
            case "done":
                params.disabled = true;
                text='Выполнено';
                break;
            default:
                if (format.block) {
                    params.disabled = true;
                } else {
                    params.onClick = this.clickCheck
                }

                if (format.icon) {
                    let styles = {};
                    if (!text) {
                        styles.float = "none"
                    }
                    icon = <i className={"fa fa-" + format.icon} style={styles}></i>
                }
        }

        btn = <Button fullWidth={true} variant="contained" {...params} style={style}>{icon}{text}</Button>

        return <div className="ttm-cellValueWrapper ttm-cell-button">
            {this.checkClickDialog()}
            {prefix}
            {btn}
        </div>
    }
};