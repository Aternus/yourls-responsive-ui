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
        <link rel="stylesheet" href="https://unpkg.com/animate.css@4/animate.min.css">
        <link rel="stylesheet" href="https://unpkg.com/@fortawesome/fontawesome-free@7/css/all.min.css">
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
        <script type="importmap">
        {
            "imports": {
                "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
            }
        }
        </script>
        <script type="module" src="$js"></script>
        HEAD;
}

yourls_add_action( 'html_head', 'responsive_head' );

function responsive_vue_root(): void {
    if ( yourls_is_valid_user() !== true ) {
        return;
    }

    echo '<div id="responsive-ui-vue-root"></div>';
}

yourls_add_action( 'html_logo', 'responsive_vue_root' );
