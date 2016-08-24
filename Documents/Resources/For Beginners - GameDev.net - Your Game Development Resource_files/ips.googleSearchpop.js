/************************************************/
/* IPB3 Javascript								*/
/* -------------------------------------------- */
/* ips.googleSearch.js Google Site Search		*/
/* (c) InvisionHQ, 2012							*/
/* -------------------------------------------- */
/* Author: Gabriele Venturini					*/
/************************************************/

var _googleSearch = window.IPBoard;

_googleSearch.prototype.googleSearch = 
{
	cseKey: '',
	alwaysDefault: false,
	notProperlySetup: false,
	
	init: function()
	{
		Debug.write( "Initializing ips.googleSearchpop.js" );
		
		document.observe( 'dom:loaded', function()
		{
			ipb.googleSearch.initEvent();
		});
	},

	initEvent: function()
	{		
		Debug.write( "Initializing googleSearch events" );
		
		if ( ipb.googleSearch.notProperlySetup == true )
		{
			errorDiv = new Element( 'div', { 'class': 'message error' });
			errorDiv.update( "<h3>Admin warning (Not visible to regular users)</h3>Google Site Search is not properly setup. Please refer to the system settings or readme file for this hook for more information on how to set it up. NB: An AJAX API key IS required!<br />If you don't want to use this hook, disable or uninstall it to remove this warning message." );
			$( 'content' ).insert( { top: errorDiv } );
		}
		else
		{
			
			if ( $( 'search-box' ) )
			{
				$( 'search-box' ).observe( 'submit', ipb.googleSearch.doSearch );
			}
			
			/* Always make this the default search engine */
			if ( ipb.googleSearch.alwaysDefault )
			{
				$$( '#search_options_menucontent .input_radio' ).each( function( elem )
				{
					$( elem ).checked = false;
				});
				
				$( 's_google' ).checked = 'checked';
				
				ipb.global.contextualSearch();
			}
		}
	},
	
	doSearch: function(e)
	{
		if ( $( 's_google' ).checked != false )
		{
			Event.stop(e);
			
			window.location.href = ipb.vars['base_url'] + 'app=googlecse#gsc.tab=0&gsc.q=' + $F( 'main_search' );
			
			return false;
		}
		
		return true;
	},
	
}

ipb.googleSearch.init();
