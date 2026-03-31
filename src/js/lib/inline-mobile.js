import {
    copyToClipboard,
    createActionButton,
    isMobile,
    makeField,
    replaceRowFromHtml,
} from "./shared.js";

export function initInlineCardEditing() {
    const table = document.querySelector("#main_table");
    const tbody = table?.querySelector("tbody");
    const jq = window.jQuery;

    if (
        !(table instanceof HTMLElement) ||
        !(tbody instanceof HTMLElement) ||
        table.dataset.responsiveInlineEdit === "true" ||
        typeof window.edit_link_display !== "function" ||
        typeof window.edit_link_hide !== "function" ||
        typeof window.edit_link_save !== "function"
    ) {
        return;
    }

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
            row.querySelector(
                ".responsive-inline-editor-strip-actions",
            )?.remove();
        }

        const editor = getInlineEditor(id);
        if (editor instanceof HTMLElement) {
            editor.remove();
        }

        document.querySelector(`#edit-${id}`)?.remove();
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
        const keywordInput = editRow.querySelector(`#edit-keyword-${id}`);
        const titleInput = editRow.querySelector(`#edit-title-${id}`);
        const submitButton = editRow.querySelector(`#edit-submit-${id}`);
        const closeButton = editRow.querySelector(`#edit-close-${id}`);
        const oldKeyword = editRow.querySelector(`#old_keyword_${id}`);
        const nonceInput = editRow.querySelector(`#nonce_${id}`);
        const actionsCell = row.querySelector("td.actions");

        if (
            !(urlInput instanceof HTMLElement) ||
            !(keywordInput instanceof HTMLElement) ||
            !(titleInput instanceof HTMLElement) ||
            !(submitButton instanceof HTMLElement) ||
            !(closeButton instanceof HTMLElement)
        ) {
            return;
        }

        const editor = document.createElement("section");
        editor.className = "responsive-inline-editor";
        editor.dataset.id = id;
        const editorTitle = document.createElement("p");
        editorTitle.className = "responsive-inline-editor-title";
        editorTitle.textContent = "Edit Link";

        if (keywordInput instanceof HTMLInputElement) {
            keywordInput.type = "text";
            keywordInput.setAttribute("aria-label", "Short URL");
        }

        if (urlInput instanceof HTMLInputElement) {
            urlInput.type = "text";
            urlInput.placeholder = "Destination URL";
            urlInput.setAttribute("aria-label", "Destination URL");
        }

        if (titleInput instanceof HTMLInputElement) {
            titleInput.type = "text";
            titleInput.placeholder = "Title";
            titleInput.setAttribute("aria-label", "Title");
        }

        editor.append(
            editorTitle,
            makeField(
                "responsive-inline-editor-field",
                "Short URL",
                keywordInput,
            ),
            makeField(
                "responsive-inline-editor-field",
                "Destination URL",
                urlInput,
            ),
            makeField("responsive-inline-editor-field", "Title", titleInput),
        );

        const actions = document.createElement("div");
        actions.className = "responsive-inline-editor-actions";
        const submitControl = createActionButton({
            source: submitButton,
            id,
            iconName: "save",
            label: "Save",
            variantClass: "is-primary",
            onClick: () => window.edit_link_save(id),
        });
        const closeControl = createActionButton({
            source: closeButton,
            id,
            iconName: "close",
            label: "Cancel",
            variantClass: "is-tonal",
            onClick: () => window.edit_link_hide(id),
        });
        actions.append(submitControl, closeControl);

        if (actionsCell instanceof HTMLElement) {
            const stripActions = document.createElement("div");
            stripActions.className = "responsive-inline-editor-strip-actions";
            stripActions.append(submitControl, closeControl);
            actionsCell.append(stripActions);
        } else {
            editor.append(actions);
        }

        if (oldKeyword instanceof HTMLElement) {
            editor.append(oldKeyword);
        }
        if (nonceInput instanceof HTMLElement) {
            editor.append(nonceInput);
        }

        row.append(editor);
        row.classList.add("is-editing");

        editRow.style.display = "none";
        editRow.setAttribute("aria-hidden", "true");

        if (keywordInput instanceof HTMLInputElement) {
            keywordInput.focus();
        } else if (urlInput instanceof HTMLInputElement) {
            urlInput.focus();
        }
    };

    const originalEditLinkHide = window.edit_link_hide;
    window.edit_link_hide = function (id) {
        if (!isMobile() || !getInlineEditor(id)) {
            return originalEditLinkHide(id);
        }

        cleanupInlineEditor(id);

        if (typeof window.end_disable === "function") {
            window.end_disable(`#actions-${id} .button`);
        }

        return true;
    };

    const originalEditLinkSave = window.edit_link_save;
    window.edit_link_save = function (id) {
        if (!isMobile() || !getInlineEditor(id) || typeof jq !== "function") {
            return originalEditLinkSave(id);
        }

        if (typeof window.add_loading === "function") {
            window.add_loading(`#edit-close-${id}`);
        }

        const newUrl = jq(`#edit-url-${id}`).val();
        const newKeyword = jq(`#edit-keyword-${id}`).val();
        const title = jq(`#edit-title-${id}`).val();
        const keyword = jq(`#old_keyword_${id}`).val();
        const nonce = jq(`#nonce_${id}`).val();

        jq.getJSON(
            window.ajaxurl,
            {
                action: "edit_save",
                url: newUrl,
                id: id,
                keyword: keyword,
                newkeyword: newKeyword,
                title: title,
                nonce: nonce,
            },
            (data) => {
                if (data?.status === "success") {
                    const rowReplaced = replaceRowFromHtml(id, data?.row_html);

                    cleanupInlineEditor(id);

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
                    window.end_loading(`#edit-close-${id}`);
                }

                if (typeof window.end_disable === "function") {
                    window.end_disable(`#edit-close-${id}`);
                    if (data?.status === "success") {
                        window.end_disable(`#actions-${id} .button`);
                    }
                }
            },
        );

        return true;
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
    tbody.querySelectorAll("tr.edit-row[id^='edit-']").forEach((row) => {
        mountInlineEditor(row);
    });

    table.dataset.responsiveInlineEdit = "true";
}

