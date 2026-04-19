<?php

define(
    'RUI_BRIDGE_BEGIN',
    '// BEGIN yourls-responsive-ui managed bridge',
);
define( 'RUI_BRIDGE_END', '// END yourls-responsive-ui managed bridge' );

function rui_bridge_block(): string {
    $begin = RUI_BRIDGE_BEGIN;
    $end   = RUI_BRIDGE_END;

    return <<<BRIDGE
        {$begin}
        if (
            !defined('YOURLS_RUI_UI_DISABLE')
            && !file_exists(YOURLS_USERDIR . '/yourls-responsive-ui.disable')
        ) {
            \$rui_bootstrap = YOURLS_USERDIR . '/plugins/yourls-responsive-ui/bootstrap.php';
            if (file_exists(\$rui_bootstrap)) {
                require_once \$rui_bootstrap;
            }
        }
        {$end}
        BRIDGE;
}

function rui_bridge_install(): bool {
    $cache_file = YOURLS_USERDIR . '/cache.php';

    if ( file_exists( $cache_file ) ) {
        $content = file_get_contents( $cache_file );

        if ( $content === false ) {
            return false;
        }

        $block     = rui_bridge_block();
        $has_begin = str_contains( $content, RUI_BRIDGE_BEGIN );
        $has_end   = str_contains( $content, RUI_BRIDGE_END );

        if ( $has_begin && $has_end ) {
            if ( str_contains( $content, $block ) ) {
                return true;
            }

            $before  = substr(
                $content,
                0,
                strpos( $content, RUI_BRIDGE_BEGIN ),
            );
            $after   = substr(
                $content,
                strpos( $content, RUI_BRIDGE_END ) +
                strlen( RUI_BRIDGE_END ),
            );
            $content = $before . $block . $after;

            return file_put_contents(
                $cache_file,
                $content,
                LOCK_EX,
            ) !== false;
        }

        if ( $has_begin ) {
            $content = substr(
                $content,
                0,
                strpos( $content, RUI_BRIDGE_BEGIN ),
            );
        } elseif ( $has_end ) {
            $content = substr(
                $content,
                strpos( $content, RUI_BRIDGE_END ) +
                strlen( RUI_BRIDGE_END ),
            );
        }
    } else {
        $content = "<?php\n";
    }

    if ( ! str_contains( $content, '<?php' ) && ! str_contains(
        $content,
        '<?',
    ) ) {
        $content = "<?php\n" . $content;
    }

    $content = rtrim( $content ) . "\n\n" . rui_bridge_block() . "\n";

    return file_put_contents( $cache_file, $content, LOCK_EX ) !== false;
}

function rui_bridge_remove(): bool {
    $cache_file = YOURLS_USERDIR . '/cache.php';

    if ( ! file_exists( $cache_file ) ) {
        return true;
    }

    $content = file_get_contents( $cache_file );

    if ( $content === false ) {
        return false;
    }

    $begin_pos = strpos( $content, RUI_BRIDGE_BEGIN );
    $end_pos   = strpos( $content, RUI_BRIDGE_END );

    if ( $begin_pos === false || $end_pos === false ) {
        return true;
    }

    $before  = substr( $content, 0, $begin_pos );
    $after   = substr( $content, $end_pos + strlen( RUI_BRIDGE_END ) );
    $content = rtrim( $before ) . "\n" . ltrim( $after );

    if ( trim( $content ) === '<?php' ) {
        $content = "<?php\n";
    }

    return file_put_contents( $cache_file, $content, LOCK_EX ) !== false;
}
