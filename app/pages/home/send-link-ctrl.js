angular.module('app').controller("sendLinkCtrl", function ($scope, GraphHelper) {
    var graphHelper = GraphHelper;

    $scope.contacts = [];
    $scope.selectedContacts = [];
    $scope.errorMessage = "";
    $scope.serverError = false;
    $scope.footerMessage = "Syncing contacts...";
    $scope.urls = [];
    $scope.sending = false;
    $scope.webAddress = "";
    $scope.notes = "";

    var typedContact = "";
    var ignoreText = "";

    $scope.addressChanged = function (input) {
        typedContact = input;
    }
    $scope.addressEntered = function () {
        if (typedContact != ignoreText)
            addContactIfValid({ description: typedContact });
        else
            ignoreText = "";
    }
    $scope.contactSelected = function (contact) {
        enterKeyConflict = true;
        addContactIfValid(contact);
    }
    $scope.removeContactFromList = function (contact) {
        $scope.selectedContacts = $scope.selectedContacts.filter(c => c != contact);
    }
    $scope.adjustTextBox = function (element) {
        element.target.style.height = (element.target.scrollHeight) + "px";
    }
    $scope.footerAction = function () {
        $scope.sending = true;
        var recipients = [];
        $scope.selectedContacts.forEach(function (item) {
            recipients = [...recipients, {
                emailAddress: {
                    address: item.description
                }
            }]
        })
        var message = {
            "subject": "Here's a link to look at",
            "body": {
                "contentType": "text",
                "content": $scope.webAddress + "\n\n" + $scope.notes
            },
            "toRecipients": recipients
        }
        graphHelper.sendMail(message).then(function (response) {
            $scope.sending = false;
            if (response.status == 202) {

            }
        });
        console.log(message);
    }

    addContactIfValid = function (contact) {
        ignoreText = typedContact;
        var validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ($scope.selectedContacts.filter(c => c.description == contact.description).length > 0) {
            console.log("error");
            $scope.errorMessage = "You have already entered this address.";
        } else if (validEmail.test(contact.description)) {
            console.log("success");
            $scope.errorMessage = "";
            $scope.selectedContacts = [...$scope.selectedContacts, contact];
        } else {
            console.log("error");
            $scope.errorMessage = "This email address is invalid.";
        }
    }

    chrome.tabs.getSelected(null, function (tab) {
        $scope.$apply(function () {
            $scope.webAddress = tab.url;
        })
    })
    chrome.storage.local.get('urls', function (keys) {
        $scope.urls = keys.urls || [];
        console.log($scope.urls);
    })
    chrome.runtime.sendMessage("getContacts", function (response) {
        console.log(response);
        if (response && response.error) {
            $scope.$apply(function () {
                switch (response.error) {
                    case "bad_request":
                        $scope.footerMessage = "Uh oh, looks like you need to sign in again.";
                        $scope.footerAction = function () {
                            chrome.runtime.sendMessage("login");
                            window.close();
                        }
                        $scope.serverError = true;
                        break;
                    case "no_response":
                        $scope.footerMessage = "Uh oh, looks like we can't access your contacts right now.";
                        break;
                }
            })
        } else if (response.value && response.value.length) {
            console.log("synced");
            chrome.storage.sync.get('user', function (keys) {
                var user = ""
                if (keys.user)
                    user = keys.user.emailAddress;
                $scope.$apply(function () {
                    $scope.footerMessage = "Signed in successfully\n" + user;
                })
            })
            for (let contact of response.value) {
                for (let email of contact.emailAddresses) {
                    $scope.contacts = [...$scope.contacts, {
                        name: contact.displayName,
                        address: email.address
                    }]
                }
            }
        } else {
            $scope.$apply(function () {
                $scope.footerMessage = "Uh oh, looks like we can't find any contacts."
            })
        }
        chrome.runtime.sendMessage('fetchInbox', function (response) {
            if (response && response.length)
                $scope.urls = [...$scope.urls, ...response];
        })
    });
});