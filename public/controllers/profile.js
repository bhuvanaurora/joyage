angular.module('MyApp')
  .controller('ProfileCtrl', ['$scope', '$routeParams', '$rootScope', 'Profile', 'Activity',
                              function($scope, $routeParams, $rootScope, Profile, Activity) {

    Profile.get({ _id: $routeParams.id }, function(profile) {
      $scope.profile = profile;

      $scope.subscribedActivities = [];
      $scope.subscribeCount = 0;
      for (var i=0; i<$scope.profile.subscribedActivities.length; i++) {
        ++$scope.subscribeCount;
        $scope.subscribedActivities[i] = Activity.get({ _id: $scope.profile.subscribedActivities[i] });
      }
      
      $scope.doneActivities = [];
      $scope.doneCount = 0;
      for (var i=0; i<$scope.profile.doneActivities.length; i++) {
        ++$scope.doneCount;
        $scope.doneActivities[i] = Activity.get({ _id: $scope.profile.doneActivities[i] });
      }
      
    });
  }]);