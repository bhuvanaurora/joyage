angular.module('MyApp')
    .controller('BusinessCtrl', ['$scope', '$rootScope', '$window', '$routeParams', '$location', 'fb_appId', 'Activity', 'Profile', 'Session', 'Auth', 'Business',
        function($scope, $rootScope, $window, $routeParams, $location, fb_appId, Activity, Profile, Session, Auth, Business) {

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

            $scope.session.success(function (data) {
                if (data.session != 'OK') {
                    logout();
                }
            });

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

                if ($scope.profile.p2p != true) {
                    logout();
                }

                Business.get({ business: $routeParams.business }, function(business) {

                    $scope.business = business;

                    $scope.activities = Activity.query({ business: $scope.business.business });

                });


            });

    }]);