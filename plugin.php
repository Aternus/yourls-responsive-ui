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

require_once __DIR__ . '/src/bridge.php';

// Ensure cache bridge exists on every load (idempotent)
responsive_bridge_install();

// Lifecycle hooks
yourls_add_action( 'deactivated_yourls-responsive-ui/plugin.php', 'responsive_deactivate' );
