angular.module('MyApp')
  .factory('Activity', function($resource, $routeParams) {
    return $resource('/api/activities/:_id');
  });