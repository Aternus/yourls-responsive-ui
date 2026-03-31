import { defineComponent } from "vue";

export const ResponsiveBrandIcon = defineComponent({
    name: "ResponsiveBrandIcon",
    props: {
        iconClass: { type: String, required: true },
        extraClass: { type: String, default: "" },
    },
    template: `
        <span :class="['fa-brands', iconClass, extraClass]" aria-hidden="true"></span>
    `,
});
