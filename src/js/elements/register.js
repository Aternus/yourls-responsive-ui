import { RuiMaterialIcon } from "./rui-material-icon.js";
import { RuiBrandIcon } from "./rui-brand-icon.js";
import { RuiCopyButton } from "./rui-copy-button.js";
import { RuiExpandableTitle } from "./rui-expandable-title.js";
import { RuiInfosPage } from "./rui-infos-page.js";
import { RuiNavControls } from "./rui-nav-controls.js";
import { RuiNewUrl } from "./rui-new-url.js";
import { RuiPluginActions } from "./rui-plugin-actions.js";
import { RuiScrollTop } from "./rui-scroll-top.js";
import { RuiSearch } from "./rui-search.js";

export function registerAllElements() {
    customElements.define("rui-material-icon", RuiMaterialIcon);
    customElements.define("rui-brand-icon", RuiBrandIcon);
    customElements.define("rui-copy-button", RuiCopyButton);
    customElements.define("rui-expandable-title", RuiExpandableTitle);
    customElements.define("rui-infos-page", RuiInfosPage);
    customElements.define("rui-nav-controls", RuiNavControls);
    customElements.define("rui-new-url", RuiNewUrl);
    customElements.define("rui-plugin-actions", RuiPluginActions);
    customElements.define("rui-scroll-top", RuiScrollTop);
    customElements.define("rui-search", RuiSearch);
}
