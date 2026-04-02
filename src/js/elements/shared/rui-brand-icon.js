import { defineCustomElement } from "vue";

export const RuiBrandIcon = defineCustomElement(
    {
        name: "RuiBrandIcon",
        props: {
            name: { type: String, default: "" },
        },
        template: `
            <span :class="['fa-brands', name, $attrs.class]" aria-hidden="true"></span>
        `,
    },
    { shadowRoot: false },
);
