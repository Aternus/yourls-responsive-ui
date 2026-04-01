import { h, render } from "vue";
import { replaceRowFromHtml } from "./shared.js";
import { getRowData } from "./row-data.js";
import { setModeButtons } from "./row-action-buttons.js";
import { ResponsiveEditPanel } from "../components/ResponsiveEditPanel.js";
import { ResponsiveSharePanel } from "../components/ResponsiveSharePanel.js";
import { ResponsiveDeletePanel } from "../components/ResponsiveDeletePanel.js";
import { mountVueFeature } from "./vue-feature.js";

export function initDrawerManager() {
    const table = document.querySelector("#main_table");
    const jq = window.jQuery;

    if (!(table instanceof HTMLElement) || typeof jq !== "function") {
        return;
    }

    // Hide the server-rendered delete dialog so it never shows.
    const serverDeleteDialog = document.querySelector("#delete-confirm-dialog");
    if (serverDeleteDialog instanceof HTMLElement) {
        serverDeleteDialog.style.display = "none";
    }

    mountVueFeature(
        table,
        "ResponsiveDrawerManagerFeature",
        "responsiveDrawerManager",
        () => {
            const normalizeKeywordFromInput = (value, fallbackKeyword = "") => {
                let normalized = typeof value === "string" ? value.trim() : "";
                if (normalized === "") {
                    return fallbackKeyword;
                }

                const siteInput = document.querySelector("#yourls-site");
                const siteUrl =
                    siteInput instanceof HTMLInputElement
                        ? siteInput.value.trim()
                        : "";

                if (siteUrl !== "" && normalized.startsWith(siteUrl)) {
                    normalized = normalized.slice(siteUrl.length);
                } else if (/^https?:\/\//i.test(normalized)) {
                    try {
                        const parsedUrl = new URL(normalized);
                        let parsedPath = parsedUrl.pathname.replace(/^\/+/, "");

                        if (siteUrl !== "") {
                            const yourlsUrl = new URL(
                                siteUrl,
                                window.location.origin,
                            );
                            const sitePath = yourlsUrl.pathname.replace(
                                /^\/+|\/+$/g,
                                "",
                            );

                            if (sitePath !== "") {
                                if (parsedPath.startsWith(`${sitePath}/`)) {
                                    parsedPath = parsedPath.slice(
                                        sitePath.length + 1,
                                    );
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
                let dialog = document.querySelector("#responsive-row-drawer");
                if (dialog instanceof HTMLDialogElement) {
                    return dialog;
                }

                dialog = document.createElement("dialog");
                dialog.id = "responsive-row-drawer";
                dialog.className = "responsive-drawer responsive-row-drawer";
                document.body.append(dialog);
                return dialog;
            };

            const state = {
                mode: "",
                id: "",
                dialog: ensureDrawer(),
            };

            if (!(state.dialog instanceof HTMLDialogElement)) {
                return;
            }

            const unmountDrawerView = () => {
                render(null, state.dialog);
            };

            const clearModeState = () => {
                if (state.id) {
                    setModeButtons("", state.id);
                    if (typeof window.end_disable === "function") {
                        window.end_disable(`#actions-${state.id} .button`);
                    }
                }

                state.mode = "";
                state.id = "";
            };

            const closeDrawer = () => {
                if (state.dialog.open) {
                    state.dialog.close();
                    return;
                }

                unmountDrawerView();
                clearModeState();
            };

            state.dialog.addEventListener("close", () => {
                unmountDrawerView();
                clearModeState();
            });

            // Edit Save //

            const saveDrawerEdit = (payload, saveButton) => {
                if (payload.keyword === "" || payload.nonce === "") {
                    window.location.reload();
                    return;
                }

                if (
                    saveButton instanceof HTMLButtonElement &&
                    typeof window.add_loading === "function"
                ) {
                    window.add_loading(saveButton);
                }

                jq.getJSON(
                    window.ajaxurl,
                    {
                        action: "edit_save",
                        url: payload.destinationUrl,
                        id: payload.id,
                        keyword: payload.keyword,
                        newkeyword: normalizeKeywordFromInput(
                            payload.shortUrl,
                            payload.keyword,
                        ),
                        title: payload.title,
                        nonce: payload.nonce,
                    },
                    (response) => {
                        if (response?.status === "success") {
                            const rowReplaced = replaceRowFromHtml(
                                payload.id,
                                response?.row_html,
                            );

                            closeDrawer();
                            jq("#main_table tbody").trigger("update");

                            if (!rowReplaced) {
                                window.location.reload();
                                return;
                            }
                        }

                        if (typeof window.feedback === "function") {
                            window.feedback(
                                response?.message,
                                response?.status,
                            );
                        }

                        if (
                            saveButton instanceof HTMLButtonElement &&
                            typeof window.end_loading === "function"
                        ) {
                            window.end_loading(saveButton);
                        }
                    },
                );
            };

            // Edit Nonce Fetch //

            const fetchEditSaveNonce = (data, callback) => {
                if (typeof window.add_loading === "function") {
                    window.add_loading(`#actions-${data.id} .button`);
                }

                jq.getJSON(
                    window.ajaxurl,
                    {
                        action: "edit_display",
                        keyword: data.keyword,
                        nonce: data.nonce,
                        id: data.id,
                    },
                    (response) => {
                        if (typeof window.end_loading === "function") {
                            window.end_loading(`#actions-${data.id} .button`);
                        }

                        if (!response?.html) {
                            return;
                        }

                        const temp = document.createElement("div");
                        temp.innerHTML = response.html;
                        const nonceInput = temp.querySelector(
                            `#nonce_${data.id}`,
                        );
                        if (nonceInput instanceof HTMLInputElement) {
                            data.nonce = nonceInput.value;
                        }

                        callback(data);
                    },
                );
            };

            // Delete Handlers //

            const handleDeleteConfirm = () => {
                const id = state.id;
                if (!id) {
                    return;
                }

                const keywordInput = document.querySelector(`#keyword_${id}`);
                const keyword =
                    keywordInput instanceof HTMLInputElement
                        ? keywordInput.value
                        : "";
                const deleteButton = document.querySelector(
                    `#delete-button-${id}`,
                );
                const nonce =
                    deleteButton instanceof HTMLAnchorElement
                        ? (function () {
                              const href = deleteButton.getAttribute("href");
                              if (
                                  typeof href !== "string" ||
                                  href.trim() === ""
                              ) {
                                  return "";
                              }
                              try {
                                  const parsed = new URL(
                                      href,
                                      window.location.origin,
                                  );
                                  return parsed.searchParams.get("nonce") ?? "";
                              } catch (_error) {
                                  return "";
                              }
                          })()
                        : "";

                jq.getJSON(
                    window.ajaxurl,
                    {
                        action: "delete",
                        keyword,
                        nonce,
                        id,
                    },
                    (data) => {
                        if (data.success == 1) {
                            jq(`#id-${id}`).fadeOut(function () {
                                jq(this).remove();
                                if (jq("#main_table tbody tr").length === 1) {
                                    jq("#nourl_found").css("display", "");
                                }

                                if (typeof window.zebra_table === "function") {
                                    window.zebra_table();
                                }
                            });

                            if (
                                typeof window.decrement_counter === "function"
                            ) {
                                window.decrement_counter();
                            }

                            if (
                                typeof window.decrease_total_clicks ===
                                "function"
                            ) {
                                window.decrease_total_clicks(id);
                            }
                        } else {
                            if (typeof window.feedback === "function") {
                                window.feedback(
                                    "something wrong happened while deleting!",
                                    "fail",
                                );
                            }
                        }

                        closeDrawer();
                    },
                );
            };

            const handleDeleteCancel = () => {
                closeDrawer();

                if (document.activeElement) {
                    document.activeElement.blur();
                }
            };

            // Render Panel //

            const renderDrawerContent = (mode, data) => {
                if (mode === "edit") {
                    render(
                        h(ResponsiveEditPanel, {
                            data,
                            onClose: closeDrawer,
                            onSaveEdit: saveDrawerEdit,
                        }),
                        state.dialog,
                    );
                    return true;
                }

                if (mode === "share") {
                    render(
                        h(ResponsiveSharePanel, {
                            data,
                            onClose: closeDrawer,
                        }),
                        state.dialog,
                    );
                    return true;
                }

                if (mode === "delete") {
                    render(
                        h(ResponsiveDeletePanel, {
                            data,
                            onConfirm: handleDeleteConfirm,
                            onCancel: handleDeleteCancel,
                        }),
                        state.dialog,
                    );
                    return true;
                }

                return false;
            };

            // Open / Close //

            const showDrawer = (mode, id, data) => {
                if (!renderDrawerContent(mode, data)) {
                    return false;
                }

                state.mode = mode;
                state.id = String(id);
                setModeButtons(mode, state.id);
                state.dialog.showModal();
                return true;
            };

            const openDrawer = (mode, id) => {
                const data = getRowData(id);
                if (!data) {
                    return false;
                }

                if (
                    state.dialog.open &&
                    state.mode === mode &&
                    state.id === String(id)
                ) {
                    closeDrawer();
                    return false;
                }

                if (state.dialog.open) {
                    closeDrawer();
                }

                if (mode === "edit") {
                    fetchEditSaveNonce(data, (updatedData) => {
                        showDrawer(mode, id, updatedData);
                    });
                    return true;
                }

                return showDrawer(mode, id, data);
            };

            // YOURLS Global Overrides //

            window.edit_link_display = function (id) {
                return openDrawer("edit", id);
            };

            window.edit_link_hide = function (id) {
                if (state.mode === "edit" && state.id === String(id)) {
                    closeDrawer();
                    return true;
                }

                return true;
            };

            const originalEditLinkSave = window.edit_link_save;
            window.edit_link_save = function (id) {
                if (state.mode !== "edit" || state.id !== String(id)) {
                    return typeof originalEditLinkSave === "function"
                        ? originalEditLinkSave(id)
                        : false;
                }

                const saveButton = state.dialog.querySelector(
                    ".responsive-drawer-actions .responsive-drawer-button.is-primary",
                );
                if (saveButton instanceof HTMLButtonElement) {
                    saveButton.click();
                    return true;
                }

                return false;
            };

            window.toggle_share = function (id) {
                return openDrawer("share", id);
            };

            window.remove_link = function (id) {
                if (jq(`#delete-button-${id}`).hasClass("disabled")) {
                    return false;
                }

                return openDrawer("delete", id);
            };

            window.remove_link_confirmed = handleDeleteConfirm;
            window.remove_link_canceled = handleDeleteCancel;
        },
    );
}
