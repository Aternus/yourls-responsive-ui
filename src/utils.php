<?php

function responsive_get_color_scheme(): string {
    $scheme = yourls_get_option( 'responsive_color_scheme' );

    if ( isset( $_POST['responsive_color_scheme'] ) ) {
        // the user has updated the color scheme
        $isValid = in_array(
            $_POST['responsive_color_scheme'],
            [ RESPONSIVE_SCHEME_LIGHT, RESPONSIVE_SCHEME_DARK ],
        );
        if ( $isValid ) {
            $scheme = $_POST['responsive_color_scheme'];
        }
    }

    return $scheme;
}
