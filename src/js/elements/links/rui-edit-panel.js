import { defineCustomElement, ref } from "vue";
import { usePrimaryControlFocus } from "../../composables/usePrimaryControlFocus.js";

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
            const primaryControl = ref(null);
            usePrimaryControlFocus(primaryControl);

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
                primaryControl,
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
                            :field-class-name="'responsive-drawer-field'"
                            :label-text="'Short URL'"
                            :label-class-name="'responsive-drawer-label'"
                            :control-id="\`responsive-drawer-keyword-\${drawerId}\`"
                            :model-value="shortUrl"
                            :aria-label="'Short URL'"
                            :control-ref="primaryControl"
                            @update:model-value="shortUrl = $event"
                        />
                        <rui-text-input-field
                            :field-class-name="'responsive-drawer-field'"
                            :label-text="'Destination URL'"
                            :label-class-name="'responsive-drawer-label'"
                            :control-id="\`responsive-drawer-url-\${drawerId}\`"
                            :model-value="destinationUrl"
                            :aria-label="'Destination URL'"
                            @update:model-value="destinationUrl = $event"
                        />
                        <rui-text-input-field
                            :field-class-name="'responsive-drawer-field'"
                            :label-text="'Title'"
                            :label-class-name="'responsive-drawer-label'"
                            :control-id="\`responsive-drawer-title-input-\${drawerId}\`"
                            :model-value="title"
                            :aria-label="'Title'"
                            @update:model-value="title = $event"
                        />
                    </section>
                </section>
                <template #actions>
                    <rui-action-button
                        :icon-name="'save'"
                        :label="'Save'"
                        :variant-class="'is-primary'"
                        :class-name="'responsive-drawer-button'"
                        @press="saveEdit"
                    />
                    <rui-action-button
                        :icon-name="'close'"
                        :label="'Cancel'"
                        :variant-class="'is-tonal'"
                        :class-name="'responsive-drawer-button'"
                        @press="closeDrawer"
                    />
                </template>
            </rui-drawer>
        `,
    },
    { shadowRoot: false },
);
