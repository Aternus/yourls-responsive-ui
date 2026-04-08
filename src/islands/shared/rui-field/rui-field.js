import { defineCustomElement } from "vue";

export const RuiField = defineCustomElement(
  {
    name: "RuiField",
    props: {
      labelText: { type: String, required: true },
      controlId: { type: String, default: "" },
    },
    template: /* HTML */ `
      <div>
        <label class="rui-field-label" :for="controlId || null"
          >{{ labelText }}</label
        >
        <slot />
      </div>
    `,
  },
  { shadowRoot: false },
);
