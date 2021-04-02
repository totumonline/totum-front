import React from 'react';
import {FieldNumber} from "./FieldNumber";

export class FieldNumberText extends FieldNumber {
    getVal(style, format, blocked) {
        let postfix;
        format.viewdata = format.viewdata || {};

        if (this.props.field.unitType) {
            let style = this.getUnitTypeStyle(format);
            postfix = <div className="cell-unitType" style={style}>{this.props.field.unitType}</div>
        }


        let pref, comment;

        if (format.icon) {
            pref = <><i
                className={"fa fa-" + format.icon}></i> </>
        }
        let cl = "cell-text ";
        if (postfix) {
            cl += 'cell-with-postfix';
        }

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
        return <>{comment}
            <div style={styles}>
                <div className={cl} style={styles}>{pref} {this.props.data.v}</div>
                {postfix}</div>
        </>;
    }

};