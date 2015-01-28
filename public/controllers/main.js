angular.module('MyApp')
  .controller('MainCtrl', ['$scope', 'fb_appId', '$window', '$location', 'Activity', function($scope, fb_appId, $window, $location, Activity) {
    $scope.cities = ['Bangalore', 'Delhi', 'Mumbai'];
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/

      $scope.activ = [];
      $scope.pagenumber = 1;
      $scope.gDesc = '';
      $scope.city = "Bangalore";

    $scope.genres = ['Active', 'Posh', 'Calm', 'Adventure', 'Fun', 'Dark'];
    
    $scope.headingTitle = 'all activities';
    
    $scope.sortOrder = 'timeAdded';
    $scope.activities = Activity.query({ page: 1,  sortOrder: $scope.sortOrder, city: $scope.city });
    $scope.activ.push($scope.activities);

    $scope.filterByCity = function(city) {
      $scope.city = city;
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
    };
    
    $scope.filterByGenre = function(genre) {
      //$scope.activities = Activity.query({ genre: genre, page: 1, sortOrder: $scope.sortOrder });
      $scope.activ = [];
      $scope.activ.push(Activity.query({ genre: genre, page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.headingTitle = genre;

      if (genre == 'Active') {
        $scope.gDesc = "Look, the sun is out. Go for a run, climb a mountain, learn to dance, or play a game. You are not meant to sit in a chair. Just get up, put the sneakers on and leave the world behind.";
      } else if (genre == 'Posh') {
        $scope.gDesc = "Enough with the bourgeois. Simplicity is overrated and beige is boring. Nah, choose to be a diva instead. Splurge on luxuries, fine dining and upscale shopping. Paint the town bright, bold red.";
      } else if (genre == 'Calm') {
        $scope.gDesc = "You work hard. Or probably don't. But you deserve to relax a little. Walk in a park, check out a museum, find a cafe, read a book, or watch a play. Blur the city noise and find your nirvana.";
      } else if (genre == 'Adventure') {
        $scope.gDesc = 'Do something new today. Something you have never done before. Something different, something crazy. Throw caution to the wind and enter the realm of unknown.';
      } else if (genre == 'Fun') {
        $scope.gDesc = 'Go to a club, hang out with old friends or make new ones, mix it up with laughter and karaoke, set the dance floor ablaze. Abandon the real world and just crank the volume up.';
      } else if (genre == 'Dark') {
        $scope.gDesc = 'Legend is, there lives someone who wakes up at sundown, roams the dark alleys in search of hidden watering holes and turns every night into a legendary one. Is that someone, you?';
      }

      $scope.displayMenu();
    };
    
    $scope.allActivities = function(){
      //$scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder });
      $scope.activ = [];
      $scope.activ.push(Activity.query({ page: 1, sortOrder: $scope.sortOrder, city: $scope.city }));
      $scope.headingTitle = "all activities";
      $scope.gDesc = '';
      $scope.displayMenu();
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
      } else if (sortType === 2) {
        $scope.sortOrder = 'popularity';
      } else if (sortType === 3) {
        $scope.sortOrder = 'dateOfActivity';
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

      // ----------------------------------------------- For Navbar --------------------------------------------- //

      $scope.go = function (path) {
        $location.path(path);
      };

      $scope.displayMenu = function () {
        var elem = document.getElementById("filter-container");
        var container = document.getElementById("mood-def");
        if (elem.style.display == "block") {
          elem.style.display = "none";
          container.style.marginTop = "0px";
        } else {
          elem.style.display = "block";
          container.style.marginTop = "160px";
        }
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

      $('.close-modal').click(function() {
        $(this).closest('.modal').fadeOut('fast');
      });

      // -------------- for slider

      var $firstSlide = $('.slide:first-child');
      var $lastSlide = $('.slide:last-child');
      $('.slide:not(".js-active")').hide();
      $('.js-control-left').click(function() {
        if ($('li.js-active').index() == 0) {
          $('.js-active').fadeOut(500).removeClass('js-active');
          $lastSlide.toggleClass('js-active').fadeIn(500);
        } else {
          $('.js-active').fadeOut(500).removeClass('js-active').prev('li').toggleClass('js-active').fadeIn(500);
        }
      });
      $('.js-control-right').click(function() {
        if ($('li.js-active').index() == 3) {
          $('.js-active').fadeOut(500).removeClass('js-active');
          $firstSlide.toggleClass('js-active').fadeIn(500);
        } else {
          $('.js-active').removeClass('js-active').fadeOut(500).next('li').toggleClass('js-active').fadeIn(500);
        }
      });

  }]);