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
    this.storeHomeState = function (data) {
        chrome.storage.local.set(data, function () {
            console.log('Home state stored');
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
    this.logout = function () {
        chrome.storage.local.clear();
        chrome.storage.sync.clear();
    }
    this.addURLs = function (urls) {
        return new Promise(resolve => {
            chrome.storage.local.get('urls', function (keys) {
                if (!keys.urls)
                    keys.urls = [];
                for (givenUrlOb of urls) {
                    let found = false;
                    let url = new URL(givenUrlOb.url);
                    if (url.hostname.indexOf('www.') == 0)
                        url.hostname = url.hostname.substring(4);
                    for (urlOb of keys.urls) {
                        if (url.hostname == urlOb.url.hostname && url.pathname == urlOb.url.pathname) {
                            found = true;
                            let shouldAdd = true;
                            for (message of urlOb.messages) {
                                if (givenUrlOb.message.id == message.id)
                                    shouldAdd = false;
                            } if (shouldAdd) {
                                urlOb.display.senders = [...urlOb.display.senders, givenUrlOb.message.from.name || givenUrlOb.message.from.address]
                                urlOb.messages = [...urlOb.messages, givenUrlOb.message]
                                urlOb.display.senders = urlOb.display.senders.filter(function (elem, index, self) {
                                    return index == self.indexOf(elem);
                                })
                            }

                        }
                    } if (!found) {
                        keys.urls = [...keys.urls, {
                            display: {
                                url: givenUrlOb.url,
                                senders: [givenUrlOb.message.from.name || givenUrlOb.message.from.address]
                            },
                            url: {
                                hostname: url.hostname,
                                pathname: url.pathname
                            },
                            messages: [givenUrlOb.message]
                        }]
                    }
                }
                chrome.storage.local.set({ urls: keys.urls }, function () {
                    resolve(keys.urls);
                })
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