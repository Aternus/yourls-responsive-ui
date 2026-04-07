///////////////////////////////////////////////////////////
// Drawer Manager
///////////////////////////////////////////////////////////

import { apiRequest } from "./api.js";
import { recomputeTotalClicks, recomputeTotalLinks } from "./counters.js";
import { addLoading, endLoading, showFeedback } from "./feedback.js";
import { setModeButtons } from "./row-action-buttons.js";
import { getRowData } from "./row-data.js";
import { replaceRowFromHtml } from "./shared.js";

let initialized = false;

function ceDetail(event, index = 0) {
  const detail = event?.detail;
  return Array.isArray(detail) ? detail[index] : detail;
}

export function initDrawerManager() {
  if (initialized) {
    return;
  }

  const table = document.querySelector("#main_table");
  if (!(table instanceof HTMLElement)) {
    return;
  }

  // Hide the server-rendered delete dialog so it never shows.
  const serverDeleteDialog = document.querySelector("#delete-confirm-dialog");
  if (serverDeleteDialog instanceof HTMLElement) {
    serverDeleteDialog.style.display = "none";
  }

  initialized = true;

  const normalizeKeywordFromInput = (value, fallbackKeyword = "") => {
    let normalized = typeof value === "string" ? value.trim() : "";
    if (normalized === "") {
      return fallbackKeyword;
    }

    const siteInput = document.querySelector("#yourls-site");
    const siteUrl =
      siteInput instanceof HTMLInputElement ? siteInput.value.trim() : "";

    if (siteUrl !== "" && normalized.startsWith(siteUrl)) {
      normalized = normalized.slice(siteUrl.length);
    } else if (/^https?:\/\//i.test(normalized)) {
      try {
        const parsedUrl = new URL(normalized);
        let parsedPath = parsedUrl.pathname.replace(/^\/+/, "");

        if (siteUrl !== "") {
          const yourlsUrl = new URL(siteUrl, window.location.origin);
          const sitePath = yourlsUrl.pathname.replace(/^\/+|\/+$/g, "");

          if (sitePath !== "") {
            if (parsedPath.startsWith(`${sitePath}/`)) {
              parsedPath = parsedPath.slice(sitePath.length + 1);
            } else if (parsedPath === sitePath) {
              parsedPath = "";
            }
          }
        }

        normalized = parsedPath;
      } catch (_error) {
        // Keep the input as-is when URL parsing fails.
      }
    }

    normalized = normalized
      .split("#")[0]
      .split("?")[0]
      .replace(/^\/+|\/+$/g, "");

    return normalized || fallbackKeyword;
  };

  const ensureDrawer = () => {
    let dialog = document.querySelector("#rui-row-drawer");
    if (dialog instanceof HTMLDialogElement) {
      return dialog;
    }

    dialog = document.createElement("dialog");
    dialog.id = "rui-row-drawer";
    dialog.className = "rui-drawer rui-drawer--row";
    document.body.append(dialog);
    return dialog;
  };

  const ensureViewport = (dialog) => {
    const existingViewport = dialog.querySelector("rui-row-drawer-viewport");
    if (existingViewport instanceof HTMLElement) {
      return existingViewport;
    }

    const viewport = document.createElement("rui-row-drawer-viewport");
    dialog.replaceChildren(viewport);
    return viewport;
  };

  const state = {
    mode: "",
    id: "",
    dialog: ensureDrawer(),
    viewport: null,
  };

  state.viewport = ensureViewport(state.dialog);

  const clearModeState = () => {
    if (state.id) {
      setModeButtons("", state.id);
      endLoading(`#actions-${state.id} .button`);
    }

    state.mode = "";
    state.id = "";
  };

  const resetViewportState = () => {
    state.viewport.open = false;
    state.viewport.mode = "";
    state.viewport.data = null;
  };

  const closeDrawer = () => {
    if (state.viewport.open) {
      state.viewport.open = false;
      return;
    }

    if (state.dialog.open) {
      state.dialog.close();
      return;
    }

    resetViewportState();
    clearModeState();
  };

  const finalizeDrawerClose = () => {
    if (state.viewport.open) {
      return;
    }

    if (state.dialog.open) {
      state.dialog.close();
      return;
    }

    resetViewportState();
    clearModeState();
  };

  state.viewport.addEventListener("request-close", () => {
    closeDrawer();
  });

  state.viewport.addEventListener("after-leave", () => {
    finalizeDrawerClose();
  });

  state.viewport.addEventListener("save-edit", (event) => {
    const payload = ceDetail(event, 0);
    const button = ceDetail(event, 1);
    saveDrawerEdit(payload, button);
  });

  state.viewport.addEventListener("confirm-delete", () => {
    handleDeleteConfirm();
  });

  state.viewport.addEventListener("cancel-delete", () => {
    handleDeleteCancel();
  });

  state.dialog.addEventListener("close", () => {
    resetViewportState();
    clearModeState();
  });

  state.dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDrawer();
  });

  // Edit Save //

  const saveDrawerEdit = (payload, saveButton) => {
    if (payload.keyword === "" || payload.nonce === "") {
      window.location.reload();
      return;
    }

    if (saveButton instanceof HTMLButtonElement) {
      addLoading(saveButton);
    }

    apiRequest({
      action: "edit_save",
      url: payload.destinationUrl,
      id: payload.id,
      keyword: payload.keyword,
      newkeyword: normalizeKeywordFromInput(payload.shortUrl, payload.keyword),
      title: payload.title,
      nonce: payload.nonce,
    }).then((response) => {
      if (response?.status === "success") {
        const rowReplaced = replaceRowFromHtml(payload.id, response?.row_html);

        closeDrawer();

        if (!rowReplaced) {
          window.location.reload();
          return;
        }
      }

      if (response?.message) {
        showFeedback(response.message, response.status);
      }

      if (saveButton instanceof HTMLButtonElement) {
        endLoading(saveButton);
      }
    });
  };

  // Edit Nonce Fetch //

  const fetchEditSaveNonce = (data, callback) => {
    addLoading(`#actions-${data.id} .button`);

    apiRequest({
      action: "edit_display",
      keyword: data.keyword,
      nonce: data.nonce,
      id: data.id,
    }).then((response) => {
      endLoading(`#actions-${data.id} .button`);

      if (!response?.html) {
        return;
      }

      const temp = document.createElement("div");
      temp.innerHTML = response.html;
      const nonceInput = temp.querySelector(`#nonce_${data.id}`);
      if (nonceInput instanceof HTMLInputElement) {
        data.nonce = nonceInput.value;
      }

      callback(data);
    });
  };

  // Delete Handlers //

  const handleDeleteConfirm = () => {
    const id = state.id;
    if (!id) {
      return;
    }

    const keywordInput = document.querySelector(`#keyword_${id}`);
    const keyword =
      keywordInput instanceof HTMLInputElement ? keywordInput.value : "";
    const deleteButton = document.querySelector(`#delete-button-${id}`);
    const nonce =
      deleteButton instanceof HTMLAnchorElement
        ? (function () {
            const href = deleteButton.getAttribute("href");
            if (typeof href !== "string" || href.trim() === "") {
              return "";
            }
            try {
              const parsed = new URL(href, window.location.origin);
              return parsed.searchParams.get("nonce") ?? "";
            } catch (_error) {
              return "";
            }
          })()
        : "";

    apiRequest({
      action: "delete",
      keyword,
      nonce,
      id,
    }).then((data) => {
      if (data.success === 1 || data.success === "1") {
        const row = document.querySelector(`#id-${id}`);
        if (row instanceof HTMLElement) {
          const removeRow = () => {
            row.remove();
            recomputeTotalLinks();
            recomputeTotalClicks();
          };
          row.addEventListener("transitionend", removeRow, {
            once: true,
          });
          row.style.transition = "opacity 0.3s ease";
          row.style.opacity = "0";
        }
      } else {
        showFeedback("something wrong happened while deleting!", "fail");
      }

      closeDrawer();
    });
  };

  const handleDeleteCancel = () => {
    closeDrawer();

    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  // Open / Close //

  const showDrawer = (mode, id, data) => {
    state.mode = mode;
    state.id = String(id);
    setModeButtons(mode, state.id);

    state.viewport.mode = mode;
    state.viewport.data = data;

    if (!state.dialog.open) {
      state.dialog.showModal();
    }

    state.viewport.open = true;
    return true;
  };

  const openDrawer = (mode, id) => {
    const data = getRowData(id);
    if (!data) {
      return false;
    }

    if (state.viewport.open && state.mode === mode && state.id === String(id)) {
      closeDrawer();
      return false;
    }

    if (mode === "edit") {
      fetchEditSaveNonce(data, (updatedData) => {
        showDrawer(mode, id, updatedData);
      });
      return true;
    }

    return showDrawer(mode, id, data);
  };

  // Delegated Click Handler //

  const extractIdFromElement = (el) => {
    const id = el.id || "";
    const match = id.match(/-(\d+)$/);
    return match ? match[1] : "";
  };

  table.addEventListener("click", (event) => {
    const target = event.target;
    const actionEl = target.closest("[data-rui-action]");
    if (!actionEl) {
      return;
    }

    const action = actionEl.dataset.ruiAction;
    const id = extractIdFromElement(actionEl);
    if (!id) {
      return;
    }

    event.preventDefault();

    if (action === "stats") {
      const href = actionEl.getAttribute("href");
      if (href) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (action === "edit") {
      openDrawer("edit", id);
      return;
    }

    if (action === "share") {
      openDrawer("share", id);
      return;
    }

    if (action === "delete") {
      if (actionEl.classList.contains("disabled")) {
        return;
      }
      openDrawer("delete", id);
    }
  });
}
