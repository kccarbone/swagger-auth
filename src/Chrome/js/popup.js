var background = chrome.extension.getBackgroundPage();
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

	$('#btnUserLogin, #btnImpUserLogin').on('click', function () {
	    setLoading();
	    saveLoginInfo();
	    getOAuthToken();
	});
	
	setActiveIndex(0);
	setLoading();
	loadPrefs();
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
	background.getPrefs(function (result) {
	    if (result && !result.missing) {
	        preferences = result;
	        loadUsers();
	        loadLoginInfo();
	    }
	    else {
	        background.setPrefs({ missing: true });
		    background.setSavedLogin({ savePassword: false });
		    background.setSavedImpLogin({ impSavePassword: false });
		    setActiveIndex(2);
		    clearLoading();
			$('.nav li:not(.active)').addClass('disabled');
			$('.prefs').hide();
			$('.no-prefs').show();
		}
	});
};

var loadUsers = function () {
    $('#ddImpersonate').html('<option value="">&lt;Nobody&gt;</option>');

    $.each(preferences.Users, function () {
        var user = this;
        var id = '';

        if (user.UserId) {
            id = 'user-' + user.UserId;
        }
        if (user.ClientId) {
            id = 'client-' + user.ClientId;
        }
        if (user.EntityId) {
            id = 'entity-' + user.EntityId;
        }

        $('#ddImpersonate').append('<option value="' + id + '">' + user.Name + '</option>');
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
        background.setSavedLogin(
            {
                username: $username.val(),
                password: $password.val(),
                savePassword: $savePassword.is(':checked')
            }
        );
    }
    else {
        background.setSavedLogin({ savePassword: false });
    }

    if ($impSavePassword.is(':checked')) {
        background.setSavedImpLogin(
            {
                impUsername: $impUsername.val(),
                impPassword: $impPassword.val(),
                impSavePassword: $impSavePassword.is(':checked')
            }
        );
    }
    else {
        background.setSavedImpLogin({ impSavePassword: false });
    }
};

var loadLoginInfo = function () {
    var $username = $('#tbUserName');
    var $password = $('#tbPassword');
    var $savePassword = $('#cbSavePassword');
    var $impUsername = $('#tbImpUserName');
    var $impPassword = $('#tbImpPassword');
    var $impSavePassword = $('#cbImpSavePassword');

    background.getSavedLogin(function (result) {
        if (result && result.savePassword) {
            $username.val(result.username);
            $password.val(result.password);
            $savePassword.prop('checked', result.savePassword);
        }
        else {
            background.setSavedLogin({ savePassword: false });
        }

        background.getSavedImpLogin(function (result) {
            if (result && result.impSavePassword) {
                $impUsername.val(result.impUsername);
                $impPassword.val(result.impPassword);
                $impSavePassword.prop('checked', result.impSavePassword);
            }
            else {
                background.setSavedImpLogin({ impSavePassword: false });
            }

            clearLoading();
        });
    });
};

var getOAuthToken = function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var tab = tabs[0];
        var environment;
        var username = $('#tbUserName').val();
        var password = $('#tbPassword').val();
        var name = $('#tbUserName').val();
        var impersonateId = '';

        if ($('.content').eq(1).is('.active')) {
            username = $('#tbImpUserName').val();
            password = $('#tbImpPassword').val();
            impersonateId = $('#ddImpersonate option:selected').val();
            name = $('#ddImpersonate option:selected').text();
        }

        if (name == '<Nobody>') {
            name = username;
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
            if (tab.url.toLowerCase().indexOf(this.API_url.toLowerCase()) >= 0) {
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
            chrome.tabs.executeScript(tab.id, { file: "js/jquery.js" }, function () {
                chrome.tabs.executeScript(tab.id, { file: "js/content.js" }, function () {
                    chrome.tabs.executeScript(tab.id, { code: "content.fillAuth('" + htmlEscape(name) + "', '" + data.access_token + "', '" + impersonateId + "');" }, function () {
                        window.close();
                    });
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

var htmlEscape = function (str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

$(function () {
	init();
});
