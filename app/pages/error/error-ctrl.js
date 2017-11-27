angular.module('app').controller('errorCtrl', function ($scope, GraphHelper, storageService) {
    $scope.message = "";
    switch (storageService.data.error) {
        case "bad_request":
            $scope.message = "Login failed. Please try again."
            break;
        case "bad_token":
            $scope.message = "Your login has expired. Please sign in again."
            break;
    }
    $scope.login = function () {
        console.log("login called");
        GraphHelper.login();
    }
})