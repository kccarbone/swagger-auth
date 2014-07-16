var cachedPrefs;
var cachedSavedLogin;
var cachedSavedImpLogin;

var getPrefs = function (callback) {
    if (cachedPrefs) {
        callback(cachedPrefs);
        return;
    }

    chrome.storage.sync.get('prefs', function (result) {
        cachedPrefs = result.prefs;
        callback(result.prefs);
    });
};

var getSavedLogin = function (callback) {
    if (cachedSavedLogin) {
        callback(cachedSavedLogin);
        return;
    }

    chrome.storage.sync.get('savedLogin', function (result) {
        cachedSavedLogin = result.savedLogin;
        callback(result.savedLogin);
    });
};

var getSavedImpLogin = function (callback) {
    if (cachedSavedImpLogin) {
        callback(cachedSavedImpLogin);
        return;
    }

    chrome.storage.sync.get('savedImpLogin', function (result) {
        cachedSavedImpLogin = result.savedImpLogin;
        callback(result.savedImpLogin);
    });
};

var setPrefs = function (prefs) {
    cachedPrefs = prefs;
    chrome.storage.sync.set({ 'prefs': prefs });
};

var setSavedLogin = function (savedLogin) {
    cachedSavedLogin = savedLogin;
    chrome.storage.sync.set({ 'savedLogin': savedLogin });
};

var setSavedImpLogin = function (savedImpLogin) {
    cachedSavedImpLogin = savedImpLogin;
    chrome.storage.sync.set({ 'savedImpLogin': savedImpLogin });
};

var clearPrefs = function () {
    cachedPrefs = false;
    chrome.storage.sync.remove('prefs');
};


