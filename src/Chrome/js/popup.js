var init = function () {
	
	$('.nav li').on('click', function () { 
		if (!$(this).hasClass('disabled')) {
			setActiveIndex($('.nav li').index(this));
		}
	});
	
	$('.settings-link button').on('click', function () {
		chrome.tabs.create({'url': chrome.extension.getURL("settings.html") } )
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

var loadPrefs = function () {
	chrome.storage.sync.get('prefs', function (result) {
		if (result.prefs) {
			prefs = result.prefs;
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
