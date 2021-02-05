import React from 'react';
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import {TableSection} from "../sectionsComponencts/TableSection";

export class SectionsTabs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0
        }
        this.addBindings();
    }

    addBindings() {
        this.tabSwitch = this.tabSwitch.bind(this);
    }

    tabSwitch(event, newValue) {
        this.setState({activeTab: newValue})
    }

    getTabs() {
        return this.props.sections.map((sec, i) => {
            let disabled;
            switch (sec.status) {
                case 'close':
                    disabled = true;
                    break;
                case 'view':
                case 'edit':
                    break;
                default:
                    return null;
            }
            let title = sec.title.replace(/\*\*(.*)/, '').trim();
            return <Tab label={title} value={i} key={i} disabled={disabled}/>
        })
    }

    render() {
        return <div>
            <Tabs
                indicatorColor="secondary"
                textColor="secondary"
                value={this.state.activeTab}
                onChange={this.tabSwitch}
                variant="scrollable"
                scrollButtons="auto"
            >
                {this.getTabs()}

            </Tabs>
            <Box>
                {this.getSections()}
            </Box>

        </div>
    }

    getSections() {
        return this.props.sections.map((sec, i) => {
            return <div hidden={this.state.activeTab !== i} key={i}><TableSection
                sec={sec}
                data={this.props.data}
                format={this.props.format} width={this.props.width}
                model={this.props.model}/></div>

        })
    }
};