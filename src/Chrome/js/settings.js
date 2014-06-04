var init = function () {
	
	$('#import-settings').on('click', importPrefs);
	$('#clear-prefs').on('click', clearPrefs);
	
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
			console.log(newPrefs);
			
			chrome.storage.sync.set({ 'prefs': newPrefs });
		} 

	})(fileList[0]); 
		
	fileReader.readAsText(fileList[0]); 
};

var clearPrefs = function () {
	chrome.storage.sync.remove('prefs');
};

$(function () {
	init();
});
