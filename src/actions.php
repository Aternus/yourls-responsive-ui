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
    $css = responsive_get_asset_url( 'release/css/app.css' );
    $js  = responsive_get_asset_url( 'release/js/app.js', 'src/js/app.js' );

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

function responsive_addnew_custom_element(): void {
    if ( yourls_is_valid_user() !== true ) {
        return;
    }

    echo '<rui-new-url></rui-new-url>';
}

yourls_add_action( 'html_addnew', 'responsive_addnew_custom_element' );

function responsive_hook_context( $hook_args ): string {
    $context = is_array( $hook_args )
        ? array_shift( $hook_args )
        : $hook_args;

    return is_string( $context ) ? $context : '';
}

function responsive_custom_elements_root( $hook_args = [] ): void {
    if ( yourls_is_valid_user() !== true ) {
        return;
    }

    $context = responsive_hook_context( $hook_args );

    echo '<rui-nav-controls></rui-nav-controls>';
    echo '<rui-scroll-top></rui-scroll-top>';

    if ( in_array( $context, [ 'index', 'bookmark' ], true ) ) {
        echo '<rui-search></rui-search>';
    }

    if ( $context === 'infos' ) {
        echo '<rui-infos-page></rui-infos-page>';
    }

    if ( $context === 'plugins' ) {
        echo '<rui-plugin-actions></rui-plugin-actions>';
    }
}

yourls_add_action( 'html_footer', 'responsive_custom_elements_root', 10, 1 );
