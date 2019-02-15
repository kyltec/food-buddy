import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Tags } from '../../../api/tags';
import { TagCategories } from '../../../api/tagCategories';
import {
  Grid,
  Typography,
  Button,
  Chip,
  FormControlLabel,
  Switch
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import Slider from '@material-ui/lab/Slider';

class TopMatches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openNow: true,
      price: 1
    };
  }

  handlePriceChange = (event, price) => {
    let dollars = '';
    for (let i = 0; i < price; i++) {
      dollars += '$';
    }
    this.setState({ price, dollars });
  };

  handleOpenNowChange = event => {
    this.setState({ openNow: event.target.checked });
  };

  render() {
    const {
      userids,
      users,
      currentUser,
      currentUserId,
      allTags,
      tagCategories,
      classes,
      matches
    } = this.props;
    let price = this.state;

    return matches ? (
      <div>
        <Grid
          container
          justify="space-between"
          align="center"
          className={classes.topMatchesHeader}
        >
          <Typography className={classes.title} variant="h5">
            Your top matches:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.openNow}
                onChange={this.handleOpenNowChange}
                value="openNow"
              />
            }
            label="Open now"
          />
        </Grid>
        <div>
          <Grid
            container
            spacing={16}
            direction="column"
            justify="space-evenly"
            alignItems="center"
            className={classes.pricePoint}
          >
            <Slider
              value={this.state.price}
              min={1}
              max={4}
              step={1}
              onChange={this.handlePriceChange}
            />
            {price.dollars}
          </Grid>
        </div>

        <Grid
          container
          spacing={16}
          justify="space-between"
          alignItems="center"
        >
          {matches.map(({ tagids, users }) => {
            const userTags = allTags.filter(tag => tagids.includes(tag._id));
            const userTagTitles = userTags.map(tag => tag.title);
            return (
              <Grid
                item
                xs={12}
                sm={6}
                key={userTagTitles.join(', ')}
                className={classes.matches}
              >
                <Typography className={classes.tagTitle} color="primary">
                  {userTagTitles.join(' or ')}
                </Typography>
                <div className={classes.flexMatches}>
                  <Typography className={classes.matchesLabel}>
                    Match:
                  </Typography>
                  {users.map(user => (
                    <Chip
                      className={classes.user}
                      key={user._id}
                      label={user.username}
                      color="default"
                      variant="default"
                    />
                  ))}
                </div>
                <Button
                  variant="outlined"
                  color="primary"
                  className={classes.button}
                  component={Link}
                  size="small"
                  to={{
                    pathname: '/results',
                    state: {
                      query: userTagTitles
                        .map(title => `(${title})`)
                        .join(' OR '),
                      price: this.state.price,
                      openNow: this.state.openNow
                    }
                  }}
                >
                  Select
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </div>
    ) : (
      <div>U suck</div>
    );
  }
}

TopMatches.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withTracker(() => {
  Meteor.subscribe('tags');
  Meteor.subscribe('tagCategories');
  Meteor.subscribe('users');

  return {
    currentUser: Meteor.user(),
    currentUserId: Meteor.userId(),
    users: Meteor.users.find({}).fetch(),
    allTags: Tags.find({}).fetch(),
    tagCategories: TagCategories.find({}).fetch()
  };
})(withStyles(styles)(TopMatches));
