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

export function initResponsiveUI() {
    const inits = [
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

    inits.forEach((fn) => fn());

    let pendingReinit = 0;
    let observer = new MutationObserver(() => {
        if (pendingReinit) {
            return;
        }

        pendingReinit = window.requestAnimationFrame(() => {
            pendingReinit = 0;
            inits.forEach((fn) => fn());
        });
    });

    const root = document.querySelector("#wrap") || document.body;
    observer.observe(root, { childList: true, subtree: true });

    window.addEventListener("pagehide", () => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    });
}
