angular.module('MyApp')
    .factory('Location', function($resource) {
        return $resource('/userLocation');
    });