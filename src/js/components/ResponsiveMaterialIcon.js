import { defineComponent } from "vue";

export const ResponsiveMaterialIcon = defineComponent({
    name: "ResponsiveMaterialIcon",
    props: {
        iconName: { type: String, required: true },
        extraClass: { type: String, default: "" },
    },
    template: `
        <span :class="['material-icons', extraClass]" aria-hidden="true">{{ iconName }}</span>
    `,
});
