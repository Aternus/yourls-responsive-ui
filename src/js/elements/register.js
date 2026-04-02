import { RuiMaterialIcon } from "./shared/rui-material-icon.js";
import { RuiBrandIcon } from "./shared/rui-brand-icon.js";
import { RuiCopyButton } from "./shared/rui-copy-button.js";
import { RuiActionButton } from "./shared/rui-action-button.js";
import { RuiField } from "./shared/rui-field.js";
import { RuiTextInputField } from "./shared/rui-text-input-field.js";
import { RuiTextareaField } from "./shared/rui-textarea-field.js";
import { RuiExpandableTitle } from "./links/rui-expandable-title.js";
import { RuiSearch } from "./links/rui-search.js";
import { RuiNewUrl } from "./links/rui-new-url.js";
import { RuiDrawer } from "./links/rui-drawer.js";
import { RuiDrawerIntro } from "./links/rui-drawer-intro.js";
import { RuiEditPanel } from "./links/rui-edit-panel.js";
import { RuiSharePanel } from "./links/rui-share-panel.js";
import { RuiDeletePanel } from "./links/rui-delete-panel.js";
import { RuiNavControls } from "./navigation/rui-nav-controls.js";
import { RuiScrollTop } from "./navigation/rui-scroll-top.js";
import { RuiPluginActions } from "./admin/rui-plugin-actions.js";
import { RuiInfosPage } from "./admin/rui-infos-page.js";

function define(tag, constructor) {
    if (!customElements.get(tag)) {
        customElements.define(tag, constructor);
    }
}

export function registerAllElements() {
    // Shared
    define("rui-material-icon", RuiMaterialIcon);
    define("rui-brand-icon", RuiBrandIcon);
    define("rui-copy-button", RuiCopyButton);
    define("rui-action-button", RuiActionButton);
    define("rui-field", RuiField);
    define("rui-text-input-field", RuiTextInputField);
    define("rui-textarea-field", RuiTextareaField);

    // Links
    define("rui-expandable-title", RuiExpandableTitle);
    define("rui-search", RuiSearch);
    define("rui-new-url", RuiNewUrl);
    define("rui-drawer", RuiDrawer);
    define("rui-drawer-intro", RuiDrawerIntro);
    define("rui-edit-panel", RuiEditPanel);
    define("rui-share-panel", RuiSharePanel);
    define("rui-delete-panel", RuiDeletePanel);

    // Navigation
    define("rui-nav-controls", RuiNavControls);
    define("rui-scroll-top", RuiScrollTop);

    // Admin
    define("rui-plugin-actions", RuiPluginActions);
    define("rui-infos-page", RuiInfosPage);
}
