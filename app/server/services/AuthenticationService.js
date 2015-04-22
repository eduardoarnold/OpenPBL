/*global require, module*/
(function () {
  'use strict';

  // Modules in use
  var User = require('../models/User');
  var TokenProvider = require('../token/TokenProvider');
  var Q = require('q');
  var Exception = require('../shared/Exceptions');

  /**
    Validate user credentials
      Find for one user with that credentials,
      then if finds the user, resvolve de promise
      else, reject the promisse with error status message
  */
  var verifyUserCredentials = function (userMail, candidatePassword) {
    var deferred = Q.defer();

    var query = {email: userMail};

    User.getUserByEmail(userMail)
      .then(function (user) {
        return user.validatePassword(candidatePassword);
      })
      .then(function () {
        deferred.resolve();
      })
      .catch(function (error) {
        deferred.reject();
      });

    return deferred.promise;
  };

  /**
    Authenticate the user using Token Provider
    If the User Credentials are valid then resolve de promise 
    and sendthe created session token
  */
  var authenticateUser = function (userMail, userPassword) {
    var deferred = Q.defer();

    verifyUserCredentials(userMail, userPassword)
      .then(function () {
        return TokenProvider.createToken(userMail);
      })
      .then(function (token) {
        deferred.resolve(token);
      })
      .catch(function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  // export the class
  module.exports = {
    authenticateUser: authenticateUser
  };
}());
