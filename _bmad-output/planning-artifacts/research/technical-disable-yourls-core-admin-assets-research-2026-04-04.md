---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: "research"
lastStep: 6
research_type: "technical"
research_topic: "Disable YOURLS core admin styles/scripts (while preserving core jQuery) for yourls-responsive-ui"
research_goals: "Use YOURLS hooks first; avoid runtime CSS overrides; preserve core jQuery for compatibility; disable built-in styles/non-essential core JS; evaluate output buffering + DOM parsing fallback where hooks are missing."
user_name: "Aternus"
date: "2026-04-04"
web_research_enabled: true
source_verification: true
---

# Research Report: Technical

**Date:** 2026-04-04  
**Author:** Aternus  
**Research Type:** technical

---

## Research Overview

This research evaluates how to fully disable original YOURLS admin CSS/JS so `yourls-responsive-ui` does not rely on runtime style overrides.

Method used:

- Verified current local code path in bundled YOURLS (`vendor/YOURLS`, version `1.10.3`).
- Verified official docs for hooks, plugin architecture, and special files.
- Mapped hook coverage vs actual asset output points.
- Assessed fallback strategies where hook coverage is insufficient.

---

## Technical Research Scope Confirmation

**Research Topic:** Disable YOURLS core admin styles/scripts (while preserving core jQuery) for yourls-responsive-ui  
**Research Goals:** Use YOURLS hooks first; avoid runtime CSS overrides; preserve core jQuery for compatibility; disable built-in styles/non-essential core JS; evaluate output buffering + DOM parsing fallback where hooks are missing.

**Technical Research Scope:**

- Architecture Analysis - YOURLS render lifecycle and hook points around `<head>` output
- Implementation Approaches - hook-only, output rewrite, core patch strategy
- Technology Stack - YOURLS plugin API + PHP output buffering / DOM parsing mechanisms
- Integration Patterns - where plugin code can safely intercept full-page HTML responses
- Performance Considerations - overhead and risk tradeoffs of runtime output rewriting

**Scope Confirmed:** 2026-04-04

---

## Technology Stack Analysis

### Core Platform and Render Path

YOURLS admin page assets are emitted directly inside `yourls_html_head()` in core, not through a WordPress-like enqueue/dequeue registry.

Local verification (YOURLS 1.10.3):

- Hardcoded JS includes: `jquery-3.5.1.min.js`, `common.js`, `jquery.notifybar.js`
- Hardcoded CSS includes: `css/style.css` plus context-specific `infos.css`, `tablesorter.css`, `share.css`, `cal.css`
- Context booleans (`$share/$insert/$tablesorter/$tabs/$cal/$charts`) are internal locals, not filterable before print.

References:

- Local: `vendor/YOURLS/includes/functions-html.php:28-133`
- Local: `vendor/YOURLS/includes/version.php` (version `1.10.3`)

### Hook Surface Availability

Available hooks around head output:

- `pre_html_head` (before markup is printed)
- `admin_headers` (for headers, not asset list control)
- `html_head_meta` (extra meta output)
- `html_head` (late in head, after core assets already printed)

There is no `shunt_html_head` / `html_head_assets` filter in current hooklist.

References:

- YOURLS Hooklist: https://yourls.org/hooklist.php
- Local: `vendor/YOURLS/includes/functions-html.php:30,69,93,132`

### Hook API Capabilities

YOURLS does support removing hook callbacks via:

- `yourls_remove_filter()`
- `yourls_remove_action()`
- `yourls_remove_all_filters()` / `yourls_remove_all_actions()`

This helps only for logic attached through hooks; it cannot remove static `<script>/<link>` printed inline by core template functions.

References:

- Local: `vendor/YOURLS/includes/functions-plugins.php:338-402`
- Docs: https://yourls.org/docs/development/hooks

---

## Integration Patterns Analysis

### Pattern 1: Hook-First Output Interception (No Core Fork)

Use hooks to start output buffering before `yourls_html_head()` prints, then sanitize full HTML before response flush.

Recommended hook points:

