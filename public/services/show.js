angular.module('MyApp')
  .factory('Activity', function($resource) {                //changed
    return $resource('/api/activities/:_id');               //changed
  });