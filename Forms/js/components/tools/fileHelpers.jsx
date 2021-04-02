import React from 'react';
import AttachFileIcon from '@material-ui/icons/AttachFile';


export async function createFileFromUrl(url) {
    const response = await fetch(url);
    const data = await response.blob();
    const metadata = {type: data.type};
    const filename = url.replace(/\?.+/, '').split('/').pop();
    return new File([data], filename, metadata);
}
export function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event?.target?.result);
        };
        reader.onerror = (event) => {
            reader.abort();
            reject(event);
        };
        reader.readAsDataURL(file);
    });
}
export function getPreviewIcon(fileObject) {
    if (isImage(fileObject.file)) {
        return (<img
            className="ttm-preview"
            role="presentation"
            src={fileObject.data}
        />);
    }

    return <AttachFileIcon />;
}
export function isImage(url) {
    return /(png|jpg|jpeg|bmp|gif)$/i.test(url)
}