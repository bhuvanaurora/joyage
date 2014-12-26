angular.module('MyApp')
    .factory('AuthProfile', function($resource) {
        return $resource('/api/authprofile/:_id');
    });