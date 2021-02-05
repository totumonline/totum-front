import React from 'react';
import {FieldDefault} from "./fields/FieldDefault";
import {FieldButton} from "./fields/FieldButton";
import {FieldString} from "./fields/FieldString";
import {FieldNumber} from "./fields/FieldNumber";
import {FieldSelect} from "./fields/FieldSelect";
import {FieldCheckbox} from "./fields/FieldCheckbox";
import {FieldCheckboxSwitch} from "./fields/FieldCheckboxSwitch";
import {FieldSelectCheckbox} from "./fields/FieldSelectCheckbox";
import {FieldSelectSwitch} from "./fields/FieldSelectSwitch";
import {FieldSelectCheckboxPicture} from "./fields/FieldSelectCheckboxPicture";
import {FieldSelectGrid} from "./fields/FieldSelectGrid";
import {FieldNumberSlider} from "./fields/FieldNumberSlider";
import {FieldText} from "./fields/FieldText";
import {FieldTextView} from "./fields/FieldTextView";
import {FieldFile} from "./fields/FieldFile";
import {FieldFileImage} from "./fields/FieldFileImage";
import {FieldSelectViewImage} from "./fields/FieldSelectViewImage";
import {FieldNumberText} from "./fields/FieldNumberText";
import {FieldStringText} from "./fields/FieldStringText";
import {FieldDate} from "./fields/FieldDate";

export const FieldValue = ({field, data, format, model, item}) => {
    let Module = FieldDefault;

    switch (field.type) {
        case 'string':
            switch (format.viewtype) {
                case 'text':
                    Module = FieldStringText;
                    break;
                default:
                    Module = FieldString;
            }
            break;
        case 'button':
            Module = FieldButton;
            break;
        case 'number':
            switch (format.viewtype) {
                case 'slider':
                    Module = FieldNumberSlider;
                    break;
                case 'text':
                    Module = FieldNumberText;
                    break;
                default:
                    Module = FieldNumber;
            }
            break;
        case 'select':
            switch (format.viewtype) {
                case 'checkbox':
                    Module = FieldSelectCheckbox;
                    break;
                case 'switch':
                    Module = FieldSelectSwitch;
                    break;
                case 'checkboxpicture':
                    Module = FieldSelectCheckboxPicture;
                    break;
                case 'grid':
                    Module = FieldSelectGrid;
                    break;
                    case 'viewimage':
                    Module = FieldSelectViewImage;
                    break;
                default:
                    Module = FieldSelect;
            }

            break;
        case 'checkbox':

            switch (format.viewtype) {
                case 'switch':
                    Module = FieldCheckboxSwitch;
                    break;
                default:
                    Module = FieldCheckbox;
            }
            break;
        case 'text':
            switch (format.viewtype) {
                case 'text':
                case 'html':
                    Module = FieldTextView;
                    break;
                default:
                    Module = FieldText;
            }
            break;
        case 'file':
            switch (format.viewtype) {
                case 'image':
                    Module = FieldFileImage;
                    break;
                default:
                    Module=FieldFile;
            }
            break;
            case 'date':
            switch (format.viewtype) {

                default:
                    Module=FieldDate;
            }
            break;
    }

    return <div className="ttm-fieldValue">
        <Module item={item} field={field} data={data} format={format} model={model}/>
    </div>
};