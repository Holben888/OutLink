angular.module('app').controller('accountSetupCtrl', function ($scope, $location, GraphHelper, storageService) {
    $scope.currentSlideIndex = 0;
    console.log($scope);
    $scope.direction = 'next';
    $scope.nextPages = [0, 1, 2, 3, 6];
    $scope.prevPages = [1, 2, 3, 4];
    $scope.graphHelper = GraphHelper;


    chrome.storage.sync.get('token', function (keys) {
        if (keys.token) {
            $scope.$apply(function () {
                $scope.currentSlideIndex = 6;
                console.log($scope);
            });
        }
    });
    $scope.slides = [
        {
            header: "Welcome to Outlink!",
            message: "The best way to organize web links from your inbox."
        }, {
            header: "Communicate smarter",
            message: "Send weblinks with personal notes to your Outlook contacts right from the extension icon."
        }, {
            header: "No more \"Alt-Tabbing\"",
            message: "View all of your colleague's notes on a webpage right in your browser window.",
        }, {
            header: "Verify with ease",
            message: "Click the charm to quickly grab codes and verification links whenever you make a new account on the web."
        }, {
            header: "Time to get set up",
            message: "Sign in to your Outlook account and start loving your inbox again.",
            login: function () {
                //Send login request to background to get correct redirect uri
                chrome.runtime.sendMessage("login", function (response) {
                    console.log(response);
                });
            }
        },
        {
            header: "Authenticating..."
        }, {
            header: "All set!",
            message: "Time to start using Outlink"
        }
    ]
    $scope.nextSlide = function () {
        $scope.direction = 'next';
        if ($scope.currentSlideIndex == 6) {
            storageService.loginComplete();
            $location.url('/home');
        }
        $scope.currentSlideIndex++;
    }
    $scope.prevSlide = function () {
        $scope.direction = 'prev';
        $scope.currentSlideIndex--;
    }
    $scope.slideClass = function (index) {
        return {
            activenext: $scope.direction == 'next' && index == $scope.currentSlideIndex,
            activeprev: $scope.direction == 'prev' && index == $scope.currentSlideIndex
        }
    }
})