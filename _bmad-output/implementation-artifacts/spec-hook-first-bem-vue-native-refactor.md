---
title: 'Hook-first BEM markup and Vue-native refactor for YOURLS Responsive UI'
type: 'refactor'
created: '2026-04-04T23:58:00+03:00'
status: 'ready-for-dev'
context:
  - 'AGENTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The plugin still depends on legacy override patterns: mixed selectors, global YOURLS JS patching, and jQuery-driven AJAX/DOM behavior. This creates maintenance drag and blocks clean UI evolution now that core assets can be stripped.

**Approach:** Use YOURLS hooks as the primary server-render contract, standardize plugin-owned markup to BEM selectors, and move frontend behavior to idiomatic Vue Custom Elements plus native `fetch` APIs. Keep Vue components self-contained and remove global patch/function dependencies.

## Boundaries & Constraints

**Always:**
- Prefer hook/filter output changes over DOM regex rewrites.
- Use BEM selectors for plugin-owned markup.
- Keep Vue CE code idiomatic (`props`, `emits`, composables, explicit state).
- Use native `fetch` (no jQuery).
- Preserve current user flows: add URL, search/filter, edit/share/delete, plugins, infos.

**Ask First:**
- Changing behavior/copy/interaction model beyond refactor scope.
- Any hook payload change that could break third-party plugin integrations.

**Never:**
- No edits under `vendor/YOURLS`.
- No new reliance on patched globals (`edit_link_display`, `remove_link`, `toggle_share`, `add_loading`, etc.).
- No jQuery usage in refactored paths.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Row rendering | `yourls_table_add_row` output on index page | Row/cell/action markup includes stable BEM selectors + action metadata | Fallback to valid minimal markup if hook data incomplete |
| Edit save | User saves in CE drawer | Request sent via `fetch`, row replaced in DOM, feedback shown | Keep drawer open and show fail feedback on bad response |
| Delete | User confirms delete in CE drawer | Request sent via `fetch`, row removed, counters updated natively | Leave row intact and show fail feedback on API failure |
| Date filters | Native date fields in search drawer | Values normalized to server-expected format on submit | Ignore invalid values without JS crash |
| Missing config | Missing `ajaxUrl` or nonce | Fast failure with visible error, no uncaught exceptions | Reject from API helper with safe message |

</frozen-after-approval>

## Code Map

- `src/filters.php` -- row/action/cell/table hooks for BEM server markup.
- `src/actions.php` -- frontend bootstrap config and CE mount points.
- `src/sanitizer.php` -- required asset isolation layer that strips original YOURLS JS/CSS.
- `src/js/lib/drawer-manager.js` -- replace jQuery/global override flows.
- `src/js/lib/row-data.js` -- align row extraction with new BEM markup.
- `src/js/lib/shared.js` -- shared DOM/feedback helpers.
- `src/js/lib/api.js` (new) -- `fetch` JSON helper for admin AJAX.
- `src/js/lib/feedback.js` (new) -- plugin-owned loading/disabled/message helpers (replacement for stripped core globals).
- `src/js/lib/counters.js` (new) -- plugin-owned link/click counters and empty-state row visibility.
- `src/js/lib/search-query.js` (new) -- protocol/slashes split helper to preserve search behavior.
- `src/js/elements/links/rui-search.js` -- remove jQuery-dependent datepicker path.
- `src/js/elements/links/rui-new-url.js` -- reduce transplant assumptions; hook-first ownership.
- `src/js/elements/links/rui-edit-panel.js` -- keep CE contract clean for save flow.
- `src/js/elements/links/rui-delete-panel.js` -- keep CE contract clean for delete flow.
- `src/css/components/_table.scss` -- migrate table layout selectors to BEM.
- `src/css/components/_new_url.scss` -- migrate add/share selectors to BEM.
- `src/css/components/_dialog.scss` -- migrate drawer/dialog selectors to BEM map.
- `src/css/components/_nav_menu.scss` -- normalize control naming to BEM.

## Tasks & Acceptance

