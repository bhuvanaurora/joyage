angular.module('MyApp')
  .controller('InviteCtrl', ['$scope', '$window', '$alert', '$window', '$routeParams', '$http', 'fb_appId', 'Profile',
    function($scope, $window, $alert, $window, $routeParams, $http, fb_appId, Profile) {

      Profile.get({ _id: $routeParams.id }, function(profile) {
        $scope.profile = profile;

        //$scope.disabled = true;
        if ($scope.profile.inviteSent) {
          if ($scope.profile.inviteSent < 10) {
            $scope.disabled = false;
          }
        }

        $window.fbAsyncInit = function () {
          FB.init({
            appId: fb_appId,
            responseType: 'token',
            version: 'v2.2',
            cookie: true,
            status: true,
            xfbml: true,
            oauth: true,
            frictionlessRequests: true
          });

          (function () {
            FB.api('/v2.2/me/friends?fields=name,location,id', function (response) {
              if (response && !response.error) {
                $scope.friend_list = response;
              }
            })
          }());

          /*(function() {
           var e = document.createElement(script);
           e.async = true;
           e.src = document.location.protocol + '//connect/facebook.net/en_US/all.js';
           document.getElementById('fb-root').appendChild(e);
           }());*/

          $scope.invite_friends = function () {
            FB.api('/v2.2/me/friends?fields=name,location,id', function (response) {
              if (response && !response.error) {
                $scope.friend_list = response;
              }
            });
          };

          $scope.fb_invite = function (id) {
            FB.ui({
              to: id,
              method: 'send',
              name: 'Joyage | Discover the best activities in town',
              link: 'http://joyage.in'
            });
          };

          $scope.fb_invite = function () {
            FB.ui({
              to: '',
              method: 'send',
              name: 'Joyage | Discover the best activities in town',
              link: 'http://joyage.in'
            });
          };

          $scope.fb_request = function () {
            FB.ui({
              method: 'apprequests',
              //action_type: 'send',
              //data: 'Joyage tracking',
              message: 'Invite your facebook friends to Joyage',
              max_recipients: 10,
              filters: ['app_non_users'],
              redirect_uri: 'http://joyage.in'
            }, function (response) {
              if (response.to.length) {
                $http.post('/sendInvites', {id: $routeParams.id, response: response});
                var recipient_info = "https://graph.facebook.com/" + $scope.profile.facebookId + "/apprequests?fields=id,application,to,from,data,message,action_type,object,created_time&access_token=" + fb_appId;
                console.log(recipient_info);
                console.log(response.to.length);
                console.log(response);
              }

              if (response) {
                $alert({
                  content: 'successfully invited',
                  placement: 'top-right',
                  type: 'material',
                  duration: 3
                });
              } else {
                $alert({
                  content: 'failed to invite',
                  placement: 'top-right',
                  type: 'material',
                  duration: 3
                });
              }
            });
          };

          /*$scope.invite_users = function() {
           $http.get("https://graph.facebook.com/"+$routeParams.id+"/apprequests?fields=id,application,to,from,data,message,action_type,object,created_time&access_token="+fb_appId).success(function(data) {
           //$http.get("https://www.google.co.in").success(function(data) {
           console.log(data);
           });
           }*/

          $scope.my_details = function () {
            FB.api(
                "/me", function (response) {
                  if (response && !response.error) {
                    console.log(response);
                  }
                }
            )
          }

        };

      });

    }]);