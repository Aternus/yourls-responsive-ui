///////////////////////////////////////////////////////////
// Responsive UI
///////////////////////////////////////////////////////////

import { registerAllElements } from "./elements/register.js";
import { initDrawerManager } from "./lib/drawer-manager.js";

registerAllElements();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDrawerManager, {
        once: true,
    });
} else {
    initDrawerManager();
}
