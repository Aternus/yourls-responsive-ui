///////////////////////////////////////////////////////////
// Fetch JSON Helper for Admin AJAX
///////////////////////////////////////////////////////////

const DEFAULT_TIMEOUT = 30000;

const MUTATION_ACTIONS = new Set(["add", "edit_save", "delete"]);

/**
 * Send a request to the YOURLS admin AJAX endpoint.
 *
 * Mutation actions (add, edit_save, delete) use POST with a form body.
 * Read-only actions use GET with query parameters.
 *
 * Returns a normalized response object with at minimum { status, message }.
 * On network/timeout/parse failure the promise resolves (never rejects) with
 * a { status: "fail", message } shape so callers always get a usable object.
 */
export function apiRequest(params, options = {}) {
  const ajaxURL = window.RESPONSIVEUI?.ajaxURL;
  if (!ajaxURL) {
    return Promise.resolve({
      status: "fail",
      message: "Missing AJAX URL.",
    });
  }

  const { timeout = DEFAULT_TIMEOUT, signal: externalSignal } = options;

  const isMutation = MUTATION_ACTIONS.has(params.action);

  const url = new URL(ajaxURL, window.location.origin);
  const fetchOptions = {
    credentials: "same-origin",
  };

  if (isMutation) {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        body.set(key, String(value));
      }
    }
    fetchOptions.method = "POST";
    fetchOptions.body = body;
  } else {
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        url.searchParams.set(key, String(value));
      }
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
  fetchOptions.signal = combinedSignal;

  return fetch(url, fetchOptions)
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
