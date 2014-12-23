angular.module('MyApp')
    .factory('updateInvites', function($resource, $routeParams) {
        return $resource('/api/invites/:id', { id: $routeParams.id }, {
            update: {
                method: 'PUT'
            }
        });
    });