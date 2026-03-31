import { createMaterialIcon } from "./shared.js";

export function initDeleteConfirmDialog() {
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

        return parts.join(" ").replace(/\s+/g, " ").replace(/:\s*$/, "").trim();
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
        const cancelControl = buttonGroup.querySelector('input[type="reset"]');

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
            document.querySelector(`#url-${id} > a`)?.getAttribute("title") ??
            "";
        const titleSpan = dialog.querySelector('span[name="title"]');
        if (titleSpan instanceof HTMLElement && titleAttr !== "") {
            titleSpan.textContent = titleAttr;
        }

        return result;
    };

    dialog.dataset.responsiveDeleteConfirm = "true";
}
