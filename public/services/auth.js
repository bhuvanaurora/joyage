angular.module('MyApp')
  .factory('Auth', ['$http', '$location', '$rootScope', '$routeParams', '$alert', '$window', 'fb_appId', 'fb_connect', 'Invites', 'updateInvites', 'AuthProfile',
           function($http, $location, $rootScope, $routeParams, $alert, $window, fb_appId, fb_connect, Invites, updateInvites, AuthProfile) {
    
    var token = $window.localStorage.token;
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      $rootScope.currentUser = payload.user;
    }

    // Asynchronously initialize Facebook SDK
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

    // Asynchronously load Google+ SDK
    /*(function() {
      var po = document.createElement('script');
      po.type = 'text/javascript';
      po.async = true;
      po.src = 'https://apis.google.com/js/client:plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
    })();*/

    return {
      facebookLogin: function () {
        if ($routeParams.id) {
          updateInvites.get({ _id: $routeParams.id }, function (invites) {
            if (invites) {
              if (invites.invitations_accepted < 10) {
                FB.login(function (response) {
                  FB.api('/me', function (profile) {
                    var data = {
                      signedRequest: response.authResponse.signedRequest,
                      profile: profile
                    };
                    AuthProfile.get({_id: profile.id}, function (prof) {
                        if (prof) {
                            $http.post('/auth/facebook', data)
                                .success(function (token) {
                                    console.log('Data: ' + data);
                                    var payload = JSON.parse($window.atob(token.split('.')[1]));
                                    $window.localStorage.token = token;
                                    $rootScope.currentUser = payload.user;
                                    $location.path('/');
                                    $alert({
                                        title: 'Cheers!',
                                        content: 'You have successfully signed-in with Facebook.',
                                        animation: 'fadeZoomFadeDown',
                                        type: 'material',
                                        duration: 3
                                    });
                                })
                                .error(function () {
                                    delete $window.localStorage.token;
                                    $alert({
                                        title: 'Error!',
                                        content: 'Could not sign-in',
                                        animation: 'fadeZoomFadeDown',
                                        type: 'material',
                                        duration: 3
                                    });
                                });
                        }
                    });
                    $http.post('/auth/facebook', data)
                        .success(function (token) {
                            console.log('Data: ' + data);
                            var payload = JSON.parse($window.atob(token.split('.')[1]));
                            $window.localStorage.token = token;
                            $rootScope.currentUser = payload.user;
                            invites.$update(function () {

                            });
                            $location.path('/');
                            $alert({
                                title: 'Cheers!',
                                content: 'You have successfully signed-in with Facebook.',
                                animation: 'fadeZoomFadeDown',
                                type: 'material',
                                duration: 3
                            });
                        })
                        .error(function () {
                            delete $window.localStorage.token;
                            $alert({
                                title: 'Error!',
                                content: 'Could not sign-in',
                                animation: 'fadeZoomFadeDown',
                                type: 'material',
                                duration: 3
                            });
                        });
                  });
                }, {scope: 'email, public_profile, user_friends, publish_actions'});
              } else {
                $alert({
                  title: 'Maximum number of invites reached for the invitation',
                  content: 'Could not sign-in',
                  animation: 'fadeZoomFadeDown',
                  type: 'material',
                  duration: 3
                });
                $location.path('/');
              }
            } else {
              $alert({
                title: 'Incorrect invitation',
                content: 'Could not sign-in',
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
              $location.path('/');
            }
          });
        } else {
          FB.login(function (response) {
              FB.api('/me', function (profile) {
                  var data = {
                      signedRequest: response.authResponse.signedRequest,
                      profile: profile
                  };
                  AuthProfile.get({_id: profile.id}, function (prof) {
                      if(prof) {
                          $http.post('/auth/facebook', data)
                              .success(function (token) {
                                  var payload = JSON.parse($window.atob(token.split('.')[1]));
                                  $window.localStorage.token = token;
                                  $rootScope.currentUser = payload.user;
                                  $location.path('/');
                                  $alert({
                                      title: 'Cheers!',
                                      content: 'You have successfully signed-in with Facebook.',
                                      animation: 'fadeZoomFadeDown',
                                      type: 'material',
                                      duration: 3
                                  });
                              })
                              .error(function () {
                                  delete $window.localStorage.token;
                                  $alert({
                                      title: 'Error!',
                                      content: 'Could not sign-in',
                                      animation: 'fadeZoomFadeDown',
                                      type: 'material',
                                      duration: 3
                                  });
                              });
                      } else {
                          $alert({
                              title: 'Invitation error!',
                              content: 'You do not have an invitation',
                              animation: 'fadeZoomFadeDown',
                              type: 'material',
                              duration: 3
                          });
                      }
                  });
              });
              }, {scope: 'email, public_profile, user_friends, publish_actions'});
        }
        }
        ,
        /*googleLogin: function() {
         gapi.auth.authorize({
         client_id: '412023566724-lbjlu1k9tg0331k3s29vghhac45f8916.apps.googleusercontent.com',      // Joyage API
         scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read',
         immediate: false
         }, function(token) {
         gapi.client.load('plus', 'v1', function() {
         var request = gapi.client.plus.people.get({
         userId: 'me'
         });
         request.execute(function(authData) {
         $http.post('/auth/google', { profile: authData }).success(function(token) {
         var payload = JSON.parse($window.atob(token.split('.')[1]));
         $window.localStorage.token = token;
         $rootScope.currentUser = payload.user;
         $location.path('/');
         $alert({
         title: 'Cheers!',
         content: 'You have successfully signed-in with Google.',
         animation: 'fadeZoomFadeDown',
         type: 'material',
         duration: 3
         });
         });
         });
         });
         });
         },*/
        /*login: function(user) {
         return $http.post('/auth/login', user)
         .success(function(data) {
         $window.localStorage.token = data.token;
         var payload = JSON.parse($window.atob(data.token.split('.')[1]));
         $rootScope.currentUser = payload.user;
         $location.path('/');
         $alert({
         title: 'Cheers!',
         content: 'You have successfully logged in.',
         animation: 'fadeZoomFadeDown',
         type: 'material',
         duration: 3
         });
         })
         .error(function() {
         delete $window.localStorage.token;
         $alert({
         title: 'Error!',
         content: 'Invalid username or password.',
         animation: 'fadeZoomFadeDown',
         type: 'material',
         duration: 3
         });
         });
         },*/
        /*signup: function(user) {
         return $http.post('/auth/signup', user)
         .success(function() {
         $location.path('/login');
         $alert({
         title: 'Congratulations!',
         content: 'Your account has been created.',
         animation: 'fadeZoomFadeDown',
         type: 'material',
         duration: 3
         });
         })
         .error(function(response) {
         $alert({
         title: 'Error!',
         content: response.data,
         animation: 'fadeZoomFadeDown',
         type: 'material',
         duration: 3
         });
         });
         },*/
        logout: function () {
          delete $window.localStorage.token;
          $rootScope.currentUser = null;
          FB.getLoginStatus(function (response) {
            if (response && response.status === 'connected') {
                FB.logout(function (response) {
                    $window.location = '/';
                });
            };
          });
          $alert({
            content: 'You have been logged out.',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        }
      };
  }]);