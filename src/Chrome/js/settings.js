var preferences;

var init = function () {
	
	$('#import-settings').on('click', importPrefs);
	$('#clear-prefs').on('click', clearPrefs);
	
	loadPrefs();
};

var loadPrefs = function () {
    var $prefs = $('.prefs, .users');
    var $noprefs = $('.no-prefs');
    var $content = $('.prefs div');
    var oldUsers = [];

    if (preferences && preferences.Users) {
        oldUsers = preferences.Users;
    }

    $prefs.hide();
    $noprefs.hide();

    var addError = function (msg) {
        $content.append('<p class="pref-error">' + msg + '</p>');
    };

    var addSuccess = function (msg) {
        $content.append('<p class="pref-success">' + msg + '</p>');
    };

    chrome.storage.sync.get('prefs', function (result) {
        if (result.prefs) {
            preferences = result.prefs;
            $content.html('');

            if (!preferences.Token_Auth) {
                addError('Token_Auth section missing');
            }
            else {
                if (!preferences.Token_Auth.grant_type) {
                    addError('Token_Auth.grant_type value missing');
                }
                if (!preferences.Token_Auth.client_id) {
                    addError('Token_Auth.client_id value missing');
                }
                if (!preferences.Token_Auth.client_secret) {
                    addError('Token_Auth.client_secret value missing');
                }
                if ($content.html() == '') {
                    addSuccess('Token_Auth data loaded');
                }
            }

            if (!preferences.Environments) {
                addError('Environments section missing');
            }
            else {
                $.each(preferences.Environments, function () {
                    addSuccess('Environment loaded: ' + this.Name);
                });
            }

            if (!preferences.Users) {
                addError('Users section missing');
            }
            else {
                addSuccess('Users loaded');

                $.each(preferences.Users, function () {
                    var newUser = this;
                    var exists = false;

                    $.each(oldUsers, function () { if (this.UserId == newUser.UserId) { exists = true; } });

                    if (!exists) {
                        oldUsers.push(newUser);
                    }
                });

                preferences.Users = oldUsers;
                commitPrefs(preferences);
            }

            $prefs.show();
        }
        else {
            preferences = {};
            $noprefs.show();
        }

        updateUsers();
    });
};

var updateUsers = function () {
    var $content = $('.users div');
    var html = '';

    if (!!preferences.Users && preferences.Users.length > 0) {
        html += ('<table>');
        html += ('<tr><th>&nbsp;</th><th>User</th><th>User ID</th></tr>');

        $.each(preferences.Users, function () {
            var user = this;

            html += '<tr>';
            html += '<td><img src="images/delete.png" /></td>';
            html += '<td>' + user.Name + '</td>';
            html += '<td>' + user.UserId + '</td>';
            html += '</tr>';
        });

        html += ('</table>');
    }

    $content.html(html);
};

var importPrefs = function () {
	var fileList = $('#settings-file')[0].files;
	var fileReader = new FileReader(); 
		
	if (!(fileList instanceof FileList) || fileList.length === 0){ 
		alert('You must select a settings file to import. Click the Choose File to select a file.'); 
		return false; 
	} 
		
	fileReader.onloadend = (function(file){ 

		return function(e) { 
		    var newPrefs = $.parseJSON(e.target.result);
			
			commitPrefs(newPrefs);
			setTimeout(function () { loadPrefs(); }, 100);
		} 

	})(fileList[0]); 
		
	fileReader.readAsText(fileList[0]); 
};

var commitPrefs = function (prefs) {
    chrome.storage.sync.set({ 'prefs': prefs });
};

var clearPrefs = function () {
    chrome.storage.sync.remove('prefs');
    setTimeout(function () { loadPrefs(); }, 100);
};

$(function () {
	init();
});
