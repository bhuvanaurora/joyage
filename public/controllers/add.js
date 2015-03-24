angular.module('MyApp')
  .controller('AddCtrl', ['$scope', '$alert', '$routeParams', '$http', '$route', '$upload', 'Activity', 'editedActivity', 'Profile', 'Business',
                          function($scope, $alert, $routeParams, $http, $route, $upload, Activity, editedActivity, Profile, Business) {

      $scope.businessNames = [];
      $scope.listOfBusinesses = Business.query({},function(value) {
          for (var i=0; i<value.length; i++ ) {
              $scope.businessNames.push(value[i].business);
          }

          Profile.get({ _id: $routeParams.id }, function(profile) {
              $scope.profile = profile;
              {

                  var poster = '';
                  $scope.onFileSelect = function ($files) {
                      for (var i = 0; i < $files.length; i++) {
                          var file = $files[i];
                          $scope.upload = $upload.upload({
                              url: '/upload',
                              data: {myObj: $scope.myModelObj},
                              file: file,
                          }).progress(function (evt) {
                              console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                          }).success(function (data, status, headers, config) {
                              poster = data.imageurl;
                          });
                      }
                  };

                  var cornerPic = '';
                  $scope.onPicSelect = function ($files) {
                      for (var i = 0; i < $files.length; i++) {
                          var file = $files[i];
                          $scope.upload = $upload.upload({
                              url: '/uploadCornerPic',
                              data: {myObj: $scope.myModelObj},
                              file: file,
                          }).progress(function (evt) {
                              console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                          }).success(function (data, status, headers, config) {
                              cornerPic = data.imageurl;
                          });
                      }
                  };

                  var mediaImage = '';
                  $scope.onMediaImageSelect = function ($files) {
                      for (var i = 0; i < $files.length; i++) {
                          var file = $files[i];
                          $scope.upload = $upload.upload({
                              url: '/uploadMediaImage',
                              data: {myObj: $scope.myModelObj},
                              file: file,
                          }).progress(function (evt) {
                              console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                          }).success(function (data, status, headers, config) {
                              mediaImage = data.imageurl;
                          });
                      }
                  };

                  var venueImage = '';
                  $scope.onVenueImageSelect = function ($files) {
                      for (var i = 0; i < $files.length; i++) {
                          var file = $files[i];
                          $scope.upload = $upload.upload({
                              url: '/uploadVenueImage',
                              data: {myObj: $scope.myModelObj},
                              file: file,
                          }).progress(function (evt) {
                              console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                          }).success(function (data, status, headers, config) {
                              venueImage = data.imageurl;
                          });
                      }
                  };

                  if (!$routeParams.rs) {

                      // ------------------------------------------------------------- For adding activities ------------------------------------------------------ //

                      $scope.genres = ['Athletic Activities', 'Fitness Classes', 'Hiking & Biking',
                          'Nature Appreciation', 'Bars', 'Breweries & Distilleries',
                          'Featured Cocktails', 'Happy Hours', 'Classes', 'Exhibits & Galleries',
                          'Brunch & Breakfast', 'Lunch', 'Dinner', 'Sweet Treats', 'Food Trucks & Pop-Ups',
                          'Tea & Coffee shops', 'Concerts', 'Fun & Games', 'Nightlife & Parties',
                          'Theater & Shows', 'Activites for Two', 'Food & Dining', 'Bars & Drinking'];

                      $scope.categories = [];

                      $scope.addCategory = function (genre) {
                          $scope.categories.push(genre);
                          $scope.genres.splice($scope.genres.indexOf(genre), 1);
                      };

                      $scope.removeCategory = function (selectedCategory) {
                          $scope.categories.splice($scope.categories.indexOf(selectedCategory), 1);
                          $scope.genres.push(selectedCategory);
                      };

                      $scope.city = 'Bangalore';
                      $scope.country = 'India';
                      $scope.currency = 'Rs';

                      $scope.addActivity = function () {

                          if ($scope.businessNames.indexOf($scope.business) == -1) {

                              Business.save({
                                  business: $scope.business,
                                  city: $scope.city,
                                  country: $scope.country
                              });

                          }

                          $scope.categories.push($scope.moods);
                          $scope.categories.push($scope.times);

                          var id;
                          var title = $scope.title.split(" ");
                          id = title.join("-");

                          var mediaVar = [];
                          if ($scope.mediaTitle1) {
                              mediaVar.push({
                                  title: $scope.mediaTitle1,
                                  text: $scope.mediaText1,
                                  link: $scope.mediaLink1
                              })
                          }
                          if ($scope.mediaTitle2) {
                              mediaVar.push({
                                  title: $scope.mediaTitle2,
                                  text: $scope.mediaText2,
                                  link: $scope.mediaLink2
                              })
                          }
                          if ($scope.mediaTitle3) {
                              mediaVar.push({
                                  title: $scope.mediaTitle3,
                                  text: $scope.mediaText3,
                                  link: $scope.mediaLink3
                              })
                          }
                          if ($scope.mediaTitle4) {
                              mediaVar.push({
                                  title: $scope.mediaTitle4,
                                  text: $scope.mediaText4,
                                  link: $scope.mediaLink4
                              })
                          }

                          if (!$scope.mapLat && !$scope.mapLon) {
                              if ($scope.city == 'Bangalore') {
                                  $scope.mapLat = 12.9539;
                                  $scope.mapLon = 77.6309;
                              } else if ($scope.city == 'Delhi') {
                                  $scope.mapLat = 28.6336;
                                  $scope.mapLon = 77.2225;
                              } else if ($scope.city == 'Mumbai') {
                                  $scope.mapLat = 19.0822;
                                  $scope.mapLon = 72.8812;
                              }
                          }

                          Activity.save({
                                  id: id,
                                  title: $scope.title,
                                  description: $scope.description,
                                  genre: $scope.categories,
                                  dateOfActivity: $scope.dateOfActivity,
                                  endDateOfActivity: $scope.endDateOfActivity,
                                  timeOfActivity: $scope.timeOfActivity,
                                  city: $scope.city,
                                  business: $scope.business,
                                  location: $scope.location,
                                  address: $scope.address,
                                  venueImage: venueImage,
                                  venueDescription: $scope.venueDescription,
                                  mediaImage: mediaImage,
                                  media: mediaVar,
                                  phone: $scope.phone,
                                  sourceName: $scope.sourceName,
                                  sourceDescription: $scope.sourceDescription,
                                  sourceWebsite: $scope.sourceWebsite,
                                  locationWebsite: $scope.locationWebsite,
                                  neighborhood: $scope.neighborhood,
                                  country: $scope.country,
                                  mapLat: $scope.mapLat,
                                  mapLon: $scope.mapLon,
                                  status: "Continuing",
                                  poster: poster,
                                  photoCredit: $scope.photoCredit,
                                  photoCreditLink: $scope.photoCreditLink,
                                  currency: $scope.currency,
                                  price: $scope.price,
                                  facebookLink: $scope.facebookLink,
                                  twitterLink: $scope.twitterLink,
                                  zomatoLink: $scope.zomatoLink,
                                  payment: $scope.payment,
                                  bookRide: $scope.bookRide,
                                  goodies: $scope.goodies,
                                  moreInfo: $scope.moreInfo,
                                  moreInfoLink: $scope.moreInfoLink,
                                  addedBy: $scope.addedBy,
                                  corner: $scope.corner,
                                  cornerPic: cornerPic,
                                  cornerText: $scope.cornerText
                              },
                              function () {
                                  $scope.title = '';
                                  $scope.description = '';
                                  $scope.categories = '';
                                  $scope.dateOfActivity = '';
                                  $scope.endDateOfActivity = '';
                                  $scope.timeOfActivity = '';
                                  $scope.city = '';
                                  $scope.business = '';
                                  $scope.location = '';
                                  $scope.address = '';
                                  $scope.phone = '';
                                  $scope.venueDescription = '';
                                  $scope.venueImage = '';
                                  $scope.mediaImage = '';
                                  $scope.sourceName = '';
                                  $scope.sourceDescription = '';
                                  $scope.sourceWebsite = '';
                                  $scope.locationWebsite = '';
                                  $scope.neighborhood = '';
                                  $scope.country = '';
                                  $scope.mapLat = '';
                                  $scope.mapLon = '';
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
                                  $scope.corner = '';
                                  $scope.cornerPic = '';
                                  $scope.cornerText = '';
                                  mediaVar = [];
                                  $alert({
                                      content: 'Activity has been added.',
                                      placement: 'top-right',
                                      type: 'success',
                                      duration: 3
                                  });
                              },
                              function (response) {
                                  $alert({
                                      content: response.data.message,
                                      placement: 'top-right',
                                      type: 'material',
                                      duration: 3
                                  });
                              });
                      };
                  }

                  // --------------------------------------------------------- For editing activities ----------------------------------------------------- //

                  if ($routeParams.rs) {

                      editedActivity.get({_id: $routeParams.rs}, function (activity) {
                          $scope.activity = activity;

                          $scope.categories = [];
                          $scope.filterMoods = ['Active', 'Posh', 'Fun', 'Adventure', 'Party', 'Dark'];
                          $scope.moods = '';
                          $scope.filterTimes = ['Morning', 'Afternoon', 'Evening', 'Afterdark'];
                          $scope.times = '';

                          for (var i = 0; i < activity.genre.length; i++) {
                              if (activity.genre[i] != null) {
                                  if ($scope.filterMoods.indexOf(activity.genre[i]) !== -1) {
                                      $scope.moods = activity.genre[i];
                                  } else if ($scope.filterTimes.indexOf(activity.genre[i]) !== -1) {
                                      $scope.times = activity.genre[i];
                                  } else {
                                      $scope.categories.push(activity.genre[i]);
                                  }
                              }
                          }

                          $scope.genres = ['Athletic Activities', 'Fitness Classes', 'Hiking & Biking',
                              'Nature Appreciation', 'Bars', 'Breweries & Distilleries',
                              'Featured Cocktails', 'Happy Hours', 'Classes', 'Exhibits & Galleries',
                              'Brunch & Breakfast', 'Lunch', 'Dinner', 'Sweet Treats', 'Food Trucks & Pop-Ups',
                              'Tea & Coffeeshops', 'Concerts', 'Fun & Games', 'Nightlife & Parties',
                              'Theater & Shows', 'Activites for Two', 'Food & Dining', 'Bars & Drinking'];

                          if (activity.genre) {
                              for (var i = 0; i < $scope.categories.length; i++) {
                                  $scope.genres.splice($scope.genres.indexOf($scope.categories[i]), 1);
                              }
                          }

                          $scope.addCategory = function (genre) {
                              $scope.categories.push(genre);
                              $scope.genres.splice($scope.genres.indexOf(genre), 1);
                          };
                          $scope.removeCategory = function (selectedCategory) {
                              $scope.categories.splice($scope.categories.indexOf(selectedCategory), 1);
                              $scope.genres.push(selectedCategory);
                          };

                          $scope.title = activity.title;
                          $scope.description = activity.description;
                          $scope.dateOfActivity = activity.dateOfActivity;
                          $scope.endDateOfActivity = activity.endDateOfActivity;
                          $scope.timeOfActivity = activity.timeOfActivity;
                          $scope.business = activity.business;
                          $scope.location = activity.location;
                          $scope.city = activity.city;
                          $scope.address = activity.address;

                          if (activity.media[0]) {
                              $scope.mediaTitle1 = activity.media[0].title;
                              $scope.mediaText1 = activity.media[0].text;
                              $scope.mediaLink1 = activity.media[0].link;
                          }
                          if (activity.media[1]) {
                              $scope.mediaTitle2 = activity.media[1].title;
                              $scope.mediaText2 = activity.media[1].text;
                              $scope.mediaLink2 = activity.media[1].link;
                          }
                          if (activity.media[2]) {
                              $scope.mediaTitle3 = activity.media[2].title;
                              $scope.mediaText3 = activity.media[2].text;
                              $scope.mediaLink3 = activity.media[2].link;
                          }
                          if (activity.media[3]) {
                              $scope.mediaTitle4 = activity.media[3].title;
                              $scope.mediaText4 = activity.media[3].text;
                              $scope.mediaLink4 = activity.media[3].link;
                          }

                          $scope.mediaImage = activity.mediaImage;
                          $scope.phone = activity.phone;
                          $scope.venueImage = activity.venueImage;
                          $scope.venueDescription = activity.venueDescription;
                          $scope.sourceName = activity.sourceName;
                          $scope.sourceDescription = activity.sourceDescription;
                          $scope.sourceWebsite = activity.sourceWebsite;
                          $scope.locationWebsite = activity.locationWebsite;
                          $scope.neighborhood = activity.neighborhood;
                          $scope.city = activity.city;
                          $scope.country = activity.country;
                          $scope.poster = activity.poster;
                          $scope.photoCredit = activity.photoCredit;
                          $scope.photoCreditLink = activity.photoCreditLink;
                          $scope.mapLat = activity.mapLat;
                          $scope.mapLon = activity.mapLon;
                          $scope.currency = activity.currency;
                          $scope.price = activity.price;
                          $scope.facebookLink = activity.facebookLink;
                          $scope.twitterLink = activity.twitterLink;
                          $scope.zomatoLink = activity.zomatoLink;
                          $scope.payment = activity.payment;
                          $scope.bookRide = activity.bookRide;
                          $scope.goodies = activity.goodies;
                          $scope.moreInfo = activity.moreInfo;
                          $scope.moreInfoLink = activity.moreInfoLink;
                          $scope.addedBy = activity.addedBy;
                          $scope.corner = activity.corner;
                          $scope.cornerPic = activity.cornerPic;
                          $scope.cornerText = activity.cornerText;
                          $scope.mediaImage = activity.mediaImage;
                      });

                      $scope.addActivity = function () {

                          $scope.categories.push($scope.moods);
                          $scope.categories.push($scope.times);

                          var id;
                          var title = $scope.title.split(" ");
                          id = title.join("-");

                          var mediaVar = [];
                          if ($scope.mediaTitle1) {
                              mediaVar.push({
                                  title: $scope.mediaTitle1,
                                  text: $scope.mediaText1,
                                  link: $scope.mediaLink1
                              })
                          }
                          if ($scope.mediaTitle2) {
                              mediaVar.push({
                                  title: $scope.mediaTitle2,
                                  text: $scope.mediaText2,
                                  link: $scope.mediaLink2
                              })
                          }
                          if ($scope.mediaTitle3) {
                              mediaVar.push({
                                  title: $scope.mediaTitle3,
                                  text: $scope.mediaText3,
                                  link: $scope.mediaLink3
                              })
                          }
                          if ($scope.mediaTitle4) {
                              mediaVar.push({
                                  title: $scope.mediaTitle4,
                                  text: $scope.mediaText4,
                                  link: $scope.mediaLink4
                              })
                          }

                          if (!$scope.mapLat && !$scope.mapLon) {
                              if ($scope.city == 'Bangalore') {
                                  $scope.mapLat = 12.9539;
                                  $scope.mapLon = 77.6309;
                              } else if ($scope.city == 'Delhi') {
                                  $scope.mapLat = 28.6336;
                                  $scope.mapLon = 77.2225;
                              } else if ($scope.city == 'Mumbai') {
                                  $scope.mapLat = 19.0822;
                                  $scope.mapLon = 72.8812;
                              }
                          }

                          $scope.activity.title = $scope.title;
                          $scope.activity.description = $scope.description;
                          $scope.activity.genre = $scope.categories;
                          $scope.activity.dateOfActivity = $scope.dateOfActivity;
                          $scope.activity.endDateOfActivity = $scope.endDateOfActivity;
                          $scope.activity.timeOfActivity = $scope.timeOfActivity;
                          $scope.activity.business = $scope.business;
                          $scope.activity.location = $scope.location;
                          $scope.activity.city = $scope.city;
                          $scope.activity.address = $scope.address;
                          $scope.activity.media = mediaVar;
                          $scope.activity.phone = $scope.phone;
                          $scope.activity.venueImage = $scope.venueImage;
                          $scope.activity.venueDescription = $scope.venueDescription;
                          $scope.activity.sourceName = $scope.sourceName;
                          $scope.activity.sourceDescription = $scope.sourceDescription;
                          $scope.activity.sourceWebsite = $scope.sourceWebsite;
                          $scope.activity.locationWebsite = $scope.locationWebsite;
                          $scope.activity.neighborhood = $scope.neighborhood;
                          $scope.activity.city = $scope.city;
                          $scope.activity.country = $scope.country;
                          $scope.activity.mapLat = $scope.mapLat;
                          $scope.activity.mapLon = $scope.mapLon;
                          $scope.activity.poster = $scope.poster;
                          $scope.activity.photoCredit = $scope.photoCredit;
                          $scope.activity.photoCreditLink = $scope.photoCreditLink;
                          $scope.activity.currency = $scope.currency;
                          $scope.activity.price = $scope.price;
                          $scope.activity.facebookLink = $scope.facebookLink;
                          $scope.activity.twitterLink = $scope.twitterLink;
                          $scope.activity.zomatoLink = $scope.zomatoLink;
                          $scope.activity.payment = $scope.payment;
                          $scope.activity.bookRide = $scope.bookRide;
                          $scope.activity.goodies = $scope.goodies;
                          $scope.activity.moreInfo = $scope.moreInfo;
                          $scope.activity.moreInfoLink = $scope.moreInfoLink;
                          $scope.activity.corner = $scope.corner;
                          $scope.activity.cornerPic = $scope.cornerPic;
                          $scope.activity.cornerText = $scope.cornerText;
                          $scope.activity.mediaImage = $scope.mediaImage;

                          $scope.activity.$update(function () {
                              $route.reload();
                          });

                      };
                  }
              }
          });
      });
  }]);