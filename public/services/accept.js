angular.module('MyApp')
  .factory('Accept', function($http) {
    return {
      acceptActivity: function(activity) {
        return $http.post('/api/acceptActivity', { activityId: activity._id, preview: true });
      }
    };
  });