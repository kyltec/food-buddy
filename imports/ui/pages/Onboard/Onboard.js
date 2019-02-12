import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TagCategories } from '../../../api/tagCategories';
import { Tags } from '../../../api/tags';
import Chip from '@material-ui/core/Chip';
import Bubbles from '../../components/Bubbles';

function getSteps() {
  return [
    'We want to get to know you better! Please select your favourite cusines:',
    'Select your favourite food types:',
    'Select any dietary preferences and extra info:'
  ];
}

class Onboard extends React.Component {
  state = {
    activeStep: 0
  };

  getStepContent = step => {
    switch (step) {
      case 0:
        console.log(this.props.tags);

        // return this.props.tags.map(tag => tag[tag]);
        return <Bubbles tag={this.props.tags} />;
      case 1:
        return 'An ad group contains one or more ads which target a shared set of keywords.';
      case 2:
        return `Try out different ad text to see what brings in the most customers,
                and learn how to enhance your ads using features like ad extensions.
                If you run into any problems with your ads, find out how to tell if
                they're running and how to resolve approval issues.`;
      default:
        return 'Unknown step';
    }
  };

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0
    });
  };

  render() {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;

    return (
      <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel className={classes.label}>{label}</StepLabel>
              <StepContent>
                <Typography component="title">
                  {this.getStepContent(index)}
                </Typography>
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={this.handleBack}
                      className={classes.backButton}
                    >
                      Back
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      disabled={
                        !Meteor.user().profile ||
                        !Meteor.user().profile.tags ||
                        Meteor.user().profile.tags.length === 0
                      }
                      onClick={this.handleNext}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={this.handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </div>
    );
  }
}

Onboard.propTypes = {
  classes: PropTypes.object
};

export default withTracker(() => {
  Meteor.subscribe('tags');
  Meteor.subscribe('tagCategories');

  return {
    tags: Tags.find({}).fetch(),
    tagCategories: TagCategories.find({}).fetch()
  };
})(withStyles(styles, { withTheme: true })(Onboard));
