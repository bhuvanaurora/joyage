angular.module('MyApp')
    .controller('AdminCtrl', ['$scope', '$alert', '$route', 'Activity', 'Delete',
                              function($scope, $alert, $route, Activity, Delete) {
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
    }]);