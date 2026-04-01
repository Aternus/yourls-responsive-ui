import { defineComponent } from "vue";
import { ResponsiveBrandIcon } from "./ResponsiveBrandIcon.js";
import { ResponsiveMaterialIcon } from "./ResponsiveMaterialIcon.js";

export const ResponsiveActionButton = defineComponent({
    name: "ResponsiveActionButton",
    components: {
        ResponsiveBrandIcon,
        ResponsiveMaterialIcon,
    },
    props: {
        dataId: { type: String, default: "" },
        elementId: { type: String, default: "" },
        iconName: { type: String, required: true },
        iconLibrary: { type: String, default: "material" },
        label: { type: String, required: true },
        variantClass: { type: String, required: true },
        className: {
            type: String,
            default: "responsive-inline-editor-button",
        },
    },
    emits: ["press"],
    setup(_props, { emit }) {
        const handleClick = (event) => {
            event.preventDefault();
            emit("press", event.currentTarget);
        };

        return {
            handleClick,
        };
    },
    template: `
        <button
            type="button"
            :class="['button', className, variantClass]"
            :id="elementId || null"
            :data-id="dataId || null"
            :aria-label="label"
            :title="label"
            @click="handleClick"
        >
            <responsive-brand-icon
                v-if="iconLibrary === 'brand'"
                :icon-class="iconName"
                extra-class="responsive-brand-icon"
            />
            <responsive-material-icon
                v-else
                :icon-name="iconName"
            />
        </button>
    `,
});
