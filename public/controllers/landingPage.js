angular.module('MyApp')
    .controller('landPageCtrl', ['$scope', '$rootScope', '$location', 'Auth',
        function($scope, $rootScope, $location, Auth) {

            if ($rootScope.currentUser) {
                $location.path('/home');
            }

        }]);