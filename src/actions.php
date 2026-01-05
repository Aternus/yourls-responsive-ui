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

    $light = RESPONSIVE_SCHEME_LIGHT;
    $dark  = RESPONSIVE_SCHEME_DARK;
    echo <<<HEAD
        <meta name="color-scheme" content="$scheme">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
        <link rel="stylesheet" href="$url/release/css/theme.css">
        <script>
        const RESPONSIVEUI = {
            pluginURL: '$url',
            scheme: {       
                current: '$scheme',
                available: ['$light', '$dark']                
            },
        }
        </script>
        <script src="$url/release/js/theme.js"></script>
        HEAD;
}

yourls_add_action( 'html_head', 'responsive_head' );
