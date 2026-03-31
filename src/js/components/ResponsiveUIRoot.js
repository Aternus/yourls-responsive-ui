import { defineComponent, onBeforeUnmount, onMounted } from "vue";
import { initDeleteConfirmDialog } from "../lib/delete-confirm.js";
import { initDesktopRowDrawers } from "../lib/desktop-drawers.js";
import { initInfosPage } from "../lib/infos-page.js";
import {
    initInlineCardEditing,
    initInlineCardSharing,
} from "../lib/inline-mobile.js";
import {
    initPluginActionIcons,
    initPluginsFilterButton,
} from "../lib/plugins.js";
import { initSearchFilters } from "../lib/search-filters.js";
import {
    initDestinationTitleExpansion,
    initRowLinkCopyButtons,
} from "../lib/table-enhancements.js";
import { ResponsiveNavControls } from "./ResponsiveNavControls.js";
import { ResponsiveScrollTopControl } from "./ResponsiveScrollTopControl.js";

const FEATURE_INITS = [
    initDestinationTitleExpansion,
    initRowLinkCopyButtons,
    initDeleteConfirmDialog,
    initInlineCardEditing,
    initInlineCardSharing,
    initDesktopRowDrawers,
    initPluginsFilterButton,
    initPluginActionIcons,
    initSearchFilters,
    initInfosPage,
];

export const ResponsiveUIRoot = defineComponent({
    name: "ResponsiveUIRoot",
    components: {
        ResponsiveNavControls,
        ResponsiveScrollTopControl,
    },
    setup() {
        let pendingReinit = 0;
        let observer = null;

        const runFeatures = () => {
            FEATURE_INITS.forEach((fn) => fn());
        };

        const disconnectObserver = () => {
            if (pendingReinit) {
                window.cancelAnimationFrame(pendingReinit);
                pendingReinit = 0;
            }

            if (observer) {
                observer.disconnect();
                observer = null;
            }
        };

        const scheduleReinit = () => {
            if (pendingReinit) {
                return;
            }

            pendingReinit = window.requestAnimationFrame(() => {
                pendingReinit = 0;
                runFeatures();
            });
        };

        onMounted(() => {
            runFeatures();

            const root = document.querySelector("#wrap") || document.body;
            observer = new MutationObserver(scheduleReinit);
            observer.observe(root, { childList: true, subtree: true });

            window.addEventListener("pagehide", disconnectObserver, {
                once: true,
            });
        });

        onBeforeUnmount(() => {
            disconnectObserver();
        });

        return {};
    },
    template: `
        <responsive-nav-controls />
        <responsive-scroll-top-control />
    `,
});
