angular.module('MyApp')
    .factory('updateInvites', function($resource, $routeParams) {
        return $resource('/api/invites/:_id', { _id: $routeParams.id }, {
            update: {
                method: 'PUT'
            }
        });
    });