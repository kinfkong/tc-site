(function ( $ ) {
	"use strict";
	/*global alert */
	/*global tb_remove */
	/*global arve_regex_list */
	/*global send_to_editor */
	
	var create_shortcode = function() {

		if ( ( $('#arve-provider').val() === '' ) || ( $('#arve-id').val() === '' ) ) {
			return;
		}

		// defines the options and their default values
		// again, this is not the most elegant way to do this
		// but well, this gets the job done nonetheless
		var options = {
			'id'           : '',
			'align'        : '',
			'mode'         : '',
			'autoplay'     : '',
			'aspect_ratio' : '',
			'maxwidth'     : '',
			'parameters'   : '',
			'thumbnail'    : '',
			'grow'         : '',
		};

		var shortcode = '[' + $('#arve-provider').val();

		for( var index in options) {
			var value = $('#arve-' + index).val();

			// attaches the attribute to the shortcode only if it's different from the default value
			if ( value !== options[index] )
				shortcode += ' ' + index + '="' + value + '"';
		}

		shortcode += ']';

		return shortcode;
	};

	var detect_id = function( code ) {

		//var regExp;
		var embed_regex = {}; 
		var output      = {};

		$.each( arve_regex_list, function( provider, regex ) {

			regex = new RegExp( regex,"i" );

			var match = code.match( regex );
			
			if ( match && match[1] ) {
				output.provider = provider;
				output.videoid  = match[1];
				return false;
			}

		});

		if( ! $.isEmptyObject( output ) ) {
			return output;
		}

		// MTV services
		embed_regex.comedycentral = /comedycentral\.com:([a-z0-9\-]{36})/i;
		embed_regex.gametrailers  = /gametrailers\.com:([a-z0-9\-]{36})/i;
		embed_regex.spike         = /spike\.com:([a-z0-9\-]{36})/i;

		embed_regex.flickr        = /flickr\.com\/photos\/[a-zA-Z0-9@_\-]+\/([0-9]+)/i;
		embed_regex.videojug      = /videojug\.com\/embed\/([a-z0-9\-]{36})/i;
		embed_regex.bliptv        = /blip\.tv\/play\/([a-z0-9]+)/i;
		embed_regex.movieweb      = /movieweb\.com\/v\/([a-z0-9]{14})/i;

		// Iframe
		embed_regex.iframe        = /src=(?:'|")(https?:\/\/(www\.)?[^'"]+)/i;
		embed_regex.fileurl       = /(.*\.(mp4|webm|ogg))$/i;

		$.each( embed_regex, function( provider, regex ) {

			var match = code.match( regex );

			if ( match && match[1] ) {

				if ( 'fileurl' == provider ) {
					provider = 'iframe';				
				}

				output.provider = provider;
				output.videoid  = match[1];
				return false;
			}

		});

		if( ! $.isEmptyObject(output) ) {
			return output;
		}

		return 'nothing matched';
	};

	$( "#arve-btn" ).click( function( event ) {

		event.preventDefault();

		setTimeout( function() {
			// Stupid WP or Thinkbox
			$( '#TB_ajaxContent' ).height( "auto" );
			$( '#TB_window' ).height( $( '.arve-dialog:first' ).outerHeight() + 70 );
		}, 100 );
	} );

	$( "#arve-show-more" ).click( function( event ) {
		event.preventDefault();
		$('.arve-hidden').fadeIn();
	});

	// handles the click event of the submit button
	$( '#arve-submit' ).click( function( event ){

		event.preventDefault();

		if ( ( $( '#arve-id' ).val() === '' ) || ( $('#arve-id').val() === 'nothing matched' ) ) {
			alert( 'no id' );
			return;
		}

		if ( $( '#arve-provider' ).val() === '' )  {
			alert( 'no provider selected' );
			return;
		}

		// inserts the shortcode into the active editor
		send_to_editor( create_shortcode() );

		// closes Thickbox
		tb_remove();
	});

	$( '#arve-url' ).bind( 'keyup mouseup change', function() {

		var response = detect_id( $(this).val() );

		if ( 'nothing matched' == response ) {
			return;
		}

		$( "#arve-provider option" ).each( function () {
			if ( $(this).html() == response.provider ) {
				$(this).attr("selected", "selected");
				return;
			}
		});

		$('#arve-id').val( response.videoid );
	});

	$( '#arve-url, #arve-provider, #arve-id, #arve-maxwidth, #arve-mode, #arve-align, #arve-autoplay, #arve-aspect_ratio, #arve-parameters, #arve-grow, #arve-thumbnail' )
		.bind( 'keyup mouseup change', function() {

		var shortcode = create_shortcode();

		if ( shortcode ) {
			$( '#arve-shortcode' ).html( shortcode );
		} else {
			$( '#arve-shortcode' ).html( '-' );
		}
	});

	// Options Page
	$('.arve-settings-section').each( function() {

		$(this).insertBefore( $(this).parent() );
	});
	
	$('.arve-settings-section').each( function() {
	
		var id     = $(this).attr( 'id' );
		var classs = $(this).attr( 'class' );
		var title  = $(this).attr( 'title' );
		
		$(this).nextUntil( '.arve-settings-section' ).wrapAll( '<section id="' + id + '" class="' + classs + '" />' );
		
		$( '<a href="#" data-target="#' + id + '" class="nav-tab">' + title + '</a>' ).appendTo( '.arve-settings-tabs' );
		
		$(this).remove();
	});
	
	// Its hidden!
	var last_tab_input = $( '#arve_options_main\\[last_options_tab\\]' );
	
	$('.arve-settings-tabs a').on( 'click', function(e) {

		var target = $(this).attr('data-target');
	
		$('.arve-settings-section').show();
		$( target ).prependTo( '.arve-options-form' );
		$('.arve-settings-section').not( target ).hide();
		
		$( last_tab_input ).val( target );
		
		$('.arve-settings-tabs a').removeClass( 'nav-tab-active' );
		$(this).addClass( 'nav-tab-active' );
		
		e.preventDefault();
	});
	
	if( last_tab_input.val() ) {
	
		var last_tab = last_tab_input.val();
		
		if( $( last_tab ).length === 0 ) {
			last_tab = '#arve-settings-section-main';
		}

		$('.arve-settings-tabs a[data-target='+last_tab+']').addClass( 'nav-tab-active' );

		$( last_tab ).prependTo( '.arve-options-form' );
		$('.arve-settings-section').not( last_tab ).hide();
	}
		
}(jQuery));