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

    const mount = document.createElement("div");
    mount.id = "responsive-ui-vue-root";
    mount.hidden = true;
    document.body.append(mount);

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
