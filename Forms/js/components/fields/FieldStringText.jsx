import React from 'react';
import {FieldString} from "./FieldString";
import Typography from "@material-ui/core/Typography";

export class FieldStringText extends FieldString {
    getVal(style, format, blocked) {
        let pref, comment;

        if (format.icon) {
            pref =  <><i
                className={"fa fa-" + format.icon}></i> </>
        }
        let cl="cell-text ";


        let styles={};
        if(format.viewdata){
            if(format.viewdata.color){
                styles.color=format.viewdata.color
            }
            if(format.viewdata.weight){
                styles.fontWeight=format.viewdata.weight
            }
            if(format.viewdata.size){
                styles.fontSize=format.viewdata.size+"px"
            }
        }
        if(format.align){ 
            styles.textAlign=format.align
        }
        return <>{comment}<div style={styles}><div className={cl} style={styles}>{pref} {this.props.data.v}</div></div></>;
    }
};