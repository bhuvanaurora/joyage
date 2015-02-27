angular.module('MyApp')
  .controller('MainCtrl', ['$scope', '$rootScope', 'fb_appId', '$window', '$location', 'Activity', 'Session', 'Auth', 'Subscription',
      function($scope, $rootScope, fb_appId, $window, $location, Activity, Session, Auth, Subscription) {

    $scope.cities = ['Bangalore', 'Delhi', 'Mumbai'];
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/

      if (!$rootScope.currentUser) {
        $location.path('/login');
      }

    $window.scrollTo(0,0);

    $scope.sortOrders = ['New on Joyage', 'Popular', 'Upcoming'];

    $scope.session = Session;

    // --------------------- Test and consider using for token errors ----------------------- //

    /*$scope.session.error(function(err) {
      $window.location = '/login';
    });*/

    $scope.session.success(function(data) {
      if (data.session == 'expired') {
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

    $scope.activ = [];
    $scope.pagenumber = 1;
    $scope.gDesc = '';
    $scope.city = "Bangalore";
    $scope.sortSelected = 'New on Joyage';

    $scope.genres = ['Active', 'Posh', 'Calm', 'Adventure', 'Party', 'Dark'];
    
    $scope.headingTitle = 'all activities';
    
    $scope.sortOrder = 'timeAdded';
    $scope.activities = Activity.query({ page: 1,  sortOrder: $scope.sortOrder, city: $scope.city });
    $scope.activ.push($scope.activities);

    $scope.filterByCity = function(city) {
      $scope.city = city;
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
    };

    /*function bgColorSwitch () {
      for (var i=0; i<6; i++) {
        var bcg1 = document.getElementById($scope.genres[i]);
        bcg1.style.backgroundColor = "#f2f2f2";
      }
      var bcg1 = document.getElementById('allActivs');
      bcg1.style.backgroundColor = "#f2f2f2";
    }*/

    function bgColorSwitch (color) {
      title = document.getElementsByClassName('heading-title');
      for (var i=0; i<title.length ;i++) {
        console.log(title[i]);
        title[i].style.color = color;
        console.log(title[i].style.color);
      }
    }

    $scope.filterByGenre = function(genre) {
      //$scope.activities = Activity.query({ genre: genre, page: 1, sortOrder: $scope.sortOrder });
      $scope.activ = [];
      $scope.activ.push(Activity.query({ genre: genre, page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.headingTitle = genre;

      var elem = document.getElementById("gImg");

      if (genre == 'Active') {

        elem.src="/img/Active-Mood.jpg";
        var bcg = document.getElementById(genre);
        bgColorSwitch("#e6214e");

      } else if (genre == 'Posh') {

        elem.src="/img/Posh-Mood.jpg";
        var bcg = document.getElementById(genre);
        bgColorSwitch("#1d58d0");

      } else if (genre == 'Calm') {

        elem.src="/img/Calm-Mood.jpg";
        var bcg = document.getElementById(genre);
        //bgColorSwitch();

      } else if (genre == 'Adventure') {

        elem.src="/img/Adventure-Mood.jpg";
        var bcg = document.getElementById(genre);
        //bgColorSwitch();

      } else if (genre == 'Party') {

        elem.src="/img/Party-Mood.jpg";
        var bcg = document.getElementById(genre);
        //bgColorSwitch();

      } else if (genre == 'Dark') {

        elem.src="/img/Dark-Mood.jpg";
        var bcg = document.getElementById(genre);
        //bgColorSwitch();

      }

    };

    $scope.allActivities = function(){
      //$scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder });
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.headingTitle = "all activities";
      $scope.gDesc = '';
      bgColorSwitch("#e6214e");
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
      $scope.pageClick();
      $scope.pageClick();
    };

      // ----------------------------------------------- For dynamic page elements --------------------------------------------- //

      $scope.go = function (path) {
        $location.path(path);
      };

      $scope.displayMenu = function () {

        var elem = document.getElementById("nav-city");
        var container = document.getElementById("city-drop-text");
        elem.style.display = "block";
        container.style.marginTop = "88px";

      };

      $scope.closeMenu = function () {

        var elem = document.getElementById("nav-city");
        var container = document.getElementById("city-drop-text");
        elem.style.display = "none";
        container.style.marginTop = "0px";

      };

      $scope.displayMenu1 = function () {

        var elem = document.getElementById("nav-sort");
        var container = document.getElementById("sort-drop-text");
        elem.style.display = "block";
        container.style.marginTop = "88px";

      };

      $scope.closeMenu1 = function () {

        var elem = document.getElementById("nav-sort");
        var container = document.getElementById("sort-drop-text");
        elem.style.display = "none";
        container.style.marginTop = "0px";

      };

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

  }]);