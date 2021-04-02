import React from 'react';
import {TableSection} from "../sectionsComponencts/TableSection";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

export class SectionsExpantion extends React.Component {
    constructor(props) {
        super(props);
        this.addBindings();

        this.state = {active: [0]};

    }

    addBindings() {
        this.change = this.change.bind(this)
    }

    change(ind, newVal) {
        let sec = this.props.sections[ind];
        if (newVal) {
            if (this.state.active.indexOf(ind) == -1) {
                if (sec.viewtype.parallel) {
                    this.setState((state) => {
                        return {active: [...state.active, ind]}
                    })
                } else {
                    this.setState({
                        active: [ind]
                    })
                }
            }
        } else {
            this.setState((state) => {
                let active = [];
                state.active.map((i) => {
                    if (i !== ind)
                        active.push(i)
                })
                return {active: active}
            })
        }


    }

    getPanel(sec, ind) {
        return <ExpansionPanel key={ind} expanded={this.state.active.indexOf(ind) !== -1} data-index={ind}
                               onChange={(event, newVal) => this.change(ind, newVal)}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
            >
                <Typography>{sec.title.replace(/\*\*.*/, '')}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <TableSection
                    sec={sec}
                    data={this.props.data}
                    format={this.props.format}
                    width={this.props.width}
                    model={this.props.model}/>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    }

    render() {
        return <div>
            {this.props.sections.map((sec, ind) => this.getPanel(sec, ind))}
        </div>
    }
};