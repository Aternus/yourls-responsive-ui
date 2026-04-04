import {
    computed,
    defineCustomElement,
    onBeforeUnmount,
    onMounted,
    ref,
} from "vue";
import { useMediaQuery } from "../../composables/useMediaQuery.js";
import { useRafScheduler } from "../../composables/useRafScheduler.js";

export const RuiScrollTop = defineCustomElement(
    {
        name: "RuiScrollTop",
        setup() {
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
                syncScrollPosition();
                window.addEventListener("scroll", scheduleSync, {
                    passive: true,
                });
                window.addEventListener("resize", scheduleSync, {
                    passive: true,
                });
            });

            onBeforeUnmount(() => {
                window.removeEventListener("scroll", scheduleSync);
                window.removeEventListener("resize", scheduleSync);
            });

            const isVisible = computed(
                () => isMobile.value === true && scrollY.value > 220,
            );

            return {
                isVisible,
                scrollToTop,
            };
        },
        template: `
            <button
                type="button"
                :class="{
                    'rui-scroll-top__button': true,
                    'is-visible': isVisible,
                }"
                :hidden="!isVisible"
                aria-label="Scroll to top"
                title="Scroll to top"
                @click="scrollToTop"
            >
                <rui-material-icon name="arrow_upward" />
            </button>
        `,
    },
    { shadowRoot: false },
);
