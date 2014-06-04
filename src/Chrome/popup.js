var init = function () {
	
	$('.nav li').on('click', function () { 
		setActiveIndex($('.nav li').index(this));
	});
	
	$('h1').on('click', function () {
		 var fileList            = 
		document.getElementById('settingsFile').files; 
		
		    // Make sure file has been selected 
		    if (!(fileList instanceof FileList) || fileList.length === 0){ 
		
		        alert('You must select a settings file to import. Click the Choose File to select a file.'); 
		        return false; 
		    } 
		
		    var fileReader = new FileReader(); 
		
		    fileReader.onloadend = (function(file){ 
		
		        return function(e) { 
		        	console.log(e.target.result);
		        } 
		
		    })(fileList[0]); 
		
		    fileReader.readAsText(fileList[0]); 
	});
	
	
	// TODO: wrap this in the browser action click handler to avoid permission warning
	injectContentJS(function () {
		
	});
	
	setActiveIndex(0);
};

var setActiveIndex = function (index) {
	$('.nav li').removeClass('active').eq(index).addClass('active');
	$('.content').removeClass('active').eq(index).addClass('active');
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
