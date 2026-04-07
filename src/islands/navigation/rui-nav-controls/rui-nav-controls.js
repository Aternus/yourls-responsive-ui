import {
  defineCustomElement,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

export const RuiNavControls = defineCustomElement(
  {
    name: "RuiNavControls",
    setup() {
      const navElement = ref(null);
      const isOpen = ref(false);

      const closeMenu = () => {
        isOpen.value = false;
      };

      const toggleMenu = () => {
        isOpen.value = !isOpen.value;
      };

      const handleDocumentKeydown = (event) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      };

      const handleNavClick = (event) => {
        if (event.target instanceof Element && event.target.closest("a")) {
          closeMenu();
        }
      };

      watch(
        isOpen,
        (open) => {
          document.body.classList.toggle("rui-nav--open", open);
        },
        { immediate: true },
      );

      onMounted(() => {
        navElement.value = document.querySelector('nav[role="navigation"]');

        if (!(navElement.value instanceof HTMLElement)) {
          return;
        }

        document.addEventListener("keydown", handleDocumentKeydown);
        navElement.value.addEventListener("click", handleNavClick);
      });

      onBeforeUnmount(() => {
        document.body.classList.remove("rui-nav--open");
        document.removeEventListener("keydown", handleDocumentKeydown);

        if (navElement.value instanceof HTMLElement) {
          navElement.value.removeEventListener("click", handleNavClick);
        }
      });

      return {
        navElement,
        isOpen,
        toggleMenu,
        closeMenu,
      };
    },
    template: `
            <template v-if="navElement">
                <button
                    type="button"
                    class="rui-nav__button"
                    aria-controls="admin_menu"
                    :aria-expanded="isOpen ? 'true' : 'false'"
                    aria-label="Toggle navigation menu"
                    @click="toggleMenu"
                >
                    <iconify-icon
                        icon="mdi:menu"
                        class="rui-nav__icon rui-nav__icon--open"
                        aria-hidden="true"
                    ></iconify-icon>
                    <iconify-icon
                        icon="mdi:close"
                        class="rui-nav__icon rui-nav__icon--close"
                        aria-hidden="true"
                    ></iconify-icon>
                </button>
                <button
                    type="button"
                    class="rui-nav__overlay"
                    aria-hidden="true"
                    tabindex="-1"
                    @click="closeMenu"
                ></button>
            </template>
        `,
  },
  { shadowRoot: false },
);
