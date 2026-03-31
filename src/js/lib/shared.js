//=== Shared Utilities ===//

export const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
export const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

export function createMaterialIcon(iconName, extraClass = "") {
    const icon = document.createElement("span");
    icon.className = `material-icons${extraClass ? ` ${extraClass}` : ""}`;
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = iconName;
    return icon;
}

export function setMaterialIcon(icon, iconName, extraClass = "") {
    if (!(icon instanceof HTMLElement)) {
        return;
    }

    icon.className = `material-icons${extraClass ? ` ${extraClass}` : ""}`;
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = iconName;
}

export function createBrandIcon(iconClass, extraClass = "") {
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

export async function copyToClipboard(value) {
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

export function replaceRowFromHtml(id, rowHtml) {
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

export function makeField(className, labelText, control) {
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

export function createActionButton({
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
