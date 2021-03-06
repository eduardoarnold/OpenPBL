(function () {
  'use strict';

  var STATUS = require('../../models/constants/activity_status');
  var Activity = require('../../models/Activity');
  var Exception = require('../../shared/Exceptions');
  var Message = require('../../shared/MessageResource');
  var Q = require('q');

  /**
    Update Activity Status to the next status
  **/
  var updateActivityStatus = function (activityId, currentStatus) {
    var deferred = Q.defer();

    if (currentStatus.status === STATUS.FINISHED) {
      deferred.reject(Exception.ACTIVITY_STATUS_IS_FINISHED);
    }

    var activityNextStatus = STATUS.getStatusAfter(currentStatus.status);

    var queryUpdateStatus = {
      $set: { status: activityNextStatus}
    };

    Activity.updateActivity(activityId, queryUpdateStatus)
      .then(function (activity) {
        var responseBag = {
          message: Message.SUCCESS_UPDATING_ACTIVITY,
          status: activity.status
        };
        deferred.resolve(responseBag);
      })
      .catch(function () {
        deferred.reject(Exception.ACTIVITY_STATUS_UPDATING_ERROR);
      });

    return deferred.promise;
  };

  module.exports = {
    updateActivityStatus: updateActivityStatus
  };

}());
