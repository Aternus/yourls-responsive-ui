import { h, onBeforeUnmount, onMounted } from "vue";
import { initDeleteConfirmDialog } from "./delete-confirm.js";
import { initDesktopRowDrawers } from "./desktop-drawers.js";
import { initInfosPage } from "./infos-page.js";
import {
    initInlineCardEditing,
    initInlineCardSharing,
} from "./inline-mobile.js";
import { initNavMenu, initScrollTopButton } from "./navigation.js";
import { initPluginActionIcons, initPluginsFilterButton } from "./plugins.js";
import { initSearchFilters } from "./search-filters.js";
import {
    initDestinationTitleExpansion,
    initRowLinkCopyButtons,
} from "./table-enhancements.js";

const FEATURE_INITS = [
    initNavMenu,
    initScrollTopButton,
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

export const ResponsiveUIRoot = {
    name: "ResponsiveUIRoot",
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

        return () => h("span", { hidden: true });
    },
};
