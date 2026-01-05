<?php

function responsive_head_meta(): void {
    echo <<<HEAD_META
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        HEAD_META;
}

yourls_add_action( 'html_head_meta', 'responsive_head_meta' );

function responsive_set_theme( $theme ): void {
    $url   = RESPONSIVE_PLUGIN_URL;
    $theme = ( $theme == RESPONSIVE_SCHEME_LIGHT ) ? RESPONSIVE_SCHEME_LIGHT : RESPONSIVE_SCHEME_DARK;
    $light = RESPONSIVE_SCHEME_LIGHT;
    $dark  = RESPONSIVE_SCHEME_DARK;
    echo <<<HEAD
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
        <link rel="stylesheet" href="$url/release/css/theme.css">
        <meta name="responsive_theme" content="$theme">
        <script>
            const RESPONSIVE_THEME_LIGHT = '$light';
            const RESPONSIVE_THEME_DARK = '$dark';
        </script>
        <script src="$url/release/js/theme.js"></script>
        HEAD;
}

function responsive_head_scripts(): void {
    // This is so the user doesn't have to reload page twice in settings screen
    if ( isset( $_POST['responsive_color_scheme'] ) ) {
        // User has just changed theme
        if ( $_POST['responsive_color_scheme'] == RESPONSIVE_SCHEME_LIGHT ) {
            responsive_set_theme( RESPONSIVE_SCHEME_LIGHT );
        } else {
            responsive_set_theme( RESPONSIVE_SCHEME_DARK );
        }
    } else {
        // User has not just changed theme
        if ( yourls_get_option( 'responsive_color_scheme' ) == RESPONSIVE_SCHEME_LIGHT ) {
            responsive_set_theme( RESPONSIVE_SCHEME_LIGHT );
        } else {
            responsive_set_theme( RESPONSIVE_SCHEME_DARK );
        }
    }
}

yourls_add_action( 'html_head', 'responsive_head_scripts' );


function responsive_head_plugin_url(): void {
    $url = RESPONSIVE_PLUGIN_URL;
    echo <<<HEAD
        <meta name="pluginURL" content="$url">
        HEAD;
}

yourls_add_action( 'html_head', 'responsive_head_plugin_url' );
