angular.module('MyApp')
  .controller('InviteCtrl', ['$scope', '$window', 'fb_appId',
    function($scope, $window, fb_appId) {

      $window.fbAsyncInit = function () {
        FB.init({
          appId: fb_appId,
          responseType: 'token',
          version: 'v2.2',
          cookie: true,
          status: true,
          xfbml: true
        });

        (function() {
          FB.api('/v2.2/me/friends?fields=name,location,id', function (response) {
          if (response && !response.error) {
            $scope.friend_list = response;
          }
          })
        }());

        (function() {
          var e = document.createElement(script);
          e.async = true;
          e.src = document.location.protocol + '//connect/facebook.net/en_US/all.js';
          document.getElementById('fb-root').appendChild(e);
        }());

        $scope.invite_friends = function() {
          FB.api('/v2.2/me/friends?fields=name,location,id', function (response) {
            if (response && !response.error) {
              $scope.friend_list = response;
            }
          });
        };

        $scope.fb_invite = function(id) {
          FB.ui({
            to: id,
            method: 'send',
            name: 'Joyage | Discover the best activities in town',
            link: 'http://joyage.in'
          });
        }

      };

    }]);