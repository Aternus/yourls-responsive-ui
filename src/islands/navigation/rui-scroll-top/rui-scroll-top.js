import { cva } from "class-variance-authority";
import { defineCustomElement, onBeforeUnmount, onMounted, ref } from "vue";

import { useRafScheduler } from "../../composables/useRafScheduler.js";

const scrollTopButtonVariants = cva(
  "btn fixed right-4 bottom-4 z-250 btn-circle border-none text-xl shadow-md transition-all duration-200 ease-out btn-secondary",
  {
    variants: {
      visible: {
        false: "pointer-events-none translate-y-1.5 opacity-0",
        true: "pointer-events-auto translate-y-0 opacity-100",
      },
    },
  },
);

export const RuiScrollTop = defineCustomElement(
  {
    name: "RuiScrollTop",
    setup() {
      const isVisible = ref(false);

      const syncScrollPosition = () => {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        isVisible.value = scrollY > 220;
      };

      const scheduleSync = useRafScheduler(syncScrollPosition);

      const scrollToTop = (event) => {
        event.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      };

      onMounted(() => {
        syncScrollPosition();
        window.addEventListener("scroll", scheduleSync, {
          passive: true,
        });
      });

      onBeforeUnmount(() => {
        window.removeEventListener("scroll", scheduleSync);
      });

      return {
        isVisible,
        scrollTopButtonVariants,
        scrollToTop,
      };
    },
    template: /* HTML */ `
      <button
        type="button"
        :class="scrollTopButtonVariants({ visible: isVisible })"
        :aria-hidden="String(!isVisible)"
        :tabindex="isVisible ? 0 : -1"
        aria-label="Scroll to top"
        title="Scroll to top"
        @click="scrollToTop"
      >
        <iconify-icon icon="mdi:arrow-up"></iconify-icon>
      </button>
    `,
  },
  { shadowRoot: false },
);
