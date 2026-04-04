import { defineCustomElement, onMounted, ref } from "vue";

export const RuiExpandableTitle = defineCustomElement(
    {
        name: "RuiExpandableTitle",
        props: {
            title: { type: String, default: "" },
        },
        setup(props) {
            const isExpanded = ref(false);
            const root = ref(null);

            const collapseOthers = () => {
                const table = root.value?.closest("table");
                if (!table) {
                    return;
                }

                table
                    .querySelectorAll(
                        "rui-expandable-title .rui-links-table__title.is-expanded",
                    )
                    .forEach((node) => {
                        if (node !== root.value) {
                            node.classList.remove("is-expanded");
                        }
                    });
            };

            const toggle = () => {
                collapseOthers();
                isExpanded.value = !isExpanded.value;
            };

            const handleKeydown = (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggle();
                }
            };

            onMounted(() => {
                root.value?.setAttribute("tabindex", "0");
            });

            return {
                isExpanded,
                root,
                toggle,
                handleKeydown,
            };
        },
        template: `
            <span
                ref="root"
                class="rui-links-table__title"
                :class="{ 'is-expanded': isExpanded }"
                :title="title"
                role="button"
                @click="toggle"
                @keydown="handleKeydown"
            ><slot /></span>
        `,
    },
    { shadowRoot: false },
);
