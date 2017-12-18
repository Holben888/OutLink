angular.module("app", []).run(function (GraphHelper, storageService) {
    console.log("I exist in the background");
    var graphHelper = GraphHelper;
    var storageSrv = storageService;
    var intervalSync = null;
    storageSrv.syncData();
    graphHelper.setHeaders();
    chrome.storage.sync.get("token", function (keys) {
        if (keys.token) {
            intervalSync = setInterval(syncInbox, 300 * 1000);
        }
    })
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            var httpCall = null;
            storageSrv.syncData();
            if (request == "login") {
                graphHelper.login();
                sendResponse("logging in");
            }
            if (request == "logged in") {
                if (intervalSync)
                    clearInterval(intervalSync);
                intervalSync = setInterval(syncInbox, 300 * 1000);
                sendResponse("logged in");
            }
            if (request == "logout") {
                if (intervalSync)
                    clearInterval(intervalSync);
                intervalSync = null;
                sendResponse("logged out");
            }

            if (request == "fetchInbox")
                httpCall = graphHelper.getInboxSize;
            else if (request == "getContacts")
                httpCall = graphHelper.getContacts;
            else if (request == "getTeams")
                httpCall = graphHelper.getTeams;
            else
                sendResponse({ error: "invalid_call" });

            chrome.storage.sync.get('token', function (keys) {
                if (keys.token) {
                    makeHttpCall({
                        responseCallback: sendResponse,
                        httpCall: httpCall,
                        token: keys.token,
                        request: request
                    })
                } else {
                    sendResponse({ error: "bad_request" });
                }
            })
            //Specifies an asynchronous response
            return true;
        })
    syncInbox = function () {
        console.log('running');
        chrome.storage.sync.get('token', function (keys) {
            if (keys.token) {
                makeHttpCall({
                    responseCallback: function (data) { },
                    httpCall: graphHelper.getInboxSize,
                    token: keys.token,
                    request: "fetchInbox"
                })
            }
        })
    }
    makeHttpCall = function (data) {
        //chrome.storage.local.set({ urls: [], inboxSize: 0 });
        console.log("working:", data.request);
        var sendResponse = data.responseCallback;
        data.httpCall(data).success(function (response) {
            handleResponse(data, response);
        }).error(function (error) {
            console.log(error);
            //If request fails, the access token has expired
            graphHelper.getNewToken(storageSrv.data.refreshToken).success(function (response) {
                if (response['access_token']) {
                    storageSrv.storeToken(response['access_token']);
                    data.httpCall({ ...data, token: response['access_token'] }).success(function (response) {
                        handleResponse(data, response);
                    }).error(function (error) {
                        sendResponse({ error: "bad_request" });
                    })
                }
            }).error(function (error) {
                sendResponse({ error: "bad_request" });
            });
        })
    }
    handleResponse = function (data, response) {
        console.log(response);
        var sendResponse = data.responseCallback;
        if (data.request == "fetchInbox" && response && response.totalItemCount) {
            chrome.storage.local.get('inboxSize', function (keys) {
                var inboxSize = keys.inboxSize ? keys.inboxSize : 0;
                if (!keys.inboxSize || response.totalItemCount - inboxSize > 0) {
                    console.log(keys);
                    storageSrv.setInboxSize(response.totalItemCount);
                    makeHttpCall({
                        ...data,
                        topSize: response.totalItemCount - inboxSize > 100 ? 100 : response.totalItemCount - inboxSize,
                        httpCall: graphHelper.fetchInbox
                    })
                } else
                    sendResponse(response ? response : { error: "no_response" });
            });
        } else if (data.request == "fetchInbox" && response && response.value) {
            identifyURLS(response.value).then(urls => sendResponse(urls))
        } else
            sendResponse(response ? response : { error: "no_response" });
    }
    identifyURLS = async function (messages) {
        var allURLs = [];
        messages = messages.filter(m => {
            let fourWeeksAgo = new Date();
            fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 31);
            return m.inferenceClassification == 'focused' && new Date(m.sentDateTime) > fourWeeksAgo;
        });
        messages.forEach(function (message) {
            var urls = [];
            if (message.body.contentType == "text") {
                var items = message.body.content.split(/[.,!]*[\s\n]+/);
                var reValidURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
                items.forEach(function (item) {
                    if (reValidURL.test(item))
                        urls = [...urls, {
                            url: item,
                            message: {
                                body: message.body.content || "No body",
                                bodyPreview: message.bodyPreview || "",
                                from: message.from.emailAddress || "Unknown",
                                subject: message.subject || "No subject",
                                webLink: message.webLink || "",
                                id: message.id
                            }
                        }];
                })
            } else if (message.body.contentType == "html") {
                var reValidBody = /<\s*body[^>]*>((.|[\r\n]*)*?)<\s*\/\s*body>/;
                var body = message.body.content.match(reValidBody);
                if (body[1]) {
                    var reValidURL = /<\s*a[^href]*href\s*=\s*["'](https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?)["']/;
                    var cutString = body[1];
                    var match = "";
                    do {
                        match = cutString.match(reValidURL);
                        if (match && match[1]) {
                            cutString = match.input.replace(match[0], "");
                            urls = [...urls, {
                                url: match[1],
                                message: {
                                    body: message.body.content || "No body",
                                    bodyPreview: message.bodyPreview || "",
                                    from: message.from.emailAddress || "Unknown",
                                    subject: message.subject || "No subject",
                                    webLink: message.webLink || "",
                                    id: message.id
                                }
                            }];
                        }
                    } while (match);
                }
            }
            allURLs = [...allURLs, ...urls];
        })
        let retURLs = [];
        if (allURLs.length) {
            chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
            chrome.browserAction.setBadgeText({ text: allURLs.length.toString() });
            retURLs = await storageSrv.addURLs(allURLs);
        }
        return retURLs
    }
});