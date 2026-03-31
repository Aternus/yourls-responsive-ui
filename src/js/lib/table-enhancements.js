import { copyToClipboard } from "./shared.js";

export function initDestinationTitleExpansion() {
    const table = document.querySelector("#main_table");

    if (
        !(table instanceof HTMLElement) ||
        table.dataset.responsiveTitleExpand === "true"
    ) {
        return;
    }

    const toggleTitle = (target) => {
        if (!(target instanceof Element)) {
            return;
        }

        const title = target.closest(".responsive-destination-title");
        if (!(title instanceof HTMLElement)) {
            return;
        }

        table
            .querySelectorAll(".responsive-destination-title.is-expanded")
            .forEach((node) => {
                if (node !== title) {
                    node.classList.remove("is-expanded");
                }
            });

        title.classList.toggle("is-expanded");
    };

    table.addEventListener("click", (event) => {
        toggleTitle(event.target);
    });

    table.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        const target = event.target;
        if (
            !(target instanceof Element) ||
            !target.closest(".responsive-destination-title")
        ) {
            return;
        }

        event.preventDefault();
        toggleTitle(target);
    });

    table.dataset.responsiveTitleExpand = "true";
}

export function initRowLinkCopyButtons() {
    const table = document.querySelector("#main_table");

    if (
        !(table instanceof HTMLElement) ||
        table.dataset.responsiveCopyButtons === "true"
    ) {
        return;
    }

    table.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest(".responsive-copy-link-button");
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        event.preventDefault();

        const originalLabel =
            button.dataset.copyLabel ||
            button.getAttribute("aria-label") ||
            "Copy URL";
        const icon = button.querySelector(".material-icons");
        const copyValue = button.dataset.copyText ?? "";

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

    table.dataset.responsiveCopyButtons = "true";
}
