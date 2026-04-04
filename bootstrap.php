<?php

///////////////////////////////////////////////////////////
// Runtime Bootstrap
///////////////////////////////////////////////////////////

// Loaded by cache.php bridge for all admin flows
// (including upgrade/install where plugins are not loaded).

// No direct call
if ( ! defined( 'YOURLS_ABSPATH' ) ) {
	die();
}

// Kill switch: constant
if ( defined( 'YOURLS_RESPONSIVE_UI_DISABLE' ) ) {
	return;
}

// Kill switch: file toggle
if ( file_exists( YOURLS_USERDIR . '/yourls-responsive-ui.disable' ) ) {
	return;
}

// Prevent double-loading (bridge + plugin.php both active)
if ( defined( 'RESPONSIVE_BOOTSTRAP_LOADED' ) ) {
	return;
}

define( 'RESPONSIVE_BOOTSTRAP_LOADED', true );
define( 'RESPONSIVE_PLUGIN_URL', yourls_plugin_url( __DIR__ ) );

require_once __DIR__ . '/src/constants.php';
require_once __DIR__ . '/src/utils.php';
require_once __DIR__ . '/src/settings_page.php';
require_once __DIR__ . '/src/actions.php';
require_once __DIR__ . '/src/filters.php';
require_once __DIR__ . '/src/sanitizer.php';
