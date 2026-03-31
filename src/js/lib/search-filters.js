import { createMaterialIcon } from "./shared.js";

export function initSearchFilters() {
    const filterForm = document.querySelector("#filter_form form");
    const filterOptions = document.querySelector("#filter_options");

    if (
        !(filterForm instanceof HTMLFormElement) ||
        !(filterOptions instanceof HTMLElement) ||
        filterOptions.dataset.responsiveEnhanced === "true"
    ) {
        return;
    }

    const controls = {
        search: filterForm.querySelector('input[name="search"]'),
        searchIn: filterForm.querySelector('select[name="search_in"]'),
        sortBy: filterForm.querySelector('select[name="sort_by"]'),
        sortOrder: filterForm.querySelector('select[name="sort_order"]'),
        perpage: filterForm.querySelector('input[name="perpage"]'),
        clickFilter: filterForm.querySelector('select[name="click_filter"]'),
        clickLimit: filterForm.querySelector('input[name="click_limit"]'),
        dateFilter: filterForm.querySelector('select[name="date_filter"]'),
        dateFirst: filterForm.querySelector('input[name="date_first"]'),
        dateAnd: filterForm.querySelector("#date_and"),
        dateSecond: filterForm.querySelector('input[name="date_second"]'),
        buttons: filterOptions.querySelector("#filter_buttons"),
    };

    const requiredControls = [
        controls.search,
        controls.searchIn,
        controls.sortBy,
        controls.sortOrder,
        controls.perpage,
        controls.clickFilter,
        controls.clickLimit,
        controls.dateFilter,
        controls.dateFirst,
        controls.dateAnd,
        controls.dateSecond,
        controls.buttons,
    ];

    if (requiredControls.some((control) => !(control instanceof Element))) {
        return;
    }

    const createGroup = ({
        title,
        hint,
        className = "",
        fields = [],
        inlineHeader = false,
    }) => {
        const group = document.createElement("section");
        group.className = `responsive-filter-group ${className}`.trim();

        const headingTag = inlineHeader ? "span" : "p";
        const heading = document.createElement(headingTag);
        heading.className = "responsive-filter-group-title";
        heading.textContent = title;

        if (inlineHeader && hint) {
            const headingRow = document.createElement("p");
            headingRow.className = "responsive-filter-group-heading-row";

            const description = document.createElement("span");
            description.className = "responsive-filter-group-hint";
            description.textContent = hint;

            headingRow.append(heading, description);
            group.append(headingRow);
        } else {
            group.append(heading);

            if (hint) {
                const description = document.createElement("p");
                description.className = "responsive-filter-group-hint";
                description.textContent = hint;
                group.append(description);
            }
        }

        const controlsWrap = document.createElement("div");
        controlsWrap.className = "responsive-filter-group-controls";
        fields.forEach((field) => {
            if (field instanceof Element) {
                controlsWrap.append(field);
            }
        });
        group.append(controlsWrap);

        return group;
    };

    const shell = document.createElement("section");
    shell.className = "responsive-filter-shell";

    const quick = document.createElement("div");
    quick.className = "responsive-filter-quick";
    quick.append(
        createGroup({
            title: "Search",
            hint: "Keyword, URL, title, or IP",
            className: "is-search",
            inlineHeader: true,
            fields: [controls.search],
        }),
        createGroup({
            title: "In field",
            className: "is-scope",
            fields: [controls.searchIn],
        }),
    );
    shell.append(quick);

    const advanced = document.createElement("details");
    advanced.className = "responsive-filter-advanced";

    const advancedSummary = document.createElement("summary");
    advancedSummary.className = "responsive-filter-advanced-summary";
    advancedSummary.append(
        createMaterialIcon("tune"),
        Object.assign(document.createElement("span"), {
            textContent: "Advanced filters",
        }),
    );
    advanced.append(advancedSummary);

    const advancedBody = document.createElement("div");
    advancedBody.className = "responsive-filter-advanced-body";
    advancedBody.append(
        createGroup({
            title: "Sort",
            className: "is-sort",
            fields: [controls.sortBy, controls.sortOrder],
        }),
        createGroup({
            title: "Rows",
            hint: "Results per page",
            className: "is-perpage",
            fields: [controls.perpage],
        }),
        createGroup({
            title: "Clicks",
            hint: "Show links with more or less clicks",
            className: "is-clicks",
            fields: [controls.clickFilter, controls.clickLimit],
        }),
        createGroup({
            title: "Date",
            hint: "Filter by creation date",
            className: "is-date",
            fields: [
                controls.dateFilter,
                controls.dateFirst,
                controls.dateAnd,
                controls.dateSecond,
            ],
        }),
    );

    advanced.append(advancedBody);
    shell.append(advanced);

    const actionButtons = Array.from(
        controls.buttons.querySelectorAll("input"),
    );
    controls.buttons.replaceChildren(...actionButtons);
    controls.buttons.classList.add("responsive-filter-buttons");
    actionButtons.forEach((button) => {
        if (button instanceof HTMLInputElement) {
            button.classList.add("responsive-filter-button");
        }
    });
    controls.buttons
        .querySelector("#submit-clear-filter")
        ?.classList.add("is-tonal");
    shell.append(controls.buttons);

    const isSelectAtDefault = (selectControl) => {
        if (!(selectControl instanceof HTMLSelectElement)) {
            return true;
        }

        const defaultValue = selectControl.dataset.responsiveDefault ?? "";
        return selectControl.value === defaultValue;
    };

    const hasAdvancedValues =
        controls.perpage instanceof HTMLInputElement &&
        controls.sortBy instanceof HTMLSelectElement &&
        controls.sortOrder instanceof HTMLSelectElement &&
        controls.clickFilter instanceof HTMLSelectElement &&
        controls.clickLimit instanceof HTMLInputElement &&
        controls.dateFilter instanceof HTMLSelectElement &&
        controls.dateFirst instanceof HTMLInputElement &&
        controls.dateSecond instanceof HTMLInputElement &&
        (controls.perpage.value.trim() !== "15" ||
            !isSelectAtDefault(controls.sortBy) ||
            !isSelectAtDefault(controls.sortOrder) ||
            !isSelectAtDefault(controls.clickFilter) ||
            controls.clickLimit.value.trim() !== "" ||
            !isSelectAtDefault(controls.dateFilter) ||
            controls.dateFirst.value.trim() !== "" ||
            controls.dateSecond.value.trim() !== "");

    const hasQuickValues =
        controls.search instanceof HTMLInputElement &&
        controls.searchIn instanceof HTMLSelectElement &&
        (controls.search.value.trim() !== "" ||
            !isSelectAtDefault(controls.searchIn));

    const hasFiltersApplied = hasQuickValues || hasAdvancedValues;

    if (hasAdvancedValues) {
        advanced.open = true;
    }

    const disclosure = document.createElement("details");
    disclosure.className = "responsive-filter-disclosure";

    const disclosureSummary = document.createElement("summary");
    disclosureSummary.className = "responsive-filter-disclosure-summary";
    disclosureSummary.append(
        createMaterialIcon("filter_alt"),
        Object.assign(document.createElement("span"), {
            className: "responsive-filter-disclosure-text",
            textContent: "Filters",
        }),
    );

    const shouldOpenByDefault = hasFiltersApplied;
    disclosure.open = shouldOpenByDefault;

    disclosure.append(disclosureSummary, shell);

    filterOptions.replaceChildren(disclosure);
    filterOptions.dataset.responsiveEnhanced = "true";
}
