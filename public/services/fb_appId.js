angular.module('MyApp')
  .factory('fb_appId', ['$http', '$window',
           function($http, $window) {
     if ($window.location.host === 'localhost:3000') {
        return '1486280281653740'
     } else {
        return '1463495237249090';
     }
  }]);