angular.module('MyApp')
  .controller('LoginCtrl', ['$scope', 'Auth', function($scope, Auth) {
    /*$scope.login = function() {
      Auth.login({ email: $scope.email, password: $scope.password });
    };*/
        /*$scope.googleLogin = function() {
      Auth.googleLogin();
    };*/
    $scope.facebookLogin = function() {
      Auth.facebookLogin();
    };
    $scope.pageClass = 'fadeZoom';
  }]);