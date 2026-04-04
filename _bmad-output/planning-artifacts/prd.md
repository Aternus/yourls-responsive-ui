---
stepsCompleted:
    - step-01-init
    - step-02-discovery
    - step-02b-vision
    - step-02c-executive-summary
    - step-03-success
    - step-04-journeys
    - step-05-domain
    - step-06-innovation
    - step-07-project-type
    - step-08-scoping
    - step-09-functional
    - step-10-nonfunctional
    - step-11-polish
    - step-12-complete
inputDocuments:
    - _bmad-output/planning-artifacts/research/technical-disable-yourls-core-admin-assets-research-2026-04-04.md
    - docs/architecture.md
documentCounts:
    briefCount: 0
    researchCount: 1
    brainstormingCount: 0
    projectDocsCount: 1
    projectContextCount: 0
workflowType: "prd"
projectName: yourls-responsive-ui
userName: Aternus
date: 2026-04-04
classification:
    projectType: web_app
    domain: general
    complexity: medium
    projectContext: brownfield
---

# Product Requirements Document - yourls-responsive-ui

**Author:** Aternus  
**Date:** 2026-04-04

## Executive Summary

`yourls-responsive-ui` needs deterministic control of YOURLS admin presentation so plugin UX is first-class, not layered over core CSS/JS. The product objective is to disable non-essential YOURLS core admin assets while preserving compatibility-critical jQuery and preserving YOURLS as server authority.

The solution is a plugin-managed runtime path that sanitizes admin HTML output by context, removes selected core CSS/JS and known inline dependencies, and injects responsive UI assets consistently across normal admin flows and upgrade flow.

### What Makes This Special

Unlike pure runtime CSS overrides, this product defines an explicit asset-control contract:

- exact context-scoped strip rules with explicit page coverage
- bridge bootstrap through `user/cache.php` to cover upgrade/install paths where plugin loading is skipped
- explicit compatibility posture: preserve core `jquery-3.5.1.min.js` for ecosystem plugins
- fail-open behavior and immediate kill switches for operational safety

This gives a practical non-core-fork path today and keeps a clean migration path to future upstream asset-filter hooks.

## Project Classification

- **Project Type:** `web_app` (admin web UI enhancement plugin)
- **Domain:** `general`
- **Complexity:** `medium` (brownfield + lifecycle and compatibility constraints)
- **Project Context:** `brownfield` (existing YOURLS + existing responsive UI plugin)

## Success Criteria

### User Success

- Admin users experience consistent responsive UI across login, index, plugins, tools, infos, and upgrade pages.
- No visual flash/reflow from core styles competing with plugin styles.
- Primary admin actions (create short URL, manage plugins, access tools) remain intact with no behavioral regressions.

### Business Success

- Plugin can be shipped without maintaining a YOURLS core fork.
- Upgrade effort per YOURLS release is bounded by targeted rule adjustments and regression tests, not broad UI rewrites.
- Support burden drops through deterministic behavior and operational kill switches.

### Technical Success

- Non-essential core assets are removed by context while core jQuery remains present.
- Plugin assets load across all intended admin contexts, including upgrade flow through cache bridge.
- Sanitizer failures do not white-screen admin pages; original HTML is returned.

### Measurable Outcomes

- 100% of targeted pages exclude configured core assets and include plugin assets.
- 0 high-severity runtime JS errors on login, index, plugins, tools, infos, and upgrade smoke tests.
- Activation fails fast with actionable error when managed bridge cannot be installed.
- Deactivation/uninstall removes managed bridge block without altering unrelated cache content.

## Product Scope

### MVP - Minimum Viable Product

- Implement context-aware `<head>` sanitizer with exact URL/path matching.
- Keep YOURLS core jQuery; remove configured core CSS/JS per context.
- Remove/replace known inline blocks that break when stripped scripts are removed.
- Add managed `cache.php` bridge lifecycle (activate/update/remove).
- Add kill switches and fail-open behavior.
- Support contexts: `login`, `index`, `bookmark`, `plugins`, `tools`, `infos`, `upgrade`.

### Growth Features (Post-MVP)

- Optional `install.php` support via config flag.
- Admin diagnostics page with live strip-rule and context preview.
- Additional automated smoke coverage for all supported admin contexts.

### Vision (Future)

- Upstream YOURLS asset manifest filter support (`html_head_assets`) to replace sanitizer path.
- Parallel track: patch YOURLS core to expose a dedicated admin asset hook.
- Transition to hook-based asset control with sanitizer retained only as transitional fallback.

