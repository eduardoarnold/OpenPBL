/*global require, module*/
(function () {
  'use strict';

  //Modules in use
  var Activity = require('../models/Activity');
  var Exception = require('../shared/Exceptions');
  var Message = require('../shared/MessageResource');
  var userService = require('./UserService');
  var Q = require('q');

  /** 
    Persists the new Activity, link the activity with the creator
  **/
  var saveNewActivity = function (activityData, activityCreator) {
    var deferred = Q.defer();

    var newActivity = new Activity({
      name: activityData.name,
      _creator: activityCreator._id
    });

    newActivity.save(function (error, activity) {
      if (error) {
        deferred.reject(Exception.ERROR_CREATING_NEW_ACTIVITY);
      }
      deferred.resolve(activity);
    });

    return deferred.promise;
  };

  /**
    Transforms the new activity data into an response bag 
    with activity id and
  **/
  var newActivityResponseBag = function (activityData) {
    var deferred = Q.defer();

    var responseBag = {};
    responseBag.id = activityData._id;
    responseBag.message = Message.SUCCESS_CREATING_ACTIVITY;

    deferred.resolve(responseBag);
    return deferred.promise;
  };

  /**
    Make the promise chain to create the new activity
  **/
  var createNewActivity = function (token, activityData) {
    var deferred = Q.defer();

    userService.getSessionUser(token)
      .then(function (sessionUser) {
        return saveNewActivity(activityData, sessionUser);
      })
      .then(function (newActivity) {
        return newActivityResponseBag(newActivity);
      })
      .then(function (responseBag) {
        deferred.resolve(responseBag);
      })
      .catch(function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  // export the class
  module.exports = {
    createNewActivity: createNewActivity
  };
}());
