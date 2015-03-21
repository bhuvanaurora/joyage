angular.module('MyApp')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$window', '$interval', 'Auth', function($scope, $rootScope, $location, $window, $interval, Auth) {
    /*$scope.login = function() {
      Auth.login({ email: $scope.email, password: $scope.password });
    };*/
        /*$scope.googleLogin = function() {
      Auth.googleLogin();
    };*/

      /*$interval(function() {
        $window.location.reload();
      },10000);*/

      if ($rootScope.currentUser) {
        $location.path('/home');
      }

    $scope.facebookLogin = function() {
      Auth.facebookLogin();
    };
    $scope.pageClass = 'fadeZoom';

      $('.open-modal').click(function() {
        $('.login-box-block').hide();
        var el = $(this)[0],
            classes = el.className.split(/\s+/);
        for(var i = 0; i < classes.length; i++) {
          if(classes[i].match(/modal-/)) {
            var modalClass = classes[i];
            $('.modal.' + modalClass).fadeIn('fast');
          }
        }
      });

      $('.close-modal').click(function() {
        $('.login-box-block').show();
        $(this).closest('.modal').fadeOut('fast');
      });

      $scope.go = function (path) {
        $location.path(path);
      };

  }]);