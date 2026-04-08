import { defineCustomElement } from "vue";

export const RuiDrawerIntro = defineCustomElement(
  {
    name: "RuiDrawerIntro",
    props: {
      icon: { type: String, required: true },
      title: { type: String, required: true },
      meta: { type: String, required: true },
      variant: { type: String, default: "brand" },
    },
    template: /* HTML */ `
      <section :class="['rui-drawer__intro', 'is-' + variant]">
        <iconify-icon
          :icon="icon"
          class="rui-drawer__intro-icon"
          aria-hidden="true"
        ></iconify-icon>
        <p class="rui-drawer__intro-title">{{ title }}</p>
        <p class="rui-drawer__intro-meta">{{ meta }}</p>
      </section>
    `,
  },
  { shadowRoot: false },
);