**Execution:**
- [ ] `src/filters.php` -- define BEM-oriented markup contract using `table_add_row_action_array`, `table_add_row_cell_array`, `action_links`, and related table hooks; replace plugin-owned inline `onclick` behavior with `data-rui-action` attributes -- makes server HTML deterministic for JS/CSS and enables delegated native handlers.
- [ ] `src/actions.php` -- inject explicit `RESPONSIVEUI` runtime config (`ajaxUrl`, context, flags) and keep CE roots context-aware -- removes hidden global coupling.
- [ ] `src/js/lib/api.js` + `src/js/lib/drawer-manager.js` -- replace `jq.getJSON`/global patch calls with `fetch` helper and native request lifecycle; define helper contract (`same-origin` credentials, query serialization, timeout/abort, JSON parse fallback for nonce/error text responses) -- removes jQuery AJAX debt and ambiguous error handling.
- [ ] `src/js/lib/drawer-manager.js` + `src/js/lib/row-data.js` -- swap global function overrides for delegated click handling on BEM/data-action selectors; preserve nonce lifecycle (`edit-link_*` for display, `edit-save_*` for save) -- removes monkey-patched `window.*` entrypoints and CSRF drift.
- [ ] `src/js/lib/feedback.js` + `src/js/lib/shared.js` -- replace stripped core helpers (`feedback`, `add_loading`, `end_loading`, `end_disable`) with plugin-native equivalents -- avoids silent UX regressions.
- [ ] `src/js/lib/counters.js` + `src/js/lib/drawer-manager.js` -- replace stripped counter helpers (`decrement_counter`, `decrease_total_clicks`) with deterministic DOM-based recompute/update logic -- keeps tracking summary consistent after add/delete.
- [ ] `src/js/lib/search-query.js` + `src/js/elements/links/rui-search.js` -- preserve legacy URL-search compatibility by splitting protocol/slashes/rest before submit and restoring server-expected fields -- avoids query parsing regressions.
- [ ] `src/js/elements/links/rui-search.js` -- delete jQuery datepicker disable logic and keep native date handling only -- makes CE behavior framework-native.
- [ ] `src/js/elements/links/rui-new-url.js` + `src/filters.php` (`shunt_html_addnew`) -- make add-new flow fully plugin-owned (markup + behavior), and remove reliance on legacy inline `onclick="add_link()"`/core `add_link` function -- enforces decoupled ownership for creation flow.
- [ ] `src/sanitizer.php` -- keep sanitizer as a required isolation layer that strips original YOURLS assets/scripts so core UI code never competes with plugin code -- preserves deterministic frontend ownership.
- [ ] `src/css/components/_table.scss`, `src/css/components/_new_url.scss`, `src/css/components/_dialog.scss`, `src/css/components/_nav_menu.scss`, `src/css/pages/_index.scss` -- migrate to BEM selectors directly (breaking change, no compatibility alias layer) -- completes CSS contract alignment.

**Acceptance Criteria:**
- Given index/plugins/infos pages, when rendered, then plugin-owned interactive markup uses BEM selectors consistently.
- Given plugin-owned controls on index/search/drawer surfaces, when rendered, then behavior is bound through data attributes and delegated listeners, not inline `onclick` handlers.
- Given edit/share/delete actions, when executed, then they work without jQuery and without global callback monkey-patching.
- Given fetch-based AJAX actions, when nonce is invalid or response is non-JSON text, then the helper returns a normalized failure object and the UI shows deterministic error feedback.
- Given edit flow, when edit panel opens and then saves, then save requests always use a fresh `edit-save_*` nonce resolved from `edit_display`.
- Given add-new flow on index/bookmark contexts, when users submit new links, then creation works through plugin-owned code paths with no dependency on core `add_link`.
- Given core YOURLS assets are stripped (including jQuery), when plugin JS boots, then no uncaught runtime errors occur in critical flows.
- Given CE code is reviewed, when checking refactored components, then behavior is driven by local state/props/emits rather than legacy globals.
- Given add/delete operations complete, when tracking summary is displayed, then total links/clicks and `#nourl_found` state stay consistent with current table rows.
- Given filter search includes full URLs, when filters submit, then protocol/slashes splitting behavior matches legacy server expectations.
- Given drawer and expandable-title interactions, when operated by keyboard/screen reader users, then focus handling and expanded/collapsed semantics remain accessible.
- Given runtime is inspected in supported contexts, when plugin features are exercised, then no plugin feature requires YOURLS legacy frontend symbols (`add_link`, `edit_link_display`, `toggle_share`, `remove_link`, `feedback`, `add_loading`, `end_loading`, `end_disable`, `decrement_counter`, `decrease_total_clicks`).
- Given sanitizer is active, when admin pages render, then original YOURLS JS/CSS assets are consistently stripped so plugin assets remain the only active UI layer.
- Given formatting check runs, when `npm run format:check` is executed, then touched JS/SCSS files pass.

## Full Frontend Decouple Definition Of Done

