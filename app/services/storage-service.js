angular.module('app').service('storageService', function ($q, $location) {
    this.data = {
        'token': "",
        'error': "",
        'refreshToken': "",
        'firstLoginComplete': false
    };
    var _this = this;

    this.storeToken = function (token) {
        this.data = { ...this.data, token: token, error: "" };
        chrome.storage.sync.set(this.data, function () {
            console.log('Token stored');
        })
    }
    this.loginComplete = function () {
        this.data = { ...this.data, firstLoginComplete: true };
        console.log(this.data);
        chrome.storage.sync.set({ firstLoginComplete: true }, function () {
            console.log('Login complete');
        })
    }
    this.storeRefreshToken = function (token) {
        this.data = { ...this.data, refreshToken: token, error: "" };
        chrome.storage.sync.set(this.data, function () {
            console.log('Refresh token stored');
        })
    }
    this.syncData = function () {
        chrome.storage.sync.get('token', function (keys) {
            if (keys.token != null)
                _this.data.token = keys.token;
        })
        chrome.storage.sync.get('refreshToken', function (keys) {
            if (keys.refreshToken != null)
                _this.data.refreshToken = keys.refreshToken;
        })
        chrome.storage.sync.get('firstLoginComplete', function (keys) {
            if (keys.firstLoginComplete)
                _this.data.firstLoginComplete = keys.firstLoginComplete;
        })
    }
    this.removeToken = function () {
        this.data = { ...this.data, token: "" };
        chrome.storage.sync.set(this.data, function () {
            console.log('Token removed');
        })
    }
    this.logError = function (errorType) {
        this.data.error = errorType;
        $location.url('/error');
    }
    this.clearError = function () {
        this.data.error = "";
    }

});