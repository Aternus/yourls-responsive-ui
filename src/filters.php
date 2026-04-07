<?php

function responsive_output_color_scheme( string $html ): string {
    $scheme = responsive_get_color_scheme();

    if ( $scheme !== RESPONSIVE_SCHEME_SYSTEM ) {
        return $html
               . ' style="color-scheme: ' . $scheme . ';"'
               . ' data-theme="' . $scheme . '"';
    }

    return $html;
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

    if ( ! isset( $filter_defaults[ $name ] ) ) {
        return $html;
    }

    $attributes = ' data-rui-control="' . yourls_esc_attr( $name ) . '"'
                  . ' data-rui-default="' . yourls_esc_attr( $filter_defaults[ $name ] ) . '"';

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
    if ( yourls_is_infos() ) {
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
        'delete' => 'delete',
    ];

    foreach ( $actions as $key => $action ) {
        if ( ! isset( $icons[ $key ] ) ) {
            continue;
        }

        $label = '';
        if ( isset( $action['title'] ) ) {
            $label = strip_tags( html_entity_decode( (string) $action['title'] ) );
        } elseif ( isset( $action['anchor'] ) ) {
            $label = strip_tags( html_entity_decode( (string) $action['anchor'] ) );
        }

        $icon = '<span class="material-symbols-outlined rui-links-table__action-icon" aria-hidden="true">'
                . $icons[ $key ] . '</span>';
        $text = '<span class="rui-sr-only">' . yourls_esc_html( $label )
                . '</span>';

        $actions[ $key ]['anchor'] = $icon . $text;

        // Remove inline onclick — behavior is delegated via data-rui-action.
        if ( isset( $actions[ $key ]['onclick'] ) ) {
            $actions[ $key ]['onclick'] = '';
        }
    }

    return $actions;
}

yourls_add_filter(
    'table_add_row_action_array',
    'responsive_table_row_action_array',
    10,
    2,
);

function responsive_action_links_add_data_attributes(
    string $action_links,
    string $keyword,
): string {
    $action_map = [
        'stats-button'  => 'stats',
        'share-button'  => 'share',
        'edit-button'   => 'edit',
        'delete-button' => 'delete',
    ];

    foreach ( $action_map as $id_prefix => $action_name ) {
        $pattern      = '/(<a\b[^>]*\bid=["\']' . preg_quote( $id_prefix,
                '/' ) . '-[^"\']*["\'])/i';
        $action_links = preg_replace(
                            $pattern,
                            '$1 data-rui-action="' . $action_name . '"',
                            $action_links,
                        ) ?? $action_links;
    }

    // Strip any remaining onclick attributes from action links.
    $stripped = preg_replace(
        '/\s*onclick="[^"]*"/i',
        '',
        $action_links,
    );

    return is_string( $stripped ) ? $stripped : $action_links;
}

yourls_add_filter(
    'action_links',
    'responsive_action_links_add_data_attributes',
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
            = '<a class="rui-links-table__metadata-link rui-links-table__metadata-link--shorturl"'
              . ' href="%shorturl%" aria-hidden="true" tabindex="-1">%keyword_html%</a>'
              . '<span class="rui-link-row">'
              . '<a class="rui-links-table__shorturl-link rui-url-value" href="%shorturl%" target="_blank" rel="noopener noreferrer">'
              . '<span class="rui-link-row__text">%keyword_html%</span>'
              . '<span class="material-symbols-outlined rui-link-row__icon" aria-hidden="true">open_in_new</span>'
              . '</a>'
              . '<rui-copy-button copy-text="%shorturl%" copy-label="Copy short URL"></rui-copy-button>'
              . '</span>';
    }

    if ( isset( $cells['url'] ) ) {
        $full_title                    = yourls_esc_html( $title );
        $full_long_url                 = yourls_esc_html( urldecode( $url ) );
        $cells['url']['title_html']    = $full_title;
        $cells['url']['long_url_html'] = $full_long_url;

        $cells['url']['template']
            = '<a class="rui-links-table__metadata-link rui-links-table__metadata-link--destination"'
              . ' href="%long_url%" title="%title_attr%" aria-hidden="true" tabindex="-1">%title_html%</a>'
              . '<span class="rui-links-table__destination rui-links-table__destination--url">'
              . '<span class="rui-links-table__destination-label">Destination URL</span>'
              . '<small class="rui-links-table__destination-raw">%warning%<span class="rui-link-row">'
              . '<a class="rui-links-table__destination-link rui-url-value" href="%long_url%" target="_blank" rel="noopener noreferrer">'
              . '<span class="rui-link-row__text">%long_url_html%</span>'
              . '<span class="material-symbols-outlined rui-link-row__icon" aria-hidden="true">open_in_new</span>'
              . '</a>'
              . '<rui-copy-button copy-text="%long_url%" copy-label="Copy destination URL"></rui-copy-button>'
              . '</span></small>'
              . '</span>'
              . '<span class="rui-links-table__destination rui-links-table__destination--title">'
              . '<span class="rui-links-table__destination-label">Title</span>'
              . '<rui-expandable-title title="%title_attr%">%title_html%</rui-expandable-title>'
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

    if ( ! is_string( $digits ) || $digits === '' ) {
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
    if ( ! is_array( $link ) ) {
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
    return match ( $text ) {
        'Shorten The URL' => 'Shorten',
        'Delete confirmation' => 'Delete Link',
        default => $translation,
    };
}

yourls_add_filter( 'translate', 'responsive_translate_labels', 10, 3 );

///////////////////////////////////////////////////////////
// Shunt: Add-New Form
///////////////////////////////////////////////////////////

function responsive_shunt_html_addnew( $false ): string {
    if ( ! defined( 'YOURLS_USER' ) ) {
        return '';
    }

    $nonce = yourls_create_nonce( 'add_url' );
    $site  = yourls_get_yourls_site();

    $output = <<<HTML
        <main role="main">
        <div id="new_url">
            <rui-new-url></rui-new-url>
            <div id="new_url_form_wrap">
                <form id="new_url_form" action="" method="post">
                    <input type="hidden" name="nonce" value="{$nonce}" />
                    <input type="url" id="add-url" name="url" placeholder="Paste the URL to shorten" class="text" required />
                    <input type="text" id="add-keyword" name="keyword" placeholder="Optional custom short URL" class="text" value="" />
                    <input type="submit" id="add-button" name="add-button" value="Shorten" class="button primary" />
                </form>
            </div>
            <div id="feedback" role="status" aria-live="polite" style="display:none"></div>
            <div id="shareboxes" style="display:none">
                <div id="copybox">
                    <label for="copylink">Short URL</label>
                    <input id="copylink" class="text" type="text" readonly />
                    <small>
                        <span id="origlink"></span> -
                        <span id="statlink"></span>
                    </small>
                </div>
                <div id="sharebox">
                    <div id="tweet">
                        <span id="charcount"></span>
                        <textarea id="tweet_body" rows="2"></textarea>
                    </div>
                    <div id="share_links">
                        <a id="share_tw" href="#">Twitter</a>
                        <a id="share_fb" href="#">Facebook</a>
                    </div>
                </div>
            </div>
            <input type="hidden" id="yourls-site" value="{$site}" />
        </div>
        HTML;

    echo $output;

    return '';
}

yourls_add_filter( 'shunt_html_addnew', 'responsive_shunt_html_addnew' );
