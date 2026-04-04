# Deferred Work

Items surfaced during review of the hook-first BEM/Vue-native refactor that are not caused by this change.

- **Hardcoded 300ms timeout for delete row fade-out**: The delete handler uses `setTimeout(() => row.remove(), 300)` paired with a CSS `opacity 0.3s` transition. Should use `transitionend` event instead to avoid drift under load. Pre-existing pattern carried forward.
- **`preg_replace` could return null on PCRE backtrack limit exhaustion**: In `src/filters.php`, `preg_replace` calls that strip `onclick` attributes could return null if regex backtrack limits are hit. Pre-existing PHP pattern.
- **`apiRequest` sends mutation operations as GET query strings**: Actions like `edit_save` and `delete` include nonces in query parameters. GET params are logged by servers/proxies. Should use POST for mutations. This is the pre-existing YOURLS admin-ajax convention.
