<?php

function responsive_get_color_scheme(): string {
    $color_scheme = yourls_get_option( 'responsive_color_scheme' );

    if ( isset( $_POST['responsive_color_scheme'] ) ) {
        // the user has updated the color scheme
        $isValid = in_array(
            $_POST['responsive_color_scheme'],
            [ RESPONSIVE_SCHEME_LIGHT, RESPONSIVE_SCHEME_DARK ],
            true,
        );
        if ( $isValid ) {
            $color_scheme = $_POST['responsive_color_scheme'];
        }
    }

    return $color_scheme;
}
