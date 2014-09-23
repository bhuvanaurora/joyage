// Changes made

angular.module('MyApp')
  .controller('DetailCtrl', function($scope, $rootScope, $routeParams, Activity, Subscription) {
      Activity.get({ _id: $routeParams.id }, function(activity) {
        $scope.activity = activity;
        
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
      });
    });