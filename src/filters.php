<?php

function responsive_output_color_scheme( string $html ): string {
    return $html . ' style="color-scheme: ' . responsive_get_color_scheme() . ';"';
}

yourls_add_filter( 'html_language_attributes',
    'responsive_output_color_scheme' );

function responsive_admin_links( $admin_links ): array {
    return $admin_links;
}

yourls_add_filter( 'admin_links', 'responsive_admin_links' );


function responsive_help_link( string $html ) {
    return null;
}

yourls_add_filter( 'help_link', 'responsive_help_link' );


function responsive_hide_powered_by( string $html ) {
    return null;
}

yourls_add_filter( 'html_footer_text', 'responsive_hide_powered_by' );

function responsive_logout_link( string $html ): string {
    return preg_replace( '/(.*?)\((.*?)\)/', '<span>$1</span><span>$2</span>',
        $html );
}

yourls_add_filter( 'logout_link', 'responsive_logout_link' );
