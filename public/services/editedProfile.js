angular.module('MyApp')
    .factory('editedProfile', function($resource, $routeParams) {
        return $resource('/api/profile/:_id', { _id: $routeParams.id }, {
            update: {
                method: 'PUT'
            }
        });
    });