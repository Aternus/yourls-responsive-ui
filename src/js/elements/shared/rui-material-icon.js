import { defineCustomElement } from "vue";

export const RuiMaterialIcon = defineCustomElement(
  {
    name: "RuiMaterialIcon",
    props: {
      name: { type: String, default: "" },
    },
    template: `
            <span :class="['material-icons', $attrs.class]" aria-hidden="true">{{ name }}</span>
        `,
  },
  { shadowRoot: false },
);
