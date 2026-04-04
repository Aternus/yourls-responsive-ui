<?php

if ( ! defined( 'YOURLS_ABSPATH' ) ) {
	die();
}

define( 'RESPONSIVE_PLUGIN_URL', yourls_plugin_url( __DIR__ ) );

require_once __DIR__ . '/src/constants.php';
require_once __DIR__ . '/src/utils.php';
require_once __DIR__ . '/src/settings_page.php';
require_once __DIR__ . '/src/actions.php';
require_once __DIR__ . '/src/filters.php';
require_once __DIR__ . '/src/sanitizer.php';
