import { computed, defineComponent, ref } from "vue";
import { copyToClipboard, openShareWindow } from "../lib/shared.js";
import { useCopyFeedback } from "../composables/useCopyFeedback.js";
import { usePrimaryControlFocus } from "../composables/usePrimaryControlFocus.js";
import { ResponsiveActionButton } from "./ResponsiveActionButton.js";
import { ResponsiveTextInputField } from "./ResponsiveTextInputField.js";
import { ResponsiveTextareaField } from "./ResponsiveTextareaField.js";

function buildShareMessage(data) {
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const shortUrl =
        typeof data.shortUrl === "string" ? data.shortUrl.trim() : "";

    return `${title ? `${title} ` : ""}${shortUrl}`.trim();
}

export const ResponsiveDesktopDrawerPanel = defineComponent({
    name: "ResponsiveDesktopDrawerPanel",
    components: {
        ResponsiveActionButton,
        ResponsiveTextInputField,
        ResponsiveTextareaField,
    },
    props: {
        mode: { type: String, required: true },
        data: { type: Object, required: true },
    },
    emits: ["close", "saveEdit"],
    setup(props, { emit }) {
        const shortUrl = ref(String(props.data.shortUrl ?? ""));
        const destinationUrl = ref(String(props.data.destinationUrl ?? ""));
        const title = ref(String(props.data.title ?? ""));
        const message = ref(buildShareMessage(props.data));
        const primaryControl = ref(null);
        const {
            iconName: copyIconName,
            label: copyLabel,
            markCopied,
        } = useCopyFeedback();
        usePrimaryControlFocus(primaryControl);

        const closeDrawer = () => {
            emit("close");
        };

        const copyShortUrl = async () => {
            const copied = await copyToClipboard(shortUrl.value);
            if (!copied) {
                return;
            }

            markCopied();
        };

        const saveEdit = (button) => {
            emit(
                "saveEdit",
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

        const drawerId = String(props.data.id ?? "");

        const isEditMode = computed(() => props.mode === "edit");

        const shareOnTwitter = () => {
            openShareWindow(
                "tw",
                message.value.trim(),
                shortUrl.value.trim(),
                String(props.data.destinationUrl ?? ""),
            );
        };

        const shareOnFacebook = () => {
            openShareWindow(
                "fb",
                message.value.trim(),
                shortUrl.value.trim(),
                String(props.data.destinationUrl ?? ""),
            );
        };

        return {
            shortUrl,
            destinationUrl,
            title,
            message,
            primaryControl,
            copyIconName,
            copyLabel,
            copyShortUrl,
            closeDrawer,
            saveEdit,
            drawerId,
            isEditMode,
            shareOnTwitter,
            shareOnFacebook,
        };
    },
    template: `
        <div name="dialog_title" id="responsive-row-drawer-title">
            {{ isEditMode ? 'Edit Link' : 'Share Link' }}
        </div>
        <div class="confirm-message">
            <section class="responsive-row-drawer-content">
                <section
                    v-if="isEditMode"
                    class="responsive-inline-editor responsive-drawer-editor"
                    :data-id="drawerId"
                >
                    <p class="responsive-inline-editor-title">Edit mode</p>
                    <responsive-text-input-field
                        field-class-name="responsive-inline-editor-field"
                        label-text="Short URL"
                        label-class-name="responsive-inline-editor-label"
                        :control-id="\`responsive-drawer-keyword-\${drawerId}\`"
                        :model-value="shortUrl"
                        aria-label="Short URL"
                        :control-ref="primaryControl"
                        @update:model-value="shortUrl = $event"
                    />
                    <responsive-text-input-field
                        field-class-name="responsive-inline-editor-field"
                        label-text="Destination URL"
                        label-class-name="responsive-inline-editor-label"
                        :control-id="\`responsive-drawer-url-\${drawerId}\`"
                        :model-value="destinationUrl"
                        aria-label="Destination URL"
                        @update:model-value="destinationUrl = $event"
                    />
                    <responsive-text-input-field
                        field-class-name="responsive-inline-editor-field"
                        label-text="Title"
                        label-class-name="responsive-inline-editor-label"
                        :control-id="\`responsive-drawer-title-input-\${drawerId}\`"
                        :model-value="title"
                        aria-label="Title"
                        @update:model-value="title = $event"
                    />
                </section>
                <section
                    v-else
                    class="responsive-inline-share responsive-drawer-share"
                    :data-id="drawerId"
                >
                    <p class="responsive-inline-share-title">Share mode</p>
                    <responsive-text-input-field
                        field-class-name="responsive-inline-share-field"
                        label-text="Short URL"
                        label-class-name="responsive-inline-share-label"
                        :control-id="\`responsive-drawer-share-shorturl-\${drawerId}\`"
                        :model-value="shortUrl"
                        :read-only="true"
                        aria-label="Short URL to share"
                        :control-ref="primaryControl"
                    />
                    <responsive-textarea-field
                        field-class-name="responsive-inline-share-field"
                        label-text="Message"
                        label-class-name="responsive-inline-share-label"
                        :control-id="\`responsive-drawer-share-message-\${drawerId}\`"
                        :model-value="message"
                        :rows="3"
                        aria-label="Share message"
                        @update:model-value="message = $event"
                    />
                </section>
            </section>
        </div>
        <div class="button-group responsive-row-drawer-actions">
            <responsive-action-button
                v-if="isEditMode"
                icon-name="save"
                label="Save"
                variant-class="is-primary"
                class-name="responsive-drawer-button"
                @press="saveEdit"
            />
            <responsive-action-button
                v-else
                :icon-name="copyIconName"
                :label="copyLabel"
                variant-class="is-primary"
                class-name="responsive-drawer-button"
                @press="copyShortUrl"
            />
            <responsive-action-button
                v-if="isEditMode"
                icon-name="close"
                label="Cancel"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="closeDrawer"
            />
            <responsive-action-button
                v-else
                icon-name="fa-x-twitter"
                icon-library="brand"
                label="Share on Twitter"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="shareOnTwitter"
            />
            <responsive-action-button
                v-if="!isEditMode"
                icon-name="fa-facebook-f"
                icon-library="brand"
                label="Share on Facebook"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="shareOnFacebook"
            />
            <responsive-action-button
                v-if="!isEditMode"
                icon-name="close"
                label="Close share mode"
                variant-class="is-tonal"
                class-name="responsive-drawer-button"
                @press="closeDrawer"
            />
        </div>
    `,
});