- Start buffer in `pre_html_head` (priority 0)
- End/flush in `html_footer` or `shutdown`
- Apply only to HTML document responses (`admin`, `infos`, login screen)

Strengths:

- No core edits
- Uses official hook system
- Can remove both static includes and inline jQuery-dependent snippets

Limitations:

- Still runtime rewrite (not true dequeue)
- Must maintain a precise strip list

### Pattern 2: Core Patch / Upstreamable Asset Filter API (Best Long-Term)

Introduce a core asset manifest in `yourls_html_head()` and run it through a filter before printing.

Example conceptual API:

- `yourls_apply_filter('html_head_assets', $assets, $context)`
- Optional `yourls_apply_filter('shunt_html_head_assets', false, $context)`

Then your plugin can remove `jquery`, `common`, `notifybar`, `style`, etc. without output parsing.

Strengths:

- Clean architecture
- No HTML surgery
- Future-proof if accepted upstream

Limitations:

- Requires core patch/fork until upstream merged

---

## Architectural Patterns and Constraints

### Critical Constraint: Inline jQuery Usage Outside `functions-html.php`

Disabling jQuery requires removing/replacing inline snippets still using `$()`:

- `vendor/YOURLS/includes/functions-html.php:809` (`$('#username').focus();` login)
- `vendor/YOURLS/admin/index.php:271-274` (`$(document).ready(...)` in bookmark flow)
- `vendor/YOURLS/admin/plugins.php:151-162` (`$('#plugin_summary')...` toggle behavior)

If these remain after jQuery removal, pages throw runtime errors.

### Core Compatibility Principle

YOURLS docs explicitly advise extending via plugins/hooks instead of hacking core files.

Reference:

- https://yourls.org/docs/development/dont-hack-core

## Live Runtime Validation (Local Instance)

Live checks were run on **2026-04-04** against `https://localhost/admin/index.php` with `curl`.

### Connectivity and Protocol

- `https://localhost/admin/index.php` returned `HTTP/1.1 200 OK`.
- `http://localhost/admin/index.php` failed (`port 80` closed).

This means local validation currently represents the TLS endpoint only.

### Login Page (`/admin/index.php`, unauthenticated)

Observed in emitted HTML:

- Core assets present:
    - `/js/jquery-3.5.1.min.js?v=1.10.3`
    - `/js/common.js?v=1.10.3`
    - `/js/jquery.notifybar.js?v=1.10.3`
    - `/css/style.css?v=1.10.3`
- Plugin assets appended later in `<head>`:
    - `/user/plugins/yourls-responsive-ui/release/css/app.css?...`
    - `/user/plugins/yourls-responsive-ui/src/js/app.js?...`
- Inline jQuery present on login:
    - `$('#username').focus();`

### Authenticated Admin Pages (`root` / `root`)

After logging in and re-checking live HTML for `index.php`, `plugins.php`, `tools.php`:

- Core assets remain present on all checked pages.
- Context assets appear as expected:
    - `index.php`: `tablesorter.css/js`, `share.css/js`, `cal.css/js`, `insert.js`
    - `plugins.php`, `tools.php`: `tablesorter.css/js`
- Plugin assets still load **after** core assets in `<head>`.

### Bookmarklet Context Validation

A live bookmark-style request to `admin/index.php` confirmed inline jQuery dependency:

- `$(document).ready(function(){ feedback(...); init_clipboard(); });`

This validates that disabling jQuery requires stripping/replacing inline blocks in addition to `<script src>` tags.

## Ecosystem Compatibility Check (Top Plugins)

On **2026-04-04**, a compatibility audit was run against the top YOURLS plugins by stars (from GitHub `topic:yourls-plugin`), constrained to repos listed in the official `YOURLS/awesome` plugin list.

Top 10 evaluated:

1. `YOURLS/antispam` (41)
2. `MatthewC/yourls-password-protection` (36)
3. `YOURLS/404-if-not-found` (33)
4. `YOURLS/dont-log-bots` (23)
5. `ozh/yourls-change-password` (23)
6. `YOURLS/timezones` (22)
7. `ozh/yourls-fallback-url` (20)
8. `YOURLS/google-safe-browsing` (17)
9. `dorks-delivered/GTM-for-YOURLS` (16)
10. `MatthewC/yourls-2fa-support` (15)

