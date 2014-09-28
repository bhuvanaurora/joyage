angular.module('MyApp')
  .factory('DoneIt', function($http) {
    return {
      markDone: function(activity) {
        return $http.post('/api/markDone', { activityId: activity._id });
      },
      markUndone: function(activity) {
        return $http.post('/api/markUndone', { activityId: activity._id });
      }
    };
  });