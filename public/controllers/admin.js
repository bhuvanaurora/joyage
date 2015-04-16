angular.module('MyApp')
    .controller('AdminCtrl', ['$scope', '$alert', '$route', '$routeParams', '$location', 'Activity', 'Delete', 'Profile', 'Business',
                              function($scope, $alert, $route, $routeParams, $location, Activity, Delete, Profile, Business) {

          $scope.listOfBusinesses = Business.query();

          Profile.get({ _id: $routeParams.id }, function(profile) {
            $scope.profile = profile;
            if ($scope.profile.curator === true) {
                $scope.activities = Activity.query({ preview: false });
                $scope.deleteActivity = function(activity) {
                    Delete.deleteActivity(activity).success(function() {
                        $alert({
                            content: 'Activity deleted',
                            placement: 'top-right',
                            type: 'material',
                            duration: 3
                        });
                        $route.reload();
                    });
                };
            } else {
                $location.path('/home');
            }
        });
        
    }]);