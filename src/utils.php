<?php

function rui_sanitize_color_scheme( $color_scheme ): string {
    $scheme = is_string( $color_scheme ) ? $color_scheme : '';

    if (
        in_array(
            $scheme,
            [
                RUI_SCHEME_SYSTEM,
                RUI_SCHEME_LIGHT,
                RUI_SCHEME_DARK,
            ],
            true,
        )
    ) {
        return $scheme;
    }

    return RUI_SCHEME_LIGHT;
}

function rui_get_color_scheme(): string {
    $color_scheme = yourls_get_option( RUI_OPTION_COLOR_SCHEME );

    if ( isset( $_POST['rui_color_scheme'] ) ) {
        $color_scheme = $_POST['rui_color_scheme'];
    }

    return rui_sanitize_color_scheme( $color_scheme );
}

function rui_get_color_scheme_css_value( string $scheme ): string {
    if ( $scheme === RUI_SCHEME_SYSTEM ) {
        return RUI_SCHEME_LIGHT . ' ' . RUI_SCHEME_DARK;
    }

    return $scheme;
}

function rui_get_asset_url(
    string $release_path,
    string $source_path = '',
): string {
    $plugin_path = dirname( __DIR__ );
    $release     = ltrim( $release_path, '/' );
    $source      = ltrim( $source_path, '/' );

    $asset_path = $release;
    $asset_file = $plugin_path . '/' . $release;

    if ( ! file_exists( $asset_file ) && $source !== '' ) {
        $asset_path = $source;
        $asset_file = $plugin_path . '/' . $source;
    }

    $asset_url = RUI_PLUGIN_URL . '/' . $asset_path;

    if ( file_exists( $asset_file ) ) {
        $asset_url .= '?ver=' . filemtime( $asset_file );
    }

    return $asset_url;
}

function rui_is_show_footer_text(): bool {
    return (int) yourls_get_option(
        RUI_OPTION_SHOW_FOOTER_TEXT,
        1,
    ) === 1;
}

function rui_is_show_help_link(): bool {
    return (int) yourls_get_option( RUI_OPTION_SHOW_HELP_LINK, 1 ) === 1;
}
