import {
  defineCustomElement,
  onMounted,
  shallowRef,
  useHost,
  useTemplateRef,
} from "vue";

import { useI18n } from "../../composables/useI18n.js";
import { ensureHostElement } from "../../lib/dom.js";

const LEGACY_DEBUG_SELECTOR = '#footer + div[style*="text-align:left"]';

function findLegacyDebugContainer() {
  return document.querySelector(LEGACY_DEBUG_SELECTOR);
}

export const RuiDebugConsole = defineCustomElement(
  {
    name: "RuiDebugConsole",
    setup() {
      const host = useHost();
      const { t } = useI18n("debug");
      const dialogRef = useTemplateRef("dialogRef");
      const debugText = shallowRef("");

      onMounted(async () => {
        const hostElement = ensureHostElement(host);
        const container = findLegacyDebugContainer();

        if (!container) {
          hostElement.remove();
          return;
        }

        // Extract debug content from legacy pre tags.
        const pres = container.querySelectorAll("pre");
        debugText.value = Array.from(pres)
          .map((pre) => pre.textContent)
          .join("\n");

        // Remove the legacy debug container.
        container.remove();
      });

      const toggle = () => {
        const dialog = dialogRef.value;
        if (!dialog) return;

        dialog.open ? dialog.close() : dialog.showModal();
      };

      return {
        debugText,
        toggle,
        t,
      };
    },
    template: /* HTML */ `
      <template v-if="debugText">
        <dialog ref="dialogRef" class="modal modal-bottom">
          <div
            class="modal-box mx-auto flex max-h-[50dvh] flex-col p-0 lg:max-w-[80dvw]"
          >
            <div
              class="mockup-code flex grow flex-col overflow-hidden rounded-b-none px-5 before:mb-5 before:-ml-5 before:shrink-0"
            >
              <pre
                class="shrink grow overflow-auto p-0 before:m-0"
              ><code>{{ debugText }}</code></pre>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <button
          type="button"
          class="btn fixed right-5 bottom-5 z-5 btn-square text-xl btn-sm"
          @click="toggle"
          :title="t('title')"
        >
          <iconify-icon icon="mdi:console"></iconify-icon>
        </button>
      </template>
    `,
  },
  { shadowRoot: false },
);
