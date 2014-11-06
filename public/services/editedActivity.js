angular.module('MyApp')
  .factory('editedActivity', function($resource, $routeParams) {
    return $resource('/api/activities/:_id', { _id: $routeParams.id }, {
        update: {
            method: 'PUT'
        }    
    });
  });