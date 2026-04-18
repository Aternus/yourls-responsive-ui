import {
  computed,
  defineCustomElement,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  watch,
} from "vue";

import { useI18n } from "../../composables/useI18n.js";
import { useResponsiveConfig } from "../../composables/useResponsiveConfig.js";
import { ensureHostElement, replaceElementWithHost } from "../../lib/dom.js";

const HEADER_SELECTOR = "#wrap > header[role='banner']";
const NAV_SELECTOR = "#wrap > nav[role='navigation']";

const TOPLEVEL_NAV_ITEM_SELECTOR = "#admin_menu > li.admin_menu_toplevel";
const SUBLEVEL_NAV_LINK_SELECTOR = "ul > li.admin_menu_sublevel > a[href]";
const LOGOUT_LINK_SELECTOR = "#admin_menu_logout_link a[href]";
const USERNAME_SELECTOR = "#admin_menu_logout_link strong";

const MOBILE_DRAWER_TOGGLE_ID = "rui-navbar-mobile-drawer-toggle";

function toRoute(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "";
  }
}

function resolveLegacyHeader() {
  const legacyHeader = document.querySelector(HEADER_SELECTOR);
  return legacyHeader instanceof HTMLElement ? legacyHeader : null;
}

function readLegacyHeaderData(legacyHeader) {
  const brandLink = legacyHeader.querySelector("a[href]");
  const brandLogo = legacyHeader.querySelector("#yourls-logo");
  const safeBrandLink =
    brandLink instanceof HTMLAnchorElement ? brandLink : null;
  const safeBrandLogo =
    brandLogo instanceof HTMLImageElement ? brandLogo : null;

  return {
    href: safeBrandLink?.href ?? "/admin/index.php",
    title: safeBrandLink?.title ?? "",
    logoSrc: safeBrandLogo?.src ?? "",
    logoAlt: safeBrandLogo?.alt ?? "",
  };
}

function resolveLegacyNav() {
  const legacyNav = document.querySelector(NAV_SELECTOR);
  return legacyNav instanceof HTMLElement ? legacyNav : null;
}

function readLegacyNavLinks(legacyNav, currentPathname) {
  return Array.from(legacyNav.querySelectorAll(TOPLEVEL_NAV_ITEM_SELECTOR))
    .map((menuItem) => {
      if (!(menuItem instanceof HTMLElement)) {
        return null;
      }

      const topLevelChild = menuItem.firstElementChild;
      const anchor =
        topLevelChild instanceof HTMLAnchorElement ? topLevelChild : null;
      if (!(anchor instanceof HTMLAnchorElement)) {
        return null;
      }

      const label = (anchor.textContent ?? "").trim();
      if (label.length === 0) {
        return null;
      }

      const children = Array.from(
        menuItem.querySelectorAll(SUBLEVEL_NAV_LINK_SELECTOR),
      )
        .map((sublevelAnchor) => {
          if (!(sublevelAnchor instanceof HTMLAnchorElement)) {
            return null;
          }

          const sublevelLabel = (sublevelAnchor.textContent ?? "").trim();
          if (sublevelLabel.length === 0) {
            return null;
          }

          return {
            href: sublevelAnchor.href,
            label: sublevelLabel,
            isCurrent: toRoute(sublevelAnchor.href) === currentPathname,
          };
        })
        .filter((sublevelLink) => sublevelLink !== null);

      const isParentCurrent = toRoute(anchor.href) === currentPathname;

      return {
        href: anchor.href,
        label,
        isParentCurrent,
        isCurrent: isParentCurrent || children.some((child) => child.isCurrent),
        children,
      };
    })
    .filter((link) => link !== null);
}

function readLegacyUserData(legacyNav) {
  const logoutAnchor = legacyNav.querySelector(LOGOUT_LINK_SELECTOR);
  const userStrong = legacyNav.querySelector(USERNAME_SELECTOR);
  const safeLogoutAnchor =
    logoutAnchor instanceof HTMLAnchorElement ? logoutAnchor : null;

  return {
    username: (userStrong.textContent ?? "").trim(),
    logoutHref: safeLogoutAnchor?.href ?? "",
    logoutLabel: (safeLogoutAnchor?.textContent ?? "").trim(),
  };
}

function getLegacyHeaderSnapshot() {
  const legacyHeader = resolveLegacyHeader();
  if (!legacyHeader) {
    return {
      legacyHeader: null,
      data: {
        href: "",
        title: "",
        logoSrc: "",
        logoAlt: "",
      },
    };
  }

  return {
    legacyHeader,
    data: readLegacyHeaderData(legacyHeader),
  };
}

