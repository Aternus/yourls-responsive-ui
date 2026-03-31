import {
    copyToClipboard,
    createMaterialIcon,
    setMaterialIcon,
} from "./shared.js";
import { mountVueFeature } from "./vue-feature.js";

export function initInfosPage() {
    const body = document.body;
    const wrap = document.querySelector("#wrap");

    if (
        !(body instanceof HTMLBodyElement) ||
        !(wrap instanceof HTMLElement) ||
        !body.classList.contains("infos") ||
        body.dataset.responsiveInfosEnhanced === "true"
    ) {
        return;
    }

    const installInfosPage = () => {
        const tabIcons = {
            "#stat_tab_stats": "show_chart",
            "#stat_tab_location": "location_on",
            "#stat_tab_sources": "account_tree",
            "#stat_tab_share": "share",
        };
        let scheduleInfosChartsScale = () => {};

        document.querySelectorAll("#headers a[href]").forEach((anchor) => {
            if (
                !(anchor instanceof HTMLAnchorElement) ||
                anchor.querySelector(".responsive-infos-tab-icon")
            ) {
                return;
            }

            const href = anchor.getAttribute("href") ?? "";
            const iconName = tabIcons[href];

            if (!iconName) {
                return;
            }

            anchor.prepend(
                createMaterialIcon(iconName, "responsive-infos-tab-icon"),
            );
        });

        const tabsHeader = wrap.querySelector("#headers");
        if (tabsHeader instanceof HTMLElement) {
            tabsHeader.style.setProperty("display", "flex", "important");

            const tabAnchors = Array.from(
                tabsHeader.querySelectorAll("li > a[href]"),
            ).filter((anchor) => anchor instanceof HTMLAnchorElement);

            const setActiveAnchor = (activeAnchor) => {
                tabAnchors.forEach((anchor) => {
                    anchor.classList.toggle(
                        "is-responsive-active",
                        anchor === activeAnchor,
                    );
                });
            };

            const resolveActiveAnchor = () => {
                const selectedAnchor =
                    tabsHeader.querySelector("li > a.selected");
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
                    "li > a.is-responsive-active",
                );
                if (explicitActive instanceof HTMLAnchorElement) {
                    return explicitActive;
                }

                return tabAnchors[0] ?? null;
            };

            const updateHeaderPill = () => {
                const selected = resolveActiveAnchor();

                if (!(selected instanceof HTMLElement)) {
                    tabsHeader.style.setProperty(
                        "--responsive-pill-width",
                        "0px",
                    );
                    return;
                }

                setActiveAnchor(selected);

                const headerRect = tabsHeader.getBoundingClientRect();
                const selectedRect = selected.getBoundingClientRect();
                const left =
                    selectedRect.left - headerRect.left + tabsHeader.scrollLeft;
                tabsHeader.style.setProperty(
                    "--responsive-pill-left",
                    `${left}px`,
                );
                tabsHeader.style.setProperty(
                    "--responsive-pill-width",
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
                    window.requestAnimationFrame(scheduleInfosChartsScale);
                    window.setTimeout(scheduleInfosChartsScale, 140);
                });
            });

            const tabMutationObserver = new MutationObserver(() => {
                window.requestAnimationFrame(updateHeaderPill);
                window.requestAnimationFrame(scheduleInfosChartsScale);
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
                {
                    once: true,
                },
            );
        }

        const infoVisualizations = Array.from(
            wrap.querySelectorAll("[id^='visualization_']"),
        ).filter((node) => node instanceof HTMLElement);

        if (infoVisualizations.length) {
            const scaleVisualization = (container) => {
                if (!(container instanceof HTMLElement)) {
                    return;
                }

                if (
                    container.clientWidth <= 0 ||
                    container.offsetParent === null
                ) {
                    return;
                }

                const chartRoot = container.firstElementChild;
                if (!(chartRoot instanceof HTMLElement)) {
                    container.style.removeProperty("height");
                    return;
                }

                const naturalWidth =
                    chartRoot.scrollWidth || chartRoot.offsetWidth;
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
            scheduleInfosChartsScale = () => {
                if (scaleRafId) {
                    return;
                }

                scaleRafId = window.requestAnimationFrame(() => {
                    scaleRafId = 0;
                    scaleAllVisualizations();
                });
            };

            const visualizationMutationObserver = new MutationObserver(() => {
                scheduleInfosChartsScale();
            });
            infoVisualizations.forEach((node) => {
                visualizationMutationObserver.observe(node, {
                    childList: true,
                    subtree: true,
                });
            });

            window.addEventListener("resize", scheduleInfosChartsScale, {
                passive: true,
            });
            window.addEventListener("hashchange", scheduleInfosChartsScale, {
                passive: true,
            });

            window.requestAnimationFrame(() => {
                scheduleInfosChartsScale();
                window.setTimeout(scheduleInfosChartsScale, 120);
            });
        }

        const makeLinkRow = (anchor, label) => {
            if (!(anchor instanceof HTMLAnchorElement)) {
                return;
            }

            if (
                anchor.parentElement?.classList.contains(
                    "responsive-infos-link-row",
                )
            ) {
                return;
            }

            const href = anchor.getAttribute("href") ?? "";
            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("javascript:")
            ) {
                return;
            }

            anchor.setAttribute("target", "_blank");
            anchor.setAttribute("rel", "noopener noreferrer");
            anchor.classList.add("responsive-infos-raw-link");

            const rawText = anchor.textContent ?? "";
            anchor.textContent = "";

            const text = document.createElement("span");
            text.className = "responsive-link-text";
            text.textContent = rawText.trim();

            const icon = document.createElement("span");
            setMaterialIcon(icon, "open_in_new", "responsive-link-icon");

            anchor.append(text, icon);

            const copyButton = document.createElement("button");
            copyButton.type = "button";
            copyButton.className = "responsive-infos-copy-button";
            copyButton.dataset.copyText = href;
            copyButton.setAttribute("aria-label", `Copy ${label}`);
            copyButton.setAttribute("title", `Copy ${label}`);
            copyButton.append(createMaterialIcon("content_copy"));

            const row = document.createElement("span");
            row.className = "responsive-infos-link-row";
            const placeholder = document.createElement("span");
            anchor.replaceWith(placeholder);
            row.append(anchor, copyButton);
            placeholder.replaceWith(row);
        };

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
            makeLinkRow(primaryAnchor, label);

            if (
                !(aggregateAnchor instanceof HTMLAnchorElement) ||
                heading.id === "longurl"
            ) {
                return;
            }

            aggregateAnchor.classList.add("responsive-infos-aggregate-link");
            aggregateAnchor.setAttribute(
                "aria-label",
                aggregateAnchor.getAttribute("title") ||
                    "Aggregate stats for duplicate short URLs",
            );

            if (!aggregateAnchor.querySelector(".material-icons")) {
                aggregateAnchor.textContent = "";
                aggregateAnchor.append(createMaterialIcon("bar_chart"));
            }

            const row = heading.querySelector(
                ":scope > .responsive-infos-link-row",
            );
            if (
                row instanceof HTMLElement &&
                aggregateAnchor.parentElement !== row
            ) {
                row.append(aggregateAnchor);
            }
        });

        wrap.querySelectorAll(
            "#copybox a[href], ul[id^='details_'] a[href]",
        ).forEach((anchor) => {
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

        wrap.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const button = target.closest(".responsive-infos-copy-button");
            if (!(button instanceof HTMLButtonElement)) {
                return;
            }

            event.preventDefault();

            const originalLabel =
                button.getAttribute("aria-label") || "Copy URL";
            const copyValue = button.dataset.copyText ?? "";
            const icon = button.querySelector(".material-icons");

            copyToClipboard(copyValue).then((copied) => {
                if (!copied) {
                    return;
                }

                button.classList.add("is-copied");
                button.setAttribute("aria-label", "Copied");
                button.setAttribute("title", "Copied");

                if (icon instanceof HTMLElement) {
                    icon.textContent = "check";
                }

                window.setTimeout(() => {
                    button.classList.remove("is-copied");
                    button.setAttribute("aria-label", originalLabel);
                    button.setAttribute("title", originalLabel);

                    if (icon instanceof HTMLElement) {
                        icon.textContent = "content_copy";
                    }
                }, 1200);
            });
        });
    };

    mountVueFeature(
        body,
        "ResponsiveInfosPageFeature",
        "responsiveInfosEnhanced",
        installInfosPage,
    );
}
