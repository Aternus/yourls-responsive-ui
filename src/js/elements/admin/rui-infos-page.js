import { defineCustomElement } from "vue";

export const RuiInfosPage = defineCustomElement(
  {
    name: "RuiInfosPage",
    setup() {
      return {};
    },
    mounted() {
      const body = document.body;
      const wrap = document.querySelector("#wrap");

      if (
        !(body instanceof HTMLBodyElement) ||
        !(wrap instanceof HTMLElement) ||
        !body.classList.contains("infos") ||
        body.dataset.ruiInfosEnhanced === "true"
      ) {
        return;
      }

      body.dataset.ruiInfosEnhanced = "true";

      this.installTabIcons(wrap);
      const scheduleChartsScale = this.installChartScaling(wrap);
      this.installHeaderPill(wrap, scheduleChartsScale);
      this.installLinkRows(wrap);
      this.installExternalLinks(wrap);
    },
    methods: {
      installTabIcons(wrap) {
        const tabIcons = {
          "#stat_tab_stats": "show_chart",
          "#stat_tab_location": "location_on",
          "#stat_tab_sources": "account_tree",
          "#stat_tab_share": "share",
        };

        document.querySelectorAll("#headers a[href]").forEach((anchor) => {
          if (
            !(anchor instanceof HTMLAnchorElement) ||
            anchor.querySelector(".rui-infos__tab-icon")
          ) {
            return;
          }

          const href = anchor.getAttribute("href") ?? "";
          const iconName = tabIcons[href];

          if (!iconName) {
            return;
          }

          const icon = document.createElement("rui-material-icon");
          icon.setAttribute("name", iconName);
          icon.setAttribute("class", "rui-infos__tab-icon");
          anchor.prepend(icon);
        });
      },

      installHeaderPill(wrap, scheduleChartsScale) {
        const tabsHeader = wrap.querySelector("#headers");
        if (!(tabsHeader instanceof HTMLElement)) {
          return;
        }

        tabsHeader.style.setProperty("display", "flex", "important");

        const tabAnchors = Array.from(
          tabsHeader.querySelectorAll("li > a[href]"),
        ).filter((anchor) => anchor instanceof HTMLAnchorElement);

        const setActiveAnchor = (activeAnchor) => {
          tabAnchors.forEach((anchor) => {
            anchor.classList.toggle("is-rui-active", anchor === activeAnchor);
          });
        };

        const resolveActiveAnchor = () => {
          const selectedAnchor = tabsHeader.querySelector("li > a.selected");
          if (selectedAnchor instanceof HTMLAnchorElement) {
            return selectedAnchor;
          }

          const hash = window.location.hash;
          if (hash) {
            const hashAnchor = tabsHeader.querySelector(
              `li > a[href="${hash}"]`,
            );
            if (hashAnchor instanceof HTMLAnchorElement) {
              return hashAnchor;
            }
          }

          const selectedItemAnchor =
            tabsHeader.querySelector("li.selected > a");
          if (selectedItemAnchor instanceof HTMLAnchorElement) {
            return selectedItemAnchor;
          }

          const explicitActive = tabsHeader.querySelector(
            "li > a.is-rui-active",
          );
          if (explicitActive instanceof HTMLAnchorElement) {
            return explicitActive;
          }

          return tabAnchors[0] ?? null;
        };

        const updateHeaderPill = () => {
          const selected = resolveActiveAnchor();

          if (!(selected instanceof HTMLElement)) {
            tabsHeader.style.setProperty("--rui-pill-width", "0px");
            return;
          }

          setActiveAnchor(selected);

          const headerRect = tabsHeader.getBoundingClientRect();
          const selectedRect = selected.getBoundingClientRect();
          const left =
            selectedRect.left - headerRect.left + tabsHeader.scrollLeft;
          tabsHeader.style.setProperty("--rui-pill-left", `${left}px`);
          tabsHeader.style.setProperty(
            "--rui-pill-width",
            `${selected.offsetWidth}px`,
          );
        };

        tabsHeader.addEventListener("click", (event) => {
          if (!(event.target instanceof Element)) {
            return;
          }

          const anchor = event.target.closest("#headers a[href]");
          if (!(anchor instanceof HTMLAnchorElement)) {
            return;
          }

          setActiveAnchor(anchor);

          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(updateHeaderPill);
            window.requestAnimationFrame(scheduleChartsScale);
            window.setTimeout(scheduleChartsScale, 140);
          });
        });

        const tabMutationObserver = new MutationObserver(() => {
          window.requestAnimationFrame(updateHeaderPill);
          window.requestAnimationFrame(scheduleChartsScale);
        });
        tabMutationObserver.observe(tabsHeader, {
          subtree: true,
          attributes: true,
          attributeFilter: ["class"],
        });

        window.addEventListener("resize", updateHeaderPill, {
          passive: true,
        });
        window.addEventListener("hashchange", updateHeaderPill, {
          passive: true,
        });
        window.requestAnimationFrame(updateHeaderPill);
        window.setTimeout(updateHeaderPill, 120);
        window.setTimeout(updateHeaderPill, 260);

        if (document.fonts?.ready) {
          document.fonts.ready.then(() => {
            window.requestAnimationFrame(updateHeaderPill);
          });
        }

        window.addEventListener(
          "load",
          () => {
            window.requestAnimationFrame(updateHeaderPill);
          },
          { once: true },
        );
      },

      installChartScaling(wrap) {
        const infoVisualizations = Array.from(
          wrap.querySelectorAll("[id^='visualization_']"),
        ).filter((node) => node instanceof HTMLElement);

        if (!infoVisualizations.length) {
          return () => {};
        }

        const scaleVisualization = (container) => {
          if (!(container instanceof HTMLElement)) {
            return;
          }

          if (container.clientWidth <= 0 || container.offsetParent === null) {
            return;
          }

          const chartRoot = container.firstElementChild;
          if (!(chartRoot instanceof HTMLElement)) {
            container.style.removeProperty("height");
            return;
          }

          const naturalWidth = chartRoot.scrollWidth || chartRoot.offsetWidth;
          const naturalHeight =
            chartRoot.scrollHeight || chartRoot.offsetHeight;

          if (!naturalWidth || !naturalHeight) {
            return;
          }

          const availableWidth = container.clientWidth;
          const scale = Math.min(1, availableWidth / naturalWidth);

          chartRoot.style.transform =
            scale < 0.999 ? `scale(${scale})` : "none";
          container.style.height = `${Math.ceil(naturalHeight * scale)}px`;
        };

        const scaleAllVisualizations = () => {
          infoVisualizations.forEach(scaleVisualization);
        };

        let scaleRafId = 0;
        const scheduleChartsScale = () => {
          if (scaleRafId) {
            return;
          }

          scaleRafId = window.requestAnimationFrame(() => {
            scaleRafId = 0;
            scaleAllVisualizations();
          });
        };

        const visualizationMutationObserver = new MutationObserver(() => {
          scheduleChartsScale();
        });
        infoVisualizations.forEach((node) => {
          visualizationMutationObserver.observe(node, {
            childList: true,
            subtree: true,
          });
        });

        window.addEventListener("resize", scheduleChartsScale, {
          passive: true,
        });
        window.addEventListener("hashchange", scheduleChartsScale, {
          passive: true,
        });

        window.requestAnimationFrame(() => {
          scheduleChartsScale();
          window.setTimeout(scheduleChartsScale, 120);
        });

        return scheduleChartsScale;
      },

      installLinkRows(wrap) {
        wrap.querySelectorAll("#wrap > h3").forEach((heading) => {
          if (!(heading instanceof HTMLElement)) {
            return;
          }

          const anchors = Array.from(
            heading.querySelectorAll(":scope > a[href]"),
          ).filter((anchor) => anchor instanceof HTMLAnchorElement);

          if (!anchors.length) {
            return;
          }

          const primaryAnchor =
            anchors.find((anchor) => {
              const href = anchor.getAttribute("href") ?? "";
              return !href.includes("+all");
            }) ?? anchors[0];
          const aggregateAnchor = anchors.find((anchor) => {
            const href = anchor.getAttribute("href") ?? "";
            return href.includes("+all");
          });

          const label = heading.id === "longurl" ? "long URL" : "short URL";
          this.makeLinkRow(primaryAnchor, label);

          if (
            !(aggregateAnchor instanceof HTMLAnchorElement) ||
            heading.id === "longurl"
          ) {
            return;
          }

          aggregateAnchor.classList.add("rui-infos__aggregate-link");
          aggregateAnchor.setAttribute(
            "aria-label",
            aggregateAnchor.getAttribute("title") ||
              "Aggregate stats for duplicate short URLs",
          );

          if (!aggregateAnchor.querySelector(".material-icons")) {
            aggregateAnchor.textContent = "";
            const icon = document.createElement("rui-material-icon");
            icon.setAttribute("name", "bar_chart");
            aggregateAnchor.append(icon);
          }

          const row = heading.querySelector(":scope > .rui-infos__link-row");
          if (
            row instanceof HTMLElement &&
            aggregateAnchor.parentElement !== row
          ) {
            row.append(aggregateAnchor);
          }
        });
      },

      makeLinkRow(anchor, label) {
        if (!(anchor instanceof HTMLAnchorElement)) {
          return;
        }

        if (anchor.parentElement?.classList.contains("rui-infos__link-row")) {
          return;
        }

        const href = anchor.getAttribute("href") ?? "";
        if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
          return;
        }

        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
        anchor.classList.add("rui-infos__raw-link");

        const rawText = anchor.textContent ?? "";
        anchor.textContent = "";

        const text = document.createElement("span");
        text.className = "rui-link-row__text";
        text.textContent = rawText.trim();

        const linkIcon = document.createElement("rui-material-icon");
        linkIcon.setAttribute("name", "open_in_new");
        linkIcon.setAttribute("class", "rui-link-row__icon");

        anchor.append(text, linkIcon);

        const copyButton = document.createElement("rui-copy-button");
        copyButton.setAttribute("copy-text", href);
        copyButton.setAttribute("copy-label", `Copy ${label}`);

        const row = document.createElement("span");
        row.className = "rui-infos__link-row";
        const placeholder = document.createElement("span");
        anchor.replaceWith(placeholder);
        row.append(anchor, copyButton);
        placeholder.replaceWith(row);
      },

      installExternalLinks(wrap) {
        wrap
          .querySelectorAll("#copybox a[href], ul[id^='details_'] a[href]")
          .forEach((anchor) => {
            if (!(anchor instanceof HTMLAnchorElement)) {
              return;
            }

            const href = anchor.getAttribute("href") ?? "";

            if (
              href === "" ||
              href.startsWith("#") ||
              href.startsWith("javascript:")
            ) {
              return;
            }

            anchor.setAttribute("target", "_blank");
            anchor.setAttribute("rel", "noopener noreferrer");
          });
      },
    },
    template: `<span hidden></span>`,
  },
  { shadowRoot: false },
);
