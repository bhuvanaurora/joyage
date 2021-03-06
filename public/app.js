angular.module('MyApp', ['ngResource', 'ngMessages', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap', 'angularFileUpload'])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      /*.when('/', {
        templateUrl: 'views/landingPage.html',
        controller: 'landPageCtrl'
      })*/

      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })

      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'MainCtrl'
      })

      .when('/blog', {
          templateUrl: 'views/pages/blog.html'
      })

      .when('/business/:business/:id', {
          templateUrl: 'views/businessPage.html',
          controller: 'BusinessCtrl'
        })

        .when('/listUsersToGod/:id', {
          templateUrl: 'views/usersPage.html',
          controller: 'UsersCtrl'
        })

      .when('/invite/:id', {
        templateUrl: 'views/invite.html',
        controller: 'InviteCtrl'
      })

      .when('/activities/:id', {
        templateUrl: 'views/detail.html',
        controller: 'DetailCtrl'
      })

      .when('/editActivity/:rs/:id', {
        templateUrl: 'views/add.html',
        controller: 'AddCtrl'
      })

      .when('/login/:id', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })

      /*.when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })*/

      .when('/add/:id', {
        templateUrl: 'views/add.html',
        controller: 'AddCtrl'
      })

      .when('/admin/:id', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      })

      .when('/about', {
        templateUrl: 'views/pages/about.html'
      })

      .when('/contact', {
        templateUrl: 'views/pages/contact.html'
      })

      .when('/jobs', {
        templateUrl: 'views/pages/jobs.html'
      })

      .when('/privacy', {
        templateUrl: 'views/pages/privacy.html'
      })

      .when('/tos', {
        templateUrl: 'views/pages/tos.html'
      })

      .when('/profile/:id', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })

      .otherwise({
        redirectTo: '/'
      });
  })

  .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope, $q, $window, $location) {
      return {
        request: function(config) {
          if ($window.localStorage.token) {
            config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
          }
          return config;
        },
        responseError: function(response) {
          if (response.status === 401 || response.status === 403) {
            $location.path('/login');
          }
          return $q.reject(response);
        }
      }
    });
  });