angular.module('MyApp')
  .controller('ProfileCtrl', ['$scope', '$routeParams', '$rootScope', '$location', '$window', 'Profile', 'Activity', 'fb_appId', 'Session', 'Auth',
                              function($scope, $routeParams, $rootScope, $location, $window, Profile, Activity, fb_appId, Session, Auth) {

    $window.scrollTo(0,0);

    $scope.session = Session;

    $scope.session.success(function(data) {
      console.log('Data: '+data.session);

      if (data.session == 'expired') {
        $window.fbAsyncInit = function () {
          FB.init({
            appId: fb_appId,
            responseType: 'token',
            version: 'v2.2',
            cookie: true,
            status: true,
            xfbml: true
          });

          Auth.logout();
        };
      }
    });

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

    // ----------------------------------------------- For Navbar --------------------------------------------- //

    $scope.go = function (path) {
      $location.path(path);
    };

    $scope.userMenu = function() {
      var elem = document.getElementById("user-menu-drawer");
      if (elem.style) {
        if (elem.style.display == 'block') {
          elem.style.display = 'none';
        } else {
          elem.style.display = 'block';
        }
      }
    };

  }]);