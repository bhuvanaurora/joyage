angular.module('MyApp')
    .controller('AdminCtrl', ['$scope', '$alert', '$route', '$routeParams', '$rootScope', '$window', '$location', 'Activity', 'Delete', 'Profile', 'Business',
                              function($scope, $alert, $route, $routeParams, $rootScope, $window, $location, Activity, Delete, Profile, Business) {

          $scope.listOfBusinesses = Business.query();

          Profile.get({ _id: $routeParams.id }, function(profile) {
            $scope.profile = profile;
            if ($scope.profile.curator === true) {
                $scope.activities = Activity.query({ preview: false });
                $scope.deleteActivity = function(activity) {
                    Delete.deleteActivity(activity).success(function() {
                        alert('Activity deleted!');
                        $route.reload();
                    });
                };
                $scope.editActivity = function(activity) {
                    $window.location = '/editActivity/'+activity._id+'/'+$rootScope.currentUser._id;
                };
            } else {
                $location.path('/home');
            }
        });

      // ----------------------------------------------- For dynamic page elements --------------------------------------------- //

      $scope.userMenu = function() {
          var elem = document.getElementById("user-menu-drawer");
          if (elem) {
              if (elem.style) {
                  if (elem.style.display == 'block') {
                      elem.style.display = 'none';
                  } else {
                      elem.style.display = 'block';
                  }
              }
          }
      };
        
    }]);