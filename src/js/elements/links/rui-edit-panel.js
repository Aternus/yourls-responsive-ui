import { defineCustomElement, ref } from "vue";

export const RuiEditPanel = defineCustomElement(
    {
        name: "RuiEditPanel",
        props: {
            data: { type: Object, required: true },
        },
        emits: ["save-edit", "close"],
        setup(props, { emit }) {
            const shortUrl = ref(String(props.data.shortUrl ?? ""));
            const destinationUrl = ref(String(props.data.destinationUrl ?? ""));
            const title = ref(String(props.data.title ?? ""));

            const drawerId = String(props.data.id ?? "");

            const closeDrawer = () => {
                emit("close");
            };

            const saveEdit = (button) => {
                emit(
                    "save-edit",
                    {
                        id: String(props.data.id ?? ""),
                        keyword: String(props.data.keyword ?? ""),
                        nonce: String(props.data.nonce ?? ""),
                        shortUrl: shortUrl.value,
                        destinationUrl: destinationUrl.value,
                        title: title.value,
                    },
                    button,
                );
            };

            return {
                shortUrl,
                destinationUrl,
                title,
                drawerId,
                closeDrawer,
                saveEdit,
            };
        },
        template: `
            <rui-drawer title="Edit Link">
                <section class="responsive-drawer-content">
                    <rui-drawer-intro
                        icon="edit"
                        title="Edit the link details below."
                        meta="Changes are saved when you press Save."
                        variant="brand"
                    />
                    <section
                        class="responsive-drawer-editor"
                        :data-id="drawerId"
                    >
                        <rui-text-input-field
                            class="responsive-drawer-field"
                            :label-text="'Short URL'"
                            :control-id="'responsive-drawer-keyword-' + drawerId"
                            :model-value="shortUrl"
                            :auto-focus="true"
                            :aria-label="'Short URL'"
                            @update:model-value="shortUrl = $event"
                        />
                        <rui-text-input-field
                            class="responsive-drawer-field"
                            :label-text="'Destination URL'"
                            :control-id="'responsive-drawer-url-' + drawerId"
                            :model-value="destinationUrl"
                            :aria-label="'Destination URL'"
                            @update:model-value="destinationUrl = $event"
                        />
                        <rui-text-input-field
                            class="responsive-drawer-field"
                            :label-text="'Title'"
                            :control-id="'responsive-drawer-title-input-' + drawerId"
                            :model-value="title"
                            :aria-label="'Title'"
                            @update:model-value="title = $event"
                        />
                    </section>
                </section>
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-primary"
                    :icon-name="'save'"
                    :label="'Save'"
                    @press="saveEdit"
                />
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-tonal"
                    :icon-name="'close'"
                    :label="'Cancel'"
                    @press="closeDrawer"
                />
            </rui-drawer>
        `,
    },
    { shadowRoot: false },
);
