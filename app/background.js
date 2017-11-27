angular.module("app", []).run(function (GraphHelper, storageService) {
    console.log("I exist in the background");
    var graphHelper = GraphHelper;
    var storageSrv = storageService;
    storageSrv.syncData();
    graphHelper.setHeaders();
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            var httpCall = null;
            console.log(request);
            if (request == "login") {
                graphHelper.login();
                sendResponse("logging in");
            }

            if (request == "fetchInbox")
                httpCall = graphHelper.fetchInbox;
            else if (request == "getContacts")
                httpCall = graphHelper.getContacts;
            else
                sendResponse("invalid call");

            chrome.storage.sync.get('token', function (keys) {
                if (keys.token) {
                    httpCall(keys.token).success(function (response) {
                        if (response && response.value)
                            sendResponse(response.value);
                        else
                            console.log("No response values!");
                        console.log(response);
                    }).error(function (error) {
                        console.log(error);
                        //If request fails, the access token has expired
                        graphHelper.getNewToken(storageSrv.data.refreshToken).success(function (response) {
                            if (response['access_token']) {
                                storageSrv.storeToken(response['access_token']);
                                httpCall(response['access_token']).success(function (response) {
                                    console.log(response);
                                    if (response && response.value)
                                        sendResponse(response.value);
                                    else
                                        console.log("No response values!");
                                }).error(function (error) {
                                    console.log(error);
                                })
                            }
                        }).error(function (error) {
                            console.log(error);
                        });
                    })
                } else {
                    console.log("No token!");
                }
            })
            //Specifies an asynchronous response
            return true;
        })
});