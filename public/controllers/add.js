angular.module('MyApp')
  .controller('AddCtrl', ['$scope', '$alert', '$http', 'Activity', function($scope, $alert, $http, Activity) {
    
    alert("Have you added the pictures? Add the HQ pictures first.");
    
    $scope.genres = ['Athletic Activities', 'Fitness Classes', 'Hiking & Biking',
                     'Nature Appreciation', 'Bars', 'Breweries & Distilleries',
                      'Featured Cocktails', 'Happy Hours', 'Classes', 'Exhibits & Galleries',
                      'Brunch & Breakfast', 'Lunch', 'Dinner', 'Sweet Treats', 'Food Trucks & Pop-Ups',
                      'Tea & Coffeeshops', 'Concerts', 'Fun & Games', 'Nightlife & Parties',
                      'Theater & Shows', 'Activites for Two', 'Food & Dining', 'Bars & Drinking'];
    $scope.categories = [];
    $scope.addCategory = function(genre) {
      $scope.categories.push(genre);
      $scope.genres.splice($scope.genres.indexOf(genre), 1);
    }
    $scope.removeCategory = function(selectedCategory) {
      $scope.categories.splice($scope.categories.indexOf(selectedCategory), 1);
      $scope.genres.push(selectedCategory);
    }
    
    $scope.addActivity = function() {
      
      var id;
      var title = $scope.title.split(" ");
      id = title.join("-");
      
      Activity.save({ id: id,
                      title: $scope.title,
                      description: $scope.description,
                      genre: $scope.categories,
                      dateOfActivity: $scope.dateOfActivity,
                      endDateOfActivity: $scope.endDateOfActivity,
                      timeOfActivity: $scope.timeOfActivity,
                      city: $scope.city,
                      location: $scope.location,
                      address: $scope.address,
                      phone: $scope.phone,
                      sourceName: $scope.sourceName,
                      sourceDescription: $scope.sourceDescription,
                      sourceWebsite: $scope.sourceWebsite,
                      locationWebsite: $scope.locationWebsite,
                      neighborhood: $scope.neighborhood,
                      country: $scope.country,
                      /*mapLocation: $scope.mapLocation,*/
                      status: "Continuing",
                      poster: $scope.poster,
                      photoCredit: $scope.photoCredit,
                      photoCreditLink: $scope.photoCreditLink,
                      currency: $scope.currency,
                      price: $scope.price,
                      facebookLink: $scope.facebookLink,
                      twitterLink: $scope.twitterLink,
                      zomatoLink: $scope.zomatoLink,
                      payment: $scope.payment,
                      bookRide:$scope.bookRide,
                      goodies: $scope.goodies,
                      moreInfo: $scope.moreInfo,
                      moreInfoLink: $scope.moreInfoLink,
                      addedBy: $scope.addedBy
                      },
        function() {
          $scope.title = '';
          $scope.description = '';
          $scope.dateOfActivity = '';
          $scope.timeOfActivity = '';
          $scope.city = '';
          $scope.location = '';
          $scope.address = '';
          $scope.phone = '';
          $scope.sourceName = '';
          $scope.sourceDescription = '';
          $scope.sourceWebsite = '';
          $scope.locationWebsite = '';
          $scope.neighborhood = '';
          $scope.country = '';
          $scope.mapLocation = '';
          $scope.poster = '';
          $scope.photoCredit = '';
          $scope.photoCreditLink = '';
          $scope.price = '';
          $scope.facebookLink = '';
          $scope.twitterLink = '';
          $scope.zomatoLink = '';
          $scope.payment = '';
          $scope.bookRide = '';
          $scope.goodies = '';
          $scope.moreInfo = '';
          $scope.moreInfoLink = '';
          $alert({
            content: 'Activity has been added.',
            placement: 'top-right',
            type: 'success',
            duration: 3
          });
        },
        function(response) {
          $alert({
            content: response.data.message,
            placement: 'top-right',
            type: 'material',
            duration: 3
          });
        });
    };
  }]);