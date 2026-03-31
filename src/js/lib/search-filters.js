import { createApp } from "vue";
import { ResponsiveSearchFilters } from "../components/ResponsiveSearchFilters.js";

function isSelectAtDefault(selectControl) {
    if (!(selectControl instanceof HTMLSelectElement)) {
        return true;
    }

    const defaultValue = selectControl.dataset.responsiveDefault ?? "";
    return selectControl.value === defaultValue;
}

function getFilterControls(filterForm, filterOptions) {
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
        return null;
    }

    return controls;
}

function resolveFilterState(controls) {
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

    return {
        hasAdvancedValues,
        hasFiltersApplied: hasQuickValues || hasAdvancedValues,
    };
}

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

    const controls = getFilterControls(filterForm, filterOptions);
    if (!controls) {
        return;
    }

    const { hasAdvancedValues, hasFiltersApplied } =
        resolveFilterState(controls);

    const mountPoint = document.createElement("div");
    mountPoint.className = "responsive-filter-vue-root";
    filterOptions.replaceChildren(mountPoint);

    createApp(ResponsiveSearchFilters, {
        controls,
        hasAdvancedValues,
        hasFiltersApplied,
    }).mount(mountPoint);

    filterOptions.dataset.responsiveEnhanced = "true";
}
