angular.module('MyApp')
    .factory('Business', function($resource) {
        return $resource('/api/businesses/:business');
    });