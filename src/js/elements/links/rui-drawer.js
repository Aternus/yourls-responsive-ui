import { defineCustomElement } from "vue";

export const RuiDrawer = defineCustomElement(
    {
        name: "RuiDrawer",
        props: {
            title: { type: String, required: true },
        },
        template: `
            <div name="dialog_title">
                <div class="responsive-drawer-heading">
                    <div class="responsive-drawer-heading-text">
                        <span class="responsive-drawer-heading-title">{{ title }}</span>
                    </div>
                </div>
            </div>
            <div class="confirm-message">
                <slot />
            </div>
            <div class="button-group responsive-drawer-actions">
                <slot name="actions" />
            </div>
        `,
    },
    { shadowRoot: false },
);
