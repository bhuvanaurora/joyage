angular.module('MyApp')
    .factory('Session', function($http) {
        return $http.get('/api/session');
    })
    .factory('SessionI', function($http) {
        return $http.get('/api/sessionI');
    })
    .factory('SessionO', function($http) {
        return $http.get('/api/sessionO');
    });