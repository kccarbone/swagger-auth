var content = (function($){
	
    var fillAuth = function (name, token, impersonateId) {
        var $tbApiKey = $('#input_apiKey');
        var $tbUserId = $('#input_RunAs');
        var $tbClientId = $('#input_RunClientAs');
        var $message = $('#sa-message');

        if ($message.length <= 0) {
            $message = $('<div id="sa-message"></div>').css({
                position: 'fixed',
                top: '0',
                left: '50%',
                width: '400px',
                marginLeft: '-200px',
                padding: '3px',
                zIndex: '3',
                fontSize: '13px',
                textAlign: 'center',
                color: '#fff',
                backgroundColor: '#5a5',
                display: 'none'
            })
            .appendTo('body');
        }

        console.log(impersonateId);
        if (impersonateId.indexOf('user-') == 0) {
            $tbClientId.val('');
            $tbUserId
                .val(impersonateId.substr(5))
                .css({ backgroundColor: '#ffd' })
                .on('focus', function () { $(this).css({ backgroundColor: '#fff' }) });
        }

        if (impersonateId.indexOf('client-') == 0) {
            $tbUserId.val('');
            $tbClientId
                .val(impersonateId.substr(7))
                .css({ backgroundColor: '#ffd' })
                .on('focus', function () { $(this).css({ backgroundColor: '#fff' }) });
        }

        $tbApiKey
            .val(token)
            .css({ backgroundColor: '#ffd' })
            .on('focus', function () { $(this).css({ backgroundColor: '#fff' }) });

        // Inject the button click event directly into the page so that it uses
        // the page's own jQuery instance and event handlers
        var script = document.createElement('script');
        script.textContent = '$("#explore").trigger("click");';
        document.head.appendChild(script);

        $message.text('Authorized user: ' + name)
            .show()
            .delay(3000)
            .fadeOut(2000);
	};
	
	return {
	    fillAuth: fillAuth
	}
	
})(jQuery);