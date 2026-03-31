<?php

function responsive_output_color_scheme( string $html ): string {
    $scheme = responsive_get_color_scheme();

    return $html
           . ' data-responsive-scheme="' . $scheme . '"'
           . ' style="color-scheme: ' . $scheme . ';"';
}

yourls_add_filter( 'html_language_attributes',
    'responsive_output_color_scheme' );

function responsive_filter_form_select_attributes(
    string $html,
    string $name,
    array $options = [],
    string $selected = '',
    bool $display = true,
): string {
    $filter_defaults = [
        'search_in'    => 'all',
        'sort_by'      => 'timestamp',
        'sort_order'   => 'desc',
        'click_filter' => 'more',
        'date_filter'  => 'before',
    ];

    if ( isset( $filter_defaults[ $name ] ) !== true ) {
        return $html;
    }

    $attributes = ' data-responsive-control="' . yourls_esc_attr( $name ) . '"'
                  . ' data-responsive-default="' . yourls_esc_attr( $filter_defaults[ $name ] ) . '"';

    $updated_html = preg_replace(
        '/<select\b/',
        '<select' . $attributes,
        $html,
        1,
    );

    return is_string( $updated_html ) ? $updated_html : $html;
}

yourls_add_filter(
    'html_select',
    'responsive_filter_form_select_attributes',
    10,
    5,
);

function responsive_infos_full_long_string(
    string $newstring,
    string $string,
    int $length = 60,
    string $append = '[...]',
): string {
    if ( function_exists( 'yourls_is_infos' ) && yourls_is_infos() ) {
        return $string;
    }

    return $newstring;
}

yourls_add_filter(
    'trim_long_string',
    'responsive_infos_full_long_string',
    10,
    4,
);

function responsive_table_row_action_array(
    array $actions,
    string $keyword,
): array {
    $icons = [
        'stats'  => 'bar_chart',
        'share'  => 'share',
        'edit'   => 'edit',
        'delete' => 'delete_outline',
    ];

    foreach ( $actions as $key => $action ) {
        if ( isset( $icons[ $key ] ) !== true ) {
            continue;
        }

        $label = '';
        if ( isset( $action['title'] ) ) {
            $label = strip_tags( html_entity_decode( (string) $action['title'] ) );
        } elseif ( isset( $action['anchor'] ) ) {
            $label = strip_tags( html_entity_decode( (string) $action['anchor'] ) );
        }

        $icon = '<span class="material-icons responsive-action-icon" aria-hidden="true">'
                . $icons[ $key ] . '</span>';
        $text = '<span class="responsive-sr-only">' . yourls_esc_html( $label )
                . '</span>';

        $actions[ $key ]['anchor'] = $icon . $text;
    }

    return $actions;
}

yourls_add_filter(
    'table_add_row_action_array',
    'responsive_table_row_action_array',
    10,
    2,
);

function responsive_table_row_cell_array(
    array $cells,
    string $keyword,
    string $url,
    string $title,
    string $ip,
    int $clicks,
    string $timestamp,
): array {
    if ( isset( $cells['keyword'] ) ) {
        $cells['keyword']['template']
            = '<a class="responsive-delete-metadata-link responsive-delete-metadata-shorturl"'
              . ' href="%shorturl%" aria-hidden="true" tabindex="-1">%keyword_html%</a>'
              . '<span class="responsive-link-row">'
              . '<a class="responsive-shorturl-link" href="%shorturl%" target="_blank" rel="noopener noreferrer">'
              . '<span class="responsive-link-text">%keyword_html%</span>'
              . '<span class="material-icons responsive-link-icon" aria-hidden="true">open_in_new</span>'
              . '</a>'
              . '<button class="responsive-copy-link-button" type="button"'
              . ' data-copy-text="%shorturl%"'
              . ' data-copy-label="Copy short URL"'
              . ' aria-label="Copy short URL"'
              . ' title="Copy short URL">'
              . '<span class="material-icons" aria-hidden="true">content_copy</span>'
              . '</button>'
              . '</span>';
    }

    if ( isset( $cells['url'] ) ) {
        $full_title                    = yourls_esc_html( $title );
        $full_long_url                 = yourls_esc_html( urldecode( $url ) );
        $cells['url']['title_html']    = $full_title;
        $cells['url']['long_url_html'] = $full_long_url;

        $cells['url']['template']
            = '<a class="responsive-delete-metadata-link responsive-delete-metadata-destination"'
              . ' href="%long_url%" title="%title_attr%" aria-hidden="true" tabindex="-1">%title_html%</a>'
              . '<span class="responsive-destination-section responsive-destination-section-url">'
              . '<span class="responsive-destination-section-title">Destination URL</span>'
              . '<small class="responsive-destination-raw">%warning%<span class="responsive-link-row">'
              . '<a class="responsive-destination-raw-link" href="%long_url%" target="_blank" rel="noopener noreferrer">'
              . '<span class="responsive-link-text">%long_url_html%</span>'
              . '<span class="material-icons responsive-link-icon" aria-hidden="true">open_in_new</span>'
              . '</a>'
              . '<button class="responsive-copy-link-button" type="button"'
              . ' data-copy-text="%long_url%"'
              . ' data-copy-label="Copy destination URL"'
              . ' aria-label="Copy destination URL"'
              . ' title="Copy destination URL">'
              . '<span class="material-icons" aria-hidden="true">content_copy</span>'
              . '</button>'
              . '</span></small>'
              . '</span>'
              . '<span class="responsive-destination-section responsive-destination-section-title-wrap">'
              . '<span class="responsive-destination-section-title">Title</span>'
              . '<span class="responsive-destination-title" tabindex="0" title="%title_attr%">%title_html%</span>'
              . '</span>';
    }

    return $cells;
}