Findings summary:

- **Hard jQuery/core-JS dependency:** `2/10`
    - `MatthewC/yourls-password-protection` (admin page JS is jQuery-based)
    - `YOURLS/timezones` (admin page JS uses `jQuery(...)` and Select2)
- **Soft dependency on YOURLS built-in CSS classes (`text`, `button`):** `2/10`
    - `ozh/yourls-change-password`
    - `MatthewC/yourls-2fa-support`
- **No meaningful dependency on core admin JS/CSS:** `6/10`

Compatibility decision:

- For plugin ecosystem compatibility, **keep core `jquery-3.5.1.min.js` present** in the near-term strategy.
- Strip non-essential core assets first; postpone full no-jQuery mode unless compatibility breakage is acceptable.

---

## Implementation Approaches and Recommendation

## Recommended Strategy (Ranked)

### 1) Immediate Production Path: Hook-Based Output Sanitizer (Plugin-only)

Implement a deterministic sanitizer that removes:

- Core CSS/JS URLs from `<head>` while keeping core jQuery for compatibility

Exhaustive **strip** list for YOURLS `1.10.3` (with jQuery preserved):

- Always:
    - `/js/common.js`
    - `/js/jquery.notifybar.js`
    - `/css/style.css`
- `index` and `bookmark` contexts:
    - `/css/tablesorter.css`
    - `/js/jquery-3.tablesorter.min.js`
    - `/js/tablesorte.js`
    - `/js/insert.js`
    - `/css/share.css`
    - `/js/share.js`
    - `/js/clipboard.min.js`
- `index` context only:
    - `/css/cal.css`
    - `/js/jquery.cal.js`
- `plugins` and `tools` contexts:
    - `/css/tablesorter.css`
    - `/js/jquery-3.tablesorter.min.js`
    - `/js/tablesorte.js`
- `infos` context:
    - `/css/infos.css`
    - `/js/infos.js`
    - `/css/share.css`
    - `/js/share.js`
    - `/js/clipboard.min.js`
    - `https://www.google.com/jsapi`

Keep present for compatibility:

- `/js/jquery-3.5.1.min.js`

Operational guardrails:

- Run only when response is HTML (not API/AJAX)
- Limit parsing to `<head>` plus explicit inline blocks
- Fail open: on parse failure, return original HTML untouched

### 2) Long-Term: Add/Upstream Asset Filters in YOURLS Core

Submit a core PR adding pre-print asset filters in `yourls_html_head()`. This is the clean fix that removes parsing overhead and fragility.

---

## Risk Assessment and Mitigation

### Risks

- Regex-only stripping can over/under-match if YOURLS markup changes.
- `DOMDocument` can normalize markup/entities and alter output unexpectedly.
- Removing `common.js` can break behavior expected by untouched admin pages.
- Future YOURLS upgrades may add new core assets not in strip list.

### Mitigations

- Prefer exact URL token checks plus scoped `<head>` parsing.
- Add snapshot tests against representative pages (`login`, `index`, `plugins`, `tools`, `infos`).
- Keep a versioned “strip manifest” keyed by YOURLS version.
- Add fail-open behavior and diagnostic logging in debug mode.

---

## Testing and Verification Plan

1. HTML snapshot tests:

- Assert removed assets are absent.
- Assert plugin assets remain.

2. Runtime smoke tests per page:

- Login form focus behavior (if replaced intentionally).
- Index/bookmark add-link flow.
- Plugins page table visibility/filter controls (if feature retained or intentionally dropped).

3. Upgrade safety:

- On YOURLS version bump, run a diff against `functions-html.php` and update strip manifest.

## Feasibility Verification: Immediate Production Path (Live)

Verification date: **2026-04-04**  
Target path: **Hook-Based Output Sanitizer (Plugin-only)**

### What Was Verified Live

