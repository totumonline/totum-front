import React from 'react';
import {FieldNumber} from "./FieldNumber";

export class FieldSelectText extends FieldNumber {
    getVal(style, format, blocked) {
        let postfix, prefix;
        format.viewdata = format.viewdata || {};

        let styles = {};
        if (format.viewdata.color) {
            styles.color = format.viewdata.color
        }
        if (format.viewdata.weight) {
            styles.fontWeight = format.viewdata.weight
        }
        if (format.viewdata.size) {
            styles.fontSize = format.viewdata.size + "px"
        }
        if (format.align) {
            styles.textAlign = format.align
        }

        if (this.props.field.unitType) {
            let style = this.getUnitTypeStyle(format);
            if (this.props.field.before) {
                prefix = <div className="cell-unitType" style={style}>{this.props.field.unitType}</div>
            } else {
                postfix = <div className="cell-unitType" style={style}>{this.props.field.unitType}</div>
            }

        }


        let icon, comment;

        if (format.icon) {
            icon = <><i
                className={"fa fa-" + format.icon}></i> </>
        }
        let cl = "cell-text ";
        if (postfix) {
            cl += 'cell-with-postfix';
        }

        let text;

        if (this.props.field.multiple) {
            text = [];
            if(this.props.data.v_){
                this.props.data.v_.forEach((v, index)=>{
                    text.push(<div  className="cell-text" key={index}>{prefix} {v[0]} {postfix}</div>)
                })
            }

        } else {
            text = <div className="cell-text"> {prefix} {this.props.data.v_[0]} {postfix}</div>
        }


        return <>{comment}
            <div style={styles}>
                {icon}
                <div className={cl} style={styles}>{text}</div>
            </div>
        </>;
    }

};