angular.module('MyApp')
  .controller('AddCtrl', function($scope, $alert, Activity) {
    $scope.addActivity = function() {
      Activity.save({ activityTitle: $scope.activityTitle }).$promise
        .then(function() {
          $scope.activityTitle = '';
          $scope.addForm.$setPristine();
          $alert({
            content: 'Activity has been added.',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .catch(function(response) {
          $scope.activityTitle = '';
          $scope.addForm.$setPristine();
          $alert({
            content: response.data.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
      
      /*var id = $scope.activityTitle + (new Date).getTime();
      var activity = new Activity({_id: "id",
                                    title: "title",
                                    dateOfActivity: "date",
                                    timeOfActivity: "time",
                                    city: "city",
                                    location: "loca",
                                    address: "add",
                                    phone: "phone",
                                    Website: "website",
                                    neighborhood: "neigh",
                                    country: "cont",
                                    genre: ["Bars"],                          
                                    description: "desc",
                                    status: "Continuing",                               
                                    poster: "",                               
                                    price: "Rs 250",
                                    timeAdded: Date.now()
                                  });
      
      activity.save(function(err){
        if (err) {
          console.log(err);
        }
      });*/
      
    };
  });