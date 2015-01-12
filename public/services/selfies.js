angular.module('MyApp')
    .factory('Selfies', function($http) {
        return {
            addSelfie: function(activity) {
                return $http.post('/api/selfies', { activityId: activity._id, selfies: activity.selfies });
            }
        };
    });