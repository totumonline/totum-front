import React from 'react';

export class FieldFileImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        if (this.props.data.v_[0])
            this.checkImage();

    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.props.data.v_[0] !== nextProps.data.v_[0]) {
            this.checkImage();
        }
        return true;
    }

    checkImage() {
        if (!this.loading)
            this.loading = true;
        else return;
        const image = new Image();
        image.onload = () => {
            this.setState({
                width: image.naturalWidth,
                height: image.naturalHeight,
            })
        };
        image.src = this.props.data.v_[0];
    }

    render() {
        let {data, format, field} = this.props;

        let style = {backgroundImage: "url(" + data.v_[0] + ")"}, wrapperStyle = {};
        style.height = "35px";

        if (format.maxheight) {
            if (/^\d+$/.test(format.maxheight)) {
                switch (format.viewdata["background-size"]) {
                    case 'cover':
                    case 'auto':
                        if (this.state.height) {
                            style.height = field.newwidth * this.state.height / this.state.width;
                            if (style.height > format.maxheight) {
                                style.height = format.maxheight;
                            }
                        }
                        break;
                    case 'contain':
                    default:
                        if (this.state.height) {
                            style.height = field.newwidth * this.state.height / this.state.width;
                            if (style.height > format.maxheight) {
                                wrapperStyle.height = format.maxheight;
                            }
                        }
                }
            } else {
                style.maxHeight = format.maxheight
            }
        } else if (format.height) {
            style.height = format.height;
        }

        if (style.maxHeight && /^\d+$/.test(style.maxHeight)) {
            style.maxHeight += 'px';
        }
        if (style.height && /^\d+$/.test(style.height)) {
            style.height += 'px';
        }

        let caps = {
            'background-size': 'backgroundSize',
            'background-position-x': 'backgroundPositionX',
            'background-position-y': 'backgroundPositionY'
        };
        Object.keys(caps).forEach((param) => {
            if (param in format.viewdata) {
                style[caps[param]] = format.viewdata[param];
            }
        })


        return <div className="ttm-file-image-wrapper" style={wrapperStyle}>
            <div className="ttm-file-image" style={style}/>
        </div>
    }
};