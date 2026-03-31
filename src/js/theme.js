///////////////////////////////////////////////////////////
// Responsive UI
///////////////////////////////////////////////////////////

(function () {
    //=== Shared Utilities ===//

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
    const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

    function createMaterialIcon(iconName, extraClass = "") {
        const icon = document.createElement("span");
        icon.className = `material-icons${extraClass ? ` ${extraClass}` : ""}`;
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = iconName;
        return icon;
    }

    function setMaterialIcon(icon, iconName, extraClass = "") {
        if (!(icon instanceof HTMLElement)) {
            return;
        }

        icon.className = `material-icons${extraClass ? ` ${extraClass}` : ""}`;
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = iconName;
    }

    function createBrandIcon(iconClass, extraClass = "") {
        const icon = document.createElement("span");
        icon.className = `fa-brands ${iconClass}${extraClass ? ` ${extraClass}` : ""}`;
        icon.setAttribute("aria-hidden", "true");
        return icon;
    }

    function fallbackCopyText(value) {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.select();

        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch (_error) {
            copied = false;
        }

        textarea.remove();
        return copied;
    }

    async function copyToClipboard(value) {
        const text = value.trim();
        if (!text) {
            return false;
        }

        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (_error) {
                // Fall back to document.execCommand below.
            }
        }

        return fallbackCopyText(text);
    }

    function replaceRowFromHtml(id, rowHtml) {
        const currentRow = document.querySelector(`#id-${id}`);
        if (!(currentRow instanceof HTMLElement)) {
            return false;
        }

        if (typeof rowHtml !== "string" || rowHtml.trim() === "") {
            return false;
        }

        const tempBody = document.createElement("tbody");
        tempBody.innerHTML = rowHtml.trim();

        const nextRow = tempBody.querySelector("tr[id^='id-']");
        if (!(nextRow instanceof HTMLElement)) {
            return false;
        }

        currentRow.replaceWith(nextRow);
        return true;
    }

    function makeField(className, labelText, control) {
        const field = document.createElement("div");
        field.className = className;

        const label = document.createElement("label");
        label.className = className.includes("share")
            ? "responsive-inline-share-label"
            : "responsive-inline-editor-label";
        label.setAttribute("for", control.id);
        label.textContent = labelText;

        field.append(label, control);
        return field;
    }

    function createActionButton({
        id,
        iconName,
        iconLibrary = "material",
        label,
        variantClass,
        className = "responsive-inline-editor-button",
        source,
        onClick,
    }) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `button ${className} ${variantClass}`;
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);

        if (id !== undefined) {
            button.dataset.id = String(id);
        }

        if (source) {
            button.id = source.id;
        }

        if (iconLibrary === "brand") {
            button.append(createBrandIcon(iconName, "responsive-brand-icon"));
        } else {
            button.append(createMaterialIcon(iconName));
        }

        button.addEventListener("click", (event) => {
            event.preventDefault();
            onClick(button);
        });

        if (source) {
            source.remove();
        }

        return button;
    }

    // Navigation Menu
    /////////////////////////////////////////////////

    function initNavMenu() {
        const checkbox = document.querySelector("#nav_menu");
        const button = document.querySelector(".nav_menu_button");
        const nav = document.querySelector('nav[role="navigation"]');

        if (!checkbox || !button || !nav) {
            return;
        }

        const syncState = () => {
            const expanded = checkbox.checked;

            button.setAttribute("aria-expanded", expanded ? "true" : "false");
            document.body.classList.toggle("responsive-nav-open", expanded);
        };

        checkbox.addEventListener("change", syncState);

        button.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && checkbox.checked) {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });

        nav.addEventListener("click", (event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });

        syncState();
    }

    // Scroll to Top
    /////////////////////////////////////////////////

    function initScrollTopButton() {
        const button = document.querySelector(".responsive-scroll-top-button");

        if (
            !(button instanceof HTMLButtonElement) ||
            button.dataset.responsiveScrollTop === "true"
        ) {
            return;
        }

        const mobileQuery = window.matchMedia("(max-width: 767px)");
        let rafId = 0;

        const setVisible = (visible) => {
            button.classList.toggle("is-visible", visible);
            button.hidden = !visible;
        };

        const syncVisibility = () => {
            const visible = mobileQuery.matches && window.scrollY > 220;
            setVisible(visible);
        };

        const scheduleSync = () => {
            if (rafId) {
                return;
            }

            rafId = window.requestAnimationFrame(() => {
                rafId = 0;
                syncVisibility();
            });
        };

        button.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });

        window.addEventListener("scroll", scheduleSync, { passive: true });
        window.addEventListener("resize", scheduleSync, { passive: true });

        if (typeof mobileQuery.addEventListener === "function") {
            mobileQuery.addEventListener("change", scheduleSync);
        } else if (typeof mobileQuery.addListener === "function") {
            mobileQuery.addListener(scheduleSync);
        }

        syncVisibility();
        button.dataset.responsiveScrollTop = "true";
    }

    // Plugins Page
    /////////////////////////////////////////////////

    function initPluginsFilterButton() {
        const toggle = document.querySelector("#toggle_plugins");

        if (!toggle || toggle.querySelector(".material-icons")) {
            return;
        }

        toggle.textContent = "";
        toggle.setAttribute("aria-label", "Toggle active and inactive plugins");

        toggle.append(createMaterialIcon("filter_alt"));
    }

    function initPluginActionIcons() {
        const pluginButtons = document.querySelectorAll(".plugin_actions a");

        pluginButtons.forEach((button) => {
            if (
                !(button instanceof HTMLElement) ||
                button.querySelector(".responsive-action-icon")
            ) {
                return;
            }

            const text = button.textContent?.trim().toLowerCase() ?? "";
            let iconName = "settings";

            if (text.includes("activate")) {
                iconName = text.includes("deactivate") ? "power_off" : "power";
            }

            button.prepend(
                createMaterialIcon(iconName, "responsive-action-icon"),
            );
        });
    }

    // Table Enhancements
    /////////////////////////////////////////////////

    function initDestinationTitleExpansion() {
        const table = document.querySelector("#main_table");

        if (
            !(table instanceof HTMLElement) ||
            table.dataset.responsiveTitleExpand === "true"
        ) {
            return;
        }

        const toggleTitle = (target) => {
            if (!(target instanceof Element)) {
                return;
            }

            const title = target.closest(".responsive-destination-title");
            if (!(title instanceof HTMLElement)) {
                return;
            }

            table
                .querySelectorAll(".responsive-destination-title.is-expanded")
                .forEach((node) => {
                    if (node !== title) {
                        node.classList.remove("is-expanded");
                    }
                });

            title.classList.toggle("is-expanded");
        };

        table.addEventListener("click", (event) => {
            toggleTitle(event.target);
        });

        table.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            const target = event.target;
            if (
                !(target instanceof Element) ||
                !target.closest(".responsive-destination-title")
            ) {
                return;
            }

            event.preventDefault();
            toggleTitle(target);
        });

        table.dataset.responsiveTitleExpand = "true";
    }

    function initRowLinkCopyButtons() {
        const table = document.querySelector("#main_table");

        if (
            !(table instanceof HTMLElement) ||
            table.dataset.responsiveCopyButtons === "true"
        ) {
            return;
        }

        table.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const button = target.closest(".responsive-copy-link-button");
            if (!(button instanceof HTMLButtonElement)) {
                return;
            }

            event.preventDefault();

            const originalLabel =
                button.dataset.copyLabel ||
                button.getAttribute("aria-label") ||
                "Copy URL";
            const icon = button.querySelector(".material-icons");
            const copyValue = button.dataset.copyText ?? "";

            copyToClipboard(copyValue).then((copied) => {
                if (!copied) {
                    return;
                }

                button.classList.add("is-copied");
                button.setAttribute("aria-label", "Copied");
                button.setAttribute("title", "Copied");

                if (icon instanceof HTMLElement) {
                    icon.textContent = "check";
                }

                window.setTimeout(() => {
                    button.classList.remove("is-copied");
                    button.setAttribute("aria-label", originalLabel);
                    button.setAttribute("title", originalLabel);

                    if (icon instanceof HTMLElement) {
                        icon.textContent = "content_copy";
                    }
                }, 1200);
            });
        });

        table.dataset.responsiveCopyButtons = "true";
    }

    // Delete Confirm Dialog
    /////////////////////////////////////////////////

    function initDeleteConfirmDialog() {
        const dialog = document.querySelector("#delete-confirm-dialog");
        const message = dialog?.querySelector(".confirm-message");
        const title = dialog?.querySelector('div[name="dialog_title"]');
        const buttonGroup = dialog?.querySelector(".button-group");

        if (
            !(dialog instanceof HTMLElement) ||
            !(message instanceof HTMLElement) ||
            dialog.dataset.responsiveDeleteConfirm === "true"
        ) {
            return;
        }

        const list = message.querySelector("ul");
        if (!(list instanceof HTMLUListElement)) {
            return;
        }

        if (
            title instanceof HTMLElement &&
            !title.querySelector(".responsive-delete-confirm-heading")
        ) {
            const headingTitle = title.textContent?.trim() ?? "Delete Link";
            title.textContent = "";

            const heading = document.createElement("div");
            heading.className = "responsive-delete-confirm-heading";

            const headingText = document.createElement("div");
            headingText.className = "responsive-delete-confirm-heading-text";

            const headingSpan = document.createElement("span");
            headingSpan.className = "responsive-delete-confirm-heading-title";
            headingSpan.textContent = headingTitle;

            headingText.append(headingSpan);
            heading.append(headingText);

            title.append(heading);
        }

        const intro = message.querySelector(":scope > p");
        if (
            intro instanceof HTMLElement &&
            !message.querySelector(".responsive-delete-confirm-intro")
        ) {
            const introSection = document.createElement("section");
            introSection.className = "responsive-delete-confirm-intro";

            const introTitle = document.createElement("p");
            introTitle.className = "responsive-delete-confirm-intro-title";
            introTitle.textContent = "Review the link details before deleting.";

            const introMeta = document.createElement("p");
            introMeta.className = "responsive-delete-confirm-intro-meta";
            introMeta.textContent = "Deletion is permanent.";

            introSection.append(
                createMaterialIcon(
                    "warning_amber",
                    "responsive-delete-confirm-intro-icon",
                ),
                introTitle,
                introMeta,
            );

            intro.replaceWith(introSection);
        }

        const labelMap = {
            short_url: "Short URL",
            title: "Title",
            url: "Destination URL",
        };
        const sortPriority = {
            short_url: 1,
            url: 2,
            title: 3,
        };

        const getLabelText = (item, valueNode) => {
            const parts = [];

            item.childNodes.forEach((node) => {
                if (node === valueNode) {
                    return;
                }

                const text = node.textContent ?? "";
                if (text.trim() !== "") {
                    parts.push(text);
                }
            });

            return parts
                .join(" ")
                .replace(/\s+/g, " ")
                .replace(/:\s*$/, "")
                .trim();
        };

        list.querySelectorAll(":scope > li").forEach((item) => {
            if (
                !(item instanceof HTMLElement) ||
                item.querySelector(".responsive-delete-confirm-section")
            ) {
                return;
            }

            const value = item.querySelector("span[name]");
            if (!(value instanceof HTMLSpanElement)) {
                return;
            }

            const valueName = value.getAttribute("name") ?? "";
            const section = document.createElement("div");
            section.className =
                "responsive-destination-section responsive-delete-confirm-section";

            if (valueName !== "") {
                section.classList.add(`is-${valueName.replaceAll("_", "-")}`);
            }

            const label = document.createElement("span");
            label.className = "responsive-destination-section-title";
            label.textContent =
                labelMap[valueName] ||
                getLabelText(item, value) ||
                valueName.replaceAll("_", " ") ||
                "Value";

            value.classList.add("responsive-delete-confirm-value");

            if (valueName === "short_url" || valueName === "url") {
                value.classList.add("is-mono");
            }

            section.append(label, value);
            item.classList.add("responsive-delete-confirm-item");
            item.dataset.responsiveDeleteField = valueName;
            item.replaceChildren(section);
        });

        const orderedItems = Array.from(list.querySelectorAll(":scope > li"));
        orderedItems.sort((a, b) => {
            const aField = a.dataset.responsiveDeleteField ?? "";
            const bField = b.dataset.responsiveDeleteField ?? "";
            const aPriority = sortPriority[aField] ?? 99;
            const bPriority = sortPriority[bField] ?? 99;

            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }

            return aField.localeCompare(bField);
        });
        list.replaceChildren(...orderedItems);

        if (buttonGroup instanceof HTMLElement) {
            const makeButton = ({
                control,
                icon,
                label,
                variantClass,
                onClick,
            }) => {
                if (!(control instanceof HTMLElement)) {
                    return null;
                }

                const button = document.createElement("button");
                button.type = "button";
                button.className = `button responsive-delete-confirm-button ${variantClass}`;
                button.setAttribute("aria-label", label);
                button.setAttribute("title", label);
                button.append(
                    createMaterialIcon(
                        icon,
                        "responsive-delete-confirm-button-icon",
                    ),
                );
                const srLabel = document.createElement("span");
                srLabel.className = "responsive-sr-only";
                srLabel.textContent = label;
                button.append(srLabel);

                button.addEventListener("click", (event) => {
                    event.preventDefault();
                    onClick();
                });

                control.replaceWith(button);
                return button;
            };

            const deleteControl = buttonGroup.querySelector("input.primary");
            const cancelControl = buttonGroup.querySelector(
                'input[type="reset"]',
            );

            makeButton({
                control: deleteControl,
                icon: "delete",
                label: "Delete",
                variantClass: "is-destructive",
                onClick: () => {
                    if (typeof window.remove_link_confirmed === "function") {
                        window.remove_link_confirmed();
                    }
                },
            });

            makeButton({
                control: cancelControl,
                icon: "close",
                label: "Cancel",
                variantClass: "is-tonal",
                onClick: () => {
                    if (typeof window.remove_link_canceled === "function") {
                        window.remove_link_canceled();
                    }
                },
            });
        }

        const originalRemoveLink = window.remove_link;
        window.remove_link = function (id) {
            const result = originalRemoveLink(id);

            const titleAttr =
                document
                    .querySelector(`#url-${id} > a`)
                    ?.getAttribute("title") ?? "";
            const titleSpan = dialog.querySelector('span[name="title"]');
            if (titleSpan instanceof HTMLElement && titleAttr !== "") {
                titleSpan.textContent = titleAttr;
            }

            return result;
        };

        dialog.dataset.responsiveDeleteConfirm = "true";
    }

    // Inline Card Editing (Mobile)
    /////////////////////////////////////////////////

    function initInlineCardEditing() {
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
                makeField(
                    "responsive-inline-editor-field",
                    "Title",
                    titleInput,
                ),
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
                stripActions.className =
                    "responsive-inline-editor-strip-actions";
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
            if (
                !isMobile() ||
                !getInlineEditor(id) ||
                typeof jq !== "function"
            ) {
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
                        const rowReplaced = replaceRowFromHtml(
                            id,
                            data?.row_html,
                        );

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

    function initInlineCardSharing() {
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

            table
                .querySelectorAll(".responsive-inline-share")
                .forEach((share) => {
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
                const encodedDestinationUrl =
                    encodeURIComponent(destinationUrl);

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
                stripActions.className =
                    "responsive-inline-share-strip-actions";
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

    // Desktop Row Drawers
    /////////////////////////////////////////////////

    function initDesktopRowDrawers() {
        const table = document.querySelector("#main_table");
        const jq = window.jQuery;

        if (
            !(table instanceof HTMLElement) ||
            table.dataset.responsiveDesktopDrawers === "true" ||
            typeof jq !== "function" ||
            typeof window.edit_link_display !== "function" ||
            typeof window.edit_link_hide !== "function" ||
            typeof window.edit_link_save !== "function" ||
            typeof window.toggle_share !== "function"
        ) {
            return;
        }

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

        table.dataset.responsiveDesktopDrawers = "true";
    }

    // Search Filters
    /////////////////////////////////////////////////

    function initSearchFilters() {
        const filterForm = document.querySelector("#filter_form form");
        const filterOptions = document.querySelector("#filter_options");

        if (
            !(filterForm instanceof HTMLFormElement) ||
            !(filterOptions instanceof HTMLElement) ||
            filterOptions.dataset.responsiveEnhanced === "true"
        ) {
            return;
        }

        const controls = {
            search: filterForm.querySelector('input[name="search"]'),
            searchIn: filterForm.querySelector('select[name="search_in"]'),
            sortBy: filterForm.querySelector('select[name="sort_by"]'),
            sortOrder: filterForm.querySelector('select[name="sort_order"]'),
            perpage: filterForm.querySelector('input[name="perpage"]'),
            clickFilter: filterForm.querySelector(
                'select[name="click_filter"]',
            ),
            clickLimit: filterForm.querySelector('input[name="click_limit"]'),
            dateFilter: filterForm.querySelector('select[name="date_filter"]'),
            dateFirst: filterForm.querySelector('input[name="date_first"]'),
            dateAnd: filterForm.querySelector("#date_and"),
            dateSecond: filterForm.querySelector('input[name="date_second"]'),
            buttons: filterOptions.querySelector("#filter_buttons"),
        };

        const requiredControls = [
            controls.search,
            controls.searchIn,
            controls.sortBy,
            controls.sortOrder,
            controls.perpage,
            controls.clickFilter,
            controls.clickLimit,
            controls.dateFilter,
            controls.dateFirst,
            controls.dateAnd,
            controls.dateSecond,
            controls.buttons,
        ];

        if (requiredControls.some((control) => !(control instanceof Element))) {
            return;
        }

        const createGroup = ({
            title,
            hint,
            className = "",
            fields = [],
            inlineHeader = false,
        }) => {
            const group = document.createElement("section");
            group.className = `responsive-filter-group ${className}`.trim();

            const headingTag = inlineHeader ? "span" : "p";
            const heading = document.createElement(headingTag);
            heading.className = "responsive-filter-group-title";
            heading.textContent = title;

            if (inlineHeader && hint) {
                const headingRow = document.createElement("p");
                headingRow.className = "responsive-filter-group-heading-row";

                const description = document.createElement("span");
                description.className = "responsive-filter-group-hint";
                description.textContent = hint;

                headingRow.append(heading, description);
                group.append(headingRow);
            } else {
                group.append(heading);

                if (hint) {
                    const description = document.createElement("p");
                    description.className = "responsive-filter-group-hint";
                    description.textContent = hint;
                    group.append(description);
                }
            }

            const controlsWrap = document.createElement("div");
            controlsWrap.className = "responsive-filter-group-controls";
            fields.forEach((field) => {
                if (field instanceof Element) {
                    controlsWrap.append(field);
                }
            });
            group.append(controlsWrap);

            return group;
        };

        const shell = document.createElement("section");
        shell.className = "responsive-filter-shell";

        const quick = document.createElement("div");
        quick.className = "responsive-filter-quick";
        quick.append(
            createGroup({
                title: "Search",
                hint: "Keyword, URL, title, or IP",
                className: "is-search",
                inlineHeader: true,
                fields: [controls.search],
            }),
            createGroup({
                title: "In field",
                className: "is-scope",
                fields: [controls.searchIn],
            }),
        );
        shell.append(quick);

        const advanced = document.createElement("details");
        advanced.className = "responsive-filter-advanced";

        const advancedSummary = document.createElement("summary");
        advancedSummary.className = "responsive-filter-advanced-summary";
        advancedSummary.append(
            createMaterialIcon("tune"),
            Object.assign(document.createElement("span"), {
                textContent: "Advanced filters",
            }),
        );
        advanced.append(advancedSummary);

        const advancedBody = document.createElement("div");
        advancedBody.className = "responsive-filter-advanced-body";
        advancedBody.append(
            createGroup({
                title: "Sort",
                className: "is-sort",
                fields: [controls.sortBy, controls.sortOrder],
            }),
            createGroup({
                title: "Rows",
                hint: "Results per page",
                className: "is-perpage",
                fields: [controls.perpage],
            }),
            createGroup({
                title: "Clicks",
                hint: "Show links with more or less clicks",
                className: "is-clicks",
                fields: [controls.clickFilter, controls.clickLimit],
            }),
            createGroup({
                title: "Date",
                hint: "Filter by creation date",
                className: "is-date",
                fields: [
                    controls.dateFilter,
                    controls.dateFirst,
                    controls.dateAnd,
                    controls.dateSecond,
                ],
            }),
        );

        advanced.append(advancedBody);
        shell.append(advanced);

        const actionButtons = Array.from(
            controls.buttons.querySelectorAll("input"),
        );
        controls.buttons.replaceChildren(...actionButtons);
        controls.buttons.classList.add("responsive-filter-buttons");
        actionButtons.forEach((button) => {
            if (button instanceof HTMLInputElement) {
                button.classList.add("responsive-filter-button");
            }
        });
        controls.buttons
            .querySelector("#submit-clear-filter")
            ?.classList.add("is-tonal");
        shell.append(controls.buttons);

        const isSelectAtDefault = (selectControl) => {
            if (!(selectControl instanceof HTMLSelectElement)) {
                return true;
            }

            const defaultValue = selectControl.dataset.responsiveDefault ?? "";
            return selectControl.value === defaultValue;
        };

        const hasAdvancedValues =
            controls.perpage instanceof HTMLInputElement &&
            controls.sortBy instanceof HTMLSelectElement &&
            controls.sortOrder instanceof HTMLSelectElement &&
            controls.clickFilter instanceof HTMLSelectElement &&
            controls.clickLimit instanceof HTMLInputElement &&
            controls.dateFilter instanceof HTMLSelectElement &&
            controls.dateFirst instanceof HTMLInputElement &&
            controls.dateSecond instanceof HTMLInputElement &&
            (controls.perpage.value.trim() !== "15" ||
                !isSelectAtDefault(controls.sortBy) ||
                !isSelectAtDefault(controls.sortOrder) ||
                !isSelectAtDefault(controls.clickFilter) ||
                controls.clickLimit.value.trim() !== "" ||
                !isSelectAtDefault(controls.dateFilter) ||
                controls.dateFirst.value.trim() !== "" ||
                controls.dateSecond.value.trim() !== "");

        const hasQuickValues =
            controls.search instanceof HTMLInputElement &&
            controls.searchIn instanceof HTMLSelectElement &&
            (controls.search.value.trim() !== "" ||
                !isSelectAtDefault(controls.searchIn));

        const hasFiltersApplied = hasQuickValues || hasAdvancedValues;

        if (hasAdvancedValues) {
            advanced.open = true;
        }

        const disclosure = document.createElement("details");
        disclosure.className = "responsive-filter-disclosure";

        const disclosureSummary = document.createElement("summary");
        disclosureSummary.className = "responsive-filter-disclosure-summary";
        disclosureSummary.append(
            createMaterialIcon("filter_alt"),
            Object.assign(document.createElement("span"), {
                className: "responsive-filter-disclosure-text",
                textContent: "Filters",
            }),
        );

        const shouldOpenByDefault = hasFiltersApplied;
        disclosure.open = shouldOpenByDefault;

        disclosure.append(disclosureSummary, shell);

        filterOptions.replaceChildren(disclosure);
        filterOptions.dataset.responsiveEnhanced = "true";
    }

    // Infos Page
    /////////////////////////////////////////////////

    function initInfosPage() {
        const body = document.body;
        const wrap = document.querySelector("#wrap");

        if (
            !(body instanceof HTMLBodyElement) ||
            !(wrap instanceof HTMLElement) ||
            !body.classList.contains("infos") ||
            body.dataset.responsiveInfosEnhanced === "true"
        ) {
            return;
        }

        const tabIcons = {
            "#stat_tab_stats": "show_chart",
            "#stat_tab_location": "location_on",
            "#stat_tab_sources": "account_tree",
            "#stat_tab_share": "share",
        };
        let scheduleInfosChartsScale = () => {};

        document.querySelectorAll("#headers a[href]").forEach((anchor) => {
            if (
                !(anchor instanceof HTMLAnchorElement) ||
                anchor.querySelector(".responsive-infos-tab-icon")
            ) {
                return;
            }

            const href = anchor.getAttribute("href") ?? "";
            const iconName = tabIcons[href];

            if (!iconName) {
                return;
            }

            anchor.prepend(
                createMaterialIcon(iconName, "responsive-infos-tab-icon"),
            );
        });

        const tabsHeader = wrap.querySelector("#headers");
        if (tabsHeader instanceof HTMLElement) {
            tabsHeader.style.setProperty("display", "flex", "important");

            const tabAnchors = Array.from(
                tabsHeader.querySelectorAll("li > a[href]"),
            ).filter((anchor) => anchor instanceof HTMLAnchorElement);

            const setActiveAnchor = (activeAnchor) => {
                tabAnchors.forEach((anchor) => {
                    anchor.classList.toggle(
                        "is-responsive-active",
                        anchor === activeAnchor,
                    );
                });
            };

            const resolveActiveAnchor = () => {
                const selectedAnchor =
                    tabsHeader.querySelector("li > a.selected");
                if (selectedAnchor instanceof HTMLAnchorElement) {
                    return selectedAnchor;
                }

                const hash = window.location.hash;
                if (hash) {
                    const hashAnchor = tabsHeader.querySelector(
                        `li > a[href="${hash}"]`,
                    );
                    if (hashAnchor instanceof HTMLAnchorElement) {
                        return hashAnchor;
                    }
                }

                const selectedItemAnchor =
                    tabsHeader.querySelector("li.selected > a");
                if (selectedItemAnchor instanceof HTMLAnchorElement) {
                    return selectedItemAnchor;
                }

                const explicitActive = tabsHeader.querySelector(
                    "li > a.is-responsive-active",
                );
                if (explicitActive instanceof HTMLAnchorElement) {
                    return explicitActive;
                }

                return tabAnchors[0] ?? null;
            };

            const updateHeaderPill = () => {
                const selected = resolveActiveAnchor();

                if (!(selected instanceof HTMLElement)) {
                    tabsHeader.style.setProperty(
                        "--responsive-pill-width",
                        "0px",
                    );
                    return;
                }

                setActiveAnchor(selected);

                const headerRect = tabsHeader.getBoundingClientRect();
                const selectedRect = selected.getBoundingClientRect();
                const left =
                    selectedRect.left - headerRect.left + tabsHeader.scrollLeft;
                tabsHeader.style.setProperty(
                    "--responsive-pill-left",
                    `${left}px`,
                );
                tabsHeader.style.setProperty(
                    "--responsive-pill-width",
                    `${selected.offsetWidth}px`,
                );
            };

            tabsHeader.addEventListener("click", (event) => {
                if (!(event.target instanceof Element)) {
                    return;
                }

                const anchor = event.target.closest("#headers a[href]");
                if (!(anchor instanceof HTMLAnchorElement)) {
                    return;
                }

                setActiveAnchor(anchor);

                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(updateHeaderPill);
                    window.requestAnimationFrame(scheduleInfosChartsScale);
                    window.setTimeout(scheduleInfosChartsScale, 140);
                });
            });

            const tabMutationObserver = new MutationObserver(() => {
                window.requestAnimationFrame(updateHeaderPill);
                window.requestAnimationFrame(scheduleInfosChartsScale);
            });
            tabMutationObserver.observe(tabsHeader, {
                subtree: true,
                attributes: true,
                attributeFilter: ["class"],
            });

            window.addEventListener("resize", updateHeaderPill, {
                passive: true,
            });
            window.addEventListener("hashchange", updateHeaderPill, {
                passive: true,
            });
            window.requestAnimationFrame(updateHeaderPill);
            window.setTimeout(updateHeaderPill, 120);
            window.setTimeout(updateHeaderPill, 260);

            if (document.fonts?.ready) {
                document.fonts.ready.then(() => {
                    window.requestAnimationFrame(updateHeaderPill);
                });
            }

            window.addEventListener(
                "load",
                () => {
                    window.requestAnimationFrame(updateHeaderPill);
                },
                {
                    once: true,
                },
            );
        }

        const infoVisualizations = Array.from(
            wrap.querySelectorAll("[id^='visualization_']"),
        ).filter((node) => node instanceof HTMLElement);

        if (infoVisualizations.length) {
            const scaleVisualization = (container) => {
                if (!(container instanceof HTMLElement)) {
                    return;
                }

                if (
                    container.clientWidth <= 0 ||
                    container.offsetParent === null
                ) {
                    return;
                }

                const chartRoot = container.firstElementChild;
                if (!(chartRoot instanceof HTMLElement)) {
                    container.style.removeProperty("height");
                    return;
                }

                const naturalWidth =
                    chartRoot.scrollWidth || chartRoot.offsetWidth;
                const naturalHeight =
                    chartRoot.scrollHeight || chartRoot.offsetHeight;

                if (!naturalWidth || !naturalHeight) {
                    return;
                }

                const availableWidth = container.clientWidth;
                const scale = Math.min(1, availableWidth / naturalWidth);

                chartRoot.style.transform =
                    scale < 0.999 ? `scale(${scale})` : "none";
                container.style.height = `${Math.ceil(naturalHeight * scale)}px`;
            };

            const scaleAllVisualizations = () => {
                infoVisualizations.forEach(scaleVisualization);
            };

            let scaleRafId = 0;
            scheduleInfosChartsScale = () => {
                if (scaleRafId) {
                    return;
                }

                scaleRafId = window.requestAnimationFrame(() => {
                    scaleRafId = 0;
                    scaleAllVisualizations();
                });
            };

            const visualizationMutationObserver = new MutationObserver(() => {
                scheduleInfosChartsScale();
            });
            infoVisualizations.forEach((node) => {
                visualizationMutationObserver.observe(node, {
                    childList: true,
                    subtree: true,
                });
            });

            window.addEventListener("resize", scheduleInfosChartsScale, {
                passive: true,
            });
            window.addEventListener("hashchange", scheduleInfosChartsScale, {
                passive: true,
            });

            window.requestAnimationFrame(() => {
                scheduleInfosChartsScale();
                window.setTimeout(scheduleInfosChartsScale, 120);
            });
        }

        const makeLinkRow = (anchor, label) => {
            if (!(anchor instanceof HTMLAnchorElement)) {
                return;
            }

            if (
                anchor.parentElement?.classList.contains(
                    "responsive-infos-link-row",
                )
            ) {
                return;
            }

            const href = anchor.getAttribute("href") ?? "";
            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("javascript:")
            ) {
                return;
            }

            anchor.setAttribute("target", "_blank");
            anchor.setAttribute("rel", "noopener noreferrer");
            anchor.classList.add("responsive-infos-raw-link");

            const rawText = anchor.textContent ?? "";
            anchor.textContent = "";

            const text = document.createElement("span");
            text.className = "responsive-link-text";
            text.textContent = rawText.trim();

            const icon = document.createElement("span");
            setMaterialIcon(icon, "open_in_new", "responsive-link-icon");

            anchor.append(text, icon);

            const copyButton = document.createElement("button");
            copyButton.type = "button";
            copyButton.className = "responsive-infos-copy-button";
            copyButton.dataset.copyText = href;
            copyButton.setAttribute("aria-label", `Copy ${label}`);
            copyButton.setAttribute("title", `Copy ${label}`);
            copyButton.append(createMaterialIcon("content_copy"));

            const row = document.createElement("span");
            row.className = "responsive-infos-link-row";
            const placeholder = document.createElement("span");
            anchor.replaceWith(placeholder);
            row.append(anchor, copyButton);
            placeholder.replaceWith(row);
        };

        wrap.querySelectorAll("#wrap > h3").forEach((heading) => {
            if (!(heading instanceof HTMLElement)) {
                return;
            }

            const anchors = Array.from(
                heading.querySelectorAll(":scope > a[href]"),
            ).filter((anchor) => anchor instanceof HTMLAnchorElement);

            if (!anchors.length) {
                return;
            }

            const primaryAnchor =
                anchors.find((anchor) => {
                    const href = anchor.getAttribute("href") ?? "";
                    return !href.includes("+all");
                }) ?? anchors[0];
            const aggregateAnchor = anchors.find((anchor) => {
                const href = anchor.getAttribute("href") ?? "";
                return href.includes("+all");
            });

            const label = heading.id === "longurl" ? "long URL" : "short URL";
            makeLinkRow(primaryAnchor, label);

            if (
                !(aggregateAnchor instanceof HTMLAnchorElement) ||
                heading.id === "longurl"
            ) {
                return;
            }

            aggregateAnchor.classList.add("responsive-infos-aggregate-link");
            aggregateAnchor.setAttribute(
                "aria-label",
                aggregateAnchor.getAttribute("title") ||
                    "Aggregate stats for duplicate short URLs",
            );

            if (!aggregateAnchor.querySelector(".material-icons")) {
                aggregateAnchor.textContent = "";
                aggregateAnchor.append(createMaterialIcon("bar_chart"));
            }

            const row = heading.querySelector(
                ":scope > .responsive-infos-link-row",
            );
            if (
                row instanceof HTMLElement &&
                aggregateAnchor.parentElement !== row
            ) {
                row.append(aggregateAnchor);
            }
        });

        wrap.querySelectorAll(
            "#copybox a[href], ul[id^='details_'] a[href]",
        ).forEach((anchor) => {
            if (!(anchor instanceof HTMLAnchorElement)) {
                return;
            }

            const href = anchor.getAttribute("href") ?? "";

            if (
                href === "" ||
                href.startsWith("#") ||
                href.startsWith("javascript:")
            ) {
                return;
            }

            anchor.setAttribute("target", "_blank");
            anchor.setAttribute("rel", "noopener noreferrer");
        });

        wrap.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const button = target.closest(".responsive-infos-copy-button");
            if (!(button instanceof HTMLButtonElement)) {
                return;
            }

            event.preventDefault();

            const originalLabel =
                button.getAttribute("aria-label") || "Copy URL";
            const copyValue = button.dataset.copyText ?? "";
            const icon = button.querySelector(".material-icons");

            copyToClipboard(copyValue).then((copied) => {
                if (!copied) {
                    return;
                }

                button.classList.add("is-copied");
                button.setAttribute("aria-label", "Copied");
                button.setAttribute("title", "Copied");

                if (icon instanceof HTMLElement) {
                    icon.textContent = "check";
                }

                window.setTimeout(() => {
                    button.classList.remove("is-copied");
                    button.setAttribute("aria-label", originalLabel);
                    button.setAttribute("title", originalLabel);

                    if (icon instanceof HTMLElement) {
                        icon.textContent = "content_copy";
                    }
                }, 1200);
            });
        });

        body.dataset.responsiveInfosEnhanced = "true";
    }

    ///////////////////////////////////////////////////////////
    // Initialization
    ///////////////////////////////////////////////////////////

    function initResponsiveUI() {
        const inits = [
            initNavMenu,
            initScrollTopButton,
            initDestinationTitleExpansion,
            initRowLinkCopyButtons,
            initDeleteConfirmDialog,
            initInlineCardEditing,
            initInlineCardSharing,
            initDesktopRowDrawers,
            initPluginsFilterButton,
            initPluginActionIcons,
            initSearchFilters,
            initInfosPage,
        ];

        inits.forEach((fn) => fn());

        let pendingReinit = 0;
        let observer = new MutationObserver(() => {
            if (pendingReinit) {
                return;
            }

            pendingReinit = window.requestAnimationFrame(() => {
                pendingReinit = 0;
                inits.forEach((fn) => fn());
            });
        });

        const root = document.querySelector("#wrap") || document.body;
        observer.observe(root, { childList: true, subtree: true });

        window.addEventListener("pagehide", () => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initResponsiveUI);
        return;
    }

    initResponsiveUI();
})();
