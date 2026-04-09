import { computed, defineCustomElement, onMounted, ref, useHost } from "vue";

import { useI18n } from "../../composables/useI18n.js";
import { useResponsiveFlags } from "../../composables/useResponsiveFlags.js";
import { RuiInvariantError } from "../../lib/errors.js";

const HEADER_SELECTOR = "#wrap > header[role='banner']";
const NAV_SELECTOR = "#wrap > nav[role='navigation']";
const TOPLEVEL_NAV_LINK_SELECTOR =
  "#admin_menu > li.admin_menu_toplevel > a[href]";
const LOGOUT_LINK_SELECTOR = "#admin_menu_logout_link a[href]";
const USERNAME_SELECTOR = "#admin_menu_logout_link strong";

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

  return {
    href: brandLink.href,
    title: brandLink.title,
    logoSrc: brandLogo.src,
    logoAlt: brandLogo.alt,
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

  return {
    username: (userStrong.textContent ?? "").trim(),
    logoutHref: logoutAnchor.href,
    logoutLabel: (logoutAnchor.textContent ?? "").trim(),
  };
}

export const RuiNavbar = defineCustomElement(
  {
    name: "RuiNavbar",
    setup() {
      const host = useHost();
      const { t } = useI18n("login");

      const ready = ref(false);
      const brandHref = ref("/admin/index.php");
      const brandTitle = ref(t("brand"));
      const logoSrc = ref("");
      const logoAlt = ref(t("brand"));

      const navLinks = ref([]);
      const username = ref("");
      const logoutHref = ref("");
      const logoutLabel = ref("");

      const hasNavLinks = computed(() => navLinks.value.length > 0);
      const hasUserMenu = computed(
        () => username.value.length > 0 || logoutHref.value.length > 0,
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

        const { isAuth } = useResponsiveFlags();
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

        ready.value = true;
      });

      return {
        ready,
        t,
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
      };
    },
    template: /* HTML */ `
      <div v-if="ready" class="navbar bg-base-100 shadow-sm">
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
          <ul class="menu menu-horizontal gap-1 px-1">
            <li v-for="item in navLinks" :key="item.href">
              <a
                :href="item.href"
                :class="{ 'menu-active font-semibold': item.isCurrent }"
                >{{ item.label }}</a
              >
            </li>
          </ul>
        </div>

        <div v-if="hasUserMenu" class="navbar-end gap-2">
          <span v-if="username" class="badge hidden badge-ghost sm:inline-flex"
            >{{ username }}</span
          >
          <a v-if="logoutHref" :href="logoutHref" class="btn btn-outline btn-sm"
            >{{ logoutLabel }}</a
          >
        </div>
      </div>
    `,
  },
  { shadowRoot: false },
);
