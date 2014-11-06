angular.module('MyApp')
  .factory('Accept', function($http) {
    return {
      acceptActivity: function(activity, userId) {
        return $http.post('/api/acceptActivity', { activityId: activity._id, preview: true, userId: userId });
      }
    };
  });