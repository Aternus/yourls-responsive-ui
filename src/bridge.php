<?php

///////////////////////////////////////////////////////////
// Cache Bridge Lifecycle Manager
///////////////////////////////////////////////////////////

// Marker constants
/////////////////////////////////////////////////

define( 'RESPONSIVE_BRIDGE_BEGIN', '// BEGIN yourls-responsive-ui managed bridge' );
define( 'RESPONSIVE_BRIDGE_END', '// END yourls-responsive-ui managed bridge' );

// Bridge block content
/////////////////////////////////////////////////

function responsive_bridge_block(): string {
	$begin = RESPONSIVE_BRIDGE_BEGIN;
	$end   = RESPONSIVE_BRIDGE_END;

	return <<<BRIDGE
{$begin}
if (
    !defined('YOURLS_RESPONSIVE_UI_DISABLE')
    && !file_exists(YOURLS_USERDIR . '/yourls-responsive-ui.disable')
) {
    \$responsive_bootstrap = YOURLS_USERDIR . '/plugins/yourls-responsive-ui/bootstrap.php';
    if (file_exists(\$responsive_bootstrap)) {
        require_once \$responsive_bootstrap;
    }
}
{$end}
BRIDGE;
}

// Bridge installation (idempotent)
/////////////////////////////////////////////////

function responsive_bridge_install(): bool {
	$cache_file = YOURLS_USERDIR . '/cache.php';
	$block      = responsive_bridge_block();

	if ( file_exists( $cache_file ) ) {
		$content = file_get_contents( $cache_file );

		if ( $content === false ) {
			return false;
		}
	} else {
		$content = "<?php\n";
	}

	// Ensure PHP open tag is present
	if ( strpos( $content, '<?php' ) === false && strpos( $content, '<?' ) === false ) {
		$content = "<?php\n" . $content;
	}

	$begin_pos = strpos( $content, RESPONSIVE_BRIDGE_BEGIN );
	$end_pos   = strpos( $content, RESPONSIVE_BRIDGE_END );

	if ( $begin_pos !== false && $end_pos !== false ) {
		// Replace existing block in-place
		$before  = substr( $content, 0, $begin_pos );
		$after   = substr( $content, $end_pos + strlen( RESPONSIVE_BRIDGE_END ) );
		$content = $before . $block . $after;
	} else {
		// Remove dangling partial marker if present
		if ( $begin_pos !== false ) {
			$content = substr( $content, 0, $begin_pos );
		} elseif ( $end_pos !== false ) {
			$content = substr( $content, $end_pos + strlen( RESPONSIVE_BRIDGE_END ) );
		}

		$content = rtrim( $content ) . "\n\n" . $block . "\n";
	}

	return file_put_contents( $cache_file, $content, LOCK_EX ) !== false;
}

// Bridge removal (deactivate)
/////////////////////////////////////////////////

function responsive_bridge_remove(): bool {
	$cache_file = YOURLS_USERDIR . '/cache.php';

	if ( ! file_exists( $cache_file ) ) {
		return true;
	}

	$content = file_get_contents( $cache_file );

	if ( $content === false ) {
		return false;
	}

	$begin_pos = strpos( $content, RESPONSIVE_BRIDGE_BEGIN );
	$end_pos   = strpos( $content, RESPONSIVE_BRIDGE_END );

	if ( $begin_pos === false || $end_pos === false ) {
		return true;
	}

	$before  = substr( $content, 0, $begin_pos );
	$after   = substr( $content, $end_pos + strlen( RESPONSIVE_BRIDGE_END ) );
	$content = rtrim( $before ) . "\n" . ltrim( $after );

	if ( trim( $content ) === '<?php' ) {
		$content = "<?php\n";
	}

	return file_put_contents( $cache_file, $content, LOCK_EX ) !== false;
}
