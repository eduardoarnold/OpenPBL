/*global require, module, GLOBAL*/
(function () {
  'use strict';

  //Modules in use
  var Activity = require('../../models/Activity');
  var Message = require('../../shared/MessageResource');
  var userService = require('../User/UserService');
  var userActivitiesStrategy = require('./ActivityListStrategy');
  var Exception = require('../../shared/Exceptions');
  var Q = require('q');

  //Specifications in use
  var ActivitySpec = require('./Specification/ActivitySpec');

  /**
    Transforms the new activity data into an response bag 
    with activity id and
  **/
  var newActivityResponseBag = function (activityData) {
    var responseBag = {};

    responseBag.id = activityData._id;
    responseBag.message = Message.SUCCESS_CREATING_ACTIVITY;

    return responseBag;
  };

  /**
    Transform a list of activities into an response bag
  **/
  var activityListResponseBag = function (activity) {
    var getUserSmallBag = function (user) {
      return {
        id: user._id,
        name: user.name,
        numberOfPosts: !!user.posts ? user.posts.length : GLOBAL.CONST_EMPTY_NUMBER
      };
    };

    var getPostSmallBag = function (post) {
      return {
        created: post.date,
        type: post.type,
        content: post.content
      };
    };

    var responseBag = {
      id: activity._id,
      name: activity.name,
      summary: !!activity.story ? activity.story.description : GLOBAL.CONST_EMPTY_STRING,
      status: activity.status,
      created: activity.created,
      participants: activity.participants.map(getUserSmallBag),
      posts: activity.posts.map(getPostSmallBag)
    };

    return responseBag;
  };

  /**
    Transform an activity entity data into an response bag
  **/
  var activityBasicDataResponseBag = function (activity) {
    var responseBag = {};

    responseBag.id = activity._id;
    responseBag.name = activity.name;
    responseBag.status = activity.status;
    responseBag.numberOfParticipants = activity.participants.length;

    return responseBag;
  };

  /** 
    Mount and persists the new Activity, 
    link the activity with the creator
    get all users from participants (email list)
    send registration emails for non-registered users
    Make the promise chain to create the new activity
  **/
  var createNewActivity = function (token, activityData) {
    var deferred = Q.defer();

    var activity = {
      name: activityData.name,
      creatorId: '',
      participants: []
    };

    userService.getSessionUser(token)
      .then(function (sessionUser) {
        activity.creatorId = sessionUser._id;
        return userService.getUsersFromEmailList(activityData.participants);
      })
      .then(function (users) {
        return userService.getAttributeFromUserList('_id', users);
      })
      .then(function (usersIds) {
        activity.participants = usersIds;
        return Activity.saveNewActivity(activity);
      })
      .then(function (newActivity) {
        var responseBag = newActivityResponseBag(newActivity);
        deferred.resolve(responseBag);
      })
      .catch(function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  /**
    Get user Activities
  **/
  var listActivities = function (token) {
    var deferred = Q.defer();
    userService.getSessionUser(token)
      .then(function (sessionUser) {
        return userActivitiesStrategy().getUserActivities(sessionUser);
      })
      .then(function (activities) {
        var responseBag = activities.map(activityListResponseBag);
        deferred.resolve({ activities: responseBag });
      })
      .catch(function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  /**
    Delete an user activity by id
  **/
  var deleteActivity = function (activityId) {
    var deferred = Q.defer();

    Activity.removeActivity(activityId)
      .then(function () {
        deferred.resolve();
      })
      .catch(function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  /**
    Get basic data from an activity
  **/
  var getActivityBasicData = function (activityId) {
    var deferred = Q.defer();

    var queryActivityBasicData = {
      select: '_id name participants status',
      where: ['_id'],
      conditions: [activityId],
      join: []
    };

    Activity.queryInActivities(queryActivityBasicData)
      .then(function (activities) {
        if (ActivitySpec.HasFoundExactlyOneActivity().isSatisfiedBy(activities)) {
          var selectedActivity = activities[0];
          var basicDataResponseBag = activityBasicDataResponseBag(selectedActivity);
          deferred.resolve(basicDataResponseBag);
        }
        deferred.reject(Exception.ACTIVITY_GET_BASIC_DATA_ERROR);
      })
      .catch(function () {
        deferred.reject(Exception.ACTIVITY_FIND_ACTIVITY_ERROR);
      });

    return deferred.promise;
  };

  // export the class
  module.exports = {
    createNewActivity: createNewActivity,
    listActivities: listActivities,
    deleteActivity: deleteActivity,
    getActivityBasicData: getActivityBasicData,
  };
}());