- Sanitizer start hook: `pre_html_head` at priority `0`, output rewrite via `ob_start(...)` callback.
- Responses checked with authenticated browser flow (`root` / `root`) across:
    - `admin/index.php`
    - `admin/plugins.php`
    - `admin/tools.php`
    - bookmark context (`admin/index.php?up=...`)
    - `ozh+` infos page
- `<head>` asset result after sanitization:
    - **Kept:** `/js/jquery-3.5.1.min.js`
    - **Removed:** all other core JS/CSS listed in this report
    - **Kept:** plugin assets (`release/css/app.css`, `src/js/app.js`)

### Feasibility Result

- **Path is technically feasible and production-viable** as a plugin-only approach, with strict scoped stripping rules.
- Runtime blockers found during initial spike were resolved by adding context-scoped inline sanitization for:
    - bookmark feedback/init block
    - infos google charts loader and graph blocks
    - login username focus block
    - plugins `yourls_defaultsort`/toggle block
- Final sweep across login + authenticated admin pages confirmed:
    - core `jquery-3.5.1.min.js` preserved
    - targeted core JS/CSS removed
    - plugin-added CSS/JS still present
    - no core dependency runtime errors from stripped blocks

### Required for Production Readiness

- Use exact URL/path matching for `<script src>` and `<link href>` stripping (avoid loose token matching).
- Use context-scoped inline strip matchers for known YOURLS core inline blocks (avoid broad generic token stripping).
- Keep core jQuery loaded for ecosystem compatibility.
- Cover `install`/`upgrade` via managed `cache.php` bridge, because YOURLS skips plugin loading in those flows.

### Additional Dependency Check (`common.js` cookie extension)

- `jQuery.cookie` is defined in `vendor/YOURLS/js/common.js`.
- Core scan found **no call sites** in YOURLS admin/includes JS/PHP templates; only definition exists.
- Conclusion: the cookie extension is not currently a blocking runtime dependency by itself.

### Upgrade Page Gap and Extension Path

Why `upgrade.php` currently keeps old YOURLS styling:

- YOURLS does call `yourls_load_plugins()` during init, but loading is explicitly skipped when `yourls_is_upgrading()` or `yourls_is_installing()` is true.
- `admin/upgrade.php` defines `YOURLS_UPGRADING` before bootstrap, so active plugins are not included there.
- Live check confirmed `upgrade.php` renders only core assets (`style.css`, `common.js`, `jquery.notifybar.js`, jQuery) and does not include plugin assets.

Technical entry point that still runs in upgrade flow:

- `Init::include_cache_files()` includes `YOURLS_USERDIR/cache.php` early and unconditionally (if present), before plugin loading.

Self-contained way to cover `upgrade.php`:

- Have this plugin manage a **cache bridge** block in `user/cache.php` automatically.
- Bridge should run for all admin requests (including upgrade/install), with file existence guards.
- Bridge should `require_once` a dedicated runtime bootstrap file in this plugin folder (not `plugin.php`).
- Keep bridge block marker-delimited so it can be added/updated/removed safely without clobbering existing `cache.php` content.

Recommended behavior:

- On plugin activation: ensure managed bridge block exists in `cache.php`.
- On plugin deactivation/uninstall: remove managed bridge block.
- At runtime via bridge: `require_once` plugin runtime bootstrap for all admin flows, including `yourls_is_upgrading()` and `yourls_is_installing()`, then run the same hook-based sanitizer/head injection strategy.
- Keep `plugin.php` lifecycle-only (metadata + bridge sync orchestration); runtime hooks/assets bootstrap only from dedicated runtime bootstrap file.

Spec improvements required from this discovery:

- Define a marker-delimited contract for the managed block:
    - `// BEGIN yourls-responsive-ui managed bridge`
    - `// END yourls-responsive-ui managed bridge`
- Require idempotent block management:
    - if marker block exists, replace in-place
    - if missing, append once
    - never overwrite unrelated `cache.php` content
- Define activation/deactivation outcomes:
    - activation success means marker block exists exactly once
    - activation failure means plugin activation fails (hard requirement)
    - deactivation/uninstall success means marker block is fully removed
- Define failure handling:
    - if `cache.php` cannot be created/updated during activation, activation must fail with actionable error
    - if bridge removal fails during deactivation/uninstall, emit admin notice with exact path and remediation
