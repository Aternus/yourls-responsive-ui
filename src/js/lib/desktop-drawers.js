import {
    copyToClipboard,
    createActionButton,
    createMaterialIcon,
    isDesktop,
    makeField,
    replaceRowFromHtml,
    setMaterialIcon,
} from "./shared.js";
import { mountVueFeature } from "./vue-feature.js";

export function initDesktopRowDrawers() {
    const table = document.querySelector("#main_table");
    const jq = window.jQuery;

    if (
        !(table instanceof HTMLElement) ||
        typeof jq !== "function" ||
        typeof window.edit_link_display !== "function" ||
        typeof window.edit_link_hide !== "function" ||
        typeof window.edit_link_save !== "function" ||
        typeof window.toggle_share !== "function"
    ) {
        return;
    }

    const installDesktopRowDrawers = () => {
        const ensureButtonDefaults = (button) => {
            if (!(button instanceof HTMLElement)) {
                return;
            }

            if (button.dataset.responsiveDefaultTitle) {
                return;
            }

            const icon = button.querySelector(".responsive-action-icon");
            const srLabel = button.querySelector(".responsive-sr-only");
            const title = button.getAttribute("title") ?? "";
            const label = srLabel?.textContent?.trim() ?? title;

            button.dataset.responsiveDefaultTitle = title;
            button.dataset.responsiveDefaultLabel = label;
            if (icon instanceof HTMLElement) {
                button.dataset.responsiveDefaultIcon = icon.className;
                button.dataset.responsiveDefaultIconName =
                    icon.textContent?.trim() ?? "";
            }
        };

        const setActionButtonVisual = (button, iconName, title, label) => {
            if (!(button instanceof HTMLElement)) {
                return;
            }

            ensureButtonDefaults(button);

            let icon = button.querySelector(".responsive-action-icon");
            if (!(icon instanceof HTMLElement)) {
                icon = createMaterialIcon(iconName, "responsive-action-icon");
                button.prepend(icon);
            } else {
                setMaterialIcon(icon, iconName, "responsive-action-icon");
            }

            button.setAttribute("title", title);
            button.setAttribute("aria-label", title);

            const srLabel = button.querySelector(".responsive-sr-only");
            if (srLabel instanceof HTMLElement) {
                srLabel.textContent = label;
            }
        };

        const restoreActionButtonVisual = (button) => {
            if (!(button instanceof HTMLElement)) {
                return;
            }

            const defaultTitle = button.dataset.responsiveDefaultTitle ?? "";
            const defaultLabel =
                button.dataset.responsiveDefaultLabel ?? defaultTitle;
            const defaultIcon = button.dataset.responsiveDefaultIcon ?? "";
            const defaultIconName =
                button.dataset.responsiveDefaultIconName ?? "";
            const icon = button.querySelector(".responsive-action-icon");
            const srLabel = button.querySelector(".responsive-sr-only");

            if (defaultTitle) {
                button.setAttribute("title", defaultTitle);
                button.setAttribute("aria-label", defaultTitle);
            }

            if (srLabel instanceof HTMLElement && defaultLabel) {
                srLabel.textContent = defaultLabel;
            }

            if (icon instanceof HTMLElement && defaultIcon) {
                icon.className = defaultIcon;
                if (defaultIconName !== "") {
                    icon.textContent = defaultIconName;
                }
            }
        };

        const extractNonceFromHref = (href) => {
            if (typeof href !== "string" || href.trim() === "") {
                return "";
            }

            try {
                const parsed = new URL(href, window.location.origin);
                return parsed.searchParams.get("nonce") ?? "";
            } catch (_error) {
                return "";
            }
        };

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

        const ensureDesktopDrawer = () => {
            let dialog = document.querySelector("#responsive-row-drawer");
            if (dialog instanceof HTMLDialogElement) {
                return dialog;
            }

            dialog = document.createElement("dialog");
            dialog.id = "responsive-row-drawer";
            dialog.className = "responsive-row-drawer";
            dialog.innerHTML =
                '<div name="dialog_title" id="responsive-row-drawer-title"></div>' +
                '<div class="confirm-message"><section class="responsive-row-drawer-content"></section></div>' +
                '<div class="button-group responsive-row-drawer-actions"></div>';

            document.body.append(dialog);
            return dialog;
        };

        const state = {
            mode: "",
            id: "",
            dialog: ensureDesktopDrawer(),
        };

        if (!(state.dialog instanceof HTMLDialogElement)) {
            return;
        }

        const setModeButtons = (mode, id) => {
            const shareButton = document.querySelector(`#share-button-${id}`);
            const editButton = document.querySelector(`#edit-button-${id}`);

            if (mode === "edit") {
                setActionButtonVisual(
                    editButton,
                    "close",
                    "Close edit",
                    "Close",
                );
                restoreActionButtonVisual(shareButton);
                return;
            }

            if (mode === "share") {
                setActionButtonVisual(
                    shareButton,
                    "close",
                    "Close share",
                    "Close",
                );
                restoreActionButtonVisual(editButton);
                return;
            }

            restoreActionButtonVisual(shareButton);
            restoreActionButtonVisual(editButton);
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
            }
            clearModeState();
        };

        state.dialog.addEventListener("close", () => {
            clearModeState();
        });

        const getRowData = (id) => {
            const row = document.querySelector(`#id-${id}`);
            if (!(row instanceof HTMLElement)) {
                return null;
            }

            const shortLink =
                row.querySelector(
                    `#keyword-${id} a.responsive-shorturl-link`,
                ) ??
                row.querySelector(
                    `#keyword-${id} a:not(.responsive-delete-metadata-link)`,
                );
            const destinationLink =
                row.querySelector(
                    `#url-${id} a.responsive-destination-raw-link`,
                ) ??
                row.querySelector(
                    `#url-${id} a:not(.responsive-delete-metadata-link)`,
                );
            const titleNode = row.querySelector(
                `#url-${id} .responsive-destination-title`,
            );
            const keywordInput = document.querySelector(`#keyword_${id}`);
            const editButton = document.querySelector(`#edit-button-${id}`);

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
                    : destinationLink instanceof HTMLAnchorElement
                      ? (destinationLink.getAttribute("title") ?? "")
                      : "";
            const keyword =
                keywordInput instanceof HTMLInputElement
                    ? keywordInput.value
                    : "";
            const nonce =
                editButton instanceof HTMLAnchorElement
                    ? extractNonceFromHref(editButton.getAttribute("href"))
                    : "";

            return {
                id: String(id),
                shortUrl,
                destinationUrl,
                title: title.trim(),
                keyword,
                nonce,
            };
        };

        const renderEditContent = (data) => {
            const content = state.dialog.querySelector(
                ".responsive-row-drawer-content",
            );
            const actions = state.dialog.querySelector(
                ".responsive-row-drawer-actions",
            );
            const title = state.dialog.querySelector(
                "#responsive-row-drawer-title",
            );

            if (
                !(content instanceof HTMLElement) ||
                !(actions instanceof HTMLElement) ||
                !(title instanceof HTMLElement)
            ) {
                return false;
            }

            title.textContent = "Edit Link";
            content.replaceChildren();
            actions.replaceChildren();

            const editor = document.createElement("section");
            editor.className =
                "responsive-inline-editor responsive-drawer-editor";
            editor.dataset.id = data.id;

            const editorTitle = document.createElement("p");
            editorTitle.className = "responsive-inline-editor-title";
            editorTitle.textContent = "Edit mode";

            const shortUrlInput = document.createElement("input");
            shortUrlInput.type = "text";
            shortUrlInput.className = "text";
            shortUrlInput.id = `responsive-drawer-keyword-${data.id}`;
            shortUrlInput.value = data.shortUrl;
            shortUrlInput.setAttribute("aria-label", "Short URL");

            const destinationInput = document.createElement("input");
            destinationInput.type = "text";
            destinationInput.className = "text";
            destinationInput.id = `responsive-drawer-url-${data.id}`;
            destinationInput.value = data.destinationUrl;
            destinationInput.setAttribute("aria-label", "Destination URL");

            const titleInput = document.createElement("input");
            titleInput.type = "text";
            titleInput.className = "text";
            titleInput.id = `responsive-drawer-title-input-${data.id}`;
            titleInput.value = data.title;
            titleInput.setAttribute("aria-label", "Title");

            editor.append(
                editorTitle,
                makeField(
                    "responsive-inline-editor-field",
                    "Short URL",
                    shortUrlInput,
                ),
                makeField(
                    "responsive-inline-editor-field",
                    "Destination URL",
                    destinationInput,
                ),
                makeField(
                    "responsive-inline-editor-field",
                    "Title",
                    titleInput,
                ),
            );

            const saveEdit = () => {
                if (data.keyword === "" || data.nonce === "") {
                    window.location.reload();
                    return;
                }

                const saveButton = actions.querySelector(
                    ".responsive-drawer-button.is-primary",
                );
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
                        url: destinationInput.value,
                        id: data.id,
                        keyword: data.keyword,
                        newkeyword: normalizeKeywordFromInput(
                            shortUrlInput.value,
                            data.keyword,
                        ),
                        title: titleInput.value,
                        nonce: data.nonce,
                    },
                    (response) => {
                        if (response?.status === "success") {
                            const rowReplaced = replaceRowFromHtml(
                                data.id,
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

            const saveButton = createActionButton({
                iconName: "save",
                label: "Save",
                variantClass: "is-primary",
                className: "responsive-drawer-button",
                onClick: () => {
                    saveEdit();
                },
            });

            const cancelButton = createActionButton({
                iconName: "close",
                label: "Cancel",
                variantClass: "is-tonal",
                className: "responsive-drawer-button",
                onClick: () => closeDrawer(),
            });

            actions.append(saveButton, cancelButton);
            content.append(editor);

            window.requestAnimationFrame(() => {
                shortUrlInput.focus();
                shortUrlInput.select();
            });

            return true;
        };

        const renderShareContent = (data) => {
            const content = state.dialog.querySelector(
                ".responsive-row-drawer-content",
            );
            const actions = state.dialog.querySelector(
                ".responsive-row-drawer-actions",
            );
            const title = state.dialog.querySelector(
                "#responsive-row-drawer-title",
            );

            if (
                !(content instanceof HTMLElement) ||
                !(actions instanceof HTMLElement) ||
                !(title instanceof HTMLElement)
            ) {
                return false;
            }

            title.textContent = "Share Link";
            content.replaceChildren();
            actions.replaceChildren();

            const share = document.createElement("section");
            share.className = "responsive-inline-share responsive-drawer-share";
            share.dataset.id = data.id;

            const shareTitle = document.createElement("p");
            shareTitle.className = "responsive-inline-share-title";
            shareTitle.textContent = "Share mode";

            const shortUrlInput = document.createElement("input");
            shortUrlInput.type = "text";
            shortUrlInput.className = "text";
            shortUrlInput.id = `responsive-drawer-share-shorturl-${data.id}`;
            shortUrlInput.value = data.shortUrl;
            shortUrlInput.readOnly = true;
            shortUrlInput.setAttribute("aria-label", "Short URL to share");

            const messageInput = document.createElement("textarea");
            messageInput.className = "text";
            messageInput.id = `responsive-drawer-share-message-${data.id}`;
            messageInput.value =
                `${data.title ? `${data.title} ` : ""}${data.shortUrl}`.trim();
            messageInput.rows = 3;
            messageInput.setAttribute("aria-label", "Share message");

            share.append(
                shareTitle,
                makeField(
                    "responsive-inline-share-field",
                    "Short URL",
                    shortUrlInput,
                ),
                makeField(
                    "responsive-inline-share-field",
                    "Message",
                    messageInput,
                ),
            );

            const openShareWindow = (destination) => {
                const text = encodeURIComponent(
                    messageInput.value.trim() || shortUrlInput.value.trim(),
                );
                const encodedShortUrl = encodeURIComponent(
                    shortUrlInput.value.trim(),
                );
                const encodedDestinationUrl = encodeURIComponent(
                    data.destinationUrl,
                );

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
                iconName: "content_copy",
                label: "Copy short URL",
                variantClass: "is-primary",
                className: "responsive-drawer-button",
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
                iconName: "fa-x-twitter",
                iconLibrary: "brand",
                label: "Share on Twitter",
                variantClass: "is-tonal",
                className: "responsive-drawer-button",
                onClick: () => openShareWindow("tw"),
            });

            const facebookButton = createActionButton({
                iconName: "fa-facebook-f",
                iconLibrary: "brand",
                label: "Share on Facebook",
                variantClass: "is-tonal",
                className: "responsive-drawer-button",
                onClick: () => openShareWindow("fb"),
            });

            const closeButton = createActionButton({
                iconName: "close",
                label: "Close share mode",
                variantClass: "is-tonal",
                className: "responsive-drawer-button",
                onClick: () => closeDrawer(),
            });

            actions.append(
                copyButton,
                twitterButton,
                facebookButton,
                closeButton,
            );
            content.append(share);

            window.requestAnimationFrame(() => {
                shortUrlInput.focus();
                shortUrlInput.select();
            });

            return true;
        };

        const showDrawer = (mode, id, data, mounted) => {
            if (!mounted) {
                return false;
            }

            state.mode = mode;
            state.id = String(id);
            setModeButtons(mode, state.id);

            state.dialog.showModal();
            return true;
        };

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
                    const nonceInput = temp.querySelector(`#nonce_${data.id}`);
                    if (nonceInput instanceof HTMLInputElement) {
                        data.nonce = nonceInput.value;
                    }

                    callback(data);
                },
            );
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
                    showDrawer(
                        mode,
                        id,
                        updatedData,
                        renderEditContent(updatedData),
                    );
                });
                return true;
            }

            return showDrawer(mode, id, data, renderShareContent(data));
        };

        const originalEditLinkDisplay = window.edit_link_display;
        window.edit_link_display = function (id) {
            if (!isDesktop()) {
                return originalEditLinkDisplay(id);
            }

            return openDrawer("edit", id);
        };

        const originalEditLinkHide = window.edit_link_hide;
        window.edit_link_hide = function (id) {
            if (!isDesktop()) {
                return originalEditLinkHide(id);
            }

            if (state.mode === "edit" && state.id === String(id)) {
                closeDrawer();
                return true;
            }

            return true;
        };

        const originalEditLinkSave = window.edit_link_save;
        window.edit_link_save = function (id) {
            if (
                !isDesktop() ||
                state.mode !== "edit" ||
                state.id !== String(id)
            ) {
                return originalEditLinkSave(id);
            }

            const saveButton = state.dialog.querySelector(
                ".responsive-drawer-button.is-primary",
            );
            if (saveButton instanceof HTMLButtonElement) {
                saveButton.click();
                return true;
            }

            return false;
        };

        const originalToggleShare = window.toggle_share;
        window.toggle_share = function (id) {
            if (!isDesktop()) {
                return originalToggleShare(id);
            }

            return openDrawer("share", id);
        };
    };

    mountVueFeature(
        table,
        "ResponsiveDesktopRowDrawersFeature",
        "responsiveDesktopDrawers",
        installDesktopRowDrawers,
    );
}
