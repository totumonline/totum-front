import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ReactHtmlParser from 'react-html-parser';

export class AlertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true
        };
        this.handleClose = this.handleClose.bind(this);
    }

    handleClose(action) {
        let close = this.props.handleClose || (() => {
        });
        if (!(action instanceof Function)) {
            action = () => {
            };
        }

        (async () => {
            if (await action() + await close())
                this.setState({open: false});
        })();
    }

    render() {
        let {handleClose, handleOpen, title, content, buttons, isHtml} = this.props;
        let $title, $body, $buttons;

        if (title !== undefined) {
            $title = <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        }
        if (content !== undefined) {
            $body = <DialogContent>
                <DialogContentText
                    id="alert-dialog-description">{isHtml ? ReactHtmlParser(content) : content}</DialogContentText>
            </DialogContent>
        }
        if (buttons) {
            let $_buttons = [];
            buttons.map((btn, i) => {
                $_buttons.push(<Button key={i} onClick={() => this.handleClose(btn.action)}>{btn.label}</Button>)
            });
            $buttons = <DialogActions>
                {$_buttons}
            </DialogActions>
        }


        return <div>
            <Dialog
                className={this.props.className}
                BackdropProps={this.props.BackdropProps || {}}
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {$title}
                {$body}
                {$buttons}
            </Dialog>
        </div>
    }
}
;