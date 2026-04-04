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

// Bridge installation (activate/update)
/////////////////////////////////////////////////

function responsive_bridge_install(): bool {
	$cache_file = YOURLS_USERDIR . '/cache.php';
	$block      = responsive_bridge_block();

	// Read existing content or start fresh
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

	// Check for existing marker block
	$begin_pos = strpos( $content, RESPONSIVE_BRIDGE_BEGIN );
	$end_pos   = strpos( $content, RESPONSIVE_BRIDGE_END );

	if ( $begin_pos !== false && $end_pos !== false ) {
		// Replace existing block in-place (idempotent update)
		$before  = substr( $content, 0, $begin_pos );
		$after   = substr( $content, $end_pos + strlen( RESPONSIVE_BRIDGE_END ) );
		$content = $before . $block . $after;
	} elseif ( $begin_pos !== false || $end_pos !== false ) {
		// Partial marker corruption — remove dangling marker before appending
		if ( $begin_pos !== false ) {
			$content = substr( $content, 0, $begin_pos );
		} elseif ( $end_pos !== false ) {
			$content = substr( $content, $end_pos + strlen( RESPONSIVE_BRIDGE_END ) );
		}
		$content = rtrim( $content ) . "\n\n" . $block . "\n";
	} else {
		// Append block
		$content = rtrim( $content ) . "\n\n" . $block . "\n";
	}

	$written = file_put_contents( $cache_file, $content, LOCK_EX );

	return $written !== false;
}

// Bridge removal (deactivate/uninstall)
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
		// No marker block found — nothing to remove
		return true;
	}

	$before = substr( $content, 0, $begin_pos );
	$after  = substr( $content, $end_pos + strlen( RESPONSIVE_BRIDGE_END ) );

	// Clean up extra blank lines at the join point, guarantee newline separator
	$content = rtrim( $before ) . "\n" . ltrim( $after );

	// If only the PHP tag remains, keep it clean
	if ( trim( $content ) === '<?php' ) {
		$content = "<?php\n";
	}

	$written = file_put_contents( $cache_file, $content, LOCK_EX );

	return $written !== false;
}

// Activation hook
/////////////////////////////////////////////////

function responsive_activate(): void {
	if ( ! responsive_bridge_install() ) {
		$cache_path = YOURLS_USERDIR . '/cache.php';
		yourls_die(
			"Responsive UI: Failed to install cache bridge. Ensure <code>{$cache_path}</code> is writable.",
			'Plugin Activation Failed',
			403
		);
	}
}

// Deactivation hook
/////////////////////////////////////////////////

function responsive_deactivate(): void {
	if ( ! responsive_bridge_remove() ) {
		$cache_path = YOURLS_USERDIR . '/cache.php';

		if ( function_exists( 'yourls_add_notice' ) ) {
			yourls_add_notice(
				"Responsive UI: Could not remove cache bridge from <code>{$cache_path}</code>. Remove the managed block manually."
			);
		}
	}
}

// Uninstall hook
/////////////////////////////////////////////////

function responsive_uninstall(): void {
	responsive_bridge_remove();
}
