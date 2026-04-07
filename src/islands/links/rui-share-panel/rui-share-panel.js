import { defineCustomElement, ref } from "vue";

import { useCopyFeedback } from "../../composables/useCopyFeedback.js";
import { copyToClipboard, openShareWindow } from "../../lib/shared.js";

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
                <section class="rui-drawer__content">
                    <rui-drawer-intro
                        icon="mdi:share-variant"
                        title="Share this link or copy it to clipboard."
                        meta="Customize the share message before sharing."
                        variant="brand"
                    />
                    <section
                        class="rui-drawer__share"
                        :data-id="drawerId"
                    >
                        <rui-text-input-field
                            class="rui-drawer__field"
                            :label-text="'Short URL'"
                            :control-id="'rui-drawer-share-shorturl-' + drawerId"
                            :model-value="shortUrl"
                            :control-class="'rui-url-value'"
                            :read-only="true"
                            :aria-label="'Short URL to share'"
                        />
                        <rui-textarea-field
                            class="rui-drawer__field"
                            :label-text="'Message'"
                            :control-id="'rui-drawer-share-message-' + drawerId"
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
                    class="rui-drawer__button rui-drawer__button--primary"
                    :icon-name="copyIconName"
                    :label="copyLabel"
                    @press="copyShortUrl"
                />
                <rui-action-button
                    slot="actions"
                    class="rui-drawer__button rui-drawer__button--tonal"
                    :icon-name="'mdi:twitter'"
                    :label="'Share on Twitter'"
                    @press="shareOnTwitter"
                />
                <rui-action-button
                    slot="actions"
                    class="rui-drawer__button rui-drawer__button--tonal"
                    :icon-name="'mdi:facebook'"
                    :label="'Share on Facebook'"
                    @press="shareOnFacebook"
                />
                <rui-action-button
                    slot="actions"
                    class="rui-drawer__button rui-drawer__button--tonal"
                    :icon-name="'mdi:close'"
                    :label="'Close share mode'"
                    @press="closeDrawer"
                />
            </rui-drawer>
        `,
  },
  { shadowRoot: false },
);
