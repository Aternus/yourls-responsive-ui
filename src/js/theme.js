///////////////////////////////////////////////////////////
// Responsive UI
///////////////////////////////////////////////////////////

import { createApp } from "vue";
import { ResponsiveUIRoot } from "./lib/init.js";

let app = null;

function mountResponsiveUI() {
    if (app) {
        return;
    }

    const mount = document.querySelector("#responsive-ui-vue-root");
    if (!(mount instanceof HTMLElement)) {
        return;
    }

    app = createApp(ResponsiveUIRoot);
    app.mount(mount);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountResponsiveUI, {
        once: true,
    });
} else {
    mountResponsiveUI();
}
