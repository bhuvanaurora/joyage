angular.module('MyApp')
    .controller('UsersCtrl', ['$scope', '$rootScope', '$window', '$routeParams', '$location', 'fb_appId', 'Activity', 'Profile', 'Session', 'Auth', 'ListUsers',
        function($scope, $rootScope, $window, $routeParams, $location, fb_appId, Activity, Profile, Session, Auth, ListUsers) {

            $window.scrollTo(0, 0);                                 // To scroll to the top of the page

            $scope.session = Session;

            function logout() {
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

            $window.fbAsyncInit = function () {
                FB.init({
                    appId: fb_appId,
                    responseType: 'token',
                    version: 'v2.2',
                    cookie: true,
                    status: true,
                    xfbml: true
                });
            };

            Profile.get({ _id: $routeParams.id }, function(profile) {

                $scope.profile = profile;

                if ($scope.profile.god != true) {
                    logout();
                }

                $scope.users = ListUsers.query({ id: $routeParams.id });

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