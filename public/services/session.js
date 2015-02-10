angular.module('MyApp')
    .factory('Session', function($http) {
        return $http.get('/api/session');
    });