angular.module('MyApp')
    .factory('updateInvites', function($resource, $routeParams) {
        return $resource('/api/invites/:rs', { rs: $routeParams.rs }, {
            update: {
                method: 'PUT'
            }
        });
    });