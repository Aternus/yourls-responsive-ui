import {
    ResponsiveActionButton,
    ResponsiveBrandIcon,
    ResponsiveField,
    ResponsiveMaterialIcon,
    renderVueElement,
} from "./shared-vue.js";

//=== Shared Utilities ===//

export const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
export const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

function requireElement(element, label) {
    if (element instanceof HTMLElement) {
        return element;
    }

    throw new Error(`${label} must render a single HTMLElement root`);
}

function requireButton(element, label) {
    const resolved = requireElement(element, label);
    if (resolved instanceof HTMLButtonElement) {
        return resolved;
    }

    throw new Error(`${label} must render a HTMLButtonElement root`);
}

export function createMaterialIcon(iconName, extraClass = "") {
    return requireElement(
        renderVueElement(ResponsiveMaterialIcon, {
            iconName,
            extraClass,
        }),
        "ResponsiveMaterialIcon",
    );
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
    return requireElement(
        renderVueElement(ResponsiveBrandIcon, {
            iconClass,
            extraClass,
        }),
        "ResponsiveBrandIcon",
    );
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
    const labelClass = className.includes("share")
        ? "responsive-inline-share-label"
        : "responsive-inline-editor-label";

    const field = requireElement(
        renderVueElement(ResponsiveField, {
            className,
            labelText,
            labelClass,
            controlId: control.id,
        }),
        "ResponsiveField",
    );

    field.append(control);
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
    const button = requireButton(
        renderVueElement(ResponsiveActionButton, {
            dataId: id !== undefined ? String(id) : "",
            elementId: source?.id ?? "",
            iconName,
            iconLibrary,
            label,
            variantClass,
            className,
            onPress: (targetButton) => onClick(targetButton),
        }),
        "ResponsiveActionButton",
    );

    if (source) {
        source.remove();
    }
    return button;
}
