angular.module('MyApp')
  .controller('MainCtrl', ['$scope', '$interval', '$rootScope', '$routeParams','fb_appId', 'fb_connect', '$window', '$location', 'Activity', 'Session', 'SessionO', 'Auth', 'Subscription',
      function($scope, $interval, $rootScope, $routeParams, fb_appId, fb_connect, $window, $location, Activity, Session, SessionO, Auth, Subscription) {

    $scope.cities = ['Bangalore', 'Delhi', 'Mumbai'];
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/

      if (!$rootScope.currentUser) {
        $location.path('/');
      }

    $window.scrollTo(0,0);

    $scope.sortOrders = ['New on Joyage', 'Popular', 'Upcoming'];


    // --------------------- Test and consider using for token errors ----------------------- //

    /*$scope.session.error(function(err) {
      $window.location = '/login';
    });*/

    var refreshes = 0;

    $interval(function () {

      if (refreshes < 1) {

        Session.success(function(data) {

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

          if ($routeParams.cit) {
            $scope.city = $routeParams.cit;
            $rootScope.city = $scope.city;
          }
          else if ($rootScope.city) {
            $scope.city = $rootScope.city;
          } else {
            if (data.city) {
              $scope.city = data.city;
            } else {
              $scope.city = 'Bangalore';
            }
          }

          if ($rootScope.genre) {
            $scope.gDesc = $scope.gD[$rootScope.genre];
            $scope.genre = $rootScope.genre;
          } else {
            $scope.gDesc = $scope.gD[''];
            $scope.genre = '';
          }

          if ($rootScope.sortOrder) {
            $scope.sortOrder = $rootScope.sortOrder;
            if ($scope.sortOrder == 'timeAdded') $scope.sortSelected = $scope.sortOrders[0];
            else if ($scope.sortOrder == 'popularity') $scope.sortSelected = $scope.sortOrders[1];
            else if ($scope.sortOrder == 'dateOfActivity') $scope.sortSelected = $scope.sortOrders[2];
          } else {
            $scope.sortOrder = 'timeAdded';
            $scope.sortSelected = $scope.sortOrders[0];
          }

          if ($scope.genre != '') $scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city, genre: $scope.genre });
          else $scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder,city: $scope.city });
          $scope.activ.push($scope.activities);

          for (var i=0; i<$scope.genres.length; i++) {
            var el = document.getElementById($scope.genres[i]);
            el.style.color = 'black';
          }

          document.getElementById($scope.genre).style.color = 'rgba(71,162,190,1)';
          if ($scope.genre == '') document.getElementById('allActivs').style.color = 'rgba(71,162,190,1)';
          else document.getElementById('allActivs').style.color = 'black';

          var elem = document.getElementById("gImg");
          if ($scope.genre == 'Active') elem.src="/img/Active-Mood.jpg";
          else if ($scope.genre == 'Posh') elem.src="/img/Posh-Mood.jpg";
          else if ($scope.genre == 'Calm') elem.src="/img/Calm-Mood.jpg";
          else if ($scope.genre == 'Adventure') elem.src="/img/Adventure-Mood.jpg";
          else if ($scope.genre == 'Party') elem.src="/img/Party-Mood.jpg";
          else if ($scope.genre == 'Underground') elem.src="/img/Underground-Mood.jpg";
          else if ($scope.genre == '') elem.src="/img/All-Mood.jpg";

          document.getElementById("overlay").style.display = 'block';

        });

      }

      refreshes += 1;

    }, 1);

    $scope.sessionO = SessionO;
    $scope.sessionO.success(function(){});

    $scope.activ = [];
    $scope.pagenumber = 1;
    $scope.gD = {
      'Active': "Look, the sun is out. Go for a run, climb a mountain, learn to dance or play a game. Just get up, put the sneakers on and leave the world behind.",
      'Posh': "Enough with the bourgeois. Simplicity is overrated and beige is boring. Nah, choose to be a diva instead. Splurge on luxury, fine dining and upscale shopping. Paint the town bright, bold red.",
      'Calm': "You work hard. Or probably don't. But you deserve to relax a little. Walk in a park, check a museum, find a cafe, read a book, or watch a play. Blur the city noise and find your nirvana.",
      'Adventure': "Do something new today. Something you have never done before. Something different, something crazy. Throw caution to the wind. Enter the realm of unknown.",
      'Party': "Go to a club, hang out with old friends, or make new ones. Mix it up with laughter and karaoke, set the dance floor ablaze. Abandon the real world and just crank the volume up.",
      'Underground': "Legend goes, the beastly creatures of underworld wake up at sundown, roam the dark alleys in search of hidden watering holes and turn every night into a legendary one."
    };

    $scope.genres = ['Active', 'Posh', 'Calm', 'Adventure', 'Party', 'Underground'];


        //-------------------------------- Filter by City -------------------------------------//


    $scope.filterByCity = function(city) {
      $scope.pagenumber = 1;
      $scope.city = city;
      $scope.activ = [];
      if ($scope.genre == '') $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      else $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city, genre: $scope.genre }));
    };


        //-------------------------------- Filter by Genre -------------------------------------//


    $scope.filterByGenre = function(genre) {
      $scope.pagenumber = 1;
      $scope.activ = [];
      $scope.activ.push(Activity.query({ genre: genre, page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.genre = genre;
      $rootScope.genre = genre;

      for (var i=0; i<$scope.genres.length; i++) {
        var el = document.getElementById($scope.genres[i]);
        el.style.color = 'black';
      }
      document.getElementById(genre).style.color = 'rgba(71,162,190,1)';

      document.getElementById('allActivs').style.color = 'black';

      $scope.gDesc = $scope.gD[genre];

      var elem = document.getElementById("gImg");
      if (genre == 'Active') elem.src="/img/Active-Mood.jpg";
      else if (genre == 'Posh') elem.src="/img/Posh-Mood.jpg";
      else if (genre == 'Calm') elem.src="/img/Calm-Mood.jpg";
      else if (genre == 'Adventure') elem.src="/img/Adventure-Mood.jpg";
      else if (genre == 'Party') elem.src="/img/Party-Mood.jpg";
      else if (genre == 'Underground') elem.src="/img/Underground-Mood.jpg";
      else if ($scope.genre == '') elem.src="/img/All-Mood.jpg";

      document.getElementById("overlay").style.display = 'block';

    };


        //-------------------------------- All activities -------------------------------------//


    $scope.allActivities = function(){
      $scope.pagenumber = 1;
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city}));

      $scope.genre = '';
      $rootScope.genre = '';
      $scope.gDesc = '';
      var elem = document.getElementById("gImg");
      elem.src="/img/All-Mood.jpg";
      document.getElementById("overlay").style.display = 'none';
      document.getElementById('allActivs').style.color = 'rgba(71,162,190,1)';
      for (var i=0; i<$scope.genres.length; i++) {
        var el = document.getElementById($scope.genres[i]);
        el.style.color = 'black';
      }
    };


        //-------------------------------- Show more button -------------------------------------//


    $scope.pageClick = function() {
      $scope.pagenumber += 1;
      if ($scope.genre == '') $scope.activ.push(Activity.query({ page: $scope.pagenumber, sortOrder: $scope.sortOrder, city: $scope.city }));
      else $scope.activ.push(Activity.query({ page: $scope.pagenumber, sortOrder: $scope.sortOrder, city: $scope.city, genre: $scope.genre }));
    };


        //----------------------------------- Sort Order ----------------------------------------//

    
    $scope.sort = function(sortType) {
      $scope.pagenumber = 1;
      if (sortType === 1) {
        $scope.sortOrder = 'timeAdded';
        $scope.sortSelected = $scope.sortOrders[0];
      } else if (sortType === 2) {
        $scope.sortOrder = 'popularity';
        $scope.sortSelected = $scope.sortOrders[1];
      } else if (sortType === 3) {
        $scope.sortOrder = 'dateOfActivity';
        $scope.sortSelected = $scope.sortOrders[2];
      }

      $rootScope.sortOrder = $scope.sortOrder;

      $scope.activ = [];
      if ($scope.genre = '') $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      else $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city, genre: $scope.genre }));

    };


      $scope.isSubscribed = function (activity) {
        if (activity.subscribers.indexOf($rootScope.currentUser._id) != -1) {
          return true
        } else {
          return false
        }
      };

        $scope.subscribe = function (activity) {
          poster = document.getElementById('posterSub');
          poster.src = 'img/favicon2.png';
          Subscription.subscribe(activity).success(function() {
            activity.subscribers.push($rootScope.currentUser._id);
          });
        };

        $scope.unsubscribe = function (activity) {
          poster = document.getElementById('posterUnsub');
          poster.src = 'img/favicon.png';
          Subscription.unsubscribe(activity).success(function() {
            var index = activity.subscribers.indexOf($rootScope.currentUser._id);
            activity.subscribers.splice(index, 1);
          });
        };

    $scope.search = function() {                                  // Will not be required with infinite scroll


      //$scope.pageClick();
      //$scope.pageClick();
    };

      // ----------------------------------------------- For dynamic page elements --------------------------------------------- //

      $scope.userMenu = function() {
        var elem = document.getElementById("user-menu-drawer");
        if (elem) {
          if (elem.style) {
            if (elem.style.display == 'block') {
              elem.style.display = 'none';
            } else {
              elem.style.display = 'block';
            }
          }
        }
      };

      $scope.sortMenu = function() {
        var elem = document.getElementById("sort-menu-drawer");
        if (elem) {
          if (elem.style) {
            if (elem.style.display == 'block') {
              elem.style.display = 'none';
            } else {
              elem.style.display = 'block';
            }
          }
        }
      };

      $scope.cityMenu = function() {
        var elem = document.getElementById("city-menu-drawer");
        if (elem) {
          if (elem.style) {
            if (elem.style.display == 'block') {
              elem.style.display = 'none';
            } else {
              elem.style.display = 'block';
            }
          }
        }
      };

  }]);