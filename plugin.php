<?php

/*
    Plugin Name: Responsive UI
    Plugin URI: https://github.com/Aternus/yourls-responsive-ui
    Description: Responsive UI for your YOURLS admin
    Version: 1.0.0
    Author: Kiril Reznik
    Author URI: https://atern.us/
*/

if (! defined('YOURLS_ABSPATH')) {
    exit();
}

require_once __DIR__.'/src/bridge.php';

responsive_bridge_install();
