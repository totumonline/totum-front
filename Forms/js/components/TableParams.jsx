import React from 'react';
import {TableSection} from "./sectionsComponencts/TableSection";
import {SectionsTabs} from "./sectionsViewTypes/SectionsTabs";
import {SectionsStepper} from "./sectionsViewTypes/SectionsStepper";
import {SectionsExpantion} from "./sectionsViewTypes/SectionsExpantion";

export const TableParams = ({data, sections, format, width, model}) => {
    let $sections = [];


    if (sections) {
        let viewtype = 'plain';
        let summSections = [];
        const pushTabs = (i) => {
            if (summSections.length) {
                let Model;
                switch (viewtype) {
                    case 'tabs':
                        Model = SectionsTabs;
                        break;
                    case "stepper":
                        Model = SectionsStepper;
                        break;
                    case 'expantion':
                        Model = SectionsExpantion;
                        break;
                    default: Error('Тип секции '+viewtype+' не найден');
                }
                $sections.push(<Model key={"tabs" + i} sections={summSections} data={data} format={format} width={width}
                                      model={model}/>)
                summSections = [];
            }
        }

        sections.forEach((sec, i) => {
            let secView = getSectionViewtype(sec.viewtype, width);

            if (secView !== viewtype) {
                if (summSections.length) {
                    pushTabs(i)
                }
            }
            if (secView === 'plain')
                $sections.push(<TableSection key={i} sec={sec} data={data} format={format} width={width}
                                             model={model}/>)
            else {
                summSections.push(sec);
            }
            viewtype = secView;
        })
        pushTabs(sections.length);

    }
    return <>{$sections}
    </>
};

const getSectionViewtype = function (viewtype, width) {
    if (viewtype.view && typeof viewtype.view === 'object') {
        let pxlsMax;
        for (let param in viewtype.view) {
            if (/^\d+$/.test(param) && parseInt(param) >= width) {
                if (!pxlsMax || param > pxlsMax) {
                    pxlsMax = param;
                }
            }
        }
        if (pxlsMax) {
            return viewtype.view[pxlsMax]
        }
        return 'plain';
    }
    return viewtype.view;
}