import { computed, defineComponent, ref } from "vue";
import { usePrimaryControlFocus } from "../composables/usePrimaryControlFocus.js";
import { ResponsiveActionButton } from "./ResponsiveActionButton.js";
import { ResponsiveTextInputField } from "./ResponsiveTextInputField.js";

export const ResponsiveInlineEditCard = defineComponent({
    name: "ResponsiveInlineEditCard",
    components: {
        ResponsiveActionButton,
        ResponsiveTextInputField,
    },
    props: {
        id: { type: String, required: true },
        initialShortUrl: { type: String, required: true },
        initialDestinationUrl: { type: String, required: true },
        initialTitle: { type: String, required: true },
        keyword: { type: String, required: true },
        nonce: { type: String, required: true },
        actionsTarget: { type: String, default: "" },
    },
    emits: ["cancel", "save"],
    setup(props, { emit }) {
        const shortUrl = ref(props.initialShortUrl);
        const destinationUrl = ref(props.initialDestinationUrl);
        const title = ref(props.initialTitle);
        const primaryControl = ref(null);
        const hasActionsTarget = computed(() => props.actionsTarget !== "");
        usePrimaryControlFocus(primaryControl);

        const handleSave = (button) => {
            emit(
                "save",
                {
                    id: props.id,
                    keyword: props.keyword,
                    nonce: props.nonce,
                    shortUrl: shortUrl.value,
                    destinationUrl: destinationUrl.value,
                    title: title.value,
                },
                button,
            );
        };

        const cancelEdit = () => {
            emit("cancel", props.id);
        };

        return {
            shortUrl,
            destinationUrl,
            title,
            primaryControl,
            hasActionsTarget,
            handleSave,
            cancelEdit,
        };
    },
    template: `
        <p class="responsive-inline-editor-title">Edit Link</p>
        <responsive-text-input-field
            field-class-name="responsive-inline-editor-field"
            label-class-name="responsive-inline-editor-label"
            label-text="Short URL"
            :control-id="\`responsive-inline-keyword-\${id}\`"
            :model-value="shortUrl"
            aria-label="Short URL"
            :control-ref="primaryControl"
            @update:model-value="shortUrl = $event"
        />
        <responsive-text-input-field
            field-class-name="responsive-inline-editor-field"
            label-class-name="responsive-inline-editor-label"
            label-text="Destination URL"
            :control-id="\`responsive-inline-url-\${id}\`"
            :model-value="destinationUrl"
            placeholder="Destination URL"
            aria-label="Destination URL"
            @update:model-value="destinationUrl = $event"
        />
        <responsive-text-input-field
            field-class-name="responsive-inline-editor-field"
            label-class-name="responsive-inline-editor-label"
            label-text="Title"
            :control-id="\`responsive-inline-title-\${id}\`"
            :model-value="title"
            placeholder="Title"
            aria-label="Title"
            @update:model-value="title = $event"
        />

        <teleport v-if="hasActionsTarget" :to="actionsTarget">
            <div class="responsive-inline-editor-strip-actions">
                <responsive-action-button
                    :data-id="id"
                    icon-name="save"
                    label="Save"
                    variant-class="is-primary"
                    @press="handleSave"
                />
                <responsive-action-button
                    :data-id="id"
                    icon-name="close"
                    label="Cancel"
                    variant-class="is-tonal"
                    @press="cancelEdit"
                />
            </div>
        </teleport>
        <div v-else class="responsive-inline-editor-actions">
            <responsive-action-button
                :data-id="id"
                icon-name="save"
                label="Save"
                variant-class="is-primary"
                @press="handleSave"
            />
            <responsive-action-button
                :data-id="id"
                icon-name="close"
                label="Cancel"
                variant-class="is-tonal"
                @press="cancelEdit"
            />
        </div>
    `,
});
