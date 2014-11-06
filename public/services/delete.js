angular.module('MyApp')
  .factory('Delete', function($http) {
    return {
      deleteActivity: function(activity) {
        return $http.post('/api/deleteActivity', { activityId: activity._id });
      }
    };
  });