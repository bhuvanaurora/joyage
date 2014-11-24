// Changes made

angular.module('MyApp')
  .controller('DetailCtrl', ['$scope', '$rootScope', '$window', '$routeParams', '$location', '$alert', 'fb_appId', 'Activity', 'Subscription', 'DoneIt', 'Tips', 'Accept', 'Delete',
                             function($scope, $rootScope, $window, $routeParams, $location, $alert, fb_appId, Activity, Subscription, DoneIt, Tips, Accept, Delete) {

         /*function GetLocation(address) {

             var geocoder = new google.maps.Geocoder();

             geocoder.geocode({ 'address': address }, function (results, status) {
                 if (status == google.maps.GeocoderStatus.OK) {
//                    var latitude = results[0].geometry.location.lat();
//                    var longitude = results[0].geometry.location.lng();
//                    alert("Latitude: " + latitude + "\nLongitude: " + longitude);
                     locationaddr.latitude = results[0].geometry.location.lat();
                     locationaddr.longitude = results[0].geometry.location.lng();
                     var mapOptions = {
                         zoom: 8,
                         center: new google.maps.LatLng(locationaddr.latitude, locationaddr.longitude),
                         mapTypeId: google.maps.MapTypeId.TERRAIN
                     }

                     $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

                     $scope.marker = [];
                     var infoWindow = new google.maps.InfoWindow();

                     var createMarker = function (info){
                         var marker = new google.maps.Marker({
                             map: $scope.map,
                             animation:google.maps.Animation.BOUNCE,
                             position: new google.maps.LatLng(info.lat, info.long),
                             title: info.city
                         });

                         google.maps.event.addListener(marker, 'click', function(){
                             infoWindow.setContent('<h2>' + marker.title + '</h2>');
                             infoWindow.open($scope.map, marker);
                         });

                         $scope.marker.push(marker);

                     }
                     createMarker(    {
                         city : address,
                         lat : locationaddr.latitude,
                         long : locationaddr.longitude
                     });
                     alert(locationaddr.longitude);
                     alert(locationaddr.latitude);
                     //                    google.maps.event.addDomListener(window, 'load', initialize);

                 } else {
                     alert("Request failed.")
                 }
             });
         };

         GetLocation($scope.location);*/

        $window.fbAsyncInit = function() {
          FB.init({
            appId: fb_appId,
            responseType: 'token',
            version: 'v2.2',
            cookie: true,
            status: true,
            xfbml: true
          });
        };


           // Post
          $scope.fb_post = function() {
            FB.api('/me/feed', 'post', {message: 'Whooppiieee!'}, function(response){
                if (!response || response.error) {
                    alert('Error occured');
                } else {
                    alert('Post ID: ' + response.id);
                }
            });
          };
        
      Activity.get({ _id: $routeParams.id }, function(activity) {
        $scope.activity = activity;
        
        $scope.activities = Activity.query({limit: 3, id: activity._id});

        // Share dialog
        $scope.fb_share = function() {
            /*FB.api('me/objects/_joyage_:activity', 'post', {
                    'og:url': 'http://samples.ogp.me/1494352094179892',
                    'og:title': activity.title,
                    'og:type': '_joyage_:activity',
                    'og:image': 'https://fbstatic-a.akamaihd.net/images/devsite/attachment_blank.png',
                    'og:description': activity.description,
                    'fb:app_id': 1486280281653740
                }, function(response) {
                // handle the response
            }
          );*/
            FB.ui({
                method: 'feed',
                name: activity.title,
                link: "http://joyage.in/activities/"+activity._id,
                //picture: response.image,
                description: activity.description
            });
          /*FB.ui({
              method: 'share_open_graph',
              action_type: 'post',
              title: activity.title,
              description: activity.description,
              action_properties: JSON.stringify({
                  object: 'http://joyage.in/'+activity._id
              })
          }, function(response){});*/
        };

        $scope.isSubscribed = function() {
            if ($rootScope.currentUser) {
              return $scope.activity.subscribers.indexOf($rootScope.currentUser._id) !== -1;
            }
        };

        $scope.subscribe = function() {
          Subscription.subscribe(activity).success(function() {
            $scope.activity.subscribers.push($rootScope.currentUser._id);
          });
        };

        $scope.unsubscribe = function() {
          Subscription.unsubscribe(activity).success(function() {
            var index = $scope.activity.subscribers.indexOf($rootScope.currentUser._id);
            $scope.activity.subscribers.splice(index, 1);
          });
        };
        
        $scope.isDone = function() {
            if ($rootScope.currentUser) {
                return $scope.activity.doneIt.indexOf($rootScope.currentUser._id) !== -1;
            }
        };
        
        $scope.markDone = function() {
          DoneIt.markDone(activity).success(function() {
            $scope.activity.doneIt.push($rootScope.currentUser._id);
          });
        };
        
        $scope.markUndone = function() {
          DoneIt.markUndone(activity).success(function() {
            var index = $scope.activity.doneIt.indexOf($rootScope.currentUser._id);
            $scope.activity.doneIt.splice(index, 1);
          });
        };
        
        $scope.addTips = function(tip) {
          $scope.activity.tips.push(tip);
          Tips.addTip(activity).success(function() {
            $scope.tip = '';
          });
        };
        
        $scope.acceptActivity = function(userId) {
            Accept.acceptActivity(activity, userId).success(function() {
                $alert({
                    content: 'Activity has been added.',
                    placement: 'top-right',
                    type: 'success',
                    duration: 3
                  });
                $location.path('/admin');
            });
        };
        
        $scope.deleteActivity = function() {
            Delete.deleteActivity(activity).success(function() {
                $alert({
                    content: 'Activity deleted',
                    placement: 'top-right',
                    type: 'material',
                    duration: 3
                });
                $location.path('/admin');
            });
        };

      });
    }]);