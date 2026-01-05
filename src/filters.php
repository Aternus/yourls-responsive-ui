<?php

function responsive_admin_links( $admin_links ) {
    if ( true !== yourls_is_valid_user() ) {
        $admin_links = [];
    } else {
        $admin_links['help'] = [
            'url'    => yourls_site_url( false, '/' ) . '/readme.html',
            'anchor' => yourls__( 'Help' ),
        ];
    }

    return $admin_links;
}

yourls_add_filter( 'admin_links', 'responsive_admin_links' );


function responsive_help_link( $help_link ) {
    return null;
}

yourls_add_filter( 'help_link', 'responsive_help_link' );


function responsive_hide_powered_by( $html ) {
    return $html;
}

yourls_add_filter( 'html_footer_text', 'responsive_hide_powered_by' );
