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
    var $loading = $('.loading');
    var oldUsers = [];

    if (preferences && preferences.Users) {
        oldUsers = preferences.Users;
    }

    $prefs.hide();
    $noprefs.hide();
    $loading.show();

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
        $loading.hide();
    });
};

var updateUsers = function () {
    var $content = $('.users div');
    var html = '';

    if (!!preferences.Users) {
        html += ('<table>');
        html += ('<tr><th>&nbsp;</th><th>User</th><th>User ID</th></tr>');

        $.each(preferences.Users, function () {
            var user = this;

            html += '<tr>';
            html += '<td><img src="images/delete.png" class="delete" /></td>';
            html += '<td>' + user.Name + '</td>';
            html += '<td>' + user.UserId + '</td>';
            html += '</tr>';
        });

        html += '<tr>';
        html += '<td><img src="images/add.png" /></td>';
        html += '<td><input type="text" id="tbNewUser" /></td>';
        html += '<td><input type="text" id="tbNewUserId" /></td>';
        html += '</tr>';

        html += ('</table>');
    }

    $content.html(html);

    var deleteHandler = function () {
        var $row = $(this).parent().parent();
        var index = $row.prevAll().length - 1;

        $row.css({ backgroundColor: '#ecc' })
            .fadeOut(300, function () { $(this).remove(); });

        preferences.Users.splice(index, 1);
        commitPrefs(preferences);
        console.log(preferences.Users);
    };

    var createHandler = function (row) {
        var $row = $(row);
        var $newUser = $('#tbNewUser');
        var $newUserId = $('#tbNewUserId');
        var newItemHtml = '';
        var newVal, $newItem;

        if ($newUser.val() != '' && $newUserId.val() != '') {
            newItemHtml += '<tr>';
            newItemHtml += '<td><img src="images/delete.png" class="delete" /></td>';
            newItemHtml += '<td>' + $newUser.val() + '</td>';
            newItemHtml += '<td>' + $newUserId.val() + '</td>';
            newItemHtml += '</tr>';

            newVal = { Name: $newUser.val(), UserId: $newUserId.val() };
            preferences.Users.push(newVal);
            commitPrefs(preferences);

            $newItem = $(newItemHtml);
            $row.before($newItem);
            $newItem.find('img.delete').on('click', deleteHandler);
            $newItem.css({ backgroundColor: '#cec' })
                .animate({ backgroundColor: '#eee' }, 500, function () { $(this).css({ backgroundColor: '' }) })
            $newUserId.val('');
            $newUser.val('').focus();
        }
    };

    $('img.delete')
        .off('click')
        .on('click', deleteHandler);

    $('#tbNewUser, #tbNewUserId')
        .off('keypress')
        .on('keypress', function (e) {
            if (e.which == 13) {
                createHandler($(this).parent().parent());
            }
        });

    $('#tbNewUserId')
        .off('keydown')
        .on('keydown', function (e) {
            if (e.which == 9) {
                e.preventDefault();
                createHandler($(this).parent().parent());
            }
        });
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
