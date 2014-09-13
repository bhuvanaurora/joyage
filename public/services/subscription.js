angular.module('MyApp')
  .factory('Subscription', function($http) {
    return {
      subscribe: function(activity) {                                                     //changed
        return $http.post('/api/subscribe', { activityId: activity._id });                //changed
      },
      unsubscribe: function(activity) {                                                   //changed
        return $http.post('/api/unsubscribe', { activityId: activity._id });              //changed
      }
    };
  });