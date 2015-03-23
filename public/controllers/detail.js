// Changes made

angular.module('MyApp')
  .controller('DetailCtrl', ['$scope', '$interval', '$rootScope', '$window', '$routeParams', '$location', '$alert', '$upload', 'fb_appId', 'Activity', 'Profile', 'Subscription', 'DoneIt', 'Tips', 'Selfies', 'Accept', 'Delete', 'Session', 'Auth',
                             function($scope, $interval, $rootScope, $window, $routeParams, $location, $alert, $upload, fb_appId, Activity, Profile, Subscription, DoneIt, Tips, Selfies, Accept, Delete, Session, Auth) {

         $window.scrollTo(0,0);                                 // To scroll to the top of the page

         $scope.session = Session;

         $scope.session.success(function(data) {
             if (data.session != 'OK') {
                 $window.fbAsyncInit = function () {
                     FB.init({
                         appId: fb_appId,
                         responseType: 'token',
                         version: 'v2.2',
                         cookie: true,
                         status: true,
                         xfbml: true
                     });

                     Auth.logout();
                 };
             }
         });

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

      Activity.get({ _id: $routeParams.id }, function(activity) {
        $scope.activity = activity;

        //$scope.activities = Activity.query({limit: 3, id: activity._id});

        // Share dialog
        $scope.fb_share = function() {
            FB.ui({
                method: 'feed',
                name: activity.title,
                link: "http://joyage.in/activities/"+activity._id,
                //picture: 'https://s3-ap-southeast-1.amazonaws.com/joyage-images/1422006228358mCxtRgP.jpg',
                description: activity.description
            });
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


          $scope.subscriptions = activity.subscriptions;
          $scope.completions = activity.completions;

        $scope.isSubscribed = function() {
            if ($rootScope.currentUser) {
              return $scope.activity.subscribers.indexOf($rootScope.currentUser._id) !== -1;
            }
        };

        $scope.subscribe = function() {
          Subscription.subscribe(activity).success(function() {
            $scope.activity.subscribers.push($rootScope.currentUser._id);
            $scope.subscriptions += 1;
          });
        };

        $scope.unsubscribe = function() {
          Subscription.unsubscribe(activity).success(function() {
            var index = $scope.activity.subscribers.indexOf($rootScope.currentUser._id);
            $scope.activity.subscribers.splice(index, 1);
            $scope.subscriptions -= 1;
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
            $scope.completions += 1;
          });
        };

        $scope.markUndone = function() {
          DoneIt.markUndone(activity).success(function() {
            var index = $scope.activity.doneIt.indexOf($rootScope.currentUser._id);
            $scope.activity.doneIt.splice(index, 1);
            $scope.completions -= 1;
          });
        };

        if ($scope.activity.tipper.indexOf($rootScope.currentUser._id) == -1) {
            $scope.editTips = true;
        }

        $scope.addTips = function(tip) {
            if ($scope.activity.tipper.indexOf($rootScope.currentUser._id) == -1) {
                $scope.activity.tips.push(tip);
                Tips.addTip(activity).success(function () {
                    $scope.tip = '';
                });
                $window.location.reload();
            }
        };

      var selfie = '';
      if (!$scope.activity.selfie_sub) {
          $scope.activity.selfie_sub = [];
      }
      $scope.onSelfieSelect = function ($files) {
          console.log($files);
          if ($files.length === 1) {
              if ($scope.activity.selfie_sub.indexOf($rootScope.currentUser._id) == -1) {
                  for (var i = 0; i < $files.length; i++) {
                      var file = $files[i];
                      $scope.upload = $upload.upload({
                          url: '/uploadSelfie',
                          data: {myObj: $scope.myModelObj},
                          file: file,
                      }).progress(function (evt) {
                          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                      }).success(function (data, status, headers, config) {
                          selfie = data.imageurl;
                          $scope.selfieImg = selfie;
                          console.log('Selfie: '+selfie);
                      });
                  }
              } else {
                  $alert({
                      content: 'You can upload only one selfie per activity',
                      placement: 'top-right',
                      type: 'material',
                      duration: 3
                  });
              }
          } else {
              $alert({
                  content: 'You can upload only one selfie per activity',
                  placement: 'top-right',
                  type: 'material',
                  duration: 3
              });
          }
      };


     if ($scope.activity.selfie_sub.indexOf($rootScope.currentUser._id) == -1) {
          $scope.addS = true;
     }

      $scope.ii = [];
      var index = 24 - $scope.activity.selfiesNumber;
      for (var i=1; i<=index; i++) {
          $scope.ii.push(i);
      }

      var refreshes = 0;

      $interval(function () {

          if (refreshes < 1) {

              /*activity.selfies.forEach(function (self) {
                  var elem = document.getElementById(self.url);
                  var rand = Math.floor((Math.random() * 10) + 1) * 10;
                  if (rand < 50) {
                      rand += 50;
                  }
                  randS = rand.toString();
                  elem.style.width = randS + 'px';
                  elem.style.height = randS + 'px';
              });*/

              for (var i = 1; i <= index; i++) {
                  var elem = document.getElementById(i);
                  elem.style.width = '100px';
                  elem.style.height = '100px';
              }

          }

          refreshes += 1;

      }, 10);


      $scope.addSelfies = function() {
          if ($scope.activity.selfie_sub.indexOf($rootScope.currentUser._id) == -1) {
              $scope.activity.selfies = selfie;
              Selfies.addSelfie($scope.activity).success(function () {
                  $scope.selfies = '';
              });
              $window.location.reload();
          }
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

          // ----------------------------------------------------- Google Maps ---------------------------------------------------------- //

          var map;

          (function () {
              var is_internetExplorer11= navigator.userAgent.toLowerCase().indexOf('trident') > -1;
              var marker_url = ( is_internetExplorer11 ) ? 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/148866/cd-icon-location.png' : 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/148866/cd-icon-location_1.svg';

              if (activity.mapLat == 12.9539 && activity.mapLon == 77.6309) {
                  var mapZoom = 10;
              } else if (activity.mapLat == 28.6336 && activity.mapLon == 77.2225) {
                  var mapZoom = 10;
              } else if (activity.mapLat == 19.0822 && activity.mapLon == 72.8812) {
                  var mapZoom = 10;
              } else {
                  var mapZoom = 15;
              }

              //define the basic color of your map, plus a value for saturation and brightness
              var $main_color = '#47a2be',
                  $saturation= -20,
                  $brightness= 5;

              //we define here the style of the map
              var style= [
                  {
                      //set saturation for the labels on the map
                      elementType: "labels",
                      stylers: [
                          {saturation: $saturation}
                      ]
                  },
                  {   //poi stands for point of interest - don't show these lables on the map
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [
                          {visibility: "off"}
                      ]
                  },
                  {
                      //don't show highways lables on the map
                      featureType: 'road.highway',
                      elementType: 'labels',
                      stylers: [
                          {visibility: "off"}
                      ]
                  },
                  {
                      //don't show local road lables on the map
                      featureType: "road.local",
                      elementType: "labels.icon",
                      stylers: [
                          {visibility: "off"}
                      ]
                  },
                  {
                      //don't show arterial road lables on the map
                      featureType: "road.arterial",
                      elementType: "labels.icon",
                      stylers: [
                          {visibility: "off"}
                      ]
                  },
                  {
                      //don't show road lables on the map
                      featureType: "road",
                      elementType: "geometry.stroke",
                      stylers: [
                          {visibility: "off"}
                      ]
                  },
                  //style different elements on the map
                  {
                      featureType: "transit",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "poi",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "poi.government",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "poi.sport_complex",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "poi.attraction",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "poi.business",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "transit",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "transit.station",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "landscape",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]

                  },
                  {
                      featureType: "road",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "road.highway",
                      elementType: "geometry.fill",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  },
                  {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [
                          { hue: $main_color },
                          { visibility: "on" },
                          { lightness: $brightness },
                          { saturation: $saturation }
                      ]
                  }
              ];

              var mapOptions = {
                  zoom: mapZoom,
                  center: new google.maps.LatLng(activity.mapLat, activity.mapLon),
                  mapTypeControl: false,
                  panControl: false,
                  zoomControl: false,
                  streetViewControl: false,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  scrollwheel: false,
                  styles: style,
              };
              map = new google.maps.Map(document.getElementById('google-container'),
                  mapOptions);

              var marker = new google.maps.Marker({
                  position: new google.maps.LatLng(activity.mapLat, activity.mapLon),
                  map: map,
                  title: activity.location,
                  animation: google.maps.Animation.DROP,
                  icon: marker_url,
                  visible: true
              });

              //add custom buttons for the zoom-in/zoom-out on the map
              function CustomZoomControl(controlDiv, map) {
                  //grap the zoom elements from the DOM and insert them in the map
                  var controlUIzoomIn= document.getElementById('cd-zoom-in'),
                      controlUIzoomOut= document.getElementById('cd-zoom-out');
                  controlDiv.appendChild(controlUIzoomIn);
                  controlDiv.appendChild(controlUIzoomOut);

                  // Setup the click event listeners and zoom-in or out according to the clicked element
                  google.maps.event.addDomListener(controlUIzoomIn, 'click', function() {
                      map.setZoom(map.getZoom()+1)
                  });
                  google.maps.event.addDomListener(controlUIzoomOut, 'click', function() {
                      map.setZoom(map.getZoom()-1)
                  });
              }

              var zoomControlDiv = document.createElement('div');
              var zoomControl = new CustomZoomControl(zoomControlDiv, map);

              //insert the zoom div on the top left of the map
              map.controls[google.maps.ControlPosition.LEFT_TOP].push(zoomControlDiv);

              function toggleBounce() {
                  if (marker.getAnimation() != null) {
                      marker.setAnimation(null);
                  } else {
                      marker.setAnimation(google.maps.Animation.BOUNCE);
                  }
              };

              google.maps.event.addListener(marker, 'click', toggleBounce);

          }());
          google.maps.event.addDomListener(window, 'load');

          // ---------------------------------------------- Google Maps end -------------------------------------- //

      $(function (){

          $('.open-modal').click(function() {
              var el = $(this)[0],
                  classes = el.className.split(/\s+/);
              for(var i = 0; i < classes.length; i++) {
                  if(classes[i].match(/modal-/)) {
                      var modalClass = classes[i];
                      $('.modal.' + modalClass).fadeIn('fast');
                  }
              }
          });

          $('.close-modal').click(function() {
              $(this).closest('.modal').fadeOut('fast');
          });

          $('.button-facebook').click(function(){
              $(this).toggleClass("button-facebook-fill");
          });
      }());

      });

     // ----------------------------------------------- For Navbar --------------------------------------------- //

     $scope.go = function (path) {
         $location.path(path);
     };

     $scope.userMenu = function() {
         var elem = document.getElementById("user-menu-drawer");
         if (elem.style) {
             if (elem.style.display == 'block') {
                 elem.style.display = 'none';
             } else {
                 elem.style.display = 'block';
             }
         }
     };

     // -------------- for modal

     $('.open-modal').click(function() {
         var el = $(this)[0],
             classes = el.className.split(/\s+/);
         for(var i = 0; i < classes.length; i++) {
             if(classes[i].match(/modal-/)) {
                 var modalClass = classes[i];
                 $('.modal.' + modalClass).fadeIn('fast');
             }
         }
     });

    }]);