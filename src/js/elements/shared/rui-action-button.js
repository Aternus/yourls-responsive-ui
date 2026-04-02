import { defineCustomElement } from "vue";

export const RuiActionButton = defineCustomElement(
    {
        name: "RuiActionButton",
        props: {
            dataId: { type: String, default: "" },
            elementId: { type: String, default: "" },
            iconName: { type: String, required: true },
            iconLibrary: { type: String, default: "material" },
            label: { type: String, required: true },
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
                class="button"
                :id="elementId || null"
                :data-id="dataId || null"
                :aria-label="label"
                :title="label"
                @click="handleClick"
            >
                <rui-brand-icon
                    v-if="iconLibrary === 'brand'"
                    :name="iconName"
                    class="responsive-brand-icon"
                />
                <rui-material-icon
                    v-else
                    :name="iconName"
                />
            </button>
        `,
    },
    { shadowRoot: false },
);
