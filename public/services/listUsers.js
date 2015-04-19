angular.module('MyApp')
    .factory('ListUsers', function($resource) {
        return $resource('/api/listUsers/:id');
    });