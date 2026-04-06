<?php

function responsive_sanitize_color_scheme( $color_scheme ): string {
    $scheme = is_string( $color_scheme ) ? $color_scheme : '';

    if (
        in_array(
            $scheme,
            [
                RESPONSIVE_SCHEME_SYSTEM,
                RESPONSIVE_SCHEME_LIGHT,
                RESPONSIVE_SCHEME_DARK,
            ],
            true,
        )
    ) {
        return $scheme;
    }

    return RESPONSIVE_SCHEME_LIGHT;
}

function responsive_get_color_scheme(): string {
    $color_scheme = yourls_get_option( 'responsive_color_scheme' );

    if ( isset( $_POST['responsive_color_scheme'] ) ) {
        $color_scheme = $_POST['responsive_color_scheme'];
    }

    return responsive_sanitize_color_scheme( $color_scheme );
}

function responsive_get_color_scheme_css_value( string $scheme ): string {
    if ( $scheme === RESPONSIVE_SCHEME_SYSTEM ) {
        return RESPONSIVE_SCHEME_LIGHT . ' ' . RESPONSIVE_SCHEME_DARK;
    }

    return $scheme;
}

function responsive_get_asset_url(
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

    $asset_url = RESPONSIVE_PLUGIN_URL . '/' . $asset_path;

    if ( file_exists( $asset_file ) ) {
        $asset_url .= '?ver=' . filemtime( $asset_file );
    }

    return $asset_url;
}
