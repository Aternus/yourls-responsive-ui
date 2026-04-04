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

// Lifecycle hooks
yourls_add_action( 'activated_yourls-responsive-ui/plugin.php', 'responsive_activate' );
yourls_add_action( 'deactivated_yourls-responsive-ui/plugin.php', 'responsive_deactivate' );
yourls_add_action( 'uninstalled_yourls-responsive-ui/plugin.php', 'responsive_uninstall' );

// Runtime bootstrap (also loaded via cache bridge for upgrade/install flows)
require_once __DIR__ . '/bootstrap.php';
