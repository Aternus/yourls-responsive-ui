# yourls-responsive-ui

## Overview

To run the project, you need to execute the following commands:

1. Backend: `docker compose up`
2. Frontend: `npm run dev`

You can access the project at `https://localhost/admin/index.php` with the
default credentials: `root` / `root`.

You will need to use cURL to access `localhost`.

- Assume Backend and Frontend services are running.
- Assume the Frontend dev process (including TailwindCSS CLI watch mode) is
  already running.
- Do not run `npm run dev` or `npm run build` for routine development tasks. Run
  either command only when explicitly requested.

## PHP

Write code that is idiomatic to PHP, inspired by WordPress core.

To execute PHP commands inside the container:

```bash
docker compose exec -w /var/www/html/user/plugins/yourls-responsive-ui web php <command>
```

The project root is mounted at `/var/www/html/user/plugins/yourls-responsive-ui`
inside the `web` container. Always use this as the working directory when
running `composer` or `pint` commands.

## Components

HTML markup changes should be done via YOURLS hooks; ONLY IF it is not possible
(i.e., there is no appropriate action/filter), you should use DOM replacement.

When a custom element performs a host replacement (i.e., it takes over and
replaces a server-rendered element on mount), the element being replaced MUST be
hidden with `display: none` from the initial render until the custom element
takes over. This prevents a flash of the legacy markup before the replacement
happens.

## Colors

The color palette is defined inside the `@theme` layer in `src/css/app.css`.

## Icons

Use Material Design Icons.

## CSS

- Use TailwindCSS.
- Prefer CSS variables.

Use the following CSS comments style:

```css
/**********************************************************
    Heading 1
**********************************************************/

/* Heading 2
************************************************/

/**=== Heading 3 ===**/

/** Heading 4 **/

/* */
```

## UX / UI

The project uses `daisyui`. The design decisions should be idiomatic to daisyUI.

## Code Styling

The project uses Prettier. Make sure to run `npm run format` before task
completion.
