angular.module('MyApp')
  .controller('InviteCtrl', ['$scope', '$window', '$alert', '$routeParams', '$http', '$route', '$interval', 'fb_appId', 'fb_connect', 'Profile', 'editedProfile', 'Invites', 'updateInvites', 'Session', 'SessionI', 'SessionO', 'Auth',
    function($scope, $window, $alert, $routeParams, $http, $route, $interval, fb_appId, fb_connect, Profile, editedProfile, Invites, updateInvites, Session, SessionI, SessionO, Auth) {


        $scope.session = Session;

        $scope.session.success(function(data) {
            console.log('Data: '+data.session);

            if (data.session == 'expired') {
                $window.fbAsyncInit = function () {
                    FB.init({
                        appId: fb_appId,
                        responseType: 'token',
                        version: 'v2.2',
                        cookie: true,
                        status: true,
                        xfbml: true
                    });

                    Auth.logout();
                };
            }
        });

        $scope.sessionI = SessionI;

        $scope.sessionI.success(function(data) {
            if (data.invitePage % 2 == 0) {
                $window.location.reload();
            }
        });

      editedProfile.get({ _id: $routeParams.id }, function(profile) {
        $scope.profile = profile;

        if ($scope.profile.p2p != true && $scope.profile.invitations_sent >= 10) {
            $window.location.href('/home');
        }

        if (!$scope.profile.inviteString) {

          chance.set('lastNames', ['Underwood', 'Stamper', 'Meechum', 'Vasquez', 'Gallagher', 'Danton', 'Posner', 'Barnes', 'Russo', 'Bing',
            'Geller', 'Buffay', 'Tribbiani', 'Green', 'Arryn', 'Baratheon', 'Bolton', 'Frey', 'Greyjoy', 'Lannister', 'Martell', 'Stark',
            'Targaryen', 'Tully', 'Tyrell', 'Tyrion', 'Danaerys', 'Aarya', 'Rachel', 'Joey', 'Ross', 'Monica', 'Chandler', 'Khaleesi', 'Ned',
            'Jamie', 'Frank', 'Chloe', 'Seinfeld', 'Jerry', 'Kramer', 'Fez', 'Hyde', 'Kelso', 'Forman', 'Burkhart', 'Pinciotti', 'Feynman',
            'Ritchie', 'Nikola', 'Tesla', 'Simon', 'Garfunkel', 'Eddie', 'Vedder', 'Lennon', 'Cash']);

          randomString = chance.last() + '-' + chance.last() + chance.cc();
          var newString = true;
        } else {
          randomString = $scope.profile.inviteString;
        }

          var refreshes = 0;

          $interval(function () {

              if (refreshes < 1) {

                  $window.fbAsyncInit = function() {
                      FB.init({
                          appId: fb_appId,
                          responseType: 'token',
                          version: 'v2.2',
                          oauth: true,
                          xfbml: true
                      });
                  };

                  // Asynchronously load Facebook SDK
                  (function(d, s, id) {
                      var js, fjs = d.getElementsByTagName(s)[0];
                      if (d.getElementById(id)) {
                          return;
                      }
                      js = d.createElement(s);
                      js.id = id;
                      js.src = fb_connect;
                      fjs.parentNode.insertBefore(js, fjs);
                  }(document, 'script', 'facebook-jssdk'));

              }

              refreshes += 1;

          }, 10);

          $scope.fb_invite = function () {
            console.log("Im ready to invite");
          };

        if(!$scope.profile.invitations_sent) {
          $scope.profile.invitations_sent = 0;
        }

          console.log(randomString);

          if ($scope.profile.inviteString == 'Ferrell-Stark-Goofy-Biryani' || $scope.profile.inviteString == 'Underwood-Dostoyevsky-Phony-Lannister') {

              $scope.fb_request = function () {
                  // Inviting friends
                  FB.ui({
                      title: 'Joyage invite',
                      method: 'apprequests',
                      message: 'Select the 10 most beautiful friends to join you on Joyage',
                      max_recipients: 10000
                      //filters: ['app_non_users']
                  }, function (response) {
                      if (response) {
                          $scope.profile.requests = response.request;
                          $scope.profile.invitation_to = response.to;
                          $scope.profile.invitations_sent = response.to.length;
                          $scope.profile.inviteString = randomString;
                          FB.ui({
                              to: response.to,
                              method: 'send',
                              link: 'http://joyage.in/login/' + randomString
                          });
                      }
                      if (newString) {
                          Invites.save({id: randomString});
                      }
                      $scope.profile.$update(function () {
                          $route.reload();
                      });

                      if (response) {
                          // Successfully invited
                      } else {
                          // Failed to invite
                      }
                  });
              };

          } else {

              $scope.fb_request = function () {
                  $alert({
                      content: 'Inviting friends',
                      placement: 'bottom-left',
                      type: 'material',
                      duration: 3
                  });
                  FB.ui({
                      method: 'apprequests',
                      title: 'Joyage invite',
                      message: 'Select the 10 most beautiful friends to join you on Joyage',
                      max_recipients: (10 - $scope.profile.invitations_sent),
                      filters: ['app_non_users']
                  }, function (response) {
                      if (response) {
                          $scope.profile.requests = response.request;
                          $scope.profile.invitation_to = response.to;
                          $scope.profile.invitations_sent = response.to.length;
                          $scope.profile.inviteString = randomString;
                          FB.ui({
                              to: response.to,
                              method: 'send',
                              link: 'http://joyage.in/login/' + randomString
                          });
                      }
                      if (newString) {
                          Invites.save({id: randomString});
                      }
                      $scope.profile.$update(function () {
                          $route.reload();
                      });

                      if (response) {
                          // Successfully invited
                      } else {
                          $alert({
                              content: 'failed to invite',
                              placement: 'bottom-left',
                              type: 'material',
                              duration: 3
                          });
                      }
                  });
              };

          }

      });

        // ----------------------------------------------- For dynamic page elements --------------------------------------------- //

        $scope.userMenu = function() {
            var elem = document.getElementById("user-menu-drawer");
            if (elem) {
                if (elem.style) {
                    if (elem.style.display == 'block') {
                        elem.style.display = 'none';
                    } else {
                        elem.style.display = 'block';
                    }
                }
            }
        };

    }]);