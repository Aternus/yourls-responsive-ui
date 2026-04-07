import { defineCustomElement } from "vue";

export const RuiDrawer = defineCustomElement(
  {
    name: "RuiDrawer",
    props: {
      title: { type: String, required: true },
    },
    template: `
            <div class="rui-drawer__titlebar">
                <div class="rui-drawer__heading">
                    <div class="rui-drawer__heading-text">
                        <span class="rui-drawer__heading-title">{{ title }}</span>
                    </div>
                </div>
            </div>
            <div class="confirm-message rui-drawer__body">
                <slot />
            </div>
            <div class="button-group rui-drawer__actions rui-drawer__footer">
                <slot name="actions" />
            </div>
        `,
  },
  { shadowRoot: false },
);
