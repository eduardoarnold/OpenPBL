/*global require, exports*/
(function () {
  'use strict';

  // Modules in use
  var postHandler = require('../services/Activity/Post/PostHandler');
  var TYPE = require('../models/constants/post_type');
  var _TOKEN_HEADER = 'x-pbl-token';

  /**
    Define the post action for user authentication
    Return HTTP status 200 and the session token on valid authentication
  */
  exports.post = function (req, res) {
    var headerToken = req.headers[_TOKEN_HEADER];
    var activityId = req.params.id;

    postHandler.usingServiceOfType(TYPE.RESOLUTION).insertNewPost(headerToken, activityId, req.body)
      .then(function (responseBag) {
        res.status(200).send(responseBag);
      })
      .catch(function (error) {
        res.status(400).send(error);
      });
  };

  exports.delete = function (req, res) {
    var postId = req.params.id;

    postHandler.usingServiceOfType(TYPE.RESOLUTION).deletePost(postId)
      .then(function (responseBag) {
        res.status(200).send(responseBag);
      })
      .catch(function (error) {
        res.status(400).send(error);
      });
  };

  exports.list = function (req, res) {
    var activityId = req.params.id;

    postHandler.usingServiceOfType(TYPE.RESOLUTION).listPostsFrom(activityId)
      .then(function (responseBag) {
        res.status(200).send(responseBag);
      })
      .catch(function (error) {
        res.status(400).send(error);
      });
  };
}());
