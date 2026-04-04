<?php

function responsive_head_meta(): void {
    echo <<<HEAD_META
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        HEAD_META;
}

yourls_add_action( 'html_head_meta', 'responsive_head_meta' );

function responsive_detect_page_context(): string {
    $page = basename( (string) ( $_SERVER['SCRIPT_NAME'] ?? '' ), '.php' );

    $context_map = [
        'index'        => 'index',
        'yourls-infos' => 'infos',
        'plugins'      => 'plugins',
        'tools'        => 'tools',
        'yourls-login' => 'login',
    ];

    if ( isset( $context_map[ $page ] ) ) {
        return $context_map[ $page ];
    }

    if ( defined( 'YOURLS_ADMIN' ) && YOURLS_ADMIN ) {
        return 'index';
    }

    return '';
}

function responsive_head(): void {
    $scheme  = responsive_get_color_scheme();
    $context = responsive_detect_page_context();

    $url = RESPONSIVE_PLUGIN_URL;
    $css = responsive_get_asset_url( 'release/css/app.css' );
    $js  = responsive_get_asset_url( 'release/js/app.js', 'src/js/app.js' );

    $light    = RESPONSIVE_SCHEME_LIGHT;
    $dark     = RESPONSIVE_SCHEME_DARK;
    $ajax_url = yourls_admin_url( 'admin-ajax.php' );

    $config_flags = [];
    if ( function_exists( 'yourls_is_valid_user' ) && yourls_is_valid_user() === true ) {
        $config_flags[] = 'authenticated';
    }
    $flags_json = json_encode( $config_flags ) ?: '[]';

    echo <<<HEAD
        <meta name="color-scheme" content="$scheme">
        <link rel="stylesheet" href="$css">
        <script>
        const RESPONSIVEUI = {
            pluginURL: '$url',
            ajaxUrl: '$ajax_url',
            context: '$context',
            flags: $flags_json,
            scheme: {
                current: '$scheme',
                available: ['$light', '$dark']
            },
        }
        </script>
        <script type="importmap">
        {
            "imports": {
                "vue": "https://unpkg.com/vue@3.5.32/dist/vue.esm-browser.js"
            }
        }
        </script>
        <script type="module" src="$js"></script>
        HEAD;
}

yourls_add_action( 'html_head', 'responsive_head' );

function responsive_custom_elements_root( $hook_args = [] ): void {
    if ( yourls_is_valid_user() !== true ) {
        return;
    }

    $context = is_array( $hook_args )
        ? array_shift( $hook_args )
        : $hook_args;
    $context = is_string( $context ) ? $context : '';

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
