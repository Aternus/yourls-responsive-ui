<?php
//
// Head.
//

function rui_head_meta(): void {
    echo <<<'HEAD_META'
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        HEAD_META;
}

yourls_add_action( 'html_head_meta', 'rui_head_meta' );

function rui_extract_hook_context( $hook_args = [] ): string {
    $context = is_array( $hook_args ) ? array_shift( $hook_args ) : $hook_args;

    return is_string( $context ) ? trim( $context ) : '';
}

function rui_detect_page_context( $hook_args = [] ): string {
    return rui_extract_hook_context( $hook_args );
}

function rui_head( $hook_args = [] ): void {
    $scheme           = rui_get_color_scheme();
    $scheme_css_value = rui_get_color_scheme_css_value( $scheme );
    $context          = rui_detect_page_context( $hook_args );

    $url = RUI_PLUGIN_URL;
    $css = rui_get_asset_url( 'release/css/app.css' );
    $js  = rui_get_asset_url( 'release/js/app.js', 'src/js/app.js' );

    $system   = RUI_SCHEME_SYSTEM;
    $light    = RUI_SCHEME_LIGHT;
    $dark     = RUI_SCHEME_DARK;
    $ajax_url = yourls_admin_url( 'admin-ajax.php' );

    $config_flags = [
        'authenticated' => defined( 'YOURLS_USER' ),
    ];

    $rui_config = [
        'pluginURL' => $url,
        'ajaxURL'   => $ajax_url,
        'context'   => $context,
        'flags'     => $config_flags,
        'scheme'    => [
            'current'   => $scheme,
            'available' => [ $system, $light, $dark ],
        ],
        'i18n'      => [
            'brand' => [
                'name'    => yourls__( 'YOURLS' ),
                'tagline' => yourls__( 'Your Own URL Shortener' ),
            ],
            'login' => [
                'legend'          => yourls__(
                    'Enter your credentials to manage your short URLs.',
                ),
                'messageLogin'    => yourls__( 'Please log in' ),
                'messageLogout'   => yourls__( 'Logged out successfully' ),
                'usernameLabel'   => yourls__( 'Username' ),
                'passwordLabel'   => yourls__( 'Password' ),
                'submitLabel'     => yourls__( 'Log in' ),
                'showPassword'    => yourls__( 'Show password' ),
                'hidePassword'    => yourls__( 'Hide password' ),
                'capsLockWarning' => yourls__( 'Caps Lock is on.' ),
            ],
        ],
    ];
    $rui_json   = json_encode(
        $rui_config,
        JSON_HEX_TAG |
        JSON_HEX_AMP |
        JSON_HEX_APOS |
        JSON_HEX_QUOT |
        JSON_INVALID_UTF8_SUBSTITUTE,
    );
    if ( $rui_json === false ) {
        $rui_json = '{}';
    }

    echo <<<HEAD
        <meta name="color-scheme" content="$scheme_css_value">
        <link rel="stylesheet" href="$css">
        <script>
        window.RUI = $rui_json;
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

yourls_add_action( 'html_head', 'rui_head' );

//
// Custom Elements.
//

function rui_custom_elements_root( $hook_args = [] ): void {
    $context = rui_extract_hook_context( $hook_args );

    if ( ! defined( 'YOURLS_USER' ) ) {
        return;
    }

    echo '<rui-scroll-top></rui-scroll-top>';

    // TODO: re-enable search component for index/bookmark contexts.

    if ( $context === 'infos' ) {
        echo '<rui-infos-page></rui-infos-page>';
    }

    if ( $context === 'plugins' ) {
        echo '<rui-plugin-actions></rui-plugin-actions>';
    }
}

yourls_add_action( 'html_footer', 'rui_custom_elements_root', 10, 1 );

function rui_login(): void {
    echo '<rui-login></rui-login>';
}

yourls_add_action( 'login_form_end', 'rui_login' );

function rui_navbar(): void {
    echo '<rui-navbar></rui-navbar>';
}

yourls_add_action( 'html_logo', 'rui_navbar' );