## User Journeys

### Journey 1: Primary Admin Success Path

A YOURLS admin logs in and lands on `admin/index.php`. The page loads plugin styles and scripts immediately, without core style conflicts. The admin creates a short URL and sees expected feedback and controls. They never encounter broken JS from removed core assets because compatibility-critical jQuery remains and required inline adaptations are applied.

### Journey 2: Primary Admin Edge Case Recovery

After YOURLS update, a context-specific inline block changes and sanitizer matching fails. The plugin fails open, returning original page markup. Admin can still operate the system. They enable a kill switch to disable sanitizer globally while investigating, restoring baseline YOURLS behavior without plugin uninstall.

### Journey 3: Operations/Upgrade Flow

An operator opens `admin/upgrade.php`. Even though active plugins are skipped in upgrading mode, managed `cache.php` bridge bootstraps runtime sanitizer and plugin asset injection. Upgrade page aligns with responsive UI conventions and strips configured core assets safely.

### Journey 4: Support/Troubleshooting Flow

Support receives a report of UI regression on `admin/plugins.php`. They inspect debug logs/diagnostics to see context detection, removed assets, and matched inline strips. They compare against configured strip rules for that context, apply targeted adjustment, and retest affected page only.

### Journey 5: Ecosystem Compatibility Flow

A site uses a third-party YOURLS plugin that depends on jQuery. Admin enables responsive UI sanitizer and verifies third-party plugin screens still function because core jQuery remains loaded. No forced plugin rewrite is required.

### Journey Requirements Summary

- deterministic context detection
- context-specific strip rules
- lifecycle coverage across normal and upgrade flows
- operational safety controls (kill switch + fail open)
- observability to debug mismatches quickly
- compatibility policy for core and ecosystem dependencies

## Innovation & Novel Patterns

### Detected Innovation Areas

- Managed `cache.php` bridge pattern for deterministic runtime bootstrap in YOURLS install/upgrade lifecycle gaps.
- Context-scoped asset-strip rules that combine static URL stripping with targeted inline block sanitation.
- Compatibility-first strategy that removes most core assets while intentionally retaining jQuery to preserve plugin ecosystem behavior.

### Market Context & Competitive Landscape

Most legacy admin theming approaches rely on override CSS and DOM patching after core assets load. This pattern shifts from override to controlled asset exclusion at render boundary, reducing style conflict and long-term maintenance. It is an architectural improvement rather than a net-new market category.

### Validation Approach

- Snapshot validate `<head>` for each targeted context.
- Runtime smoke validate key admin actions and plugin screens.
- Validate activation/deactivation bridge lifecycle behaviors with file-content integrity checks.

### Risk Mitigation

- Fail-open sanitizer behavior on parse or match failures.
- Exact path matching over broad regex where possible.
- Global disable controls (`YOURLS_RESPONSIVE_UI_DISABLE` and file toggle).
- Explicit page-context test matrix and rule ownership.

## Web App Specific Requirements

### Project-Type Overview

This product is an admin-focused web application enhancement for a server-rendered system. It must preserve progressive enhancement and server authority while applying deterministic client-side presentation control.

### Technical Architecture Considerations

- **Browser Matrix:** Current evergreen Chromium, Firefox, Safari, and current Edge for admin usage.
- **Responsive Design:** Responsive behavior across mobile and desktop admin layouts with no shadow DOM assumptions.
- **Performance Targets:** Minimal overhead in sanitization path and no user-perceptible delay in admin page load.
- **SEO Strategy:** Not applicable for private admin surfaces; indexability is not a goal.
- **Accessibility Level:** Maintain functional keyboard navigation and readable structure on sanitized pages.

### Implementation Considerations

- Keep server/client boundary explicit: PHP owns output shaping and lifecycle hooks; client JS owns interaction enhancements.
- Use stable, testable selectors and URL tokens; avoid fragile broad replacements.
- Ensure compatibility with existing YOURLS plugin behaviors where feasible.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Compatibility-first asset control with deterministic sanitization and operational safety.  
**Resource Requirements:** 1 PHP engineer + 1 frontend engineer + QA support for context coverage.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- admin login and normal dashboard workflows
- plugin/tools/infos management flows
- upgrade flow continuity through cache bridge
- troubleshooting and rollback paths

**Must-Have Capabilities:**

- context-aware asset stripping and inline sanitation
- managed bridge lifecycle with idempotent marker block
- kill switches and fail-open behavior
- automated page-level smoke and snapshot checks

