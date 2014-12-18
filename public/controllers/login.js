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

  }]);