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
	});
	
	// TODO: wrap this in the browser action click handler to avoid permission warning
	injectContentJS(function () {
		
	});
	
	setActiveIndex(0);
	loadPrefs();
};

var setActiveIndex = function (index) {
	$('.nav li').removeClass('active').eq(index).addClass('active');
	$('.content').removeClass('active').eq(index).addClass('active');
};

var setLoading = function () {
    $('.loadingBar').show();
    $('button').prop('disabled', true);
};

var clearLoading = function () {
    $('.loadingBar').hide();
    $('button').prop('disabled', false);
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

var injectContentJS = function (callback) {
	chrome.tabs.executeScript(null, { file: "jquery.js" }, function(){
		chrome.tabs.executeScript(null, { file: "content.js" }, function(){
			if(callback){
				callback();
			}
		});
	});
};

$(function () {
	init();
});
