import { defineCustomElement } from "vue";

export const RuiDeletePanel = defineCustomElement(
    {
        name: "RuiDeletePanel",
        props: {
            data: { type: Object, required: true },
        },
        emits: ["confirm", "cancel"],
        setup(_props, { emit }) {
            const confirmDelete = (button) => {
                emit("confirm", button);
            };

            const cancelDelete = () => {
                emit("cancel");
            };

            return {
                confirmDelete,
                cancelDelete,
            };
        },
        template: `
            <rui-drawer title="Delete Link">
                <section class="responsive-drawer-content">
                    <rui-drawer-intro
                        icon="warning_amber"
                        title="Review the link details before deleting."
                        meta="Deletion is permanent."
                        variant="error"
                    />
                    <ul class="responsive-drawer-delete-list">
                        <li class="responsive-drawer-delete-item">
                            <div class="responsive-drawer-delete-section">
                                <span class="responsive-drawer-label">Short URL</span>
                                <span class="responsive-drawer-value is-mono">{{ data.shortUrl }}</span>
                            </div>
                        </li>
                        <li class="responsive-drawer-delete-item">
                            <div class="responsive-drawer-delete-section">
                                <span class="responsive-drawer-label">Destination URL</span>
                                <span class="responsive-drawer-value is-mono">{{ data.destinationUrl }}</span>
                            </div>
                        </li>
                        <li class="responsive-drawer-delete-item">
                            <div class="responsive-drawer-delete-section">
                                <span class="responsive-drawer-label">Title</span>
                                <span class="responsive-drawer-value">{{ data.title }}</span>
                            </div>
                        </li>
                    </ul>
                </section>
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-destructive"
                    :icon-name="'delete'"
                    :label="'Delete'"
                    @press="confirmDelete"
                />
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-tonal"
                    :icon-name="'close'"
                    :label="'Cancel'"
                    @press="cancelDelete"
                />
            </rui-drawer>
        `,
    },
    { shadowRoot: false },
);
