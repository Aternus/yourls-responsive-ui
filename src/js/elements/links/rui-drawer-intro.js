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
            <section :class="['responsive-drawer-intro', 'is-' + variant]">
                <span class="material-icons responsive-drawer-intro-icon" aria-hidden="true">{{ icon }}</span>
                <p class="responsive-drawer-intro-title">{{ title }}</p>
                <p class="responsive-drawer-intro-meta">{{ meta }}</p>
            </section>
        `,
    },
    { shadowRoot: false },
);
