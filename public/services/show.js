angular.module('MyApp')
  .factory('Activity', function($resource) {
    return $resource('/api/activities/:_id');
  });