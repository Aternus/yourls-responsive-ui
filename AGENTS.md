# yourls-responsive-ui

## Overview

To run the project, you need to execute the following commands:

1. Backend: `docker compose up`
2. Frontend: `npm run dev`

You can access the project at `https://localhost/admin/index.php` with the
default credentials: `root` / `root`.

You will need to use cURL to access `localhost`.

Assume Backend & Frontend are running.

## PHP

Write code that is idiomatic to PHP, inspired by WordPress core.

## Components

HTML markup changes should be done via YOURLS hooks; ONLY IF it is not possible
(i.e., there is no appropriate action/filter), you should use DOM replacement.

## Colors

The color palette is defined in `src/css/_palette.css`.

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

The project is inspired by Material Design 3. It uses parts from `material-web`.
The design decisions should be idiomatic to Material Design 3.

## Code Styling

The project uses Prettier. Make sure to run prettier before task completion.
