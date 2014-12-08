angular.module('MyApp')
  .controller('ProfileCtrl', ['$scope', '$routeParams', '$rootScope', '$window', 'Profile', 'Activity', 'fb_appId',
                              function($scope, $routeParams, $rootScope, $window, Profile, Activity, fb_appId) {
    
    Profile.get({ _id: $routeParams.id }, function(profile) {
      $scope.profile = profile;

      // Asynchronously initialize FB SDK
      $window.fbAsyncInit = function() {
        FB.init({
          appId: fb_appId,
          responseType: 'token',
          version: 'v2.2',
          cookie: true,
          status: true,
          xfbml: true
        });
      };
      $scope.profilePicture = "https://graph.facebook.com/v2.2/"+profile.facebookId+"/picture?type=large";

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