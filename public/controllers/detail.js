// Changes made

angular.module('MyApp')
  .controller('DetailCtrl', ['$scope', '$rootScope', '$window', '$routeParams', '$location', '$alert', '$upload', 'fb_appId', 'Activity', 'Profile', 'Subscription', 'DoneIt', 'Tips', 'Selfies', 'Accept', 'Delete',
                             function($scope, $rootScope, $window, $routeParams, $location, $alert, $upload, fb_appId, Activity, Profile, Subscription, DoneIt, Tips, Selfies, Accept, Delete) {

         // -------------- for modal

         $('.open-modal').click(function() {
             console.log("Modal");
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
            FB.ui({
                method: 'feed',
                name: activity.title,
                link: "http://joyage.in/activities/"+activity._id,
                //picture: response.image,
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
      $scope.onSelfieSelect = function ($files) {
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

          $scope.addS = true;
      if ($scope.activity.selfie_sub.indexOf($rootScope.currentUser._id) == -1) {
          $scope.addS = false;
      }

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

              if (activity.mapLat == 12.9667 && activity.mapLon == 77.5667) {
                  var mapZoom = 10;
              } else {
                  var mapZoom = 15;
              }

              //define the basic color of your map, plus a value for saturation and brightness
              var $main_color = '#2d313f',
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
          /*$(".js-navigation").click (function(){
              $(this).toggleClass("js-open-nav");
              $("nav").toggleClass("js-open-nav");
          });

          $('.js-filter-activity:not(.js-activity-holder)').click(function() {
              $('.js-activity-holder').slideToggle(200);
          });

          $('.js-filter-place:not(.js-place-holder)').click(function() {
              $('.js-place-holder').slideToggle(200);
          });

          $(document).ready(function() { // for city select dropdown
              $('.js-city-select').click(function() {
                  $('.js-city-select-drawer').fadeToggle('fast', function() {
                      // Animation complete
                  });
                  return false;
              });
          });*/
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

     $(".js-navigation").click (function(){
         $(this).toggleClass("js-open-nav");
         $("nav").toggleClass("js-open-nav");
     });

     $(".js-filter-activity:not(.js-activity-holder)").click(function() {
         $('.js-activity-holder').slideToggle(200);
     });

     $('.js-filter-place:not(.js-place-holder)').click(function() {
         $('.js-place-holder').slideToggle(200);
     });

     $(document).ready(function() {

         $('.js-city-select').click(function() {
             $('.js-city-select-drawer').fadeToggle('fast', function() {
                 // Animation complete
             });
             return false;
         });

         // Even when the window is resized, run this code.
         $(window).resize(function(){

             // Variables
             var windowHeight = $(window).height();

             // Find the value of 90% of the viewport height
             var ninetypercent = .085 * windowHeight;

             // When the document is scrolled ninety percent, toggle the classes
             // Does not work in iOS 7 or below
             // Hasn't been tested in iOS 8
             $(document).scroll(function(){

                 // Store the document scroll function in a variable
                 var y = $(this).scrollTop();

                 // If the document is scrolled 90%
                 if( y > ninetypercent) {
                     $('.js-main-header').addClass('js-sticky-header');
                 } else {
                     $('.js-main-header').removeClass('js-sticky-header');
                 }
             });

             // Call it on resize.
         }).resize();

     });



    }]);