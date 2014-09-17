angular.module('MyApp')
  .controller('AddCtrl', ['$scope', '$alert', 'Activity', function($scope, $alert, Activity) {
    $scope.addActivity = function() {
      Activity.save({ "_id": 1,
                     "title": $scope.title},
        function() {
          $scope.title = '';
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

/*angular.module('MyApp')
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
    };
  });*/
  
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
  
/*
  db.activities.insert({"_id":20, "title":"CounterCulture presents Shaktishree Gopalan (Band) and Pinch", "description": "Pay Here! https://getfbpay.in/shaktishreegopalan/. Shaktishree Gopalan: An architect by profession & trained in the Carnatic style of singing, Shakthisree Gopalan's musical influences are varied and draw their roots from jazz, RnB, trip hop, easy listening to rock and psychedelic rock. Her biggest inspirations and influences are A R Rahman, Nina Simone, Norah Jones, U2, Alexi Murdoch, Bon Iver, Coldplay and John Mayer.Formerly associated with the Chennai based rock band 'Off the Record', she has also been doing playback, her most recent releases being the Title track of the Yash Raj Film 'Jab Tak Hai Jaan' & 'Nenjukulle' from the upcoming Mani Ratnam Movie 'Kadal', both composed by Mr A.R. Rahman. The latter growing exponentially in popularity, thanks to the MTV Unplugged launch.Apart from being an independent artist, Shakthi is currently associated with The Pyjama Conspiracy: 4 piece set up based in Chennai which has been exploring with easy listening and acoustic sounds and has been moving into more experimental elements and sounds in recent times.http://www.shakthisreegopalan.com/. Opening the night are Bangalore's very own Pinch:Pinch is a four angled sound space with moody vocals over rippling bass runs, energetic drums and simple guitar riffs. Pinching all their influences, ideas, instruments and intel together they make music that they love to love.", "dateOfActivity": ["September 20, 2014"], "timeOfActivity": "9:00 PM", "city": "Bangalore", "location": "CounterCulture", "address": "CounterCulture", "phone": "", "locationWebsite": "", "sourceWebsite": "http://www.facebook.com/events/1465617820370040", "neighborhood": "Whitefield", "country": "India", "genre": ["Bars", "Theater & Shows"], "twitterLink": "http://www.twitter.com/SynColeOfficial", "poster": "10612924_780147208674874_3431515788070754110_n.jpg", "price": "", "timeAdded": "03:09 AM, September 15, 2014"})
  
db.activities.insert({"_id":7, "title":"NH7 Weekender Bangalore", "description": "NH7 coming to Bangalore in October this year. It is going to be one hell of a party. Book your tickets early to avoid the last day rush. Early birds to get 10% discount on all tickets.", "location": "Celebration ground", "neighborhood":"Hebbal", "city":"Bangalore", "country":"India", "poster":"NH7.jpg", "genre":["NH7", "Concerts", "Nightlife & Parties", "Music"], "status":"Continuing", "price":"Rs 2500"})  

*/