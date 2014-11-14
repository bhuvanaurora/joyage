angular.module('MyApp')
    .factory('fb_connect', ['$window', function($window){
        if ($window.location.host === 'localhost:3000') {
            return "//connect.facebook.net/en_US/sdk/debug.js";
        } else {
            return "//connect.facebook.net/en_US/sdk.js";
        }
    }]);