# Hook-Based Output Sanitizer Reference

Date: 2026-04-04

## Purpose

Reference implementation for the YOURLS output sanitizer core logic.
This is a handoff artifact for implementation and is intentionally stored outside runtime plugin code.

## Scope

- Preserve core jQuery (`/js/jquery-3.5.1.min.js`)
- Strip selected core admin JS/CSS assets by exact URL/path match
- Strip specific core inline dependency blocks by page context (`bookmark`, `infos`, `index`, `login`, `plugins`)
- Keep third-party plugin assets untouched

## Known Coverage

- Sanitizer logic covers: `login`, `index`, `bookmark`, `plugins`, `tools`, `infos`
- With `cache.php` bridge bootstrap, sanitizer runtime coverage extends to: `upgrade` and optional `install`

## Runtime Wiring Requirements

- Runtime sanitizer code is loaded from dedicated plugin bootstrap file (example: `user/plugins/yourls-responsive-ui/bootstrap.php`).
- `user/cache.php` managed bridge block must `require_once` the dedicated bootstrap file.
- `plugin.php` is lifecycle-only (metadata + bridge sync orchestration), not runtime sanitizer bootstrap.

## Reference Patch (Against `src/actions.php`)

```diff
diff --git a/src/actions.php b/src/actions.php
index 25a7186..60bcd19 100644
--- a/src/actions.php
+++ b/src/actions.php
@@ -1,5 +1,254 @@
 <?php

+function responsive_begin_output_sanitizer( $context = '', $title = '' ): void {
+    if ( function_exists( 'yourls_is_API' ) && yourls_is_API() ) {
+        return;
+    }
+
+    if ( function_exists( 'yourls_is_Ajax' ) && yourls_is_Ajax() ) {
+        return;
+    }
+
+    if ( function_exists( 'yourls_is_GO' ) && yourls_is_GO() ) {
+        return;
+    }
+
+    if ( isset( $GLOBALS['responsive_output_sanitizer_active'] ) ) {
+        return;
+    }
+
+    $GLOBALS['responsive_output_sanitizer_active'] = true;
+    ob_start( 'responsive_sanitize_html_output' );
+}
+
+yourls_add_action( 'pre_html_head', 'responsive_begin_output_sanitizer', 0, 2 );
+
+function responsive_url_path( string $url ): string {
+    $parts = parse_url( $url );
+
+    if ( ! is_array( $parts ) || empty( $parts['path'] ) || ! is_string( $parts['path'] ) ) {
+        return '';
+    }
+
+    return '/' . ltrim( $parts['path'], '/' );
+}
+
+function responsive_url_host( string $url ): string {
+    $parts = parse_url( $url );
+
+    if ( ! is_array( $parts ) || empty( $parts['host'] ) || ! is_string( $parts['host'] ) ) {
+        return '';
+    }
+
+    return strtolower( $parts['host'] );
+}
+
+function responsive_should_strip_script_src( string $src, array $script_paths ): bool {
+    $path = responsive_url_path( $src );
+
+    if ( $path !== '' && in_array( $path, $script_paths, true ) ) {
+        return true;
+    }
+
+    $host = responsive_url_host( $src );
+    if ( in_array( $host, [ 'google.com', 'www.google.com' ], true ) && $path === '/jsapi' ) {
+        return true;
+    }
+
+    return false;
+}
+
+function responsive_should_strip_style_href( string $href, array $style_paths ): bool {
+    $path = responsive_url_path( $href );
+
+    return $path !== '' && in_array( $path, $style_paths, true );
+}
+
+function responsive_strip_script_src_tags( string $html, array $script_paths ): string {
+    $updated = preg_replace_callback(
+        '~<script\b[^>]*\bsrc=(["\'])([^"\']+)\1[^>]*>\s*</script>\s*~i',
+        static function ( array $matches ) use ( $script_paths ): string {
+            $src = html_entity_decode( $matches[2], ENT_QUOTES );
+
+            if ( responsive_should_strip_script_src( $src, $script_paths ) ) {
+                return '';
+            }
+
+            return $matches[0];
+        },
+        $html
+    );
+
+    return is_string( $updated ) ? $updated : $html;
+}
+
+function responsive_strip_style_href_tags( string $html, array $style_paths ): string {
+    $updated = preg_replace_callback(
+        '~<link\b[^>]*\bhref=(["\'])([^"\']+)\1[^>]*>\s*~i',
+        static function ( array $matches ) use ( $style_paths ): string {
+            $href = html_entity_decode( $matches[2], ENT_QUOTES );
+
+            if ( responsive_should_strip_style_href( $href, $style_paths ) ) {
+                return '';
+            }
+
+            return $matches[0];
+        },
+        $html
+    );
+
+    return is_string( $updated ) ? $updated : $html;
+}
+
+function responsive_strip_inline_script_blocks_matching( string $html, callable $matcher ): string {
+    $updated = preg_replace_callback(
+        '~<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)</script>\s*~i',
+        static function ( array $matches ) use ( $matcher ): string {
+            $attrs = $matches[1];
+            $body  = $matches[2];
+
+            if ( $matcher( $attrs, $body ) ) {
+                return '';
+            }
+
+            return $matches[0];
+        },
+        $html
+    );
+
+    return is_string( $updated ) ? $updated : $html;
+}
+
+function responsive_detect_body_context( string $html ): string {
+    if ( ! preg_match( '~<body\b[^>]*\bclass=(["\'])([^"\']*)\1~i', $html, $matches ) ) {
+        return '';
+    }
+
+    $class_attr = trim( $matches[2] );
+    if ( $class_attr === '' ) {
+        return '';
+    }
+
+    $classes = preg_split( '~\s+~', $class_attr );
+    if ( ! is_array( $classes ) ) {
+        return '';
+    }
+
+    $known_contexts = [ 'index', 'bookmark', 'infos', 'plugins', 'tools', 'login', 'install', 'new', 'upgrade' ];
+    foreach ( $classes as $class_name ) {
+        if ( in_array( $class_name, $known_contexts, true ) ) {
+            return $class_name;
+        }
+    }
+
+    return '';
+}
+
+function responsive_sanitize_html_output( string $html ): string {
+    if ( stripos( $html, '</head>' ) === false ) {
+        return $html;
+    }
+
+    $script_paths = [
+        '/js/common.js',
+        '/js/jquery.notifybar.js',
+        '/js/jquery-3.tablesorter.min.js',
+        '/js/tablesorte.js',
+        '/js/insert.js',
+        '/js/share.js',
+        '/js/clipboard.min.js',
+        '/js/jquery.cal.js',
+        '/js/infos.js',
+    ];
+
+    $style_paths = [
+        '/css/style.css',
+        '/css/tablesorter.css',
+        '/css/share.css',
+        '/css/cal.css',
+        '/css/infos.css',
+    ];
+
+    $output = $html;
+
+    $output  = responsive_strip_script_src_tags( $output, $script_paths );
+    $output  = responsive_strip_style_href_tags( $output, $style_paths );
+    $context = responsive_detect_body_context( $output );
+
+    if ( $context === 'bookmark' ) {
+        $output = responsive_strip_inline_script_blocks_matching(
+            $output,
+            static function ( string $attrs, string $body ): bool {
+                return strpos( $body, '$(document).ready' ) !== false
+                    && strpos( $body, 'feedback(' ) !== false
+                    && strpos( $body, 'init_clipboard()' ) !== false;
+            }
+        );
+    }
+
+    if ( $context === 'infos' ) {
+        $output = responsive_strip_inline_script_blocks_matching(
+            $output,
+            static function ( string $attrs, string $body ): bool {
+                if ( strpos( $body, 'google.load(' ) !== false
+                     && strpos( $body, 'visualization' ) !== false
+                     && strpos( $body, 'corechart' ) !== false
+                     && strpos( $body, 'geochart' ) !== false ) {
+                    return true;
+                }
+
+                $has_yourls_graph_id = preg_match( '~\bid=(["\'])yourls_graph[^"\']*\1~i', $attrs ) === 1;
+                if ( $has_yourls_graph_id ) {
+                    return true;
+                }
+
+                return false;
+            }
+        );
+    }
+
+    if ( $context === 'index' ) {
+        $output = responsive_strip_inline_script_blocks_matching(
+            $output,
+            static function ( string $attrs, string $body ): bool {
+                return strpos( $body, 'var l10n_cal_month =' ) !== false
+                    && strpos( $body, 'var l10n_cal_days =' ) !== false
+                    && strpos( $body, 'var l10n_cal_today =' ) !== false
+                    && strpos( $body, 'var l10n_cal_close =' ) !== false;
+            }
+        );
+    }
+
+    if ( $context === 'login' ) {
+        $output = responsive_strip_inline_script_blocks_matching(
+            $output,
+            static function ( string $attrs, string $body ): bool {
+                $normalized = preg_replace( '~\s+~', ' ', trim( $body ) );
+                if ( ! is_string( $normalized ) ) {
+                    return false;
+                }
+
+                return preg_match( '~^\$\([\'"]#username[\'"]\)\.focus\(\);\s*$~', $normalized ) === 1;
+            }
+        );
+    }
+
+    if ( $context === 'plugins' ) {
+        $output = responsive_strip_inline_script_blocks_matching(
+            $output,
+            static function ( string $attrs, string $body ): bool {
+                return strpos( $body, 'yourls_defaultsort = 0;' ) !== false
+                    && strpos( $body, 'yourls_defaultorder = 0;' ) !== false
+                    && strpos( $body, "#plugin_summary" ) !== false
+                    && strpos( $body, '#toggle_plugins' ) !== false
+                    && strpos( $body, "#main_table tr.inactive" ) !== false;
+            }
+        );
+    }
+
+    return $output;
+}
+
 function responsive_head_meta(): void {
     echo <<<HEAD_META
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Verification Checklist

1. Login page keeps jQuery and removes core `style.css`/`common.js` and inline `$("#username").focus()` block.
2. Index page strips tablesorter/share/cal assets and strips `l10n_cal_*` inline block.
3. Bookmark page strips core feedback/init inline block.
4. Infos page strips google loader + `yourls_graph*` inline chart blocks.
5. Plugins page strips inline `yourls_defaultsort` / `toggle_plugins` block.
6. Upgrade page applies same sanitizer behavior through `cache.php` bridge bootstrap.
7. Third-party plugin scripts/styles remain in `<head>`.
8. No runtime JS errors caused by missing stripped dependencies.
