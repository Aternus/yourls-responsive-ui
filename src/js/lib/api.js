///////////////////////////////////////////////////////////
// Fetch JSON Helper for Admin AJAX
///////////////////////////////////////////////////////////

const DEFAULT_TIMEOUT = 30000;

/**
 * Send a GET request to the YOURLS admin AJAX endpoint.
 *
 * Returns a normalized response object with at minimum { status, message }.
 * On network/timeout/parse failure the promise resolves (never rejects) with
 * a { status: "fail", message } shape so callers always get a usable object.
 */
export function apiRequest(params, options = {}) {
    const ajaxUrl = window.RESPONSIVEUI?.ajaxUrl;
    if (!ajaxUrl) {
        return Promise.resolve({
            status: "fail",
            message: "Missing AJAX URL.",
        });
    }

    const { timeout = DEFAULT_TIMEOUT, signal: externalSignal } = options;

    const url = new URL(ajaxUrl, window.location.origin);
    for (const [key, value] of Object.entries(params)) {
        if (value != null) {
            url.searchParams.set(key, String(value));
        }
    }

    const controller = new AbortController();
    const signals = [controller.signal];
    if (externalSignal) {
        signals.push(externalSignal);
    }

    const combinedSignal =
        typeof AbortSignal.any === "function"
            ? AbortSignal.any(signals)
            : controller.signal;

    const timer = setTimeout(() => controller.abort(), timeout);

    return fetch(url, {
        credentials: "same-origin",
        signal: combinedSignal,
    })
        .then((response) => {
            clearTimeout(timer);
            const contentType = response.headers.get("content-type") ?? "";

            if (contentType.includes("application/json")) {
                return response.json();
            }

            return response.text().then((text) => ({
                status: "fail",
                message: text || "Non-JSON response",
            }));
        })
        .catch((error) => {
            clearTimeout(timer);

            if (error?.name === "AbortError") {
                return { status: "fail", message: "Request timed out." };
            }

            return {
                status: "fail",
                message: error?.message || "Network error.",
            };
        });
}