- Core functionality in scope (add URL, filter/search, edit/share/delete, plugin actions, infos enhancements, nav controls) is implemented by plugin-owned markup and JS only.
- No plugin-owned interaction path depends on YOURLS legacy frontend JS functions or jQuery behavior.
- Plugin-owned interactive markup does not ship inline handler wiring (`onclick`) and uses delegated listeners/data attributes instead.
- Stripping core YOURLS frontend assets does not reduce behavior parity for in-scope features.
- Remaining legacy server HTML is either replaced at hook level or treated as inert fallback markup (not behavior owner).

## Context Coverage Matrix

| Context | Legacy Frontend Feature Surface | Plugin Replacement Owner | Replacement Complete |
|--------|----------------------------------|--------------------------|----------------------|
| `index` | add-new, filters, row actions, drawers, counters, feedback | `shunt_html_addnew`, table row hooks, CE + `api.js` + `feedback.js` + `counters.js` + `search-query.js` | Yes |
| `bookmark` | add-new + filtered list behavior parity | `shunt_html_addnew`, table/filter hooks, CE + shared libs | Yes |
| `plugins` | plugin action button UX hooks | `rui-plugin-actions` + plugin-owned event wiring | Yes |
| `infos` | infos page enhancements and navigation affordances | `rui-infos-page` + shared libs | Yes |
| `tools` | nav/control shell consistency without legacy JS dependency | nav CE + plugin shell styles/behavior | Yes |
| `login` | page-level JS behavior in plugin-owned scope | plugin CSS + sanitizer-safe passive behavior | Yes (no new interactive dependency) |

## Spec Change Log

- 2026-04-05: Added concrete hook ownership map, canonical BEM taxonomy, explicit fetch/nonce contract expectations, plugin-owned feedback/counter/search compatibility tasks, and accessibility/manual QA requirements after adversarial review.
- 2026-04-05: Made add-new replacement mandatory via `shunt_html_addnew`, added hard “Full Frontend Decouple Definition Of Done”, and added explicit context coverage matrix for replacement completeness.

## Design Notes

- Execute in this order to reduce blast radius:
  1) Hook-level markup contract,
  2) Fetch/event contract,
  3) CE cleanup,
  4) CSS BEM migration,
  5) Sanitizer hardening/validation.
- This release is intentionally breaking: do not add temporary selector aliasing.
- Hook ownership map for implementation:
  - Add-new surface: `shunt_html_addnew` (primary), `html_addnew` (fallback mount).
  - Row actions/cells: `table_add_row_action_array`, `table_add_row_cell_array`, `action_links`.
  - Head/footer bootstrapping: `html_head_meta`, `html_head`, `html_footer`.
  - Search controls: `html_select`.
- BEM contract (canonical):
  - Blocks use `rui-<surface>` (example: `rui-links-table`, `rui-drawer`, `rui-search`).
  - Elements use `__` (example: `rui-links-table__actions`).
  - Modifiers use `--` (example: `rui-drawer__button--primary`).
  - JS behavior hooks use `data-rui-*`; class names are for styling semantics, not behavior binding.
- Third-party safety invariants to preserve while refactoring:
  - Row id shape `id-<token>`.
  - Action id shape (`share-button-*`, `edit-button-*`, `delete-button-*`).
  - Hidden keyword input id `keyword_*`.
  - Filter field names (`search`, `search_in`, `sort_by`, `sort_order`, `click_filter`, `click_limit`, `date_filter`, `date_first`, `date_second`).
- Scope note: automated tests are intentionally deferred; this phase uses deterministic sanity checks + manual QA only.

## Verification

**Commands:**
- `npm run format:check` -- expected: Prettier passes for JS/SCSS.
- `npm run build` -- expected: SCSS build succeeds.
- `npm run test:e2e` -- expected: key admin workflows pass (if test coverage exists for touched areas).

**Manual checks (if no CLI):**
- `/admin/index.php`: add URL, filters, edit/share/delete drawer flows, row updates.
- `/admin/plugins.php`: plugin action enhancements and no dependency errors.
- `/admin/yourls-infos.php?keyword=<short>`: infos enhancements remain functional.
- `/admin/index.php`: verify action elements have `data-rui-action` handlers and no plugin-owned inline `onclick`.
- `/admin/index.php`: verify invalid nonce behavior surfaces a controlled failure message without JS exceptions.
- `/admin/index.php`: verify counter and `#nourl_found` behavior after repeated add/delete cycles.
- `/admin/index.php`: verify URL search with full `https://...` value still returns expected filtered rows.
