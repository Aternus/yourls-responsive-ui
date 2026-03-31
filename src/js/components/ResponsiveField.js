import { defineComponent } from "vue";

export const ResponsiveField = defineComponent({
    name: "ResponsiveField",
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
});
