import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Tags } from './tags';

/**
 * Once the user is onboarded, Users collection must contain profile object
 * with name (user's name) and tags (a list of _id's from Tags collection)
 */

Meteor.methods({
  'users.updateUserTags'(tagids) {
    if (!this.userId) {
      throw new Meteor.Error(
        'users.updateUserTags.not-authorized',
        'You are not logged in.'
      );
    }
    if (!tagids || !(tagids instanceof Array)) {
      throw new Meteor.Error(
        'users.updateUserTags.invalid-input',
        'Invalid input'
      );
    }

    // throw error if any of tagids are not in DB
    tagids.map(tagid => {
      const tag = Tags.findOne({ _id: tagid });
      if (!tag)
        throw new Meteor.Error(
          'users.updateUserTags.invalid-input',
          'Invalid input.'
        );
    });

    Meteor.users.update(this.userId, {
      $set: { 'profile.tags': tagids }
    });
  },

  'users.updateName'(name) {
    if (!this.userId) {
      throw new Meteor.Error(
        'users.updateName.not-authorized',
        'You are not logged in.'
      );
    }

    if (!name || !(name instanceof String)) {
      throw new Meteor.Error('users.updateName.invalid-name', 'Invalid name.');
    }

    Meteor.users.update(this.userId, {
      $set: { 'profile.name': name }
    });
  },

  'users.findMatches'(userids) {
    if (!this.userId) {
      throw new Meteor.Error(
        'users.findMatches.not-authorized',
        'You are not logged in.'
      );
    }
    if (!userids || !(userids instanceof Array)) {
      throw new Meteor.Error(
        'users.findMatches.invalid-input',
        'Invalid input.'
      );
    }

    const users = userids.map(userid => {
      const user = Meteor.users.findOne({ _id: userid });
      if (!user)
        throw new Meteor.Error(
          'users.findMatches.invalid-input',
          'Invalid input.'
        );
      return user;
    });

    const getUserTags = user => {
      return user.profile.tags.map(tagid => ({ tagid, user }));
    };

    let allUserTags = users
      .map(getUserTags)
      .reduce((a, b) => a.concat(b), [])
      .reduce((acc, { tagid, user }) => {
        if (acc.hasOwnProperty(tagid)) {
          acc[tagid].push(user);
        } else {
          acc[tagid] = [user];
        }
        return acc;
      }, {});

    allUserTags = Object.keys(allUserTags).map(tagid => ({
      tagid, // @TODO intersect tags from different categories
      users: allUserTags[tagid]
    }));

    allUserTags.sort((a, b) => {
      return b.users.length - a.users.length;
    });

    return allUserTags;
  }
});

if (Meteor.isServer) {
  Meteor.publish('users', function usersPublication() {
    if (!this.userId) {
      throw new Meteor.Error(
        'users.publish.not-authorized',
        'You are not logged in.'
      );
    }
    return Meteor.users.find(
      {},
      { fields: { username: 1, profile: 1, 'emails.address': 1 } }
    );
  });
}
