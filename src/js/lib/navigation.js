import { mountVueFeature } from "./vue-feature.js";

export function initNavMenu() {
    const checkbox = document.querySelector("#nav_menu");
    const button = document.querySelector(".nav_menu_button");
    const nav = document.querySelector('nav[role="navigation"]');

    if (!checkbox || !button || !nav) {
        return;
    }

    mountVueFeature(
        document.body,
        "ResponsiveNavMenuFeature",
        "responsiveNavMenu",
        () => {
            const syncState = () => {
                const expanded = checkbox.checked;

                button.setAttribute(
                    "aria-expanded",
                    expanded ? "true" : "false",
                );
                document.body.classList.toggle("responsive-nav-open", expanded);
            };

            checkbox.addEventListener("change", syncState);

            button.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                    return;
                }

                event.preventDefault();
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape" && checkbox.checked) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(
                        new Event("change", { bubbles: true }),
                    );
                }
            });

            nav.addEventListener("click", (event) => {
                if (
                    event.target instanceof Element &&
                    event.target.closest("a")
                ) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(
                        new Event("change", { bubbles: true }),
                    );
                }
            });

            syncState();
        },
    );
}

// Scroll to Top
/////////////////////////////////////////////////

export function initScrollTopButton() {
    const button = document.querySelector(".responsive-scroll-top-button");

    if (!(button instanceof HTMLButtonElement)) {
        return;
    }

    mountVueFeature(
        button,
        "ResponsiveScrollTopFeature",
        "responsiveScrollTop",
        () => {
            const mobileQuery = window.matchMedia("(max-width: 767px)");
            let rafId = 0;

            const setVisible = (visible) => {
                button.classList.toggle("is-visible", visible);
                button.hidden = !visible;
            };

            const syncVisibility = () => {
                const visible = mobileQuery.matches && window.scrollY > 220;
                setVisible(visible);
            };

            const scheduleSync = () => {
                if (rafId) {
                    return;
                }

                rafId = window.requestAnimationFrame(() => {
                    rafId = 0;
                    syncVisibility();
                });
            };

            button.addEventListener("click", (event) => {
                event.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            });

            window.addEventListener("scroll", scheduleSync, { passive: true });
            window.addEventListener("resize", scheduleSync, { passive: true });

            if (typeof mobileQuery.addEventListener === "function") {
                mobileQuery.addEventListener("change", scheduleSync);
            } else if (typeof mobileQuery.addListener === "function") {
                mobileQuery.addListener(scheduleSync);
            }

            syncVisibility();
        },
    );
}
