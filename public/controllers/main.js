angular.module('MyApp')
  .controller('MainCtrl', ['$scope', 'fb_appId', '$window', 'Activity', function($scope, fb_appId, $window, Activity) {
    /*$scope.city = ['Bangalore', 'Delhi'];*/
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/

      $scope.activities = [];

      $(function () {
        $(".js-filter-activity:not(.js-activity-holder)").click(function() {
          $('.js-activity-holder').slideToggle(200);
        });
      });
    
    // Asynchronously initialize FB SDK
    $window.fbAsyncInit = function() {
      FB.init({
        appId: fb_appId,
        responseType: 'token',
        version: 'v2.2',
        cookie: true,
        status: true,
        xfbml: true
      });
      
      // Share dialog
      /*$scope.fb_share = function() {
        FB.ui({
          method: 'share_open_graph',
          action_type: 'og.likes',
          action_properties: JSON.stringify({
            object: 'https://developers.facebook.com/docs/'
          })
        }, function(response){
          if (response && !response.error_code) {
            alert('Posting completed');
          } else {
            alert('Error while posting');
          }
        });  
      }*/
      
      // Send message
      $scope.fb_send_message = function() {
        FB.ui({
          to: '',
          method: 'send',
          name: 'Joyage',
          link: 'http://joyage.in',
          picture: '',
          description: 'Try out Joyage, it is just awesome.'
        });
      }
      
    };
    
    $scope.friends = function() {
      FB.api('/v2.2/me/friends?fields=name,location,id', function(response) {
        if (response && !response.error) {
          $scope.friend_list = response;
        }
      });
      /*FB.api('/me/friends', function(response) {
        var container = document.getElementById('mfs');
        var mfsForm = document.createElement('form');
        mfsForm.id = 'mfsForm';
        
        $scope.response = response; 
     
        // Iterate through the array of friends object and create a checkbox for each one.
        for(var i = 0; i < Math.min(response.data.length, 10); i++) {
          var friendItem = document.createElement('div');
          friendItem.id = 'friend_' + response.data[i].id;
          friendItem.innerHTML = '<input type="checkbox" name="friends" value="'
            + response.data[i].id
            + '" />' + response.data[i].name;
            mfsForm.appendChild(friendItem);
          }
        container.appendChild(mfsForm);
   
        // Create a button to send the Request(s)
        var sendButton = document.createElement('input');
        sendButton.type = 'button';
        sendButton.value = 'Send Request';
        sendButton.onclick = sendRequest;
        mfsForm.appendChild(sendButton);
      });*/  
    };
    
    $scope.facebookInviteFriends = function() {
      FB.ui({
        method: 'apprequests',
        message: 'Invite your facebook friends to Joyage',
        max_recipients: 100,
        maxRecipients: 100
      }, function(response) {
        console.log(response);
        if (response) {
          alert('Successfully Invited');
        } else {
          alert('Failed to invite');
        }
      });
    };
    
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

    $scope.pageClick = function(value) {
      if ($scope.headingTitle !== "all activities") {
        $scope.activities.push(Activity.query({ genre: $scope.headingTitle, page: value, sortOrder: $scope.sortOrder }));
      } else {
        console.log($scope.activities);
        //$scope.activities.push(Activity.query({ page: value, sortOrder: $scope.sortOrder }));
        $scope.act = Activity.query({ page: value, sortOrder: $scope.sortOrder });
        for (var i=0; i<$scope.act.length; i++) {
          console.log(i + ': ' + $scope.act[i]);
          $scope.activities.push($scope.act[i]);
        }
        $scope.activities.length = $scope.activities.length + $scope.act.length;
        console.log($scope.act);
        console.log($scope.act.$promise[0]);
        console.log($scope.act.$promise.length);
        console.log($scope.activities);
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