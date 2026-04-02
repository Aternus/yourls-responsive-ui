import { defineCustomElement } from "vue";

export const RuiField = defineCustomElement(
    {
        name: "RuiField",
        props: {
            className: { type: String, required: true },
            labelText: { type: String, required: true },
            labelClass: { type: String, required: true },
            controlId: { type: String, default: "" },
        },
        template: `
            <div :class="className">
                <label :class="labelClass" :for="controlId || null">{{ labelText }}</label>
                <slot />
            </div>
        `,
    },
    { shadowRoot: false },
);
