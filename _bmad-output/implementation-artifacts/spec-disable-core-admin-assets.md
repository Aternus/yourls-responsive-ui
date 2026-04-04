---
title: 'Disable core admin assets via sanitizer + cache bridge'
type: 'feature'
created: '2026-04-04'
status: 'done'
baseline_commit: '34d9cc4'
context:
  - docs/architecture.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/implementation-reference/hook-output-sanitizer-reference-2026-04-04.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Plugin CSS/JS loads after core YOURLS admin assets, causing style conflicts and visual reflow. Core `yourls_html_head()` hardcodes asset output with no dequeue hook, so overrides alone cannot achieve deterministic control.

**Approach:** Implement a hook-driven output sanitizer that strips configured core CSS/JS and known inline blocks from `<head>` by page context, while preserving core jQuery for ecosystem compatibility. Bootstrap runtime through a managed `cache.php` bridge block so the sanitizer covers all admin flows including upgrade. Provide kill switches and fail-open behavior for operational safety.

## Boundaries & Constraints

**Always:**
- Preserve `/js/jquery-3.5.1.min.js` — never strip it
- Fail open: return original HTML on any parse/match failure
- Use exact URL path matching for `<script src>` and `<link href>` stripping
- Use context-scoped matchers for inline block stripping (no broad token matching)
- Keep `plugin.php` lifecycle-only; runtime hooks load from `bootstrap.php` via cache bridge
- Managed bridge block uses `// BEGIN` / `// END` marker delimiters in `cache.php`
- Bridge block management is idempotent (replace in-place if exists, append if missing)

**Ask First:**
- Adding support for `install.php` context (post-MVP per PRD)
- Changing the strip manifest (adding/removing asset paths)

**Never:**
- Edit YOURLS core files
- Strip third-party plugin assets
- Use DOMDocument for HTML parsing (normalization risks)
- Overwrite unrelated `cache.php` content during bridge management

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Normal admin page | HTML response with core assets in `<head>` | Core CSS/JS stripped per context, plugin assets kept, jQuery kept | N/A |
| API/AJAX/GO request | Non-HTML response | Sanitizer skips entirely, no ob_start | N/A |
| Sanitizer regex fails | `preg_replace_callback` returns null | Return original HTML unchanged | Fail open |
| Upgrade page via bridge | `YOURLS_UPGRADING` defined, plugins not loaded | `cache.php` bridge loads `bootstrap.php`, sanitizer runs | N/A |
| Kill switch constant | `YOURLS_RESPONSIVE_UI_DISABLE` defined | Bridge no-ops, no sanitizer, no asset injection | N/A |
| Kill switch file | `YOURLS_USERDIR/yourls-responsive-ui.disable` exists | Bridge no-ops, no sanitizer, no asset injection | N/A |
| Activation — writable | `cache.php` writable | Marker block written, activation succeeds | N/A |
| Activation — not writable | `cache.php` not writable or dir not writable | Activation fails with actionable error message | Hard fail |
| Deactivation | Plugin deactivated | Marker block removed, other cache content preserved | Emit notice if removal fails |
| Double activation | Marker block already exists | Replace in-place (idempotent), no duplicate blocks | N/A |
| Bootstrap file missing | `bootstrap.php` deleted but bridge exists | Bridge `file_exists` guard prevents fatal, no-op | Silent skip |

</frozen-after-approval>

## Code Map

- `plugin.php` -- Lifecycle-only: metadata, define constants, require lifecycle modules, register activate/deactivate hooks
- `bootstrap.php` -- **NEW** Runtime entry: register sanitizer hooks, require actions/filters/utils/constants/settings
- `src/sanitizer.php` -- **NEW** Output sanitizer: context detection, asset stripping, inline block removal
- `src/bridge.php` -- **NEW** Cache bridge lifecycle: install/update/remove managed block in `cache.php`
- `src/actions.php` -- Existing action hooks (head meta, head assets, custom elements)
- `src/utils.php` -- Existing utilities (asset URL, color scheme)
- `src/filters.php` -- Existing filter hooks (unchanged)
- `src/constants.php` -- Existing constants (unchanged)
- `src/settings_page.php` -- Existing settings (unchanged)

## Tasks & Acceptance

