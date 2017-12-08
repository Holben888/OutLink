angular.module('app').service('storageService', function ($q) {
    this.data = {
        'token': "",
        'error': "",
        'refreshToken': "",
        'firstLoginComplete': false,
        'user': {}
    };
    var _this = this;

    this.storeToken = function (token) {
        this.data = { ...this.data, token: token, error: "" };
        chrome.storage.sync.set({ token: token, error: "" }, function () {
            console.log('Token stored');
        })
    }
    this.loginComplete = function () {
        this.data = { ...this.data, firstLoginComplete: true };
        chrome.storage.sync.set({ firstLoginComplete: true }, function () {
            console.log('Login complete');
        })
    }
    this.storeRefreshToken = function (token) {
        this.data = { ...this.data, refreshToken: token, error: "" };
        chrome.storage.sync.set({ refreshToken: token, error: "" }, function () {
            console.log('Refresh token stored');
        })
    }
    this.storeUser = function (user) {
        this.data = {
            ...this.data, user: {
                name: user.givenName,
                emailAddress: user.userPrincipalName
            }
        }
        chrome.storage.sync.set({ user: this.data.user }, function () {
            console.log('User stored');
        })
    }
    this.syncData = function () {
        chrome.storage.sync.get(null, function (keys) {
            if (keys.token != null)
                _this.data.token = keys.token;
            if (keys.refreshToken != null)
                _this.data.refreshToken = keys.refreshToken;
            if (keys.firstLoginComplete)
                _this.data.firstLoginComplete = keys.firstLoginComplete;
        })
    }
    this.setInboxSize = function (size) {
        console.log(size);
        chrome.storage.local.set({ inboxSize: size }, function () {
            console.log('Inbox size set');
        })
    }
    this.addURLs = function (urls) {
        chrome.storage.local.get('urls', function (keys) {
            if (!keys.urls)
                keys.urls = [];
            for (givenUrlOb of urls) {
                let found = false;
                let url = new URL(givenUrlOb.url);
                url.hostname = url.hostname.replace('www.', '');
                for (urlOb of keys.urls) {
                    if (url.hostname == urlOb.url.hostname && url.pathname == urlOb.url.pathname) {
                        found = true;
                        let shouldAdd = true;
                        for (message of urlOb.messages) {
                            if (givenUrlOb.message.id == message.id)
                                shouldAdd = false;
                        } if (shouldAdd)
                            urlOb.messages = [...urlOb.messages, givenUrlOb.message]

                    }
                } if (!found) {
                    keys.urls = [...keys.urls, {
                        url: {
                            hostname: url.hostname,
                            pathname: url.pathname
                        },
                        messages: [givenUrlOb.message]
                    }]
                }
            }
            console.log(keys.urls)
            chrome.storage.local.set({ urls: keys.urls }, function () {
                console.log("urls added");
            })
        })
    }
    this.logError = function (errorType) {
        console.log(errorType);
        this.data.error = errorType;
    }
    this.clearError = function () {
        this.data.error = "";
    }

});