- Define bootstrap safety:
    - include for admin contexts, including normal admin and install/upgrade contexts
    - use `require_once` + `file_exists` guard
    - runtime bootstrap path is dedicated and stable (example: `YOURLS_USERDIR/plugins/yourls-responsive-ui/bootstrap.php`)
    - do not load runtime hooks/assets directly from `plugin.php`
- Define global disable controls (kill switch):
    - constant: `YOURLS_RESPONSIVE_UI_DISABLE`
    - file toggle: `YOURLS_USERDIR/yourls-responsive-ui.disable`
    - if either control is active, bridge and sanitizer must no-op (fail open)
- Add verification gates to acceptance criteria:
    - `upgrade.php` renders plugin assets and stripped core assets
    - `install.php` behavior is explicit (enabled or intentionally disabled by config flag)
    - normal admin requests load runtime behavior through `cache.php` bridge
    - plugin activation fails if bridge block cannot be created/updated
    - enabling `YOURLS_RESPONSIVE_UI_DISABLE` disables bridge/sanitizer behavior immediately
    - creating `YOURLS_USERDIR/yourls-responsive-ui.disable` disables bridge/sanitizer behavior immediately
    - marker block removed after deactivation, leaving other cache content intact

Tradeoffs:

- Pros: fully automatic after plugin activation; no manual user integration step; deterministic runtime entry for all admin flows.
- Cons: requires write access to `user/cache.php`; if filesystem is read-only, activation must fail.

---

## Final Technical Conclusion

For current YOURLS (local `1.10.3`), there is no direct hook to dequeue core admin assets emitted in `yourls_html_head()`. Therefore:

- **Pure hook-only dequeue is not currently possible** for those hardcoded includes.
- **Best non-fork approach** is hook-driven output interception/sanitization (with safety guards and inline dependency handling).
- Based on ecosystem compatibility checks, **preserve core jQuery in the baseline strategy** and remove remaining core assets first.
- Keep implementation **fully self-contained in plugin code**, including automatic managed-block lifecycle in `user/cache.php` for all admin-flow runtime bootstrap.
- **Most maintainable architecture** is a small YOURLS core enhancement introducing filterable asset manifests.
- Runtime sanitizer coverage applies to `login`, `index`, `bookmark`, `plugins`, `tools`, `infos`, `upgrade`, and optional `install`, with `cache.php` as deterministic bootstrap across admin flows.
- Reference implementation handoff artifact: `_bmad-output/planning-artifacts/implementation-reference/hook-output-sanitizer-reference-2026-04-04.md`

---

## Sources

- YOURLS Plugins documentation: https://yourls.org/docs/development/plugins
- YOURLS Hooks documentation: https://yourls.org/docs/development/hooks
- YOURLS Hooklist (actions/filters): https://yourls.org/hooklist.php
- YOURLS “Don’t hack core”: https://yourls.org/docs/development/dont-hack-core
- Local source: `vendor/YOURLS/includes/functions-html.php`
- Local source: `vendor/YOURLS/includes/functions-plugins.php`
- Local source: `vendor/YOURLS/includes/Config/Init.php`
- Local source: `vendor/YOURLS/admin/index.php`
- Local source: `vendor/YOURLS/admin/plugins.php`
- Local source: `vendor/YOURLS/includes/version.php`
- GitHub ranking query: https://api.github.com/search/repositories?q=topic:yourls-plugin&sort=stars&order=desc&per_page=30
- YOURLS awesome plugins list: https://github.com/YOURLS/awesome
- https://github.com/YOURLS/antispam
- https://github.com/MatthewC/yourls-password-protection
- https://github.com/YOURLS/404-if-not-found
- https://github.com/YOURLS/dont-log-bots
- https://github.com/ozh/yourls-change-password
- https://github.com/YOURLS/timezones
- https://github.com/ozh/yourls-fallback-url
- https://github.com/YOURLS/google-safe-browsing
- https://github.com/dorks-delivered/GTM-for-YOURLS
- https://github.com/MatthewC/yourls-2fa-support
