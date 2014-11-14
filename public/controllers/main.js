angular.module('MyApp')
  .controller('MainCtrl', ['$scope', 'fb_appId', '$window', 'Activity', function($scope, fb_appId, $window, Activity) {
    /*$scope.city = ['Bangalore', 'Delhi'];*/
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/
    
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
      $scope.fb_share = function() {
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
      }
      
      // Send message
      $scope.fb_send_message = function() {
        FB.ui({
          to: '',
          method: 'send',
          link: 'http://joyage.in'
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
    }
    
    
    $scope.facebookInviteFriends = function() {
      FB.ui({
        method: 'apprequests',
        message: 'Invite your facebook friends to Joyage',
        max_recipients: 10,
        maxRecipients: 10
      }, function(response) {
        console.log(response);
        if (response) {
          alert('Successfully Invited');
        } else {
          alert('Failed to invite');
        }
      });
    }
    
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
      console.log($scope.headingTitle);
      if ($scope.headingTitle !== "all activities") {
        $scope.activities = Activity.query({ genre: $scope.headingTitle, page: value, sortOrder: $scope.sortOrder });
      } else {
        $scope.activities = Activity.query({ page: value, sortOrder: $scope.sortOrder });
      }
    }
    
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
    }
  }]);