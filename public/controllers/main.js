angular.module('MyApp')
  .controller('MainCtrl', ['$scope', 'fb_appId', '$window', 'Activity', function($scope, fb_appId, $window, Activity) {
    /*$scope.city = ['Bangalore', 'Delhi'];*/
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/

      $scope.activ = [];
      $scope.pagenumber = 1;

      $(function () {
        $(".js-filter-activity:not(.js-activity-holder)").click(function() {
          $('.js-activity-holder').slideToggle(200);
        });
      });

    $scope.genres = ['Athletic Activities', 'Fitness Classes', 'Hiking & Biking',
                     'Nature Appreciation', 'Bars', 'Breweries & Distilleries',
                      'Featured Cocktails', 'Happy Hours', 'Classes', 'Exhibits & Galleries',
                      'Brunch & Breakfast', 'Lunch', 'Dinner', 'Sweet Treats', 'Food Trucks & Pop-Ups',
                      'Tea & Coffeeshops', 'Concerts', 'Fun & Games', 'Nightlife & Parties',
                      'Theater & Shows', 'Activites for Two', 'Food & Dining', 'Bars & Drinking'];
    
    $scope.headingTitle = 'all activities';
    
    $scope.sortOrder = 'timeAdded';
    $scope.activities = Activity.query({ page: 1,  sortOrder: $scope.sortOrder });

    /*$scope.filterByCity = function(genre) {
      $scope.activities = Activity.query({ city: city });
      $scope.headingTitle = city;
    };*/
    
    $scope.filterByGenre = function(genre) {
      $scope.activities = Activity.query({ genre: genre, page: 1, sortOrder: $scope.sortOrder });
      $scope.headingTitle = genre;
    };
    
    $scope.allActivities = function(){
      $scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder });
      $scope.headingTitle = "all activities";
      displayMenu();
    };

    $scope.pageClick = function() {
      if ($scope.headingTitle !== "all activities") {
        $scope.pagenumber += 1;
        $scope.activ.push(Activity.query({ genre: $scope.headingTitle, page: $scope.pagenumber, sortOrder: $scope.sortOrder }));
      } else {
        $scope.pagenumber += 1;
        $scope.activ.push(Activity.query({ page: $scope.pagenumber, sortOrder: $scope.sortOrder }));
      }
    };
    
    $scope.sort = function(sortType) {
      if (sortType === 1) {
        $scope.sortOrder = 'timeAdded';
      } else if (sortType === 2) {
        $scope.sortOrder = 'dateOfActivity';
      } else if (sortType === 3) {
        $scope.sortOrder === 'popularity';
      }
      if ($scope.headingTitle !== "all activities") {
        $scope.activities = Activity.query({ genre: $scope.headingTitle, page: 1, sortOrder: $scope.sortOrder });
      } else {
        $scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder });
      }
    };

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