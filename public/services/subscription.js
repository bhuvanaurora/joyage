angular.module('MyApp')
  .factory('Subscription', function($http) {
    return {
      subscribe: function(activity) {
        return $http.post('/api/subscribe', { activityId: activity._id });
      },
      unsubscribe: function(activity) {
        return $http.post('/api/unsubscribe', { activityId: activity._id });
      }
    };
  });