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
        template: `
            <section :class="['rui-drawer__intro', 'is-' + variant]">
                <span class="material-icons rui-drawer__intro-icon" aria-hidden="true">{{ icon }}</span>
                <p class="rui-drawer__intro-title">{{ title }}</p>
                <p class="rui-drawer__intro-meta">{{ meta }}</p>
            </section>
        `,
    },
    { shadowRoot: false },
);
