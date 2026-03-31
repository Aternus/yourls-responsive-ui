///////////////////////////////////////////////////////////
// Responsive UI
///////////////////////////////////////////////////////////

import { initResponsiveUI } from "./lib/init.js";

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResponsiveUI);
} else {
    initResponsiveUI();
}
