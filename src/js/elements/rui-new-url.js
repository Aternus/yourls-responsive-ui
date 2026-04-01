import { defineCustomElement, onMounted, ref } from "vue";

function moveField(slot, control) {
    if (!(slot instanceof HTMLElement) || !(control instanceof Element)) {
        return;
    }

    slot.append(control);
}

export const RuiNewUrl = defineCustomElement(
    {
        name: "RuiNewUrl",
        setup() {
            const formSlot = ref(null);
            const feedbackSlot = ref(null);
            const ready = ref(false);

            onMounted(() => {
                const container = document.querySelector("#new_url");
                const form = container?.querySelector("#new_url_form");
                const feedback = container?.querySelector("#feedback");

                if (
                    !(container instanceof HTMLElement) ||
                    !(form instanceof HTMLFormElement) ||
                    !(feedback instanceof HTMLElement) ||
                    container.dataset.responsiveNewUrlEnhanced === "true"
                ) {
                    return;
                }

                const host = container.querySelector("rui-new-url");
                if (
                    host instanceof HTMLElement &&
                    container.firstElementChild !== host
                ) {
                    container.insertBefore(host, container.firstElementChild);
                }

                const legacyWrapper = form.parentElement;
                ready.value = true;
                container.dataset.responsiveNewUrlEnhanced = "true";

                requestAnimationFrame(() => {
                    moveField(formSlot.value, form);
                    moveField(feedbackSlot.value, feedback);

                    if (
                        legacyWrapper instanceof HTMLElement &&
                        legacyWrapper.childElementCount === 0
                    ) {
                        legacyWrapper.remove();
                    }
                });
            });

            return {
                formSlot,
                feedbackSlot,
                ready,
            };
        },
        template: `
            <section v-if="ready" class="responsive-new-url-surface">
                <div ref="formSlot"></div>
                <div ref="feedbackSlot"></div>
            </section>
        `,
    },
    { shadowRoot: false },
);
