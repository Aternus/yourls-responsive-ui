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
import { useResponsiveFlags } from "../../composables/useResponsiveFlags.js";
import { RuiInvariantError } from "../../lib/errors.js";

const HEADER_SELECTOR = "#wrap > header[role='banner']";
const NAV_SELECTOR = "#wrap > nav[role='navigation']";
const TOPLEVEL_NAV_LINK_SELECTOR =
  "#admin_menu > li.admin_menu_toplevel > a[href]";
const LOGOUT_LINK_SELECTOR = "#admin_menu_logout_link a[href]";
const USERNAME_SELECTOR = "#admin_menu_logout_link strong";
const MOBILE_DRAWER_TOGGLE_ID = "rui-navbar-mobile-drawer-toggle";

function toPathname(url) {
  try {
    return new URL(url, window.location.href).pathname;
  } catch {
    return "";
  }
}

function resolveLegacyHeader(host) {
  const legacyHeader = host.nextElementSibling;
  if (
    !(legacyHeader instanceof HTMLElement) ||
    !legacyHeader.matches(HEADER_SELECTOR)
  ) {
    throw new RuiInvariantError(
      "Expected legacy header to be the next sibling before mount.",
      { code: "DOM_MISSING" },
    );
  }

  return legacyHeader;
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

function readLegacyNavLinks(legacyNav, currentPathname) {
  return Array.from(legacyNav.querySelectorAll(TOPLEVEL_NAV_LINK_SELECTOR))
    .map((anchor) => {
      if (!(anchor instanceof HTMLAnchorElement)) {
        return null;
      }

      const label = (anchor.textContent ?? "").trim();
      if (label.length === 0) {
        return null;
      }

      return {
        href: anchor.href,
        label,
        isCurrent: toPathname(anchor.href) === currentPathname,
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

export const RuiNavbar = defineCustomElement(
  {
    name: "RuiNavbar",
    setup() {
      const host = useHost();
      const { t } = useI18n("brand");
      const { isAuth } = useResponsiveFlags();

      const ready = ref(false);
      const brandHref = ref("/admin/index.php");
      const brandTitle = ref(t("name"));
      const logoSrc = ref("");
      const logoAlt = ref(t("name"));

      const navLinks = ref([]);
      const username = ref("");
      const logoutHref = ref("");
      const logoutLabel = ref("");
      const isMenuOpen = ref(false);

      const hasNavLinks = computed(() => navLinks.value.length > 0);
      const hasUserMenu = computed(
        () => username.value.length > 0 || logoutHref.value.length > 0,
      );
      const hasMobileMenu = computed(
        () => hasNavLinks.value || hasUserMenu.value,
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
        if (!(host instanceof HTMLElement)) {
          throw new RuiInvariantError(
            "Expected host element to be an HTMLElement.",
            { code: "DOM_INVALID_TYPE" },
          );
        }

        const legacyHeader = resolveLegacyHeader(host);
        const legacyHeaderData = readLegacyHeaderData(legacyHeader);

        brandHref.value = legacyHeaderData.href;
        brandTitle.value = legacyHeaderData.title;
        logoSrc.value = legacyHeaderData.logoSrc;
        logoAlt.value = legacyHeaderData.logoAlt;

        if (isAuth) {
          const legacyNav = document.querySelector(NAV_SELECTOR);
          if (!(legacyNav instanceof HTMLElement)) {
            throw new RuiInvariantError(
              "Expected legacy navigation to exist for authenticated context.",
              { code: "DOM_MISSING" },
            );
          }

          navLinks.value = readLegacyNavLinks(
            legacyNav,
            window.location.pathname,
          );

          const legacyUserData = readLegacyUserData(legacyNav);
          username.value = legacyUserData.username;
          logoutHref.value = legacyUserData.logoutHref;
          logoutLabel.value = legacyUserData.logoutLabel;
        }

        // Replace the legacy banner element with this custom element host so
        // Vue fully owns the rendered navbar markup.
        if (!legacyHeader.parentNode) {
          throw new RuiInvariantError(
            "Expected legacy header to have a parent node.",
            { code: "DOM_MISSING" },
          );
        }
        legacyHeader.parentNode.replaceChild(host, legacyHeader);

        document.addEventListener("keydown", handleDocumentKeydown);
        ready.value = true;
      });

      onBeforeUnmount(() => {
        document.body.classList.remove("overflow-hidden");
        document.removeEventListener("keydown", handleDocumentKeydown);
      });

      return {
        MOBILE_DRAWER_TOGGLE_ID,
        ready,
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
        isMenuOpen,
        hasMobileMenu,
        closeMenu,
      };
    },
    template: /* HTML */ `
      <template v-if="ready">
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
                </a>
              </div>

              <div v-if="hasNavLinks" class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal gap-2 rounded-box bg-base-200">
                  <li v-for="item in navLinks" :key="item.href">
                    <a
                      :href="item.href"
                      :class="{ 'menu-active': item.isCurrent }"
                      >{{ item.label }}</a
                    >
                  </li>
                </ul>
              </div>

              <div
                v-if="hasNavLinks && hasUserMenu"
                class="navbar-end lg:hidden"
              >
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
                v-if="hasNavLinks && hasUserMenu"
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

          <div v-if="hasNavLinks && hasUserMenu" class="drawer-side lg:hidden">
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
              </a>

              <div class="divider m-0"></div>

              <ul class="menu w-full rounded-box bg-base-200">
                <li v-for="item in navLinks" :key="item.href">
                  <a
                    :href="item.href"
                    :class="{ 'menu-active': item.isCurrent }"
                    >{{ item.label }}</a
                  >
                </li>
              </ul>

              <div class="divider m-0 mt-auto"></div>

              <div class="space-y-4 border-base-300">
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
