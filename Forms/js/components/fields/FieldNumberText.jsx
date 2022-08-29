import React from 'react';
import {FieldNumber} from "./FieldNumber";
import {moneyFormat} from "../tools/moneyFormat";

export class FieldNumberText extends FieldNumber {
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
            if(this.props.field.before){
                prefix = <div className="cell-unitType" style={style}>{this.props.field.unitType}</div>
            }else{
                postfix = <div className="cell-unitType" style={style}>{this.props.field.unitType}</div>
            }

        }


        let icon, comment, value;

        if (format.icon) {
            icon = <><i
                className={"fa fa-" + format.icon}></i> </>
        }
        let cl = "cell-text ";
        if (postfix) {
            cl += 'cell-with-postfix';
        }
        [value, prefix, postfix] = moneyFormat(this.props.data.v, this.props.field, prefix, postfix)


        return <>{comment}
            <div style={styles}>
                {prefix}
                <div className={cl} style={styles}>{icon} {value}</div>
                {postfix}</div>
        </>;
    }

};