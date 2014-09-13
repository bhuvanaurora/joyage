angular.module('MyApp')
  .controller('MainCtrl', function($scope, Activity) {
    $scope.alphabet = ['0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z'];
    /*$scope.location = ['Bangalore', 'Delhi'];*/
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
    $scope.activities = Activity.query();                               //changed
    /*$scope.filterByLocation = function(genre) {
      $scope.activities = Activity.query({ location: location });
      $scope.headingTitle = location;
    };*/
    $scope.filterByGenre = function(genre) {
      $scope.activities = Activity.query({ genre: genre });             //changed
      $scope.headingTitle = genre;
    };
    $scope.filterByAlphabet = function(char) {
      $scope.activities = Activity.query({ alphabet: char });           //changed
      $scope.headingTitle = char;
    };
    $scope.allActivities = function(){
      $scope.activities = Activity.query();
      $scope.headingTitle = "all activities";
      displayMenu();
    };
  });