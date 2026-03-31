import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import { ResponsiveMaterialIcon } from "./shared-vue.js";

function useMediaQuery(query) {
    const matches = ref(false);
    let mediaQuery = null;

    const syncMatches = () => {
        matches.value = Boolean(mediaQuery?.matches);
    };

    onMounted(() => {
        mediaQuery = window.matchMedia(query);
        syncMatches();

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", syncMatches);
            return;
        }

        if (typeof mediaQuery.addListener === "function") {
            mediaQuery.addListener(syncMatches);
        }
    });

    onBeforeUnmount(() => {
        if (!mediaQuery) {
            return;
        }

        if (typeof mediaQuery.removeEventListener === "function") {
            mediaQuery.removeEventListener("change", syncMatches);
            return;
        }

        if (typeof mediaQuery.removeListener === "function") {
            mediaQuery.removeListener(syncMatches);
        }
    });

    return matches;
}

function useRafScheduler(run) {
    let rafId = 0;

    const schedule = () => {
        if (rafId) {
            return;
        }

        rafId = window.requestAnimationFrame(() => {
            rafId = 0;
            run();
        });
    };

    onBeforeUnmount(() => {
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
    });

    return schedule;
}

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

export const ResponsiveScrollTopControl = defineComponent({
    name: "ResponsiveScrollTopControl",
    components: {
        ResponsiveMaterialIcon,
    },
    setup() {
        const isMounted = ref(false);
        const scrollY = ref(0);
        const isMobile = useMediaQuery("(max-width: 767px)");

        const syncScrollPosition = () => {
            scrollY.value = window.scrollY || window.pageYOffset || 0;
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
            isMounted.value = true;
            syncScrollPosition();
            window.addEventListener("scroll", scheduleSync, { passive: true });
            window.addEventListener("resize", scheduleSync, { passive: true });
        });

        onBeforeUnmount(() => {
            window.removeEventListener("scroll", scheduleSync);
            window.removeEventListener("resize", scheduleSync);
        });

        const isVisible = computed(
            () => isMobile.value === true && scrollY.value > 220,
        );

        return {
            isMounted,
            isVisible,
            scrollToTop,
        };
    },
    template: `
        <teleport v-if="isMounted" to="#wrap">
            <button
                type="button"
                :class="{
                    'responsive-scroll-top-button': true,
                    'is-visible': isVisible,
                }"
                :hidden="!isVisible"
                aria-label="Scroll to top"
                title="Scroll to top"
                @click="scrollToTop"
            >
                <responsive-material-icon icon-name="arrow_upward" />
            </button>
        </teleport>
    `,
});