yourls_add_filter(
    'table_add_row_cell_array',
    'responsive_table_row_cell_array',
    10,
    7,
);

function responsive_extract_row_number_from_id( string $id ): int {
    $digits = preg_replace( '/\D+/', '', $id );

    if ( is_string( $digits ) !== true || $digits === '' ) {
        return 1;
    }

    $row_number = (int) $digits;
    if ( $row_number < 1 ) {
        return 1;
    }

    return $row_number;
}

function responsive_edit_link_add_row_html(
    array $response,
    string $url,
    string $keyword,
    string $newkeyword,
    string $title,
    bool $new_url_already_there = false,
    bool $keyword_is_ok = true,
): array {
    if ( ( $response['status'] ?? '' ) !== 'success' ) {
        return $response;
    }

    $row_id = 1;
    if ( isset( $_REQUEST['id'] ) && is_scalar( $_REQUEST['id'] ) ) {
        $row_id = responsive_extract_row_number_from_id( (string) $_REQUEST['id'] );
    }

    $effective_keyword = $newkeyword;
    if (
        isset( $response['url']['keyword'] ) &&
        is_string( $response['url']['keyword'] )
    ) {
        $effective_keyword = $response['url']['keyword'];
    }

    if ( $effective_keyword === '' ) {
        return $response;
    }

    $link = yourls_get_keyword_infos( $effective_keyword, false );
    if ( is_array( $link ) !== true ) {
        return $response;
    }

    $response['row_html'] = yourls_table_add_row(
        $effective_keyword,
        (string) ( $link['url'] ?? '' ),
        (string) ( $link['title'] ?? '' ),
        (string) ( $link['ip'] ?? '' ),
        (int) ( $link['clicks'] ?? 0 ),
        (string) ( $link['timestamp'] ?? '' ),
        $row_id,
    );

    return $response;
}

yourls_add_filter(
    'edit_link',
    'responsive_edit_link_add_row_html',
    10,
    7,
);


function responsive_help_link( string $html ): string {
    return '';
}

yourls_add_filter( 'help_link', 'responsive_help_link' );


function responsive_hide_powered_by( string $html ): string {
    return '';
}

yourls_add_filter( 'html_footer_text', 'responsive_hide_powered_by' );

function responsive_logout_link( string $html ): string {
    $output = preg_replace(
        '/(.*?)\((.*?)\)/',
        '<span>$1</span><span>$2</span>',
        $html,
    );

    return is_string( $output ) ? $output : $html;
}

yourls_add_filter( 'logout_link', 'responsive_logout_link' );

function responsive_translate_labels(
    string $translation,
    string $text,
    string $domain = 'default',
): string {
    if ( $text === 'Shorten The URL' ) {
        return 'Shorten';
    }

    if ( $text === 'Delete confirmation' ) {
        return 'Delete Link';
    }

    return $translation;
}

yourls_add_filter( 'translate', 'responsive_translate_labels', 10, 3 );
