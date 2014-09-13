angular.module('MyApp')
  .controller('AddCtrl', function($scope, $alert, Activity) {
    $scope.addActivity = function() {
      Activity.save({ activityName: $scope.activityName }).$promise
        .then(function() {
          $scope.activityName = '';
          $scope.addForm.$setPristine();
          $alert({
            content: 'Activity has been added.',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .catch(function(response) {
          $scope.activityName = '';
          $scope.addForm.$setPristine();
          $alert({
            content: response.data.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
    };
  });