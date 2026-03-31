import { h, render } from "vue";
import { isMobile, replaceRowFromHtml } from "./shared.js";
import { ResponsiveInlineEditCard } from "./components/ResponsiveInlineEditCard.js";
import { ResponsiveInlineShareCard } from "./components/ResponsiveInlineShareCard.js";
import { mountVueFeature } from "./vue-feature.js";

function createActionsTarget(row, className, id) {
    const actionsCell = row.querySelector("td.actions");
    if (!(actionsCell instanceof HTMLElement)) {
        return "";
    }

    const mount = document.createElement("div");
    mount.id = id;
    mount.className = className;
    actionsCell.append(mount);

    return `#${id}`;
}

export function initInlineCardEditing() {
    const table = document.querySelector("#main_table");
    const tbody = table?.querySelector("tbody");
    const jq = window.jQuery;

    if (
        !(table instanceof HTMLElement) ||
        !(tbody instanceof HTMLElement) ||
        typeof window.edit_link_display !== "function" ||
        typeof window.edit_link_hide !== "function" ||
        typeof window.edit_link_save !== "function"
    ) {
        return;
    }

    mountVueFeature(
        table,
        "ResponsiveInlineCardEditingFeature",
        "responsiveInlineEdit",
        () => {
            const getInlineEditor = (id) => {
                const row = document.querySelector(`#id-${id}`);
                if (!(row instanceof HTMLElement)) {
                    return null;
                }

                const editor = row.querySelector(".responsive-inline-editor");
                if (!(editor instanceof HTMLElement)) {
                    return null;
                }

                return editor.dataset.id === String(id) ? editor : null;
            };

            const cleanupInlineEditor = (id) => {
                const row = document.querySelector(`#id-${id}`);
                if (row instanceof HTMLElement) {
                    row.classList.remove("is-editing");
                }

                const editor = getInlineEditor(id);
                if (editor instanceof HTMLElement) {
                    render(null, editor);
                    editor.remove();
                }

                if (row instanceof HTMLElement) {
                    row.querySelector(
                        ".responsive-inline-editor-strip-actions",
                    )?.remove();
                }

                document.querySelector(`#edit-${id}`)?.remove();
            };

            const cancelInlineEditor = (id) => {
                cleanupInlineEditor(id);

                if (typeof window.end_disable === "function") {
                    window.end_disable(`#actions-${id} .button`);
                }
            };

            const saveInlineEditor = (payload, triggerButton) => {
                if (typeof jq !== "function") {
                    return;
                }

                if (typeof window.add_loading === "function") {
                    window.add_loading(triggerButton);
                }

                jq.getJSON(
                    window.ajaxurl,
                    {
                        action: "edit_save",
                        url: payload.destinationUrl,
                        id: payload.id,
                        keyword: payload.keyword,
                        newkeyword: payload.shortUrl,
                        title: payload.title,
                        nonce: payload.nonce,
                    },
                    (data) => {
                        if (data?.status === "success") {
                            const rowReplaced = replaceRowFromHtml(
                                payload.id,
                                data?.row_html,
                            );

                            cleanupInlineEditor(payload.id);
                            jq("#main_table tbody").trigger("update");

                            if (!rowReplaced) {
                                window.location.reload();
                                return;
                            }
                        }

                        if (typeof window.feedback === "function") {
                            window.feedback(data?.message, data?.status);
                        }

                        if (typeof window.end_loading === "function") {
                            window.end_loading(triggerButton);
                        }

                        if (typeof window.end_disable === "function") {
                            window.end_disable(
                                `#actions-${payload.id} .button`,
                            );
                        }
                    },
                );
            };

            const mountInlineEditor = (editRow) => {
                if (!(editRow instanceof HTMLElement) || !isMobile()) {
                    return;
                }

                const id = editRow.id.replace("edit-", "");
                if (!id) {
                    return;
                }

                const row = document.querySelector(`#id-${id}`);
                if (!(row instanceof HTMLElement)) {
                    return;
                }

                cleanupInlineEditor(id);
                if (typeof window.responsiveInlineShareCleanup === "function") {
                    window.responsiveInlineShareCleanup();
                }

                const urlInput = editRow.querySelector(`#edit-url-${id}`);
                const keywordInput = editRow.querySelector(
                    `#edit-keyword-${id}`,
                );
                const titleInput = editRow.querySelector(`#edit-title-${id}`);
                const oldKeyword = editRow.querySelector(`#old_keyword_${id}`);
                const nonceInput = editRow.querySelector(`#nonce_${id}`);

                if (
                    !(urlInput instanceof HTMLInputElement) ||
                    !(keywordInput instanceof HTMLInputElement) ||
                    !(titleInput instanceof HTMLInputElement) ||
                    !(oldKeyword instanceof HTMLInputElement) ||
                    !(nonceInput instanceof HTMLInputElement)
                ) {
                    return;
                }

                const actionsTarget = createActionsTarget(
                    row,
                    "responsive-inline-editor-strip-actions",
                    `responsive-inline-editor-strip-${id}`,
                );

                const editor = document.createElement("section");
                editor.className = "responsive-inline-editor";
                editor.dataset.id = id;

                row.append(editor);
                row.classList.add("is-editing");

                render(
                    h(ResponsiveInlineEditCard, {
                        id,
                        initialShortUrl: keywordInput.value,
                        initialDestinationUrl: urlInput.value,
                        initialTitle: titleInput.value,
                        keyword: oldKeyword.value,
                        nonce: nonceInput.value,
                        actionsTarget,
                        onCancel: (editorId) => cancelInlineEditor(editorId),
                        onSave: (payload, triggerButton) =>
                            saveInlineEditor(payload, triggerButton),
                    }),
                    editor,
                );

                editRow.remove();
            };

            const originalEditLinkHide = window.edit_link_hide;
            window.edit_link_hide = function (id) {
                if (!isMobile() || !getInlineEditor(id)) {
                    return originalEditLinkHide(id);
                }

                cancelInlineEditor(id);
                return true;
            };

            const originalEditLinkSave = window.edit_link_save;
            window.edit_link_save = function (id) {
                if (!isMobile() || !getInlineEditor(id)) {
                    return originalEditLinkSave(id);
                }

                const saveButton = document.querySelector(
                    `#id-${id} .responsive-inline-editor-button.is-primary`,
                );
                if (saveButton instanceof HTMLButtonElement) {
                    saveButton.click();
                    return true;
                }

                return false;
            };

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (
                            node instanceof HTMLElement &&
                            node.matches("tr.edit-row[id^='edit-']")
                        ) {
                            mountInlineEditor(node);
                        }
                    });
                });
            });

            observer.observe(tbody, { childList: true });
            tbody
                .querySelectorAll("tr.edit-row[id^='edit-']")
                .forEach((row) => {
                    mountInlineEditor(row);
                });
        },
    );
}

