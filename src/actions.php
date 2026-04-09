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
    $scheme           = responsive_get_color_scheme();
    $scheme_css_value = responsive_get_color_scheme_css_value( $scheme );
    $context          = responsive_detect_page_context();

    $url = RESPONSIVE_PLUGIN_URL;
    $css = responsive_get_asset_url( 'release/css/app.css' );
    $js  = responsive_get_asset_url( 'release/js/app.js', 'src/js/app.js' );

    $system   = RESPONSIVE_SCHEME_SYSTEM;
    $light    = RESPONSIVE_SCHEME_LIGHT;
    $dark     = RESPONSIVE_SCHEME_DARK;
    $ajax_url = yourls_admin_url( 'admin-ajax.php' );

    $config_flags = [
        'authenticated' => defined( 'YOURLS_USER' ),
    ];

    $responsive_ui_config = [
        'pluginURL' => $url,
        'ajaxURL'   => $ajax_url,
        'context'   => $context,
        'flags'     => $config_flags,
        'scheme'    => [
            'current'   => $scheme,
            'available' => [ $system, $light, $dark ],
        ],
        'i18n'      => [
            'login' => [
                'brand'         => yourls__( 'YOURLS' ),
                'tagline'       => yourls__( 'Your Own URL Shortener' ),
                'legend'       => yourls__( 'Enter your credentials to manage your short URLs.' ),
                'usernameLabel' => yourls__( 'Username' ),
                'passwordLabel' => yourls__( 'Password' ),
                'submitLabel'   => yourls__( 'Log in' ),
            ],
        ],
    ];
    $responsive_ui_json   = json_encode(
        $responsive_ui_config,
        JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_INVALID_UTF8_SUBSTITUTE,
    );
    if ( $responsive_ui_json === false ) {
        $responsive_ui_json = '{}';
    }

    echo <<<HEAD
        <meta name="color-scheme" content="$scheme_css_value">
        <link rel="stylesheet" href="$css">
        <script>
        window.RESPONSIVEUI = $responsive_ui_json;
        </script>
        <script type="importmap">
        {
            "imports": {
                "vue": "https://esm.sh/vue@3.5.32/dist/vue.esm-browser.js",
                "class-variance-authority": "https://esm.sh/class-variance-authority@0.7.1/dist/index.mjs"
            }
        }
        </script>
        <script src="https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js"></script>
        <script type="module" src="$js"></script>
        HEAD;
}

yourls_add_action( 'html_head', 'responsive_head' );

function responsive_custom_elements_root( $hook_args = [] ): void {
    $context = is_array( $hook_args )
        ? array_shift( $hook_args )
        : $hook_args;
    $context = is_string( $context ) ? $context : '';

    if ( ! defined( 'YOURLS_USER' ) ) {
        return;
    }

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

function responsive_login(): void {
    echo '<rui-login></rui-login>';
}

yourls_add_action( 'login_form_end', 'responsive_login' );

function responsive_navbar(): void {
    echo '<rui-navbar></rui-navbar>';
}

yourls_add_action( 'pre_html_logo', 'responsive_navbar' );