**Execution:**
- [x] `src/sanitizer.php` -- Create output sanitizer with context-aware asset stripping and inline block removal per reference implementation
- [x] `src/bridge.php` -- Create cache bridge lifecycle manager (install/update/remove marker block in `cache.php`, activation failure handling)
- [x] `bootstrap.php` -- Create runtime bootstrap that checks kill switches, then requires plugin modules and registers sanitizer hooks
- [x] `plugin.php` -- Restructure to lifecycle-only: keep metadata + constant, require only `src/bridge.php`, register activate/deactivate hooks for bridge sync. Remove direct requires of actions/filters/utils/constants/settings (moved to bootstrap)
- [x] `src/actions.php` -- No changes needed; sanitizer hook registration is in `src/sanitizer.php`; existing hooks unchanged

**Acceptance Criteria:**
- Given an authenticated admin on `index.php`, when page loads, then core `style.css`, `common.js`, `notifybar.js`, tablesorter/share/cal assets are absent from `<head>` and plugin assets and jQuery are present
- Given an unauthenticated user on login page, when page loads, then core assets stripped, jQuery present, `$('#username').focus()` inline block removed
- Given `plugins.php` loads, when rendered, then `yourls_defaultsort`/toggle inline block is stripped
- Given `infos` page loads, when rendered, then Google Charts loader and graph inline blocks are stripped
- Given `YOURLS_RESPONSIVE_UI_DISABLE` is defined, when any admin page loads, then no sanitization occurs and original HTML is returned
- Given `yourls-responsive-ui.disable` file exists in `YOURLS_USERDIR`, when any admin page loads, then no sanitization occurs
- Given plugin is activated with writable `cache.php`, when activation completes, then marker block exists exactly once in `cache.php`
- Given plugin is activated with non-writable filesystem, when activation runs, then activation fails with actionable error
- Given plugin is deactivated, when deactivation completes, then marker block is removed and other `cache.php` content is preserved
- Given `admin/upgrade.php` is loaded, when YOURLS skips plugin loading, then `cache.php` bridge bootstraps sanitizer and plugin assets still load

## Design Notes

The sanitizer uses `ob_start()` registered at `pre_html_head` (priority 0) to capture full page output. The callback applies:
1. `<script src>` stripping by exact URL path match against a static manifest
2. `<link href>` stripping by exact URL path match
3. Context detection from `<body class="...">` to determine which inline blocks to strip
4. Context-specific inline `<script>` block removal using content-signature matchers

The cache bridge writes a self-contained PHP block between `// BEGIN` and `// END` markers. This block checks kill switches and `require_once`s `bootstrap.php`. The bridge is the single runtime entry point for all admin flows.

## Verification

**Commands:**
- `npx prettier --check plugin.php src/sanitizer.php src/bridge.php src/bootstrap.php` -- expected: all files formatted
- `curl -sk https://localhost/admin/index.php -c /tmp/c -b /tmp/c -d 'username=root&password=root' -L | grep -c 'style.css'` -- expected: 0 (core CSS stripped)
- `curl -sk https://localhost/admin/index.php -c /tmp/c -b /tmp/c -d 'username=root&password=root' -L | grep -c 'jquery-3.5.1.min.js'` -- expected: 1 (jQuery preserved)

## Suggested Review Order

**Runtime bootstrap & bridge lifecycle**

- Entry point: cache bridge loads this on every admin request; kill switches and double-load guard
  [`bootstrap.php:1`](../../bootstrap.php#L1)

- Managed block lifecycle: install/update/remove with partial-marker recovery and PHP-tag guard
  [`bridge.php:37`](../../src/bridge.php#L37)

- Plugin restructured to lifecycle-only: bridge require + activate/deactivate hooks
  [`plugin.php:15`](../../plugin.php#L15)

**Output sanitizer**

- Main callback: strips external assets then dispatches context-specific inline strippers
  [`sanitizer.php:261`](../../src/sanitizer.php#L261)

- Hook registration: ob_start at pre_html_head priority 0 with API/AJAX/GO guards
  [`sanitizer.php:310`](../../src/sanitizer.php#L310)

- Context detection from body class attribute
  [`sanitizer.php:144`](../../src/sanitizer.php#L144)

- Google JSAPI stripping scoped to infos context only (review finding fix)
  [`sanitizer.php:290`](../../src/sanitizer.php#L290)

**Supporting files**

- YOURLS uninstall convention marker
  [`uninstall.php:1`](../../uninstall.php#L1)

- Existing action hooks — unchanged
  [`actions.php:1`](../../src/actions.php#L1)
