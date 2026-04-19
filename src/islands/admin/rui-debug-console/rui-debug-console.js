import {
  defineCustomElement,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useHost,
  watch,
} from "vue";

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
      const isOpen = ref(false);
      const debugText = shallowRef("");

      const handleKeydown = (event) => {
        if (event.key === "Escape") {
          isOpen.value = false;
        }
      };

      watch(isOpen, (open) => {
        if (open) {
          window.addEventListener("keydown", handleKeydown);
        } else {
          window.removeEventListener("keydown", handleKeydown);
        }
      });

      onMounted(() => {
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

      onBeforeUnmount(() => {
        window.removeEventListener("keydown", handleKeydown);
      });

      const toggle = () => {
        isOpen.value = !isOpen.value;
      };

      return {
        isOpen,
        debugText,
        toggle,
      };
    },
    template: /* HTML */ `
      <template v-if="debugText">
        <div
          v-if="isOpen"
          class="mockup-code fixed right-5 bottom-15 left-5 z-4 flex max-h-[calc(100dvh-(var(--spacing)*21))] flex-col px-5 shadow-sm before:mb-5 before:-ml-5 before:shrink-0 md:max-h-[50dvh]"
        >
          <pre
            class="shrink grow overflow-auto p-0 before:m-0"
          ><code>{{ debugText }}</code></pre>
        </div>

        <button
          type="button"
          class="btn fixed right-5 bottom-5 z-5 btn-sm btn-info"
          @click="toggle"
        >
          Debug Console
        </button>
      </template>
    `,
  },
  { shadowRoot: false },
);
