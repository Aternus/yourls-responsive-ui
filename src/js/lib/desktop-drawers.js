import { computed, defineComponent, h, ref, render } from "vue";
import {
    copyToClipboard,
    createMaterialIcon,
    isDesktop,
    replaceRowFromHtml,
    setMaterialIcon,
} from "./shared.js";
import {
    ResponsiveActionButton,
    ResponsiveTextInputField,
    ResponsiveTextareaField,
} from "./shared-vue.js";
import {
    openShareWindow,
    useCopyFeedback,
    usePrimaryControlFocus,
} from "./vue-composables.js";
import { mountVueFeature } from "./vue-feature.js";

function buildShareMessage(data) {
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const shortUrl =
        typeof data.shortUrl === "string" ? data.shortUrl.trim() : "";

    return `${title ? `${title} ` : ""}${shortUrl}`.trim();
}

const ResponsiveDesktopDrawerPanel = defineComponent({
    name: "ResponsiveDesktopDrawerPanel",
    components: {
        ResponsiveActionButton,
        ResponsiveTextInputField,
        ResponsiveTextareaField,
    },
    props: {
        mode: { type: String, required: true },
        data: { type: Object, required: true },
    },
    emits: ["close", "saveEdit"],
    setup(props, { emit }) {
        const shortUrl = ref(String(props.data.shortUrl ?? ""));
        const destinationUrl = ref(String(props.data.destinationUrl ?? ""));
        const title = ref(String(props.data.title ?? ""));
        const message = ref(buildShareMessage(props.data));
        const primaryControl = ref(null);
        const {
            iconName: copyIconName,
            label: copyLabel,
            markCopied,
        } = useCopyFeedback();
        usePrimaryControlFocus(primaryControl);

        const closeDrawer = () => {
            emit("close");
        };

        const copyShortUrl = async () => {
            const copied = await copyToClipboard(shortUrl.value);
            if (!copied) {
                return;
            }

            markCopied();
        };

        const saveEdit = (button) => {
            emit(
                "saveEdit",
                {
                    id: String(props.data.id ?? ""),
                    keyword: String(props.data.keyword ?? ""),
                    nonce: String(props.data.nonce ?? ""),
                    shortUrl: shortUrl.value,
                    destinationUrl: destinationUrl.value,
                    title: title.value,
                },
                button,
            );
        };

        const drawerId = String(props.data.id ?? "");

        const isEditMode = computed(() => props.mode === "edit");

        const shareOnTwitter = () => {
            openShareWindow(
                "tw",
                message.value.trim(),
                shortUrl.value.trim(),
                String(props.data.destinationUrl ?? ""),
            );
        };

        const shareOnFacebook = () => {
            openShareWindow(
                "fb",
                message.value.trim(),
                shortUrl.value.trim(),
                String(props.data.destinationUrl ?? ""),
            );
        };

        return {
            shortUrl,
            destinationUrl,
            title,
            message,
            primaryControl,
            copyIconName,
            copyLabel,
            copyShortUrl,
            closeDrawer,
            saveEdit,
            drawerId,
            isEditMode,
            shareOnTwitter,
            shareOnFacebook,
        };
    },
    template: `
        <div name="dialog_title" id="responsive-row-drawer-title">
            {{ isEditMode ? 'Edit Link' : 'Share Link' }}
        </div>
        <div class="confirm-message">
            <section class="responsive-row-drawer-content">
                <section
                    v-if="isEditMode"
                    class="responsive-inline-editor responsive-drawer-editor"
                    :data-id="drawerId"
                >
                    <p class="responsive-inline-editor-title">Edit mode</p>
                    <responsive-text-input-field
                        field-class-name="responsive-inline-editor-field"
                        label-text="Short URL"
                        label-class-name="responsive-inline-editor-label"
                        :control-id="\`responsive-drawer-keyword-\${drawerId}\`"
                        :model-value="shortUrl"
                        aria-label="Short URL"
                        :control-ref="primaryControl"
                        @update:model-value="shortUrl = $event"
                    />
                    <responsive-text-input-field
                        field-class-name="responsive-inline-editor-field"
                        label-text="Destination URL"
                        label-class-name="responsive-inline-editor-label"
                        :control-id="\`responsive-drawer-url-\${drawerId}\`"
                        :model-value="destinationUrl"
                        aria-label="Destination URL"
                        @update:model-value="destinationUrl = $event"
                    />
                    <responsive-text-input-field
                        field-class-name="responsive-inline-editor-field"
                        label-text="Title"
                        label-class-name="responsive-inline-editor-label"
                        :control-id="\`responsive-drawer-title-input-\${drawerId}\`"
                        :model-value="title"
                        aria-label="Title"
                        @update:model-value="title = $event"
                    />
                </section>
                <section
                    v-else
                    class="responsive-inline-share responsive-drawer-share"
                    :data-id="drawerId"
                >
                    <p class="responsive-inline-share-title">Share mode</p>
                    <responsive-text-input-field
                        field-class-name="responsive-inline-share-field"
                        label-text="Short URL"
                        label-class-name="responsive-inline-share-label"
                        :control-id="\`responsive-drawer-share-shorturl-\${drawerId}\`"
                        :model-value="shortUrl"
                        :read-only="true"
                        aria-label="Short URL to share"
                        :control-ref="primaryControl"
                    />
                    <responsive-textarea-field
                        field-class-name="responsive-inline-share-field"
                        label-text="Message"
                        label-class-name="responsive-inline-share-label"
                        :control-id="\`responsive-drawer-share-message-\${drawerId}\`"
                        :model-value="message"
                        :rows="3"
                        aria-label="Share message"
                        @update:model-value="message = $event"
                    />
                </section>
            </section>
        </div>
        <div class="button-group responsive-row-drawer-actions">
            <responsive-action-button
                v-if="isEditMode"
                icon-name="save"
                label="Save"
                variant-class="is-primary"
                class-name="responsive-drawer-button"
                @press="saveEdit"
            />
            <responsive-action-button
                v-else
                :icon-name="copyIconName"
                :label="copyLabel"
                variant-class="is-primary"
                class-name="responsive-drawer-button"
                @press="copyShortUrl"
            />
            <responsive-action-button
                v-if="isEditMode"
                icon-name="close"
                label="Cancel"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="closeDrawer"
            />
            <responsive-action-button
                v-else
                icon-name="fa-x-twitter"
                icon-library="brand"
                label="Share on Twitter"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="shareOnTwitter"
            />
            <responsive-action-button
                v-if="!isEditMode"
                icon-name="fa-facebook-f"
                icon-library="brand"
                label="Share on Facebook"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="shareOnFacebook"
            />
            <responsive-action-button
                v-if="!isEditMode"
                icon-name="close"
                label="Close share mode"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="closeDrawer"
            />
        </div>
    `,
});

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

        const unmountDrawerView = () => {
            render(null, state.dialog);
        };

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
                return;
            }

            unmountDrawerView();
            clearModeState();
        };

        state.dialog.addEventListener("close", () => {
            unmountDrawerView();
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
                        window.feedback(response?.message, response?.status);
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

        const renderDrawerContent = (mode, data) => {
            render(
                h(ResponsiveDesktopDrawerPanel, {
                    mode,
                    data,
                    onClose: closeDrawer,
                    onSaveEdit: saveDrawerEdit,
                }),
                state.dialog,
            );

            return true;
        };

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
                    showDrawer(mode, id, updatedData);
                });
                return true;
            }

            return showDrawer(mode, id, data);
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
                ".responsive-row-drawer-actions .responsive-drawer-button.is-primary",
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
