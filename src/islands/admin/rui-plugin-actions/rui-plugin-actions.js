import { defineCustomElement } from "vue";

import { createIconifyIcon } from "../../lib/shared.js";

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
          toggle.querySelector("iconify-icon")
        ) {
          return;
        }

        toggle.textContent = "";
        toggle.setAttribute("aria-label", "Toggle active and inactive plugins");

        const icon = createIconifyIcon("mdi:filter-variant");
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
            button.querySelector(".rui-links-table__action-icon")
          ) {
            return;
          }

          const text = button.textContent?.trim().toLowerCase() ?? "";
          let iconName = "mdi:cog";

          if (text.includes("activate")) {
            iconName = text.includes("deactivate")
              ? "mdi:power-off"
              : "mdi:power";
          }

          const icon = createIconifyIcon(
            iconName,
            "rui-links-table__action-icon",
          );
          button.prepend(icon);
        });
      },
    },
    template: `<span hidden></span>`,
  },
  { shadowRoot: false },
);
