# Deferred Work

Items surfaced during review of the hook-first BEM/Vue-native refactor that are not caused by this change.

- ~~**Hardcoded 300ms timeout for delete row fade-out**~~: Resolved — now uses `transitionend` event.
- ~~**`preg_replace` could return null on PCRE backtrack limit exhaustion**~~: Resolved — added `?? $action_links` null-coalescing fallback.
- ~~**`apiRequest` sends mutation operations as GET query strings**~~: Resolved — mutations now use POST.
