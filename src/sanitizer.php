<?php

///////////////////////////////////////////////////////////
// Output Sanitizer
///////////////////////////////////////////////////////////

// Script paths to strip (core JS, excluding jQuery)
/////////////////////////////////////////////////

function responsive_get_strip_script_paths(): array {
	return [
		'/js/common.js',
		'/js/jquery.notifybar.js',
		'/js/jquery-3.tablesorter.min.js',
		'/js/tablesorte.js',
		'/js/insert.js',
		'/js/share.js',
		'/js/clipboard.min.js',
		'/js/jquery.cal.js',
		'/js/infos.js',
	];
}

// Style paths to strip (core CSS)
/////////////////////////////////////////////////

function responsive_get_strip_style_paths(): array {
	return [
		'/css/style.css',
		'/css/tablesorter.css',
		'/css/share.css',
		'/css/cal.css',
		'/css/infos.css',
	];
}

// URL helpers
/////////////////////////////////////////////////

function responsive_url_path( string $url ): string {
	$parts = parse_url( $url );

	if ( ! is_array( $parts ) || empty( $parts['path'] ) || ! is_string( $parts['path'] ) ) {
		return '';
	}

	return '/' . ltrim( $parts['path'], '/' );
}

function responsive_url_host( string $url ): string {
	$parts = parse_url( $url );

	if ( ! is_array( $parts ) || empty( $parts['host'] ) || ! is_string( $parts['host'] ) ) {
		return '';
	}

	return strtolower( $parts['host'] );
}

//=== Match helpers ===//

function responsive_should_strip_script_src( string $src, array $script_paths ): bool {
	$path = responsive_url_path( $src );

	return $path !== '' && in_array( $path, $script_paths, true );
}

function responsive_is_google_jsapi_src( string $src ): bool {
	$host = responsive_url_host( $src );
	$path = responsive_url_path( $src );

	return in_array( $host, [ 'google.com', 'www.google.com' ], true ) && $path === '/jsapi';
}

function responsive_should_strip_style_href( string $href, array $style_paths ): bool {
	$path = responsive_url_path( $href );

	return $path !== '' && in_array( $path, $style_paths, true );
}

// Tag stripping
/////////////////////////////////////////////////

function responsive_strip_script_src_tags( string $html, array $script_paths ): string {
	$updated = preg_replace_callback(
		'~<script\b[^>]*\bsrc=(["\'])([^"\']+)\1[^>]*>\s*</script>\s*~i',
		static function ( array $matches ) use ( $script_paths ): string {
			$src = html_entity_decode( $matches[2], ENT_QUOTES );

			if ( responsive_should_strip_script_src( $src, $script_paths ) ) {
				return '';
			}

			return $matches[0];
		},
		$html
	);

	return is_string( $updated ) ? $updated : $html;
}

function responsive_strip_style_href_tags( string $html, array $style_paths ): string {
	$updated = preg_replace_callback(
		'~<link\b[^>]*\bhref=(["\'])([^"\']+)\1[^>]*>\s*~i',
		static function ( array $matches ) use ( $style_paths ): string {
			$href = html_entity_decode( $matches[2], ENT_QUOTES );

			if ( responsive_should_strip_style_href( $href, $style_paths ) ) {
				return '';
			}

			return $matches[0];
		},
		$html
	);

	return is_string( $updated ) ? $updated : $html;
}

// Inline script block stripping
/////////////////////////////////////////////////

function responsive_strip_inline_script_blocks_matching( string $html, callable $matcher ): string {
	$updated = preg_replace_callback(
		'~<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)</script>\s*~i',
		static function ( array $matches ) use ( $matcher ): string {
			$attrs = $matches[1];
			$body  = $matches[2];

			if ( $matcher( $attrs, $body ) ) {
				return '';
			}

			return $matches[0];
		},
		$html
	);

	return is_string( $updated ) ? $updated : $html;
}

// Context detection
/////////////////////////////////////////////////

function responsive_detect_body_context( string $html ): string {
	if ( ! preg_match( '~<body\b[^>]*\bclass=(["\'])([^"\']*)\1~i', $html, $matches ) ) {
		return '';
	}

	$class_attr = trim( $matches[2] );
	if ( $class_attr === '' ) {
		return '';
	}

	$classes = preg_split( '~\s+~', $class_attr );
	if ( ! is_array( $classes ) ) {
		return '';
	}

	$known_contexts = [
		'index',
		'bookmark',
		'infos',
		'plugins',
		'tools',
		'login',
		'install',
		'new',
		'upgrade',
	];

	foreach ( $classes as $class_name ) {
		if ( in_array( $class_name, $known_contexts, true ) ) {
			return $class_name;
		}
	}

	return '';
}

