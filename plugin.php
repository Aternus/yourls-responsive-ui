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

/*
 * HTML Head
 *********************************************************/

function responsive_head_meta() {
    echo <<<HEAD_META
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        HEAD_META;
}

yourls_add_action( 'html_head_meta', 'responsive_head_meta' );

function responsive_set_theme( $theme ) {
    $url = yourls_plugin_url( __DIR__ );
    if ( $theme == "light" ) {
        echo <<<HEAD
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <link rel="stylesheet" href="$url/release/css/light.css">
            <script src="$url/release/js/theme.js"></script>
            <meta name="responsive_theme" content="light">
            HEAD;
    } elseif ( $theme == "dark" ) {
        echo <<<HEAD
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <link rel="stylesheet" href="$url/release/css/dark.css">
            <script src="$url/release/js/theme.js"></script>
            <meta name="responsive_theme" content="dark">
            HEAD;
    }
}

function responsive_head_scripts() {
    // This is so the user doesn't have to reload page twice in settings screen
    if ( isset( $_POST['theme_choice'] ) ) {
        // User has just changed theme
        if ( $_POST['theme_choice'] == "light" ) {
            responsive_set_theme( "light" );
        } else {
            responsive_set_theme( "dark" );
        }
    } else {
        // User has not just changed theme
        if ( yourls_get_option( 'theme_choice' ) == "light" ) {
            responsive_set_theme( "light" );
        } else {
            responsive_set_theme( "dark" );
        }
    }
}

yourls_add_action( 'html_head', 'responsive_head_scripts' );


function responsive_head_plugin_url() {
    $url = yourls_plugin_url( __DIR__ );
    echo <<<HEAD
        <meta name="pluginURL" content="$url">
        HEAD;
}

yourls_add_action( 'html_head', 'responsive_head_plugin_url' );


/*
 * Plugins Loaded
 *********************************************************/

function responsive_settings_update() {
    $in = $_POST['theme_choice'];

    if ( $in ) {
        if ( $in == "light" or $in == "dark" ) {
            // Update value in database
            yourls_update_option( 'theme_choice', $in );
        } else {
            echo "Error";
        }
    }
}

function responsive_settings_handler() {
    // Check if a form was submitted
    if ( isset( $_POST['theme_choice'] ) ) {
        // Check nonce
        yourls_verify_nonce( 'responsive_settings' );

        // Process form
        responsive_settings_update();
    }

    // Get value from database
    $theme_choice = yourls_get_option( 'theme_choice' );

    // Create nonce
    $nonce = yourls_create_nonce( 'responsive_settings' );

    echo <<<HTML
        <main>
        	<h2>Responsive UI Settings</h2>
        	<form method="post">
        	<input type="hidden" name="nonce" value="$nonce" />
        	<p>
        		<label>Theme</label>
        		<select name="theme_choice" size="1" id="ui_selector">
        			<option value="dark" <?= $theme_choice === 'dark' ? 'selected' : ''; ?>>Dark</option>
        			<option value="light" <?= $theme_choice === 'light' ? 'selected' : ''; ?>>Light</option>
        		</select>
        	</p>
        	<p><input type="submit" value="Save" class="button" /></p>
        	</form>
        </main>
        HTML;
}

function responsive_settings() {
    yourls_register_plugin_page( 'responsive_settings',
        'Responsive UI Settings', 'responsive_settings_handler' );
    // parameters: page slug, page title, and function that will display the page itself
}

yourls_add_action( 'plugins_loaded', 'responsive_settings' );


/*
 * Filters
 *********************************************************/

function responsive_admin_links( $admin_links ) {
    if ( true !== yourls_is_valid_user() ) {
        $admin_links = [];
    } else {
        $admin_links['help'] = [
            'url'    => yourls_site_url( false, '/' ) . '/readme.html',
            'anchor' => yourls__( 'Help' ),
        ];
    }

    return $admin_links;
}

yourls_add_filter( 'admin_links', 'responsive_admin_links' );


function responsive_help_link( $help_link ) {
    return null;
}

yourls_add_filter( 'help_link', 'responsive_help_link' );