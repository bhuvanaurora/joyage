angular.module('MyApp')
  .controller('MainCtrl', function($scope, Activity) {
    /*$scope.city = ['Bangalore', 'Delhi'];*/
    /*$scope.neighborhood = { 'Bangalore': ['Kormangala', 'JP Nagar', 'Indiranagar', 'MG Road'],
                              'Delhi': ['Connaught Place', 'Dwarka', 'Janak Puri', 'Saket', 'Defence Colony', 'Hauz Khas']
                            };*/
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
      $scope.activities = Activity.query({ page: 1, sortOrder: $scope.sortOrder });
    }
  });