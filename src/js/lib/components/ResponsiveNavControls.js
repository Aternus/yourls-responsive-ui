import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import { ResponsiveMaterialIcon } from "./ResponsiveMaterialIcon.js";

export const ResponsiveNavControls = defineComponent({
    name: "ResponsiveNavControls",
    components: {
        ResponsiveMaterialIcon,
    },
    setup() {
        const isMounted = ref(false);
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
                document.body.classList.toggle("responsive-nav-open", open);
            },
            { immediate: true },
        );

        onMounted(() => {
            isMounted.value = true;
            navElement.value = document.querySelector('nav[role="navigation"]');

            if (!(navElement.value instanceof HTMLElement)) {
                return;
            }

            document.addEventListener("keydown", handleDocumentKeydown);
            navElement.value.addEventListener("click", handleNavClick);
        });

        onBeforeUnmount(() => {
            document.body.classList.remove("responsive-nav-open");
            document.removeEventListener("keydown", handleDocumentKeydown);

            if (navElement.value instanceof HTMLElement) {
                navElement.value.removeEventListener("click", handleNavClick);
            }
        });

        const hasNavigation = computed(
            () => navElement.value instanceof HTMLElement,
        );

        return {
            isMounted,
            hasNavigation,
            isOpen,
            toggleMenu,
            closeMenu,
        };
    },
    template: `
        <teleport v-if="isMounted && hasNavigation" to="#wrap">
            <button
                type="button"
                class="nav_menu_button"
                aria-controls="admin_menu"
                :aria-expanded="isOpen ? 'true' : 'false'"
                aria-label="Toggle navigation menu"
                @click="toggleMenu"
            >
                <responsive-material-icon
                    icon-name="menu"
                    extra-class="nav_menu_icon nav_menu_icon_open"
                />
                <responsive-material-icon
                    icon-name="close"
                    extra-class="nav_menu_icon nav_menu_icon_close"
                />
            </button>
            <button
                type="button"
                class="nav_menu_overlay"
                aria-hidden="true"
                tabindex="-1"
                @click="closeMenu"
            ></button>
        </teleport>
    `,
});
