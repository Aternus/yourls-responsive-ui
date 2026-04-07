import { defineCustomElement } from "vue";

export const RuiActionButton = defineCustomElement(
  {
    name: "RuiActionButton",
    props: {
      dataId: { type: String, default: "" },
      elementId: { type: String, default: "" },
      iconName: { type: String, required: true },
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
                <iconify-icon
                    :icon="iconName"
                    aria-hidden="true"
                ></iconify-icon>
            </button>
        `,
  },
  { shadowRoot: false },
);
