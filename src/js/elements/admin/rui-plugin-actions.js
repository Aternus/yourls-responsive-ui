import { defineCustomElement } from "vue";

export const RuiPluginActions = defineCustomElement(
    {
        name: "RuiPluginActions",
        setup() {
            return {};
        },
        mounted() {
            this.enhanceToggleButton();
            this.enhanceActionLinks();
        },
        methods: {
            enhanceToggleButton() {
                const toggle = document.querySelector("#toggle_plugins");

                if (
                    !(toggle instanceof HTMLElement) ||
                    toggle.querySelector(".material-icons")
                ) {
                    return;
                }

                toggle.textContent = "";
                toggle.setAttribute(
                    "aria-label",
                    "Toggle active and inactive plugins",
                );

                const icon = document.createElement("rui-material-icon");
                icon.setAttribute("name", "filter_alt");
                toggle.append(icon);
            },
            enhanceActionLinks() {
                const pluginActions = document.querySelector(".plugin_actions");

                if (!(pluginActions instanceof HTMLElement)) {
                    return;
                }

                pluginActions.querySelectorAll("a").forEach((button) => {
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

                    const icon = document.createElement("rui-material-icon");
                    icon.setAttribute("name", iconName);
                    icon.setAttribute("class", "responsive-action-icon");
                    button.prepend(icon);
                });
            },
        },
        template: `<span hidden></span>`,
    },
    { shadowRoot: false },
);
