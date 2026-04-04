///////////////////////////////////////////////////////////
// Search Query URL Split Helper
///////////////////////////////////////////////////////////

// Preserves legacy URL-search compatibility by splitting
// protocol/slashes from the rest of the search value before
// submit, matching server-expected field format.

/**
 * If `value` starts with a protocol (http:// or https://), strip it so
 * the server receives only the host+path portion.  Returns the value
 * unchanged when no protocol prefix is detected.
 */
export function stripSearchProtocol(value) {
    if (typeof value !== "string") {
        return "";
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return trimmed;
    }

    const match = trimmed.match(/^https?:\/\/(.*)/i);
    return match ? match[1] : trimmed;
}

/**
 * Restore protocol prefix when the server returns a search value
 * that was originally stripped.  Used to keep the UI consistent
 * with what the user typed.
 */
export function restoreSearchProtocol(value, originalSearch) {
    if (typeof value !== "string" || typeof originalSearch !== "string") {
        return value ?? "";
    }

    const protocolMatch = originalSearch.match(/^(https?:\/\/)/i);
    if (!protocolMatch) {
        return value;
    }

    return protocolMatch[1] + value;
}
