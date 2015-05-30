(function () {
  'use strict';

  angular.module('openpbl.directives')
    .directive('pblActivity', ['$log', '$q', 'activityService', 'globalValues', 'notificationService', 
      function ($log, $q, activityService, globalValues, notificationService) {
      return {
        retrict: 'E',
        templateUrl: '/shared/activity/activity.tpl.html',
        scope: {
          activity: '='
        },
        link: function (scope) {
          var init = function () {
            scope.vm = {};
            loadActivityStatus(scope.activity)
              .then(function (response) {
                scope.vm.activity = response;
                scope.content = getContentTab(scope.vm.activity.status);
              })
              .catch(function (error) {
                notificationService.error('Erro', error);
              });
          };

          var getContentTab = function (status) {
            var activityStatus = globalValues.activity.status;

            switch (status) {
              case activityStatus.CREATING_STORY:
                return 'tab-problem';

              case activityStatus.GENERATING_FACTS:
                return 'tab-facts';

              case activityStatus.IDENTIFYING_HIPOTESYS:
                return 'tab-hypothesis';

              case activityStatus.RESEARCHING:
                return 'tab-research';

              case activityStatus.RESOLVING_PROBLEM:
                return 'tab-resolution';

              case activityStatus.ABSTRACTING:
                return 'tab-abstraction';

              case activityStatus.FINISHED:
                break;
            }
          };

          var loadActivityStatus = function (activity) {
            var deferred = $q.defer()
            , statusName = activityService.getStatusPropertyName(activity.status);

            activityService.getActivityStatusData(activity.id, activity.status)
              .then(function (response) {
                activity[statusName] = response;
                deferred.resolve(activity);
              })
              .catch(function (error) {
                deferred.reject(error);
              });

            return deferred.promise;
          };

          /**
           * Salva um item da atividade
           */
          var saveActivityItem = function (activityId, apiMethod, item, fromModal) {
            $log.debug('saveActivityItem', activityId, apiMethod, item, fromModal);

            if (angular.isUndefined(activityService[apiMethod])) {
              return;
            }

            activityService[apiMethod](activityId, item)
              .then(function (response) {
                notificationService.success(response.message);

                // Verifica se ação foi disparda por modal,
                // se sim, fecha ela
                if (angular.isDefined(fromModal)) {
                  scope.toggleModal(fromModal);
                }
              })
              .catch(function (error) {
                notificationService.error(error.message);
              });
          };

          scope.addItemToList = function (list, item) {
            if (Array.isArray(list)) {
              list.push(item);
              item = null;
            }
          };

          scope.removeItemFromList = function (list, index) {
            if (Array.isArray(list)) {
              list = list.splice(index, 1);  
            }
          };

          /**
           * Salva o problema
           */
          scope.saveStory = function (from) {
            $log.debug('saveStory', from);
            var activityId = scope.vm.activity.id
            , apiMethod = 'saveActivityStory'
            , story = scope.vm.activity.story;

            saveActivityItem(activityId, apiMethod, story, from);
          };

          scope.toggleModal = function (modalName) {
            $log.debug('toggleModal', modalName);
            angular.element(modalName).modal('toggle');
          };

          scope.$watch('activity', function () {
            if (angular.isDefined(scope.activity)) {
              init();
            }
          });
        }
      };
    }]);
}());
