import { RuiInfosPage } from "./admin/rui-infos-page/rui-infos-page.js";
import { RuiLogin } from "./admin/rui-login/rui-login.js";
import { RuiPluginActions } from "./admin/rui-plugin-actions/rui-plugin-actions.js";
import { RuiDeletePanel } from "./links/rui-delete-panel/rui-delete-panel.js";
import { RuiDrawerIntro } from "./links/rui-drawer-intro/rui-drawer-intro.js";
import { RuiDrawer } from "./links/rui-drawer/rui-drawer.js";
import { RuiEditPanel } from "./links/rui-edit-panel/rui-edit-panel.js";
import { RuiExpandableTitle } from "./links/rui-expandable-title/rui-expandable-title.js";
import { RuiNewUrl } from "./links/rui-new-url/rui-new-url.js";
import { RuiRowDrawerViewport } from "./links/rui-row-drawer-viewport/rui-row-drawer-viewport.js";
import { RuiSearch } from "./links/rui-search/rui-search.js";
import { RuiSharePanel } from "./links/rui-share-panel/rui-share-panel.js";
import { RuiNavControls } from "./navigation/rui-nav-controls/rui-nav-controls.js";
import { RuiNavbar } from "./navigation/rui-navbar/rui-navbar.js";
import { RuiScrollTop } from "./navigation/rui-scroll-top/rui-scroll-top.js";
import { RuiActionButton } from "./shared/rui-action-button/rui-action-button.js";
import { RuiCopyButton } from "./shared/rui-copy-button/rui-copy-button.js";
import { RuiField } from "./shared/rui-field/rui-field.js";
import { RuiTextInputField } from "./shared/rui-text-input-field/rui-text-input-field.js";
import { RuiTextareaField } from "./shared/rui-textarea-field/rui-textarea-field.js";

function define(tag, constructor) {
  if (!customElements.get(tag)) {
    customElements.define(tag, constructor);
  }
}

export function registerAllElements() {
  // Shared
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
  define("rui-row-drawer-viewport", RuiRowDrawerViewport);
  define("rui-edit-panel", RuiEditPanel);
  define("rui-share-panel", RuiSharePanel);
  define("rui-delete-panel", RuiDeletePanel);

  // Navigation
  define("rui-navbar", RuiNavbar);
  define("rui-nav-controls", RuiNavControls);
  define("rui-scroll-top", RuiScrollTop);

  // Admin
  define("rui-plugin-actions", RuiPluginActions);
  define("rui-infos-page", RuiInfosPage);
  define("rui-login", RuiLogin);
}
