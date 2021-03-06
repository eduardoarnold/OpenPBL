/*global require, exports*/
(function () {
  'use strict';

  // Modules in use
  var userRoleService = require('../services/User/UserRoleService');

  /**
    Send the role constant bundle
  */
  /*jslint unparam: true*/
  exports.get = function (req, res) {
    var userRoles = userRoleService.getRoleBag();

    res.status(200).send(userRoles);
  };
  /*jslint unparam: false*/
}());
