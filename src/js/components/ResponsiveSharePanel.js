import { defineComponent, ref } from "vue";
import { copyToClipboard, openShareWindow } from "../lib/shared.js";
import { useCopyFeedback } from "../composables/useCopyFeedback.js";
import { usePrimaryControlFocus } from "../composables/usePrimaryControlFocus.js";
import { ResponsiveActionButton } from "./ResponsiveActionButton.js";
import { ResponsiveDrawer } from "./ResponsiveDrawer.js";
import { ResponsiveDrawerIntro } from "./ResponsiveDrawerIntro.js";
import { ResponsiveTextInputField } from "./ResponsiveTextInputField.js";
import { ResponsiveTextareaField } from "./ResponsiveTextareaField.js";

function buildShareMessage(data) {
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const shortUrl =
        typeof data.shortUrl === "string" ? data.shortUrl.trim() : "";

    return `${title ? `${title} ` : ""}${shortUrl}`.trim();
}

export const ResponsiveSharePanel = defineComponent({
    name: "ResponsiveSharePanel",
    components: {
        ResponsiveActionButton,
        ResponsiveDrawer,
        ResponsiveDrawerIntro,
        ResponsiveTextInputField,
        ResponsiveTextareaField,
    },
    props: {
        data: { type: Object, required: true },
    },
    emits: ["close"],
    setup(props, { emit }) {
        const shortUrl = ref(String(props.data.shortUrl ?? ""));
        const message = ref(buildShareMessage(props.data));
        const primaryControl = ref(null);
        const {
            iconName: copyIconName,
            label: copyLabel,
            markCopied,
        } = useCopyFeedback();
        usePrimaryControlFocus(primaryControl);

        const drawerId = String(props.data.id ?? "");

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
            message,
            primaryControl,
            copyIconName,
            copyLabel,
            drawerId,
            closeDrawer,
            copyShortUrl,
            shareOnTwitter,
            shareOnFacebook,
        };
    },
    template: `
        <responsive-drawer title="Share Link">
            <section class="responsive-drawer-content">
                <responsive-drawer-intro
                    icon="share"
                    title="Share this link or copy it to clipboard."
                    meta="Customize the share message before sharing."
                    variant="brand"
                />
                <section
                    class="responsive-drawer-share"
                    :data-id="drawerId"
                >
                    <responsive-text-input-field
                        field-class-name="responsive-drawer-field"
                        label-text="Short URL"
                        label-class-name="responsive-drawer-label"
                        :control-id="\`responsive-drawer-share-shorturl-\${drawerId}\`"
                        :model-value="shortUrl"
                        :read-only="true"
                        aria-label="Short URL to share"
                        :control-ref="primaryControl"
                    />
                    <responsive-textarea-field
                        field-class-name="responsive-drawer-field"
                        label-text="Message"
                        label-class-name="responsive-drawer-label"
                        :control-id="\`responsive-drawer-share-message-\${drawerId}\`"
                        :model-value="message"
                        :rows="3"
                        aria-label="Share message"
                        @update:model-value="message = $event"
                    />
                </section>
            </section>
            <template #actions>
                <responsive-action-button
                    :icon-name="copyIconName"
                    :label="copyLabel"
                    variant-class="is-primary"
                    class-name="responsive-drawer-button"
                    @press="copyShortUrl"
                />
                <responsive-action-button
                    icon-name="fa-x-twitter"
                    icon-library="brand"
                    label="Share on Twitter"
                    variant-class="is-tonal"
                    class-name="responsive-drawer-button"
                    @press="shareOnTwitter"
                />
                <responsive-action-button
                    icon-name="fa-facebook-f"
                    icon-library="brand"
                    label="Share on Facebook"
                    variant-class="is-tonal"
                    class-name="responsive-drawer-button"
                    @press="shareOnFacebook"
                />
                <responsive-action-button
                    icon-name="close"
                    label="Close share mode"
                    variant-class="is-tonal"
                    class-name="responsive-drawer-button"
                    @press="closeDrawer"
                />
            </template>
        </responsive-drawer>
    `,
});
