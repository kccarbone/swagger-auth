var init = function () {
	injectContentJS(function () {
		chrome.tabs.executeScript(null, { code: 'contentJS.setTokenField("test");' });
	});
}

var injectContentJS = function (callback) {
	chrome.tabs.executeScript(null, { file: "jquery.js" }, function(){
		chrome.tabs.executeScript(null, { file: "content.js" }, function(){
			if(callback){
				callback();
			}
		});
	});
}

init();
