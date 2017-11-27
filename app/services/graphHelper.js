angular.module('app').service('GraphHelper', function ($http, $location, storageService) {
    var redirectUri = 'https://' + chrome.runtime.id +
        '.chromiumapp.org/index.html';
    var storageSrv = storageService;
    this.error = new Object(null);

    this.loginInfo = APPLICATION_CONFIG.authorizationURL +
    'client_id=' + APPLICATION_CONFIG.client_id +
    '&response_type=code' +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_mode=query' +
    '&scope=' + encodeURIComponent(APPLICATION_CONFIG.graphScopes) +
    '&nonce=' + APPLICATION_CONFIG.nonce

    this.setHeaders = function (token) {
        chrome.storage.sync.get('token', function (keys) {
            if (keys.token) {
                console.log(keys.token);
                $http.defaults.headers.common.Authorization = 'Bearer ' + keys.token;
            }
        });
    }

    this.login = function () {
        redirectUri = 'https://' + chrome.runtime.id +
            '.chromiumapp.org/background.html';
        var options = {
            'interactive': true,
            url: APPLICATION_CONFIG.authorizationURL +
                'client_id=' + APPLICATION_CONFIG.client_id +
                '&response_type=code' +
                '&redirect_uri=' + encodeURIComponent(redirectUri) +
                '&response_mode=query' +
                '&scope=' + encodeURIComponent(APPLICATION_CONFIG.graphScopes) +
                '&nonce=' + APPLICATION_CONFIG.nonce
        };
        var callback = this.getTokenOnCallback.bind(this);
        //chrome.tabs.create({url: options.url});
        chrome.identity.launchWebAuthFlow(options, callback);
    }
    this.getTokenOnCallback = function (returnUri) {
        if (returnUri && returnUri.includes("code=")) {
            var _this = this;
            var code = returnUri.split("code=")[1];
            $http({
                method: 'POST',
                url: APPLICATION_CONFIG.tokenURL,
                data: 'client_id=' + APPLICATION_CONFIG.client_id +
                    '&scope=' + encodeURIComponent(APPLICATION_CONFIG.graphScopes) +
                    '&code=' + code +
                    '&redirect_uri=' + encodeURIComponent(redirectUri) +
                    '&grant_type=authorization_code' +
                    '&client_secret=' + APPLICATION_CONFIG.clientSecret,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (response) {
                if (response['refresh_token']) {
                    storageSrv.storeRefreshToken(response['refresh_token']);
                }
                if (response['access_token']) {
                    console.log(response);
                    storageSrv.storeToken(response['access_token']);
                    $http.defaults.headers.common.Authorization = 'Bearer ' + response['access_token'];
                }
            }).error(function (err) {
                console.log(err);
                storageSrv.logError('bad_request');
            });
        }
        if (chrome.runtime.lastError) {
            storageSrv.logError('bad_request');
        }
    }
    this.getNewToken = function (refreshToken) {
        redirectUri = 'https://' + chrome.runtime.id +
            '.chromiumapp.org/background.html';
        return $http({
            method: 'POST',
            url: APPLICATION_CONFIG.tokenURL,
            data: 'client_id=' + APPLICATION_CONFIG.client_id +
                '&scope=' + encodeURIComponent(APPLICATION_CONFIG.graphScopes) +
                '&refresh_token=' + refreshToken +
                '&redirect_uri=' + encodeURIComponent(redirectUri) +
                '&grant_type=refresh_token' +
                '&client_secret=' + APPLICATION_CONFIG.clientSecret,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
    }
    this.fetchInbox = function (token) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
        return $http({
            method: 'GET',
            url: "https://graph.microsoft.com/v1.0/me/mailfolders/inbox/messages"
        })
    }
    this.getContacts = function (token) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
        return $http({
            method: 'GET',
            url: "https://graph.microsoft.com/v1.0/me/contacts?$select=EmailAddresses,DisplayName"
        })
    }

    this.logout = function () {
        storageService.removeToken();
    }

    // Get the profile of the current user.
    this.me = function () {
        return $http.get('https://graph.microsoft.com/v1.0/me');
    }

    // Send an email on behalf of the current user.
    this.sendMail = function (email) {
        return $http.post('https://graph.microsoft.com/v1.0/me/sendMail', { 'message': email, 'saveToSentItems': true });
    }
});