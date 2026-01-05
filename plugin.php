<?php
/*
    Plugin Name: Responsive UI
    Plugin URI: https://github.com/Aternus/yourls-responsive-ui
    Description: Responsive UI for your YOURLS admin
    Version: 1.0.0
    Author: Kiril Reznik
    Author URI: https://atern.us/
*/

// No direct call
if ( ! defined( 'YOURLS_ABSPATH' ) ) {
    die();
}

define( "RESPONSIVE_PLUGIN_URL", yourls_plugin_url( __DIR__ ) );

require_once __DIR__ . '/src/constants.php';
require_once __DIR__ . '/src/settings_page.php';
require_once __DIR__ . '/src/actions.php';
require_once __DIR__ . '/src/filters.php';
