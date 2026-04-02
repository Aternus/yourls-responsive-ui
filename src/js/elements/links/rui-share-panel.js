import { defineCustomElement, ref } from "vue";
import { copyToClipboard, openShareWindow } from "../../lib/shared.js";
import { useCopyFeedback } from "../../composables/useCopyFeedback.js";

function buildShareMessage(data) {
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const shortUrl =
        typeof data.shortUrl === "string" ? data.shortUrl.trim() : "";

    return `${title ? `${title} ` : ""}${shortUrl}`.trim();
}

export const RuiSharePanel = defineCustomElement(
    {
        name: "RuiSharePanel",
        props: {
            data: { type: Object, required: true },
        },
        emits: ["close"],
        setup(props, { emit }) {
            const shortUrl = ref(String(props.data.shortUrl ?? ""));
            const message = ref(buildShareMessage(props.data));
            const {
                iconName: copyIconName,
                label: copyLabel,
                markCopied,
            } = useCopyFeedback();

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
            <rui-drawer title="Share Link">
                <section class="responsive-drawer-content">
                    <rui-drawer-intro
                        icon="share"
                        title="Share this link or copy it to clipboard."
                        meta="Customize the share message before sharing."
                        variant="brand"
                    />
                    <section
                        class="responsive-drawer-share"
                        :data-id="drawerId"
                    >
                        <rui-text-input-field
                            class="responsive-drawer-field"
                            :label-text="'Short URL'"
                            :control-id="'responsive-drawer-share-shorturl-' + drawerId"
                            :model-value="shortUrl"
                            :control-class="'responsive-url-value'"
                            :read-only="true"
                            :aria-label="'Short URL to share'"
                        />
                        <rui-textarea-field
                            class="responsive-drawer-field"
                            :label-text="'Message'"
                            :control-id="'responsive-drawer-share-message-' + drawerId"
                            :model-value="message"
                            :rows="3"
                            :auto-focus="true"
                            :aria-label="'Share message'"
                            @update:model-value="message = $event"
                        />
                    </section>
                </section>
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-primary"
                    :icon-name="copyIconName"
                    :label="copyLabel"
                    @press="copyShortUrl"
                />
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-tonal"
                    :icon-name="'fa-x-twitter'"
                    :icon-library="'brand'"
                    :label="'Share on Twitter'"
                    @press="shareOnTwitter"
                />
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-tonal"
                    :icon-name="'fa-facebook-f'"
                    :icon-library="'brand'"
                    :label="'Share on Facebook'"
                    @press="shareOnFacebook"
                />
                <rui-action-button
                    slot="actions"
                    class="responsive-drawer-button is-tonal"
                    :icon-name="'close'"
                    :label="'Close share mode'"
                    @press="closeDrawer"
                />
            </rui-drawer>
        `,
    },
    { shadowRoot: false },
);
