angular.module('app').controller("sendLinkCtrl", function ($scope, GraphHelper) {
    var graphHelper = GraphHelper;

    $scope.contacts = [];
    $scope.selectedContacts = [];
    $scope.syncingContacts = true;

    var typedContact = "";

    $scope.addressChanged = function (input) {
        typedContact = input;
    }
    $scope.addressEntered = function () {
        addContactIfValid({ description: typedContact });
    }
    $scope.contactSelected = function (contact) {
        addContactIfValid(contact);
    }

    addContactIfValid = function (contact) {
        var validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (validEmail.test(contact.description)) {
            console.log("success", contact);
            if (contact.title)
                $scope.selectedContacts = [...$scope.selectedContacts, contact.title];
            else
                $scope.selectedContacts = [...$scope.selectedContacts, contact.description];
        }
    }

    chrome.runtime.sendMessage("getContacts", function (response) {
        console.log(response);
        if (response.length) {
            for (let contact of response) {
                for (let email of contact.emailAddresses) {
                    $scope.contacts = [...$scope.contacts, {
                        name: contact.displayName,
                        address: email.address
                    }]
                }
            }
            $scope.syncingContacts = false;
        }
    });
});