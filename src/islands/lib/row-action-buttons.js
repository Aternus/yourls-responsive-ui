import { createIconifyIcon, setIconifyIcon } from "./shared.js";

function ensureButtonDefaults(button) {
  if (button.dataset.ruiDefaultTitle) {
    return;
  }

  const icon = button.querySelector(".rui-links-table__action-icon");
  const srLabel = button.querySelector(".rui-sr-only");
  const title = button.getAttribute("title") ?? "";
  const label = srLabel?.textContent?.trim() ?? title;

  button.dataset.ruiDefaultTitle = title;
  button.dataset.ruiDefaultLabel = label;
  if (icon instanceof HTMLElement) {
    const iconName =
      icon.getAttribute("icon") ?? icon.textContent?.trim() ?? "";

    button.dataset.ruiDefaultIcon = icon.className;
    button.dataset.ruiDefaultIconName = iconName;
  }
}

export function setActionButtonVisual(button, iconName, title, label) {
  if (!(button instanceof HTMLElement)) {
    return;
  }

  ensureButtonDefaults(button);

  let icon = button.querySelector(".rui-links-table__action-icon");
  if (
    !(icon instanceof HTMLElement) ||
    icon.tagName.toLowerCase() !== "iconify-icon"
  ) {
    const nextIcon = createIconifyIcon(
      iconName,
      "rui-links-table__action-icon",
    );

    if (icon instanceof HTMLElement) {
      icon.replaceWith(nextIcon);
    } else {
      button.prepend(nextIcon);
    }

    icon = nextIcon;
  } else {
    setIconifyIcon(icon, iconName, "rui-links-table__action-icon");
  }

  button.setAttribute("title", title);
  button.setAttribute("aria-label", title);

  const srLabel = button.querySelector(".rui-sr-only");
  if (srLabel instanceof HTMLElement) {
    srLabel.textContent = label;
  }
}

export function restoreActionButtonVisual(button) {
  if (!(button instanceof HTMLElement)) {
    return;
  }

  const defaultTitle = button.dataset.ruiDefaultTitle ?? "";
  const defaultLabel = button.dataset.ruiDefaultLabel ?? defaultTitle;
  const defaultIcon = button.dataset.ruiDefaultIcon ?? "";
  const defaultIconName = button.dataset.ruiDefaultIconName ?? "";
  const icon = button.querySelector(".rui-links-table__action-icon");
  const srLabel = button.querySelector(".rui-sr-only");

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
      icon.setAttribute("icon", defaultIconName);
    }
  }
}

export function setModeButtons(mode, id) {
  const shareButton = document.querySelector(`#share-button-${id}`);
  const editButton = document.querySelector(`#edit-button-${id}`);
  const deleteButton = document.querySelector(`#delete-button-${id}`);

  if (mode === "edit") {
    setActionButtonVisual(editButton, "mdi:close", "Close edit", "Close");
    restoreActionButtonVisual(shareButton);
    restoreActionButtonVisual(deleteButton);
    return;
  }

  if (mode === "share") {
    setActionButtonVisual(shareButton, "mdi:close", "Close share", "Close");
    restoreActionButtonVisual(editButton);
    restoreActionButtonVisual(deleteButton);
    return;
  }

  if (mode === "delete") {
    setActionButtonVisual(deleteButton, "mdi:close", "Close delete", "Close");
    restoreActionButtonVisual(editButton);
    restoreActionButtonVisual(shareButton);
    return;
  }

  restoreActionButtonVisual(shareButton);
  restoreActionButtonVisual(editButton);
  restoreActionButtonVisual(deleteButton);
}
