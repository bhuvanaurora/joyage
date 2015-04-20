angular.module('MyApp')
  .controller('MainCtrl', ['$scope', '$rootScope', 'fb_appId', '$window', '$location', 'Activity', 'Session', 'SessionO', 'Auth', 'Subscription', 'Location',
      function($scope, $rootScope, fb_appId, $window, $location, Activity, Session, SessionO, Auth, Subscription, Location) {

    $scope.cities = ['Bangalore', 'Delhi', 'Mumbai'];
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/

      if (!$rootScope.currentUser) {
        $location.path('/');
      }

    $window.scrollTo(0,0);

    $scope.sortOrders = ['New on Joyage', 'Popular', 'Upcoming'];

    $scope.session = Session;


    Location.get(function(location) {
      console.log(location.gD);
    });

    // --------------------- Test and consider using for token errors ----------------------- //

    /*$scope.session.error(function(err) {
      $window.location = '/login';
    });*/

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
    $scope.gDesc = $scope.gD['Active'];
    $scope.city = "Bangalore";
    $scope.sortSelected = 'New on Joyage';

    $scope.genres = ['Active', 'Posh', 'Calm', 'Adventure', 'Party', 'Underground'];
    $scope.genre = 'Active';
    
    $scope.headingTitle = 'all activities';
    
    $scope.sortOrder = 'timeAdded';

    $scope.activities = Activity.query({ page: 1,  sortOrder: $scope.sortOrder, city: $scope.city, genre: $scope.genre });
    $scope.activ.push($scope.activities);

    $scope.filterByCity = function(city) {
      $scope.city = city;
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city, genre: $scope.genre }));
    };


    $scope.filterByGenre = function(genre) {
      $scope.activ = [];
      $scope.activ.push(Activity.query({ genre: genre, page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.headingTitle = genre;
      $scope.genre = genre;

      var elem = document.getElementById("gImg");
      var bcg = document.getElementById(genre);
      for (var i=0; i<$scope.genres.length; i++) {
        var el = document.getElementById($scope.genres[i]);
        el.style.color = 'black';
      }

      bcg.style.color = 'rgba(71,162,190,1)';

      $scope.gDesc = $scope.gD[genre];

      if (genre == 'Active') {

        elem.src="/img/Active-Mood.jpg";

      } else if (genre == 'Posh') {

        elem.src="/img/Posh-Mood.jpg";

      } else if (genre == 'Calm') {

        elem.src="/img/Calm-Mood.jpg";

      } else if (genre == 'Adventure') {

        elem.src="/img/Adventure-Mood.jpg";

      } else if (genre == 'Party') {

        elem.src="/img/Party-Mood.jpg";

      } else if (genre == 'Underground') {

        elem.src="/img/Underground-Mood.jpg";

      }

    };

    $scope.allActivities = function(){
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.headingTitle = "all activities";
      var bcg1 = document.getElementById('allActivs');
      //bcg1.style.backgroundColor = "#e2e2e2";
    };

    $scope.pageClick = function() {
      if ($scope.headingTitle !== "all activities") {
        $scope.pagenumber += 1;
        $scope.activ.push(Activity.query({ genre: $scope.headingTitle, page: $scope.pagenumber, sortOrder: $scope.sortOrder, city: $scope.city }));
      } else {
        $scope.pagenumber += 1;
        $scope.activ.push(Activity.query({ page: $scope.pagenumber, sortOrder: $scope.sortOrder, city: $scope.city }));
      }
    };
    
    $scope.sort = function(sortType) {
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

      if ($scope.headingTitle !== "all activities") {
        $scope.activ = [];
        $scope.activ.push(Activity.query({ genre: $scope.headingTitle, page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      } else {
        $scope.activ = [];
        $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      }
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