// Inline Card Sharing (Mobile)
/////////////////////////////////////////////////

export function initInlineCardSharing() {
    const table = document.querySelector("#main_table");

    if (
        !(table instanceof HTMLElement) ||
        typeof window.toggle_share !== "function"
    ) {
        return;
    }

    mountVueFeature(
        table,
        "ResponsiveInlineCardSharingFeature",
        "responsiveInlineShare",
        () => {
            const getInlineShare = (id) => {
                const row = document.querySelector(`#id-${id}`);
                if (!(row instanceof HTMLElement)) {
                    return null;
                }

                const share = row.querySelector(".responsive-inline-share");
                if (!(share instanceof HTMLElement)) {
                    return null;
                }

                return share.dataset.id === String(id) ? share : null;
            };

            const cleanupInlineShareById = (id) => {
                const row = document.querySelector(`#id-${id}`);
                if (row instanceof HTMLElement) {
                    row.classList.remove("is-sharing");
                }

                const share = getInlineShare(id);
                if (share instanceof HTMLElement) {
                    render(null, share);
                    share.remove();
                }

                if (row instanceof HTMLElement) {
                    row.querySelector(
                        ".responsive-inline-share-strip-actions",
                    )?.remove();
                }
            };

            const cleanupInlineShare = (id) => {
                if (typeof id === "string" && id !== "") {
                    cleanupInlineShareById(id);
                    return;
                }

                table
                    .querySelectorAll(".responsive-inline-share")
                    .forEach((share) => {
                        if (!(share instanceof HTMLElement)) {
                            return;
                        }

                        const shareId = share.dataset.id ?? "";
                        if (!shareId) {
                            render(null, share);
                            share.remove();
                            return;
                        }

                        cleanupInlineShareById(shareId);
                    });
            };

            window.responsiveInlineShareCleanup = cleanupInlineShare;

            const closeInlineShare = (id) => {
                cleanupInlineShareById(id);
                if (typeof window.end_disable === "function") {
                    window.end_disable(`#actions-${id} .button`);
                }
            };

            const buildInlineShare = (id) => {
                const row = document.querySelector(`#id-${id}`);
                if (!(row instanceof HTMLElement)) {
                    return false;
                }

                const shortLink = row.querySelector(
                    `#keyword-${id} a.responsive-shorturl-link`,
                );
                const destinationLink = row.querySelector(
                    `#url-${id} a.responsive-destination-raw-link`,
                );
                const titleNode = row.querySelector(
                    `#url-${id} .responsive-destination-title`,
                );

                const shortUrl =
                    shortLink instanceof HTMLAnchorElement
                        ? (shortLink.getAttribute("href") ?? "")
                        : "";
                const destinationUrl =
                    destinationLink instanceof HTMLAnchorElement
                        ? (destinationLink.getAttribute("href") ?? "")
                        : "";
                const title =
                    titleNode instanceof HTMLElement
                        ? (titleNode.getAttribute("title") ??
                          titleNode.textContent ??
                          "")
                        : "";

                if (!shortUrl) {
                    return false;
                }

                const actionsTarget = createActionsTarget(
                    row,
                    "responsive-inline-share-strip-actions",
                    `responsive-inline-share-strip-${id}`,
                );

                const share = document.createElement("section");
                share.className = "responsive-inline-share";
                share.dataset.id = id;

                row.append(share);
                row.classList.add("is-sharing");

                render(
                    h(ResponsiveInlineShareCard, {
                        id,
                        shortUrl,
                        destinationUrl,
                        title,
                        actionsTarget,
                        onClose: () => closeInlineShare(id),
                    }),
                    share,
                );

                return true;
            };

            const originalToggleShare = window.toggle_share;
            window.toggle_share = function (id) {
                if (!isMobile()) {
                    return originalToggleShare(id);
                }

                const row = document.querySelector(`#id-${id}`);
                if (!(row instanceof HTMLElement)) {
                    return originalToggleShare(id);
                }

                if (
                    row.classList.contains("is-editing") &&
                    typeof window.edit_link_hide === "function"
                ) {
                    window.edit_link_hide(id);
                }

                const isOpen = getInlineShare(id) instanceof HTMLElement;
                if (isOpen) {
                    closeInlineShare(id);
                    return false;
                }

                cleanupInlineShare();
                const mounted = buildInlineShare(id);

                if (!mounted) {
                    return originalToggleShare(id);
                }

                return false;
            };
        },
    );
}
