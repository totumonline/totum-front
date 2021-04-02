import React from 'react';
import {SectionsTabs} from "./SectionsTabs";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";

export class SectionsStepper extends SectionsTabs {
    render() {
        return <div>
            <Stepper
                activeStep={this.state.activeTab}
            >
                {this.getTabs()}
            </Stepper>

            <Box>
                {this.getSections()}
            </Box>
            {this.getButtons()}
        </div>
    }

    addBindings() {
        super.addBindings();
        this.handleBack = this.handleBack.bind(this);
        this.handleNext = this.handleNext.bind(this);
    }

    handleBack() {
        this.setState((state) => {
            return {activeTab: state.activeTab - 1};
        })
    }

    handleNext() {
        this.setState((state) => {
            return {activeTab: state.activeTab + 1};
        })
    }

    getButtons() {
        return <div>

            <div>
                <div>
                    <Button disabled={this.state.activeTab === 0 || this.props.sections[this.state.activeTab - 1].status==='close'} onClick={this.handleBack}>
                        Back
                    </Button>

                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={this.handleNext}
                        disabled={this.state.activeTab === this.props.sections.length - 1 || this.props.sections[this.state.activeTab + 1].status==='close'}
                    >
                        {this.state.activeTab === this.props.sections.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    }

    getTabs() {
        return this.props.sections.map((sec, index) => {
            const stepProps = {};
            const labelProps = {};
            /*labelProps.optional = (
            <Typography variant="caption" color="error">
            Alert message
            </Typography>
            );*/
            // labelProps.error = true;
            if (this.state.activeTab > index) {
                stepProps.completed = false;
            }
            return (
                <Step key={index} {...stepProps}>
                    <StepLabel {...labelProps}>{sec.title.replace(/\*\*.*/, '')}</StepLabel>
                </Step>
            );
        })
    }
};