import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
} from "vue";
import { useMediaQuery } from "../composables/useMediaQuery.js";
import { useRafScheduler } from "../composables/useRafScheduler.js";
import { ResponsiveMaterialIcon } from "./ResponsiveMaterialIcon.js";

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
