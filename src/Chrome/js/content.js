var contentJS = (function($){
	
	var setTokenField = function (val) {
		$('a').text(val);
	};
	
	return {
		setTokenField: setTokenField
	}
	
})(jQuery);