// Context-specific inline strippers
/////////////////////////////////////////////////

function responsive_strip_inline_bookmark( string $html ): string {
	return responsive_strip_inline_script_blocks_matching(
		$html,
		static function ( string $attrs, string $body ): bool {
			return str_contains( $body, '$(document).ready' )
				&& str_contains( $body, 'feedback(' )
				&& str_contains( $body, 'init_clipboard()' );
		}
	);
}

function responsive_strip_inline_infos( string $html ): string {
	return responsive_strip_inline_script_blocks_matching(
		$html,
		static function ( string $attrs, string $body ): bool {
			if (
				str_contains( $body, 'google.load(' )
				&& str_contains( $body, 'visualization' )
				&& str_contains( $body, 'corechart' )
				&& str_contains( $body, 'geochart' )
			) {
				return true;
			}

			return preg_match( '~\bid=(["\'])yourls_graph[^"\']*\1~i', $attrs ) === 1;
		}
	);
}

function responsive_strip_inline_index( string $html ): string {
	return responsive_strip_inline_script_blocks_matching(
		$html,
		static function ( string $attrs, string $body ): bool {
			return str_contains( $body, 'var l10n_cal_month =' )
				&& str_contains( $body, 'var l10n_cal_days =' )
				&& str_contains( $body, 'var l10n_cal_today =' )
				&& str_contains( $body, 'var l10n_cal_close =' );
		}
	);
}

function responsive_strip_inline_login( string $html ): string {
	return responsive_strip_inline_script_blocks_matching(
		$html,
		static function ( string $attrs, string $body ): bool {
			$normalized = preg_replace( '~\s+~', ' ', trim( $body ) );
			if ( ! is_string( $normalized ) ) {
				return false;
			}

			return preg_match( '~^\$\([\'"]#username[\'"]\)\.focus\(\);\s*$~', $normalized ) === 1;
		}
	);
}

function responsive_strip_google_jsapi_src( string $html ): string {
	$updated = preg_replace_callback(
		'~<script\b[^>]*\bsrc=(["\'])([^"\']+)\1[^>]*>\s*</script>\s*~i',
		static function ( array $matches ): string {
			$src = html_entity_decode( $matches[2], ENT_QUOTES );

			return responsive_is_google_jsapi_src( $src ) ? '' : $matches[0];
		},
		$html
	);

	return is_string( $updated ) ? $updated : $html;
}

function responsive_strip_inline_plugins( string $html ): string {
	return responsive_strip_inline_script_blocks_matching(
		$html,
		static function ( string $attrs, string $body ): bool {
			return str_contains( $body, 'yourls_defaultsort = 0;' )
				&& str_contains( $body, 'yourls_defaultorder = 0;' )
				&& str_contains( $body, '#plugin_summary' )
				&& str_contains( $body, '#toggle_plugins' )
				&& str_contains( $body, '#main_table tr.inactive' );
		}
	);
}

///////////////////////////////////////////////////////////
// Main Sanitizer Callback
///////////////////////////////////////////////////////////

function responsive_sanitize_html_output( string $html ): string {
	// Fail open: no </head> means not a full HTML page
	if ( ! str_contains( strtolower( $html ), '</head>' ) ) {
		return $html;
	}

	$script_paths = responsive_get_strip_script_paths();
	$style_paths  = responsive_get_strip_style_paths();

	$output = $html;

	// Strip external asset tags
	$output = responsive_strip_script_src_tags( $output, $script_paths );
	$output = responsive_strip_style_href_tags( $output, $style_paths );

	// Detect page context for inline stripping
	$context = responsive_detect_body_context( $output );

	$output = match ( $context ) {
		'bookmark' => responsive_strip_inline_bookmark( $output ),
		'infos'    => responsive_strip_google_jsapi_src( responsive_strip_inline_infos( $output ) ),
		'index'    => responsive_strip_inline_index( $output ),
		'login'    => responsive_strip_inline_login( $output ),
		'plugins'  => responsive_strip_inline_plugins( $output ),
		default    => $output,
	};

	return $output;
}

///////////////////////////////////////////////////////////
// Hook Registration
///////////////////////////////////////////////////////////

function responsive_begin_output_sanitizer( $context = '', $title = '' ): void {
	if (
		isset( $GLOBALS['responsive_output_sanitizer_active'] )
		|| yourls_is_API()
		|| yourls_is_Ajax()
		|| yourls_is_GO()
	) {
		return;
	}

	$GLOBALS['responsive_output_sanitizer_active'] = true;
	ob_start( 'responsive_sanitize_html_output' );
}

yourls_add_action( 'pre_html_head', 'responsive_begin_output_sanitizer', 0, 2 );
