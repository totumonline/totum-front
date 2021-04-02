import React from 'react';
import {TableSection} from "./sectionsComponencts/TableSection";

export const TableFooters = ({data, sections, format, width, model}) => {
    let $sections = [];

    if (sections) {
        sections.forEach((sec, i) => {
            $sections.push(<TableSection key={i} sec={sec} data={data} format={format} width={width} model={model}/>)
        })
    }
    return <>{$sections}
    </>
};