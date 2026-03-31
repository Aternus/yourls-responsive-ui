import { createMaterialIcon } from "./shared.js";

export function initPluginsFilterButton() {
    const toggle = document.querySelector("#toggle_plugins");

    if (!toggle || toggle.querySelector(".material-icons")) {
        return;
    }

    toggle.textContent = "";
    toggle.setAttribute("aria-label", "Toggle active and inactive plugins");

    toggle.append(createMaterialIcon("filter_alt"));
}

export function initPluginActionIcons() {
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

        button.prepend(createMaterialIcon(iconName, "responsive-action-icon"));
    });
}