// Inline Card Sharing (Mobile)
/////////////////////////////////////////////////

export function initInlineCardSharing() {
    const table = document.querySelector("#main_table");

    if (
        !(table instanceof HTMLElement) ||
        table.dataset.responsiveInlineShare === "true" ||
        typeof window.toggle_share !== "function"
    ) {
        return;
    }

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
            row.querySelector(
                ".responsive-inline-share-strip-actions",
            )?.remove();
        }

        const share = getInlineShare(id);
        if (share instanceof HTMLElement) {
            share.remove();
        }
    };

    const cleanupInlineShare = (id) => {
        if (typeof id === "string" && id !== "") {
            cleanupInlineShareById(id);
            return;
        }

        table.querySelectorAll(".responsive-inline-share").forEach((share) => {
            if (!(share instanceof HTMLElement)) {
                return;
            }

            const shareId = share.dataset.id ?? "";
            if (!shareId) {
                share.remove();
                return;
            }

            cleanupInlineShareById(shareId);
        });
    };

    window.responsiveInlineShareCleanup = cleanupInlineShare;

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

        const message = `${title ? `${title} ` : ""}${shortUrl}`.trim();

        const shortUrlInput = document.createElement("input");
        shortUrlInput.type = "text";
        shortUrlInput.className = "text";
        shortUrlInput.id = `share-shorturl-${id}`;
        shortUrlInput.value = shortUrl;
        shortUrlInput.readOnly = true;
        shortUrlInput.setAttribute("aria-label", "Short URL to share");

        const messageInput = document.createElement("textarea");
        messageInput.className = "text";
        messageInput.id = `share-message-${id}`;
        messageInput.value = message;
        messageInput.rows = 3;
        messageInput.setAttribute("aria-label", "Share message");

        const editor = document.createElement("section");
        editor.className = "responsive-inline-share";
        editor.dataset.id = id;

        const editorTitle = document.createElement("p");
        editorTitle.className = "responsive-inline-share-title";
        editorTitle.textContent = "Share Link";

        editor.append(
            editorTitle,
            makeField(
                "responsive-inline-share-field",
                "Short URL",
                shortUrlInput,
            ),
            makeField("responsive-inline-share-field", "Message", messageInput),
        );

        const openShareWindow = (destination) => {
            const text = encodeURIComponent(
                messageInput.value.trim() || shortUrlInput.value.trim(),
            );
            const encodedShortUrl = encodeURIComponent(
                shortUrlInput.value.trim(),
            );
            const encodedDestinationUrl = encodeURIComponent(destinationUrl);

            if (destination === "tw") {
                const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
                window.open(
                    twitterUrl,
                    "tw",
                    "toolbar=no,width=800,height=550",
                );
                return;
            }

            if (destination === "fb") {
                const targetUrl = encodedDestinationUrl || encodedShortUrl;
                const facebookUrl = `https://www.facebook.com/share.php?u=${targetUrl}`;
                window.open(
                    facebookUrl,
                    "fb",
                    "toolbar=no,width=1000,height=550",
                );
            }
        };

        const copyButton = createActionButton({
            id,
            iconName: "content_copy",
            label: "Copy short URL",
            variantClass: "is-primary",
            onClick: async (button) => {
                const copied = await copyToClipboard(shortUrlInput.value);
                if (!copied) {
                    return;
                }

                const icon = button.querySelector(".material-icons");
                button.setAttribute("title", "Copied");
                button.setAttribute("aria-label", "Copied");

                if (icon instanceof HTMLElement) {
                    icon.textContent = "check";
                }

                window.setTimeout(() => {
                    button.setAttribute("title", "Copy short URL");
                    button.setAttribute("aria-label", "Copy short URL");
                    if (icon instanceof HTMLElement) {
                        icon.textContent = "content_copy";
                    }
                }, 1200);
            },
        });

        const twitterButton = createActionButton({
            id,
            iconName: "fa-x-twitter",
            iconLibrary: "brand",
            label: "Share on Twitter",
            variantClass: "is-tonal",
            onClick: () => openShareWindow("tw"),
        });

        const facebookButton = createActionButton({
            id,
            iconName: "fa-facebook-f",
            iconLibrary: "brand",
            label: "Share on Facebook",
            variantClass: "is-tonal",
            onClick: () => openShareWindow("fb"),
        });

        const closeButton = createActionButton({
            id,
            iconName: "close",
            label: "Close share mode",
            variantClass: "is-tonal",
            onClick: () => {
                cleanupInlineShareById(id);
                if (typeof window.end_disable === "function") {
                    window.end_disable(`#actions-${id} .button`);
                }
            },
        });

        const actionButtons = [
            copyButton,
            twitterButton,
            facebookButton,
            closeButton,
        ];

        const actionsCell = row.querySelector("td.actions");
        if (actionsCell instanceof HTMLElement) {
            const stripActions = document.createElement("div");
            stripActions.className = "responsive-inline-share-strip-actions";
            stripActions.append(...actionButtons);
            actionsCell.append(stripActions);
        } else {
            const actions = document.createElement("div");
            actions.className = "responsive-inline-editor-actions";
            actions.append(...actionButtons);
            editor.append(actions);
        }

        row.append(editor);
        row.classList.add("is-sharing");
        shortUrlInput.focus();
        shortUrlInput.select();

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
            cleanupInlineShareById(id);
            if (typeof window.end_disable === "function") {
                window.end_disable(`#actions-${id} .button`);
            }
            return false;
        }

        cleanupInlineShare();
        const mounted = buildInlineShare(id);

        if (!mounted) {
            return originalToggleShare(id);
        }

        return false;
    };

    table.dataset.responsiveInlineShare = "true";
}
