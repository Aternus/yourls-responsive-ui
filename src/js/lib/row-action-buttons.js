import { createMaterialIcon, setMaterialIcon } from "./shared.js";

export function ensureButtonDefaults(button) {
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
}

export function setActionButtonVisual(button, iconName, title, label) {
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
}

export function restoreActionButtonVisual(button) {
    if (!(button instanceof HTMLElement)) {
        return;
    }

    const defaultTitle = button.dataset.responsiveDefaultTitle ?? "";
    const defaultLabel = button.dataset.responsiveDefaultLabel ?? defaultTitle;
    const defaultIcon = button.dataset.responsiveDefaultIcon ?? "";
    const defaultIconName = button.dataset.responsiveDefaultIconName ?? "";
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
}

export function setModeButtons(mode, id) {
    const shareButton = document.querySelector(`#share-button-${id}`);
    const editButton = document.querySelector(`#edit-button-${id}`);
    const deleteButton = document.querySelector(`#delete-button-${id}`);

    if (mode === "edit") {
        setActionButtonVisual(editButton, "close", "Close edit", "Close");
        restoreActionButtonVisual(shareButton);
        restoreActionButtonVisual(deleteButton);
        return;
    }

    if (mode === "share") {
        setActionButtonVisual(shareButton, "close", "Close share", "Close");
        restoreActionButtonVisual(editButton);
        restoreActionButtonVisual(deleteButton);
        return;
    }

    if (mode === "delete") {
        setActionButtonVisual(deleteButton, "close", "Close delete", "Close");
        restoreActionButtonVisual(editButton);
        restoreActionButtonVisual(shareButton);
        return;
    }

    restoreActionButtonVisual(shareButton);
    restoreActionButtonVisual(editButton);
    restoreActionButtonVisual(deleteButton);
}
