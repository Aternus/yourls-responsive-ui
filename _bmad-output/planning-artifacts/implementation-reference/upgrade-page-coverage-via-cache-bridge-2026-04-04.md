# Cache Bridge Runtime Bootstrap (Research Artifact)

Date: 2026-04-04

## Objective

Apply responsive-ui runtime bootstrap and sanitizer behavior through `user/cache.php` for all admin flows, including `admin/upgrade.php` and optional `admin/install.php`.

## Confirmed Constraints

- `admin/upgrade.php` sets `YOURLS_UPGRADING` before bootstrap.
- `yourls_load_plugins()` skips loading plugins during install/upgrade.
- `Init::include_cache_files()` still includes `user/cache.php` early and unconditionally if it exists.

Implication: runtime hooks must be bootstrapped through `cache.php` to cover upgrade/install and to use a deterministic entry path.

## Recommended Architecture

Use an auto-managed `cache.php` bridge block owned by this plugin.

1. Activation path:

- Plugin writes/updates a marker-delimited block in `vendor/YOURLS/user/cache.php`.
- If bridge sync fails, plugin activation fails (hard requirement).

2. Bridge runtime behavior:

- For admin requests (normal admin + upgrade/install), `require_once` dedicated runtime bootstrap file:
    - `YOURLS_USERDIR . '/plugins/yourls-responsive-ui/bootstrap.php'`
- Runtime bootstrap must not be loaded from `plugin.php`.
- Use `file_exists` guard before `require_once`.
- Honor kill switches:
    - `YOURLS_RESPONSIVE_UI_DISABLE`
    - `YOURLS_USERDIR/yourls-responsive-ui.disable`

3. Deactivation/uninstall path:

- Plugin removes only its managed block, preserves the rest of `cache.php`.

## Managed Block Pattern (Example)

```php
// BEGIN yourls-responsive-ui managed bridge
if (
    !defined('YOURLS_RESPONSIVE_UI_DISABLE')
    && !file_exists(YOURLS_USERDIR . '/yourls-responsive-ui.disable')
) {
    $responsive_bootstrap = YOURLS_USERDIR . '/plugins/yourls-responsive-ui/bootstrap.php';
    if (file_exists($responsive_bootstrap)) {
        require_once $responsive_bootstrap;
    }
}
// END yourls-responsive-ui managed bridge
```

Notes:

- `plugin.php` remains lifecycle-only (metadata + bridge sync orchestration).
- Runtime hooks/assets are initialized from `bootstrap.php` loaded by the bridge.
- `require_once` keeps runtime bootstrap single-load per request for this include path.

## Safety Rules

- Never overwrite full `cache.php`; only insert/remove marker block.
- If `cache.php` is not writable during activation, activation fails with actionable error.
- If marker exists, replace in-place (idempotent update).
- If bootstrap file is missing, bridge should no-op (guarded by `file_exists`).

## Verification Checklist

1. Activate plugin with writable `user/cache.php`; confirm marker block exists exactly once.
2. Open `https://localhost/admin/index.php`; confirm runtime behavior is loaded via bridge bootstrap.
3. Open `https://localhost/admin/upgrade.php`; confirm plugin assets/sanitizer behavior are present.
4. If install coverage is enabled, open `https://localhost/admin/install.php`; confirm expected behavior.
5. Set `YOURLS_RESPONSIVE_UI_DISABLE` or create `user/yourls-responsive-ui.disable`; confirm bridge/sanitizer no-op.
6. Deactivate plugin and confirm managed bridge block is removed from `cache.php` without touching unrelated content.
