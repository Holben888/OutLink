'use strict';

var app = angular.module('app', ['ui.bootstrap', 'ngRoute', 'angucomplete-alt']);
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "app/pages/account-setup/account-setup.html",
      controller: "accountSetupCtrl"
    })
    .when("/error", {
      templateUrl: "app/pages/error/error.html",
      controller: "errorCtrl"
    })
    .when("/home", {
      templateUrl: "app/pages/home/send-link.html",
      controller: "sendLinkCtrl"
    })
}).run(function ($rootScope, $location, $http) {
  chrome.storage.sync.get(null, function (keys) {
    $rootScope.$apply(function () {
      if (keys.token)
        $http.defaults.headers.common.Authorization = 'Bearer ' + keys.token;
      if (keys.firstLoginComplete)
        $location.path('/home');
    })
  })
});
