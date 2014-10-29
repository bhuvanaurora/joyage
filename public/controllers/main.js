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
    $scope.activities = Activity.query({ page: 1 });
    
    /*$scope.filterByCity = function(genre) {
      $scope.activities = Activity.query({ city: city });
      $scope.headingTitle = city;
    };*/
    
    $scope.filterByGenre = function(genre) {
      $scope.activities = Activity.query({ genre: genre, page: 1 });
      $scope.headingTitle = genre;
    };
    
    $scope.allActivities = function(){
      $scope.activities = Activity.query({ page: 1 });
      $scope.headingTitle = "all activities";
      displayMenu();
    };
    
    $scope.sortOrder = 'timeAdded';
    $scope.pageClick = function(value) {
      console.log($scope.headingTitle);
      if ($scope.headingTitle !== "all activities") {
        $scope.activities = Activity.query({ genre: $scope.headingTitle, page: value });
      } else {
        $scope.activities = Activity.query({ page: value });
      }
    }
  });