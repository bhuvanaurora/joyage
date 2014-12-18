angular.module('MyApp')
  .controller('InviteCtrl', ['$scope', '$window', '$alert', '$window', '$routeParams', '$http', '$route', '$templateCache', 'fb_appId', 'Profile', 'editedProfile', 'Invites', 'updateInvites',
    function($scope, $window, $alert, $window, $routeParams, $http, $route, $templateCache, fb_appId, Profile, editedProfile, Invites, updateInvites) {

      editedProfile.get({ _id: $routeParams.id }, function(profile) {
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

          /*$scope.fb_invite = function (id) {
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
           };*/

          if (!$scope.profile.facebook.inviteString) {

            chance.set('lastNames', ['Underwood', 'Stamper', 'Meechum', 'Vasquez', 'Gallagher', 'Danton', 'Posner', 'Barnes', 'Russo', 'Bing',
              'Geller', 'Buffay', 'Tribbiani', 'Green', 'Arryn', 'Baratheon', 'Bolton', 'Frey', 'Greyjoy', 'Lannister', 'Martell', 'Stark',
              'Targaryen', 'Tully', 'Tyrell']);

            var randomString = chance.last() + '-' + chance.last() + chance.cc() + chance.hashtag();
            console.log(randomString);
          } else {
            var randomString = $scope.profile.facebook.inviteString;
          }

          $scope.fb_request = function () {
            FB.ui({
              method: 'apprequests',
              message: 'Invite your facebook friends to Joyage',
              max_recipients: (10 - $scope.profile.facebook.invitations_sent)
              //filters: ['app_non_users']
            }, function (response) {
              if (response) {
                $scope.profile.facebook.requests = response.request;
                $scope.profile.facebook.invitation_to = response.to;
                $scope.profile.facebook.invitations_sent = response.to.length;
                $scope.profile.facebook.inviteString = randomString;
                FB.ui({
                  to: response.to,
                  method: 'send',
                  name: 'Joyage | Discover the best activities in town',
                  link: 'http://joyage.co/login/' + randomString
                });
              }
              Invites.save({ id: randomString });
              $scope.profile.$update(function () {
                $route.reload();
              });

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
        };

      });

    }]);