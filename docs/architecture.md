# Architecture

## Domains

### Core: Links

The primary domain. Everything revolves around shortened URLs and their lifecycle.

#### Links Display

How links are rendered and presented in the table.

- Table row cells (short URL, destination URL, title, clicks)
- Copy-to-clipboard buttons
- Expandable title display
- Link row pattern (URL + external-link icon + copy button)
- Row replacement after mutations (edit save returns updated row HTML)

#### Links Filtering

Narrowing down which links are visible.

- Search input
- Filter select controls (search field, sort by, sort order, click filter, date filter)
- Active filter state detection and default tracking
- Filter form disclosure/accordion UI

#### Link Actions

Mutating or sharing link data via modal drawers.

- Drawer shell (dialog lifecycle, open/close, slide-up animation)
- Edit panel (editable fields, save via AJAX, nonce handling)
- Share panel (clipboard copy, social sharing, message composition)
- Delete panel (confirmation, AJAX delete, row removal)
- Row action buttons (edit, share, delete, stats) and their active-mode visual state

#### Link Statistics

The detail/stats page for an individual link.

- Tab navigation with animated pill indicator
- Chart and visualization scaling
- URL display with copy buttons
- External link wrapping

### Supporting: Navigation

App-level chrome for moving around the interface.

- Mobile hamburger menu and overlay
- Scroll-to-top button

### Supporting: User

Identity and personalization.

- Login / Logout
- Color scheme preference (light/dark)

### Supporting: System Operations

Admin-level management concerns.

- Tools page
- Plugins page (action icons, filter toggle)

## Layers

### PHP Layer

YOURLS provides hooks to alter the HTML before it reaches the browser. The plugin uses filters to inject responsive markup into server-rendered HTML.

Key filters:

| Filter                       | Domain          | Purpose                                                               |
| ---------------------------- | --------------- | --------------------------------------------------------------------- |
| `table_add_row_cell_array`   | Links Display   | Restructures cells with link rows, copy buttons, expandable titles    |
| `table_add_row_action_array` | Link Actions    | Replaces action text with Material Icons + accessible labels          |
| `html_select`                | Links Filtering | Tags filter selects with `data-responsive-control` and default values |
| `edit_link`                  | Link Actions    | Generates full responsive row HTML in edit save responses             |
| `trim_long_string`           | Link Statistics | Preserves full text on infos pages                                    |
| `html_language_attributes`   | User            | Injects color scheme attribute                                        |
| `translate`                  | Links Display   | Custom label translations                                             |

Key actions:

| Action           | Domain     | Purpose                                |
| ---------------- | ---------- | -------------------------------------- |
| `html_head_meta` | Navigation | Viewport meta tag                      |
| `html_head`      | Navigation | CSS, JS, Vue import map, global config |
| `html_logo`      | Navigation | Vue app root mount point               |

### JavaScript Layer

Vue 3 components for interactive UI, composables for reusable reactive logic, and library modules for feature initialization and orchestration.

#### Components

Interactive Vue components that render UI.

| Component                    | Domain          |
| ---------------------------- | --------------- |
| `ResponsiveEditPanel`        | Link Actions    |
| `ResponsiveSharePanel`       | Link Actions    |
| `ResponsiveDeletePanel`      | Link Actions    |
| `ResponsiveDrawer`           | Link Actions    |
| `ResponsiveDrawerIntro`      | Link Actions    |
| `ResponsiveActionButton`     | Shared          |
| `ResponsiveField`            | Shared          |
| `ResponsiveTextInputField`   | Shared          |
| `ResponsiveTextareaField`    | Shared          |
| `ResponsiveMaterialIcon`     | Shared          |
| `ResponsiveBrandIcon`        | Shared          |
| `ResponsiveSearchFilters`    | Links Filtering |
| `ResponsiveNavControls`      | Navigation      |
| `ResponsiveScrollTopControl` | Navigation      |
| `ResponsiveUIRoot`           | App Shell       |

#### Composables

Reusable reactive logic for Vue components.

| Composable               | Used By                   |
| ------------------------ | ------------------------- |
| `useCopyFeedback`        | Share panel, copy buttons |
| `usePrimaryControlFocus` | Edit panel, share panel   |
| `useMediaQuery`          | Scroll-to-top             |
| `useRafScheduler`        | Scroll-to-top             |

#### Library Modules

Feature initialization and orchestration.

| Module               | Domain            | Purpose                                                   |
| -------------------- | ----------------- | --------------------------------------------------------- |
| `drawer-manager`     | Link Actions      | Unified drawer lifecycle, YOURLS function overrides, AJAX |
| `table-enhancements` | Links Display     | Copy button + title expand event delegation               |
| `search-filters`     | Links Filtering   | Mounts filter UI, reorganizes controls                    |
| `infos-page`         | Link Statistics   | Tab icons, chart scaling, copy buttons, link wrapping     |
| `plugins`            | System Operations | Plugin action icons, filter toggle                        |
| `row-data`           | Link Actions      | Extracts link data from table row DOM                     |
| `row-action-buttons` | Link Actions      | Action button visual state management                     |
| `vue-feature`        | App Shell         | One-time init guard via Vue mount                         |
| `shared`             | Shared            | Clipboard, social sharing, icon helpers, row replacement  |

### CSS Layer

SCSS with CSS custom properties, organized by scope.

| Directory       | Contents                                                            |
| --------------- | ------------------------------------------------------------------- |
| `internal/`     | Design tokens: variables, motion, elevation, shape                  |
| `components/`   | Component styles: dialog, table, nav, forms, notifications          |
| `pages/`        | Page-specific styles: index, infos, plugins, login, tools, settings |
| `_palette.scss` | Color palette                                                       |
| `_style.scss`   | Global styles                                                       |
| `app.scss`      | Entry point                                                         |

## Design Principles

- **Material Design 3** inspired UI and interaction patterns
- **Progressive enhancement**: PHP renders functional HTML, JS enhances interactivity
- **YOURLS integration via hooks**: No core modifications, all customization through filters and actions
- **Vue 3 Composition API**: `defineComponent` + `setup()` for all components
- **Declarative over imperative**: Prefer behavior defined in markup over separate event wiring
