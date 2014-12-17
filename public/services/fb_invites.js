angular.module('MyApp')
    .factory('Invites', function($resource) {
        return $resource('/api/invites');
    });