// Changes made

angular.module('MyApp')
  .controller('DetailCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$alert', 'Activity', 'Subscription', 'DoneIt', 'Tips', 'Accept', 'Delete',
                             function($scope, $rootScope, $routeParams, $location, $alert, Activity, Subscription, DoneIt, Tips, Accept, Delete) {
        
      Activity.get({ _id: $routeParams.id }, function(activity) {
        $scope.activity = activity;
        
        $scope.activities = Activity.query({limit: 3, id: activity._id});
        
        $scope.isSubscribed = function() {
          return $scope.activity.subscribers.indexOf($rootScope.currentUser._id) !== -1;
        };

        $scope.subscribe = function() {
          Subscription.subscribe(activity).success(function() {
            $scope.activity.subscribers.push($rootScope.currentUser._id);
          });
        };

        $scope.unsubscribe = function() {
          Subscription.unsubscribe(activity).success(function() {
            var index = $scope.activity.subscribers.indexOf($rootScope.currentUser._id);
            $scope.activity.subscribers.splice(index, 1);
          });
        };
        
        $scope.isDone = function() {
          return $scope.activity.doneIt.indexOf($rootScope.currentUser._id) !== -1;
        };
        
        $scope.markDone = function() {
          DoneIt.markDone(activity).success(function() {
            $scope.activity.doneIt.push($rootScope.currentUser._id);
          });
        };
        
        $scope.markUndone = function() {
          DoneIt.markUndone(activity).success(function() {
            var index = $scope.activity.doneIt.indexOf($rootScope.currentUser._id);
            $scope.activity.doneIt.splice(index, 1);
          });
        };
        
        $scope.addTips = function(tip) {
          $scope.activity.tips.push(tip);
          Tips.addTip(activity).success(function() {
            $scope.tip = '';
          });
        };
        
        $scope.acceptActivity = function(userId) {
            Accept.acceptActivity(activity, userId).success(function() {
                $alert({
                    content: 'Activity has been added.',
                    placement: 'top-right',
                    type: 'success',
                    duration: 3
                  });
                $location.path('/admin');
            });
        };
        
        $scope.deleteActivity = function() {
            Delete.deleteActivity(activity).success(function() {
                $alert({
                    content: 'Activity deleted',
                    placement: 'top-right',
                    type: 'material',
                    duration: 3
                });
                $location.path('/admin');
            });
        };

      });
    }]);