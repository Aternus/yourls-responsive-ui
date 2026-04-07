import { defineCustomElement, ref } from "vue";

import { copyToClipboard } from "../../lib/shared.js";

export const RuiCopyButton = defineCustomElement(
  {
    name: "RuiCopyButton",
    props: {
      copyText: { type: String, default: "" },
      copyLabel: { type: String, default: "Copy URL" },
    },
    setup(props) {
      const iconName = ref("content_copy");
      const ariaLabel = ref(props.copyLabel);
      const isCopied = ref(false);
      let resetTimer = 0;

      const handleClick = async () => {
        const copied = await copyToClipboard(props.copyText);
        if (!copied) {
          return;
        }

        if (resetTimer) {
          window.clearTimeout(resetTimer);
        }

        iconName.value = "check";
        ariaLabel.value = "Copied";
        isCopied.value = true;

        resetTimer = window.setTimeout(() => {
          iconName.value = "content_copy";
          ariaLabel.value = props.copyLabel;
          isCopied.value = false;
          resetTimer = 0;
        }, 1200);
      };

      return {
        iconName,
        ariaLabel,
        isCopied,
        handleClick,
      };
    },
    template: `
            <button
                type="button"
                class="rui-copy-button__trigger"
                :class="{ 'is-copied': isCopied }"
                :aria-label="ariaLabel"
                :title="ariaLabel"
                @click="handleClick"
            >
                <span class="material-symbols-outlined" aria-hidden="true">{{ iconName }}</span>
            </button>
        `,
  },
  { shadowRoot: false },
);
