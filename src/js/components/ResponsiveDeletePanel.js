import { defineComponent } from "vue";
import { ResponsiveActionButton } from "./ResponsiveActionButton.js";
import { ResponsiveDrawer } from "./ResponsiveDrawer.js";
import { ResponsiveDrawerIntro } from "./ResponsiveDrawerIntro.js";

export const ResponsiveDeletePanel = defineComponent({
    name: "ResponsiveDeletePanel",
    components: {
        ResponsiveActionButton,
        ResponsiveDrawer,
        ResponsiveDrawerIntro,
    },
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
        <responsive-drawer title="Delete Link">
            <section class="responsive-drawer-content">
                <responsive-drawer-intro
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
            <template #actions>
                <responsive-action-button
                    icon-name="delete"
                    label="Delete"
                    variant-class="is-destructive"
                    class-name="responsive-drawer-button"
                    @press="confirmDelete"
                />
                <responsive-action-button
                    icon-name="close"
                    label="Cancel"
                    variant-class="is-tonal"
                    class-name="responsive-drawer-button"
                    @press="cancelDelete"
                />
            </template>
        </responsive-drawer>
    `,
});
