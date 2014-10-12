angular.module('MyApp')
  .controller('ProfileCtrl', ['$scope', '$routeParams', 'Profile', 'Activity',
                              function($scope, $routeParams, Profile, Activity) {
    
      Profile.get({ _id: $routeParams.id }, function(profile) {
        $scope.profile = profile;

        $scope.subscribedActivities = [];
        for (var i=0; i<$scope.profile.subscribedActivities.length; i++) {
          $scope.subscribedActivities[i] = Activity.get({ _id: $scope.profile.subscribedActivities[i] });
        }
        
        $scope.doneActivities = [];
        for (var i=0; i<$scope.profile.doneActivities.length; i++) {
          $scope.doneActivities[i] = Activity.get({ _id: $scope.profile.doneActivities[i] });
        }
        
      });
  }]);