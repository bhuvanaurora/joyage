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

      $('.landPageSec1').mouseover(function() {
        var el1 = document.getElementById('landPage1');
        var el2 = document.getElementById('landPage11');
        el1.style.display = 'block';
        el2.style.display = 'none';
      });

      $('.landPageSec1').mouseleave(function() {
        var el1 = document.getElementById('landPage1');
        var el2 = document.getElementById('landPage11');
        el1.style.display = 'none';
        el2.style.display = 'block';
      });

      $('.landPageSec2').mouseover(function() {
        var el1 = document.getElementById('landPage2');
        var el2 = document.getElementById('landPage22');
        el1.style.display = 'block';
        el2.style.display = 'none';
      });

      $('.landPageSec2').mouseleave(function() {
        var el1 = document.getElementById('landPage2');
        var el2 = document.getElementById('landPage22');
        el1.style.display = 'none';
        el2.style.display = 'block';
      });

      $('.landPageSec3').mouseover(function() {
        var el1 = document.getElementById('landPage3');
        var el2 = document.getElementById('landPage33');
        el1.style.display = 'block';
        el2.style.display = 'none';
      });

      $('.landPageSec3').mouseleave(function() {
        var el1 = document.getElementById('landPage3');
        var el2 = document.getElementById('landPage33');
        el1.style.display = 'none';
        el2.style.display = 'block';
      });

      $('.landPageSec4').mouseover(function() {
        var el1 = document.getElementById('landPage4');
        var el2 = document.getElementById('landPage44');
        el1.style.display = 'block';
        el2.style.display = 'none';
      });

      $('.landPageSec4').mouseleave(function() {
        var el1 = document.getElementById('landPage4');
        var el2 = document.getElementById('landPage44');
        el1.style.display = 'none';
        el2.style.display = 'block';
      });

      $('.landPageSec5').mouseover(function() {
        var el1 = document.getElementById('landPage5');
        var el2 = document.getElementById('landPage55');
        el1.style.display = 'block';
        el2.style.display = 'none';
      });

      $('.landPageSec5').mouseleave(function() {
        var el1 = document.getElementById('landPage5');
        var el2 = document.getElementById('landPage55');
        el1.style.display = 'none';
        el2.style.display = 'block';
      });

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