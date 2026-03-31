import { computed, defineComponent, ref } from "vue";
import { copyToClipboard, openShareWindow } from "../shared.js";
import { useCopyFeedback } from "../composables/useCopyFeedback.js";
import { usePrimaryControlFocus } from "../composables/usePrimaryControlFocus.js";
import { ResponsiveActionButton } from "./ResponsiveActionButton.js";
import { ResponsiveTextInputField } from "./ResponsiveTextInputField.js";
import { ResponsiveTextareaField } from "./ResponsiveTextareaField.js";

function buildShareMessage(title, shortUrl) {
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedShortUrl =
        typeof shortUrl === "string" ? shortUrl.trim() : "";

    return `${normalizedTitle ? `${normalizedTitle} ` : ""}${normalizedShortUrl}`.trim();
}

export const ResponsiveInlineShareCard = defineComponent({
    name: "ResponsiveInlineShareCard",
    components: {
        ResponsiveActionButton,
        ResponsiveTextInputField,
        ResponsiveTextareaField,
    },
    props: {
        id: { type: String, required: true },
        shortUrl: { type: String, required: true },
        destinationUrl: { type: String, required: true },
        title: { type: String, required: true },
        actionsTarget: { type: String, default: "" },
    },
    emits: ["close"],
    setup(props, { emit }) {
        const shortUrl = ref(props.shortUrl);
        const message = ref(buildShareMessage(props.title, props.shortUrl));
        const primaryControl = ref(null);
        const hasActionsTarget = computed(() => props.actionsTarget !== "");
        const {
            iconName: copyIconName,
            label: copyLabel,
            markCopied,
        } = useCopyFeedback();
        usePrimaryControlFocus(primaryControl);

        const copyShortUrl = async () => {
            const copied = await copyToClipboard(shortUrl.value);
            if (!copied) {
                return;
            }

            markCopied();
        };

        const shareOnTwitter = () => {
            openShareWindow(
                "tw",
                message.value.trim(),
                shortUrl.value.trim(),
                props.destinationUrl,
            );
        };

        const shareOnFacebook = () => {
            openShareWindow(
                "fb",
                message.value.trim(),
                shortUrl.value.trim(),
                props.destinationUrl,
            );
        };

        const closeShare = () => {
            emit("close");
        };

        return {
            shortUrl,
            message,
            primaryControl,
            hasActionsTarget,
            copyIconName,
            copyLabel,
            copyShortUrl,
            shareOnTwitter,
            shareOnFacebook,
            closeShare,
        };
    },
    template: `
        <p class="responsive-inline-share-title">Share Link</p>
        <responsive-text-input-field
            field-class-name="responsive-inline-share-field"
            label-class-name="responsive-inline-share-label"
            label-text="Short URL"
            :control-id="\`responsive-inline-share-shorturl-\${id}\`"
            :model-value="shortUrl"
            :read-only="true"
            aria-label="Short URL to share"
            :control-ref="primaryControl"
        />
        <responsive-textarea-field
            field-class-name="responsive-inline-share-field"
            label-class-name="responsive-inline-share-label"
            label-text="Message"
            :control-id="\`responsive-inline-share-message-\${id}\`"
            :model-value="message"
            :rows="3"
            aria-label="Share message"
            @update:model-value="message = $event"
        />

        <teleport v-if="hasActionsTarget" :to="actionsTarget">
            <div class="responsive-inline-share-strip-actions">
                <responsive-action-button
                    :data-id="id"
                    :icon-name="copyIconName"
                    :label="copyLabel"
                    variant-class="is-primary"
                    @press="copyShortUrl"
                />
                <responsive-action-button
                    :data-id="id"
                    icon-name="fa-x-twitter"
                    icon-library="brand"
                    label="Share on Twitter"
                    variant-class="is-tonal"
                    @press="shareOnTwitter"
                />
                <responsive-action-button
                    :data-id="id"
                    icon-name="fa-facebook-f"
                    icon-library="brand"
                    label="Share on Facebook"
                    variant-class="is-tonal"
                    @press="shareOnFacebook"
                />
                <responsive-action-button
                    :data-id="id"
                    icon-name="close"
                    label="Close share mode"
                    variant-class="is-tonal"
                    @press="closeShare"
                />
            </div>
        </teleport>
        <div v-else class="responsive-inline-editor-actions">
            <responsive-action-button
                :data-id="id"
                :icon-name="copyIconName"
                :label="copyLabel"
                variant-class="is-primary"
                @press="copyShortUrl"
            />
            <responsive-action-button
                :data-id="id"
                icon-name="fa-x-twitter"
                icon-library="brand"
                label="Share on Twitter"
                variant-class="is-tonal"
                @press="shareOnTwitter"
            />
            <responsive-action-button
                :data-id="id"
                icon-name="fa-facebook-f"
                icon-library="brand"
                label="Share on Facebook"
                variant-class="is-tonal"
                @press="shareOnFacebook"
            />
            <responsive-action-button
                :data-id="id"
                icon-name="close"
                label="Close share mode"
                variant-class="is-tonal"
                @press="closeShare"
            />
        </div>
    `,
});