function getLegacyNavSnapshot(currentPathname) {
  const legacyNav = resolveLegacyNav();
  if (!legacyNav) {
    return {
      legacyNav: null,
      data: {
        links: [],
        username: "",
        logoutHref: "",
        logoutLabel: "",
      },
    };
  }

  const userData = readLegacyUserData(legacyNav);

  return {
    legacyNav,
    data: {
      links: readLegacyNavLinks(legacyNav, currentPathname),
      username: userData.username,
      logoutHref: userData.logoutHref,
      logoutLabel: userData.logoutLabel,
    },
  };
}

export const RuiNavbar = defineCustomElement(
  {
    name: "RuiNavbar",
    setup() {
      const host = useHost();
      const { t } = useI18n("brand");
      const { context } = useResponsiveConfig();

      const isReady = ref(false);
      const isMenuOpen = ref(false);
      const hasLegacyHeader = ref(false);

      const brandHref = ref("/admin/index.php");
      const brandTitle = ref(t("name"));
      const logoSrc = ref("");
      const logoAlt = ref(t("name"));

      const navLinks = ref([]);
      const username = ref("");
      const logoutHref = ref("");
      const logoutLabel = ref("");

      const isLogin = context === "login";

      const hasNavLinks = computed(() => navLinks.value.length > 0);
      const hasUserMenu = computed(
        () => username.value.length > 0 || logoutHref.value.length > 0,
      );
      const hasMobileDrawer = computed(
        () => hasNavLinks.value || hasUserMenu.value,
      );
      const shouldRenderNavbar = computed(
        () =>
          !isLogin &&
          (hasLegacyHeader.value || hasNavLinks.value || hasUserMenu.value),
      );

      const closeMenu = () => {
        isMenuOpen.value = false;
      };

      const handleDocumentKeydown = (event) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      };

      watch(
        isMenuOpen,
        (open) => {
          document.body.classList.toggle("overflow-hidden", open);
        },
        { immediate: true },
      );

      onMounted(() => {
        const hostElement = ensureHostElement(host);
        if (isLogin) {
          hostElement.remove();
          isReady.value = true;
          return;
        }

        const { legacyHeader, data: legacyHeaderData } =
          getLegacyHeaderSnapshot();
        hasLegacyHeader.value = legacyHeader !== null;

        if (legacyHeaderData.href) {
          brandHref.value = legacyHeaderData.href;
        }
        if (legacyHeaderData.title) {
          brandTitle.value = legacyHeaderData.title;
        }
        logoSrc.value = legacyHeaderData.logoSrc;
        if (legacyHeaderData.logoAlt) {
          logoAlt.value = legacyHeaderData.logoAlt;
        }

        const { legacyNav, data: legacyNavData } = getLegacyNavSnapshot(
          `${window.location.pathname}${window.location.search}`,
        );
        navLinks.value = legacyNavData.links;
        username.value = legacyNavData.username;
        logoutHref.value = legacyNavData.logoutHref;
        logoutLabel.value = legacyNavData.logoutLabel;
        legacyNav?.remove();

        // Replace the legacy banner element with this custom element host so
        // Vue fully owns the rendered navbar markup.
        if (legacyHeader) {
          replaceElementWithHost(legacyHeader, hostElement);
        }

        document.addEventListener("keydown", handleDocumentKeydown);
        isReady.value = true;
      });

      onBeforeUnmount(() => {
        document.body.classList.remove("overflow-hidden");
        document.removeEventListener("keydown", handleDocumentKeydown);
      });

      return {
        MOBILE_DRAWER_TOGGLE_ID,
        isReady,
        shouldRenderNavbar,
        brandHref,
        brandTitle,
        logoSrc,
        logoAlt,
        navLinks,
        hasNavLinks,
        username,
        logoutHref,
        logoutLabel,
        hasUserMenu,
        hasMobileDrawer,
        isMenuOpen,
        closeMenu,
      };
    },
    template: /* HTML */ `
      <template v-if="isReady && shouldRenderNavbar">
        <div class="drawer drawer-end">
          <input
            :id="MOBILE_DRAWER_TOGGLE_ID"
            v-model="isMenuOpen"
            type="checkbox"
            class="drawer-toggle"
          />

          <div class="drawer-content">
            <div
              class="navbar border-b border-base-300 bg-base-100 px-2 shadow-sm lg:px-4 lg:shadow-md"
            >
              <div class="navbar-start">
                <a :href="brandHref" :title="brandTitle" class="btn btn-ghost">
                  <img
                    v-if="logoSrc"
                    :src="logoSrc"
                    :alt="logoAlt"
                    class="h-7 w-auto shrink-0"
                  />
                  <span v-else class="text-sm font-semibold text-base-content">
                    {{ brandTitle }}
                  </span>
                </a>
              </div>

              <div v-if="hasNavLinks" class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal gap-2 rounded-box bg-base-200">
                  <li v-for="item in navLinks" :key="item.href">
                    <template v-if="item.children.length > 0">
                      <details>
                        <summary :class="{ 'menu-active': item.isCurrent }">
                          {{ item.label }}
                        </summary>
                        <ul class="space-y-1">
                          <li>
                            <a
                              :href="item.href"
                              class="text-nowrap"
                              :class="{ 'menu-active': item.isParentCurrent }"
                              >{{ item.label }}</a
                            >
                          </li>
                          <li v-for="child in item.children" :key="child.href">
                            <a
                              :href="child.href"
                              class="text-nowrap"
                              :class="{ 'menu-active': child.isCurrent }"
                              >{{ child.label }}</a
                            >
                          </li>
                        </ul>
                      </details>
                    </template>
                    <a
                      v-else
                      :href="item.href"
                      class="text-nowrap"
                      :class="{ 'menu-active': item.isCurrent }"
                      >{{ item.label }}</a
                    >
                  </li>
                </ul>
              </div>

              <div v-if="hasMobileDrawer" class="navbar-end lg:hidden">
                <label
                  :for="MOBILE_DRAWER_TOGGLE_ID"
                  aria-label="Toggle navigation menu"
                  class="btn text-2xl btn-ghost"
                >
                  <iconify-icon
                    :icon="isMenuOpen ? 'mdi:close' : 'mdi:menu'"
                  ></iconify-icon>
                </label>
              </div>

              <div
                v-if="hasUserMenu"
                class="navbar-end hidden lg:flex lg:gap-4"
              >
                <span v-if="username" class="badge badge-soft"
                  >{{ username }}</span
                >
                <a
                  v-if="logoutHref"
                  :href="logoutHref"
                  class="btn btn-outline btn-sm"
                  >{{ logoutLabel }}</a
                >
              </div>
            </div>
          </div>

          <div v-if="hasMobileDrawer" class="drawer-side lg:hidden">
            <label
              :for="MOBILE_DRAWER_TOGGLE_ID"
              class="drawer-overlay"
              aria-label="Close navigation menu"
            ></label>

            <aside
              class="flex h-dvh max-w-sm min-w-xs flex-col gap-4 border-l border-base-300 bg-base-100 p-4 shadow-lg"
            >
              <a :href="brandHref" :title="brandTitle" class="btn btn-ghost">
                <img
                  v-if="logoSrc"
                  :src="logoSrc"
                  :alt="logoAlt"
                  class="h-7 w-auto shrink-0"
                />
                <span v-else class="text-sm font-semibold text-base-content">
                  {{ brandTitle }}
                </span>
              </a>

              <div v-if="hasNavLinks" class="divider m-0"></div>

              <ul
                v-if="hasNavLinks"
                class="menu w-full space-y-1 rounded-box bg-base-200"
              >
                <li v-for="item in navLinks" :key="item.href">
                  <template v-if="item.children.length > 0">
                    <details>
                      <summary :class="{ 'menu-active': item.isCurrent }">
                        {{ item.label }}
                      </summary>
                      <ul class="mt-1 space-y-1">
                        <li>
                          <a
                            :href="item.href"
                            class="text-nowrap"
                            :class="{ 'menu-active': item.isParentCurrent }"
                            >{{ item.label }}</a
                          >
                        </li>
                        <li v-for="child in item.children" :key="child.href">
                          <a
                            :href="child.href"
                            class="text-nowrap"
                            :class="{ 'menu-active': child.isCurrent }"
                            >{{ child.label }}</a
                          >
                        </li>
                      </ul>
                    </details>
                  </template>
                  <a
                    v-else
                    :href="item.href"
                    class="text-nowrap"
                    :class="{ 'menu-active': item.isCurrent }"
                    >{{ item.label }}</a
                  >
                </li>
              </ul>

              <div v-if="hasUserMenu" class="divider m-0 mt-auto"></div>

              <div v-if="hasUserMenu" class="space-y-4 border-base-300">
                <p v-if="username" class="badge badge-soft">{{ username }}</p>
                <a
                  v-if="logoutHref"
                  :href="logoutHref"
                  class="btn btn-block btn-outline btn-sm"
                  >{{ logoutLabel }}</a
                >
              </div>
            </aside>
          </div>
        </div>
      </template>
    `,
  },
  { shadowRoot: false },
);
