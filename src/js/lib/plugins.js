import { createMaterialIcon } from "./shared.js";
import { mountVueFeature } from "./vue-feature.js";

export function initPluginsFilterButton() {
    const toggle = document.querySelector("#toggle_plugins");

    if (
        !(toggle instanceof HTMLElement) ||
        toggle.querySelector(".material-icons")
    ) {
        return;
    }

    mountVueFeature(
        toggle,
        "ResponsivePluginsFilterButtonFeature",
        "responsivePluginsFilterButton",
        () => {
            toggle.textContent = "";
            toggle.setAttribute(
                "aria-label",
                "Toggle active and inactive plugins",
            );

            toggle.append(createMaterialIcon("filter_alt"));
        },
    );
}

export function initPluginActionIcons() {
    const pluginActions = document.querySelector(".plugin_actions");

    if (!(pluginActions instanceof HTMLElement)) {
        return;
    }

    mountVueFeature(
        pluginActions,
        "ResponsivePluginActionIconsFeature",
        "responsivePluginActionIcons",
        () => {
            const pluginButtons = pluginActions.querySelectorAll("a");

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
                    iconName = text.includes("deactivate")
                        ? "power_off"
                        : "power";
                }

                button.prepend(
                    createMaterialIcon(iconName, "responsive-action-icon"),
                );
            });
        },
    );
}
