angular.module('MyApp')
  .controller('MainCtrl', ['$scope', '$rootScope', 'fb_appId', '$window', '$location', 'Activity', 'Session', 'Auth',
      function($scope, $rootScope, fb_appId, $window, $location, Activity, Session, Auth) {

    $scope.cities = ['Bangalore', 'Delhi', 'Mumbai'];
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/

      /*if (!$rootScope.currentUser) {
        $location.path('/login');
      }*/

    $scope.sortOrders = ['New on Joyage', 'Popular', 'Upcoming'];

    $scope.session = Session;

    $scope.session.success(function(data) {
      console.log('Data: '+data.session);

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

    function bgColorSwitch () {
      for (var i=0; i<6; i++) {
        var bcg1 = document.getElementById($scope.genres[i]);
        bcg1.style.backgroundColor = "#f2f2f2";
      }
      var bcg1 = document.getElementById('allActivs');
      bcg1.style.backgroundColor = "#f2f2f2";
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
        bgColorSwitch();
        bcg.style.backgroundColor = "#e2e2e2";

      } else if (genre == 'Posh') {

        elem.src="/img/Posh-Mood.jpg";
        var bcg = document.getElementById(genre);
        bgColorSwitch();
        bcg.style.backgroundColor = "#e2e2e2";

      } else if (genre == 'Calm') {

        elem.src="/img/Calm-Mood.jpg";
        var bcg = document.getElementById(genre);
        bgColorSwitch();
        bcg.style.backgroundColor = "#e2e2e2";

      } else if (genre == 'Adventure') {

        elem.src="/img/Adventure-Mood.jpg";
        var bcg = document.getElementById(genre);
        bgColorSwitch();
        bcg.style.backgroundColor = "#e2e2e2";

      } else if (genre == 'Party') {

        elem.src="/img/Party-Mood.jpg";
        var bcg = document.getElementById(genre);
        bgColorSwitch();
        bcg.style.backgroundColor = "#e2e2e2";

      } else if (genre == 'Dark') {

        elem.src="/img/Dark-Mood.jpg";
        var bcg = document.getElementById(genre);
        bgColorSwitch();
        bcg.style.backgroundColor = "#e2e2e2";

      }

    };

    var bcg1 = document.getElementById('allActivs');
    bcg1.style.backgroundColor = "#e2e2e2";
    
    $scope.allActivities = function(){
      //$scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder });
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.headingTitle = "all activities";
      $scope.gDesc = '';
      bgColorSwitch();
      var bcg1 = document.getElementById('allActivs');
      bcg1.style.backgroundColor = "#e2e2e2";
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
        if (elem.style) {
          if (elem.style.display == 'block') {
            elem.style.display = 'none';
          } else {
            elem.style.display = 'block';
          }
        }
      };

  }]);