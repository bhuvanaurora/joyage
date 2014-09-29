angular.module('MyApp')
  .factory('Tips', function($http) {
    return {
      addTip: function(activity) {
        return $http.post('/api/tips', { activityId: activity._id, tips: activity.tips });
      }
    };
  });