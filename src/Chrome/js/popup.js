var preferences;

var init = function () {
	
	$('.nav li').on('click', function () { 
		if (!$(this).hasClass('disabled')) {
			setActiveIndex($('.nav li').index(this));
		}
	});
	
	$('.settings-link button').on('click', function () {
		chrome.tabs.create({'url': chrome.extension.getURL("settings.html") } )
	});

	$('#btnUserLogin').on('click', function () {
	    setLoading();
	    saveLoginInfo();
	    getOAuthToken();
	});
	
	setActiveIndex(0);
	loadPrefs();
	loadLoginInfo();
};

var setActiveIndex = function (index) {
	$('.nav li').removeClass('active').eq(index).addClass('active');
	$('.content').removeClass('active').eq(index).addClass('active');
};

var setLoading = function () {
    clearError();
    $('.loadingBar').show();
    $('button, input, checkbox, select').prop('disabled', true);
};

var clearLoading = function () {
    $('.loadingBar').hide();
    $('button, input, checkbox, select').prop('disabled', false);
};

var loadPrefs = function () {
	chrome.storage.sync.get('prefs', function (result) {
		if (result.prefs) {
		    preferences = result.prefs;
		}
		else {
			setActiveIndex(2);
			$('.nav li:not(.active)').addClass('disabled');
			$('.prefs').hide();
			$('.no-prefs').show();
		}
	});
};

var saveLoginInfo = function () {
    var $username = $('#tbUserName');
    var $password = $('#tbPassword');
    var $savePassword = $('#cbSavePassword');
    var $impUsername = $('#tbImpUserName');
    var $impPassword = $('#tbImpPassword');
    var $impSavePassword = $('#cbImpSavePassword');

    if ($savePassword.is(':checked')) {
        chrome.storage.sync.set({
            savedLogin:
                {
                    username: $username.val(),
                    password: $password.val(),
                    savePassword: $savePassword.is(':checked')
                }
        });
    }
    else {
        chrome.storage.sync.set({ savedLogin: { savePassword: false } });
    }

    if ($impSavePassword.is(':checked')) {
        chrome.storage.sync.set({
            savedImpLogin:
                {
                    impUsername: $impUsername.val(),
                    impPassword: $impPassword.val(),
                    impSavePassword: $impSavePassword.is(':checked')
                }
        });
    }
    else {
        chrome.storage.sync.set({ savedImpLogin: { impSavePassword: false } });
    }
};

var loadLoginInfo = function () {
    var $username = $('#tbUserName');
    var $password = $('#tbPassword');
    var $savePassword = $('#cbSavePassword');
    var $impUsername = $('#tbImpUserName');
    var $impPassword = $('#tbImpPassword');
    var $impSavePassword = $('#cbImpSavePassword');

    chrome.storage.sync.get('savedLogin', function (result) {
        if (result.savedLogin && result.savedLogin.savePassword) {
            $username.val(result.savedLogin.username);
            $password.val(result.savedLogin.password);
            $savePassword.prop('checked', result.savedLogin.savePassword);
        }
    });

    chrome.storage.sync.get('savedImpLogin', function (result) {
        if (result.savedImpLogin && result.savedImpLogin.impSavePassword) {
            $impUsername.val(result.savedImpLogin.impUsername);
            $impPassword.val(result.savedImpLogin.impPassword);
            $impSavePassword.prop('checked', result.savedImpLogin.impSavePassword);
        }
    });
};

var getOAuthToken = function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var tab = tabs[0];
        var environment;
        var username = $('#tbUserName').val();
        var password = $('#tbPassword').val();
        var userId = '';

        if ($('.content').eq(1).is('.active')) {
            username = $('#tbImpUserName').val();
            password = $('#tbImpPassword').val();
        }
        
        if (!tab) { showError('Tab not found'); return; }
        if (!preferences) { showError('Preferences not found'); return; }
        if (!preferences.Token_Auth) { showError('Token_Auth not found'); return; }
        if (!preferences.Token_Auth.grant_type) { showError('grant_type not found'); return; }
        if (!preferences.Token_Auth.client_id) { showError('client_id not found'); return; }
        if (!preferences.Token_Auth.client_secret) { showError('client_secret not found'); return; }
        if (!preferences.Environments) { showError('No environments configured'); return; }
        if (preferences.Environments.length <= 0) { showError('No environments configured'); return; }

        $.each(preferences.Environments, function () {
            if (tab.url.indexOf(this.API_url) >= 0) {
                environment = this;
            }
        });

        if (!environment) { showError('Environment not recognized'); return; }

        $.post(environment.IDP_url,
            {
                username: username,
                password: password,
                grant_type: preferences.Token_Auth.grant_type,
                client_id: preferences.Token_Auth.client_id,
                client_secret: preferences.Token_Auth.client_secret
            }
        )
        .done(function (data) {
            clearLoading();

            chrome.tabs.executeScript(tab.id, { file: "js/jquery.js" }, function () {
                chrome.tabs.executeScript(tab.id, { file: "js/content.js" }, function () {
                    chrome.tabs.executeScript(tab.id, { code: "content.fillAuth('" + username + "', '" + data.access_token + "', '" + userId + "');" });
                });
            });
        })
        .fail(function () {
            showError('Authenication failed');
        });
    });
};

var showError = function (msg) {
    clearLoading();
    $('.error-message').html(msg).show();
};

var clearError = function (msg) {
    $('.error-message').hide();
};

$(function () {
	init();
});