### Post-MVP Features

**Phase 2 (Post-MVP):**

- optional install-page handling
- admin diagnostics UI for strip rules and sanitizer state
- expanded context smoke/snapshot automation

**Phase 3 (Expansion):**

- core patch adoption and migration to dedicated hook-based asset control
- reduced sanitizer footprint when native filter path is available

### Risk Mitigation Strategy

**Technical Risks:** Use strict scope matching, regression snapshots, and targeted rule updates.  
**Market Risks:** Validate against common YOURLS plugins and real admin flows before rollout.  
**Resource Risks:** Deliver in phases; keep kill switch fallback to de-risk deployment.

## Functional Requirements

### Asset Control & Context Routing

- FR1: System can detect admin context (`login`, `index`, `bookmark`, `plugins`, `tools`, `infos`, `upgrade`, optional `install`) before applying sanitization.
- FR2: System can apply context-specific strip rules for CSS/JS URLs.
- FR3: System can preserve configured allow-list assets even when other core assets are removed.
- FR4: System can keep core `jquery-3.5.1.min.js` loaded in compatibility mode.
- FR5: System can skip sanitization for non-HTML responses.

### HTML Head Sanitization

- FR6: System can remove configured `<link>` tags from `<head>` based on exact path/token matching.
- FR7: System can remove configured `<script src>` tags from `<head>` based on exact path/token matching.
- FR8: System can leave plugin-provided assets untouched.
- FR9: System can avoid duplicate plugin asset injection across repeated hooks.
- FR10: System can return original HTML unchanged when sanitization/parsing fails.

### Inline Script Compatibility

- FR11: System can strip or neutralize known core inline blocks that depend on removed scripts.
- FR12: System can apply inline sanitization rules conditionally by context.
- FR13: System can preserve unrelated inline scripts and page behavior.
- FR14: System can maintain login field focus behavior after inline adjustments.

### Runtime Bootstrap & Lifecycle

- FR15: Plugin activation can create or update a managed marker-delimited bridge block in `YOURLS_USERDIR/cache.php`.
- FR16: Plugin activation can fail with actionable error when bridge cannot be created or updated.
- FR17: Plugin deactivation can remove managed bridge block while preserving non-plugin cache content.
- FR18: Plugin uninstall can remove managed bridge block while preserving non-plugin cache content.
- FR19: Bridge runtime can `require_once` a dedicated plugin bootstrap file when present.
- FR20: Bridge runtime can no-op safely when kill switch controls are active.

### Safety, Control, and Observability

- FR21: Administrator can disable runtime behavior using `YOURLS_RESPONSIVE_UI_DISABLE` constant.
- FR22: Administrator can disable runtime behavior using `YOURLS_USERDIR/yourls-responsive-ui.disable` file toggle.
- FR23: System can emit debug diagnostics for context detection and applied strip rules when debug mode is enabled.
- FR24: System can expose clear error messages for bridge lifecycle failures.

### Verification & Compatibility

- FR25: QA engineer can run automated checks that verify expected kept/removed assets per context.
- FR26: QA engineer can run smoke tests for core admin actions on all supported contexts.
- FR27: QA engineer can verify upgrade flow coverage through cache bridge bootstrap.
- FR28: System can support third-party plugin screens that rely on jQuery under compatibility mode.

## Non-Functional Requirements

### Performance

- Sanitization adds no more than 30 ms median server processing overhead on targeted admin pages under normal conditions.
- Added response-size overhead from plugin injections remains below 10 KB per page for MVP contexts.

### Security

- Bridge management writes only within `YOURLS_USERDIR/cache.php` and never executes dynamic user input.
- Runtime bootstrap path is fixed and guarded with `file_exists` + `require_once` semantics.
- Debug diagnostics exclude secrets, credentials, and nonce values.

### Scalability

- Sanitization remains stable under concurrent admin usage without shared mutable global state corruption.
- Strip-rule strategy supports incremental extension for new contexts without full rewrite.

### Accessibility

- Sanitized pages preserve keyboard-accessible admin interactions and visible focus behavior.
- UI changes maintain readable contrast and interaction affordances from plugin design system.

### Integration

- Solution remains plugin-only and does not require YOURLS core source edits for MVP.
- Runtime behavior is validated against the current baseline and maintained through context test coverage on upgrades.
- Core jQuery remains integrated for third-party plugin compatibility unless a future mode explicitly disables it.
