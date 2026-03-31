<?php

function responsive_head_meta(): void {
    echo <<<HEAD_META
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        HEAD_META;
}

yourls_add_action( 'html_head_meta', 'responsive_head_meta' );

function responsive_head(): void {
    $scheme = responsive_get_color_scheme();

    $url = RESPONSIVE_PLUGIN_URL;
    $css = responsive_get_asset_url( 'release/css/theme.css' );
    $js  = responsive_get_asset_url( 'release/js/theme.js', 'src/js/theme.js' );

    $light = RESPONSIVE_SCHEME_LIGHT;
    $dark  = RESPONSIVE_SCHEME_DARK;
    echo <<<HEAD
        <meta name="color-scheme" content="$scheme">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
        <link rel="stylesheet" href="$css">
        <script>
        const RESPONSIVEUI = {
            pluginURL: '$url',
            scheme: {
                current: '$scheme',
                available: ['$light', '$dark']
            },
        }
        </script>
        <script src="$js"></script>
        HEAD;
}

yourls_add_action( 'html_head', 'responsive_head' );

function responsive_nav_menu(): void {
    if ( yourls_is_valid_user() !== true ) {
        return;
    }
    echo <<<NAV_MENU
        <input type="checkbox" id="nav_menu">
        <label for="nav_menu" class="nav_menu_button" role="button" aria-controls="admin_menu" aria-expanded="false" aria-label="Toggle navigation menu">
            <span class="material-icons nav_menu_icon nav_menu_icon_open" aria-hidden="true">menu</span>
            <span class="material-icons nav_menu_icon nav_menu_icon_close" aria-hidden="true">close</span>
        </label>
        <label for="nav_menu" class="nav_menu_overlay" aria-hidden="true"></label>
        <button type="button" class="responsive-scroll-top-button" aria-label="Scroll to top" title="Scroll to top">
            <span class="material-icons" aria-hidden="true">arrow_upward</span>
        </button>
        NAV_MENU;
}

yourls_add_action( 'html_logo', 'responsive_nav_menu' );
