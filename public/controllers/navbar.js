angular.module('MyApp')
  .controller('NavbarCtrl', function($scope, $routeParams, $window, Auth, Profile) {
    $scope.logout = function() {
      Auth.logout();
    };
  });