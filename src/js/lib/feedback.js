///////////////////////////////////////////////////////////
// Plugin-owned Loading / Disabled / Message Helpers
///////////////////////////////////////////////////////////

// Replacements for stripped YOURLS core globals:
//   feedback, add_loading, end_loading, end_disable

function resolveTargets(selector) {
  if (typeof selector === "string") {
    return document.querySelectorAll(selector);
  }

  if (selector instanceof HTMLElement) {
    return [selector];
  }

  return [];
}

// Feedback //

let feedbackTimer = 0;

export function showFeedback(message, status = "success") {
  const el = document.querySelector("#feedback");
  if (!(el instanceof HTMLElement)) {
    return;
  }

  clearTimeout(feedbackTimer);

  el.innerHTML = "";

  const p = document.createElement("p");
  p.className = status === "success" ? "success" : "error";
  p.textContent = message;
  el.append(p);
  el.style.display = "";

  if (status === "success") {
    feedbackTimer = setTimeout(() => {
      el.style.display = "none";
    }, 5000);
  }
}

// Loading //

export function addLoading(selector) {
  for (const el of resolveTargets(selector)) {
    el.classList.add("loading");
    if ("disabled" in el) {
      el.disabled = true;
    }
  }
}

export function endLoading(selector) {
  for (const el of resolveTargets(selector)) {
    el.classList.remove("loading");
    if ("disabled" in el) {
      el.disabled = false;
    }
  }
}

// Disable //

export function endDisable(selector) {
  for (const el of resolveTargets(selector)) {
    el.classList.remove("disabled");
    if ("disabled" in el) {
      el.disabled = false;
    }
  }
}
