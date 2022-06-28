import React from 'react';
import {FieldDefault} from "./FieldDefault";
import Button from "@material-ui/core/Button";
import DropzoneDialog from "../tools/DropzoneDialog";
import {createFileFromUrl, isImage, getPreviewIcon, readFile} from "../tools/fileHelpers"
import Grid from "@material-ui/core/Grid";
import AttachFileIcon from "@material-ui/icons/AttachFile"

export class FieldFile extends FieldDefault {
    constructor(props) {
        super(props)
        this.addBindings();
        this.props.data.v_ = this.props.data.v_ || [];
        this.filesArray(this.props.data.v_, this.props.data.v);

    }

    /* shouldComponentUpdate(nextProps) {
         if(nextProps.data.v_.length!==this.props.data.v.length || nextProps.data.v_.some((f, i)=> f!==this.props.data.v_[i])){
             this.filesArray(nextProps.data.v_);
         }
         return true;
     }*/

    addBindings() {
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.save = this.save.bind(this);
    }

    openDialog() {
        this.setState({open: true});
    }

    closeDialog() {
        this.setState({open: false});
    }

    save(files) {
        //file.path - у загруженных
        let {field} = this.props;

        const close = () => {
            this.filesArray(this.props.data.v_, this.props.data.v);
            this.setState({open: false, load: false})
        }

        if (!files.length) {
            if (this.state.val && this.state.val.length) {
                this._save([]).then(close)
            } else {
                close();
            }

        } else if (!field.multiple) {
            if (!files[0]['path']) {
                close();
            } else {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.setState({'load': true})
                    this._save([{
                        'name': files[0].name,
                        'filestringbase64': btoa(evt.target.result)
                    }]).then(close)
                };
                reader.readAsBinaryString(files[0]);
            }
        } else {
            let val = [];
            let flsIn = [...files];

            const addNewFile = async function (fl) {
                const reader = new FileReader();
                let p = new Promise((res, rej) => {
                    reader.onload = (evt) => {
                        val.push({
                            'name': fl.name,
                            'filestringbase64': btoa(evt.target.result)
                        })
                        res();
                    };
                })
                reader.readAsBinaryString(fl);
                return p;
            }
            let adds = [], f;
            if (this.state.val && this.state.val.length) {
                this.state.val.some((fl, i) => {
                    if (!f && flsIn.length)
                        f = flsIn.splice(0, 1)[0];
                    if (f) {
                        if (!f.path) {
                            if (f.source_name === fl.file) {
                                val.push(fl);
                                f = null;
                            }
                        } else {
                            adds.push(addNewFile(f));
                            f = null;
                            return true;
                        }
                    }
                });
            }
            if (f) {
                adds.push(addNewFile(f));
            }

            flsIn.forEach((f) => {
                adds.push(addNewFile(f));
                return true;
            })
            Promise.all(adds).then(() => {
                this.setState({'load': true})
                this._save(val).then(close);
            })
        }
    }

    render(style, format, blocked) {
        return <div className="ttm-cellValueWrapper ttm-cell-button">
            {this._render()}
        </div>
    }

    _render(style, format, blocked) {

        let previews;
        if (this.props.data.v_ && this.props.data.v_.length) {


            previews = <Grid
                spacing={1}
                container={true}
                className="ttm-previews-grid"
            >

                {this.props.data.v_.map((url, i) => {

                    let columns = this.props.format.width < 200 ? 2 : Math.floor(this.props.format.width / 120)
                    if (columns > this.props.data.v_.length) {
                        columns = this.props.data.v_.length;
                    }
                    let xs = Math.ceil(12 / columns);

                    let preview;
                    if (isImage(url)) {
                        preview =
                            <div className="ttm-preview" style={{
                                backgroundImage: "url(" + url + ")",
                            }}></div>
                    } else {
                        preview = <div className="ttm-preview-file"><AttachFileIcon/></div>
                    }
                    preview = <div>
                        <div className="ttm-preview-wrapper">
                            {preview}
                        </div>
                        <div className='ttm-preview-file-label'>{this.props.data.v[i].name}</div>
                    </div>

                    return (

                        <Grid
                            xs={xs}
                            item={true}
                            key={i}
                        >
                            {preview}
                        </Grid>
                    );
                })}
            </Grid>
        }

        if (blocked) {
            return previews;
        } else {
            let {field, format} = this.props;
            format.viewdata = format.viewdata || {};

            let params = {};
            params.filesLimit = format.viewdata.files_limit || 1000;

            if (!field.multiple) {
                params.filesLimit = 1;
            }
            if (field.accept) {
                params.acceptedFiles = field.accept.split(';');
            }
            params.load = this.state.load;

            return <>
                {previews}
                <Button className="ttm-add-file" variant="contained" color="secondary" onClick={this.openDialog}>
                    Загрузить файлы
                </Button>


                <DropzoneDialog
                    {...params}
                    previewText=""
                    dropzoneText="Перетащите файлы для загрузки"
                    dialogTitle="Загрузка файлов"
                    cancelButtonText={"Отменить"}
                    submitButtonText={"Подтвердить"}
                    maxFileSize={50000000}
                    open={this.state.open}
                    onClose={this.closeDialog}
                    onSave={this.save}
                    initialFiles={this.state.fileObjects}
                    showPreviews={true}
                    showFileNamesInPreview={true}
                />
            </>
        }
    }

    filesArray = async (urls, vals) => {
        try {
            const fileObjs = await Promise.all(
                urls.map(async (url, i) => {
                    const file = await fetch(url);
                    const data = await file.blob();
                    data.name = vals[i]['name'];
                    data.source_name = vals[i]['file'];
                    return data;
                })
            );

            this.setState({fileObjects: fileObjs});
        } catch (err) {
            console.log(err);
        }
    }
}

