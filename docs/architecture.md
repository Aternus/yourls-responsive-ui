# Architecture

## Purpose

`yourls-responsive-ui` is a progressive-enhancement plugin for YOURLS admin pages.

- YOURLS/PHP remains the source of truth for data, permissions, and server-rendered HTML.
- Frontend JavaScript enhances UX with responsive layout behavior and interactive controls.
- The design system is Material Design 3 inspired, implemented through SCSS tokens and component/page styles.

## Domain Model

## 1) Links (Core)

The main product domain: creating, viewing, filtering, sharing, editing, and deleting short links.

Includes:

- table presentation of short URL, destination URL, title, clicks
- row-level actions (edit/share/delete/stats)
- filter/search controls
- link details and stats view

Boundary:

- Server owns canonical link data and mutation endpoints.
- Client owns interaction state (open drawer, copied feedback, expanded title, mobile disclosure state).

## 2) Navigation (Supporting)

Cross-page navigation affordances optimized for mobile behavior.

Includes:

- navigation menu toggle/overlay
- scroll-to-top behavior

Boundary:

- Server provides page structure and menu markup.
- Client augments with responsive controls and visibility logic.

## 3) Plugins & Admin Surfaces (Supporting)

Enhancements for plugin-management and utility pages.

Includes:

- action icon augmentation
- small interaction affordances

Boundary:

- Server defines available actions and page semantics.
- Client adds UI affordances, not business rules.

## 4) User Preferences (Cross-Cutting)

Personalization and display preferences.

Includes:

- color scheme selection and propagation
- label/UX text adjustments for responsive UI

Boundary:

- Server persists preference and injects baseline attributes/config.
- Client consumes those values for presentation.

## Architectural Boundaries

## A) Server Boundary (PHP / YOURLS Hooks)

Responsibilities:

- inject assets and runtime config
- reshape/selectively augment YOURLS HTML via filters/actions
- preserve compatibility with YOURLS core lifecycle and security model

Contract to frontend:

- stable DOM anchors/IDs/classes and generated custom-element tags
- required data attributes and nonce-bearing links/inputs

## B) Client Boundary (Browser / Vue Custom Elements)

Responsibilities:

- implement interactive behavior as custom elements
- orchestrate drawer lifecycle and action-state transitions
- provide resilient behavior when server updates/replaces table rows

Contract to server:

- no ownership of persistent business state
- no bypass of server validation/authorization flows

## C) Styling Boundary (SCSS)

Responsibilities:

- define visual language (palette, tokens, motion, elevation, shape)
- keep page/component styling consistent with responsive and MD3 goals

Contract:

- styles assume light-DOM rendering (`shadowRoot: false`) so global SCSS can apply

## Runtime Flow (High-Level)

1. YOURLS renders baseline admin HTML.
2. Plugin PHP hooks inject assets, config, and custom-element roots.
3. Browser upgrades registered `rui-*` elements.
4. Elements attach behavior to existing DOM and dispatch user intents.
5. Mutations route through YOURLS AJAX/server endpoints.
6. Returned HTML updates are reinserted; custom elements upgrade automatically.

## Invariants

- Progressive enhancement first: pages remain server-driven.
- Server remains authoritative for mutations and persisted data.
- Frontend behavior should degrade safely if JS is unavailable.
- Boundaries are explicit: domain logic on server, interaction logic on client.

## Extension Strategy

When adding a feature:

1. Place it in the correct domain first (Links, Navigation, Plugins/Admin, Preferences).
2. Define server/client ownership before implementation.
3. Add/adjust hook output and custom-element contract together.
4. Keep cross-domain coupling minimal; prefer composition over global side effects.
