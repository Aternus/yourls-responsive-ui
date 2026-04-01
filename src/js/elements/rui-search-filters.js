import { defineCustomElement, onMounted, ref } from "vue";

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

export const RuiSearchFilters = defineCustomElement(
    {
        name: "RuiSearchFilters",
        setup() {
            const searchSlot = ref(null);
            const scopeSlot = ref(null);
            const sortSlot = ref(null);
            const rowsSlot = ref(null);
            const clicksSlot = ref(null);
            const dateSlot = ref(null);
            const buttonsSlot = ref(null);

            const advancedOpen = ref(false);
            const disclosureOpen = ref(false);
            const ready = ref(false);

            const mountField = (slotRef, control) => {
                const slot = slotRef.value;
                if (
                    !(slot instanceof HTMLElement) ||
                    !(control instanceof Element)
                ) {
                    return;
                }

                slot.append(control);
            };

            onMounted(() => {
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

                advancedOpen.value = hasAdvancedValues;
                disclosureOpen.value = hasFiltersApplied;
                ready.value = true;

                filterOptions.dataset.responsiveEnhanced = "true";

                // Wait for template to render before moving controls
                requestAnimationFrame(() => {
                    mountField(searchSlot, controls.search);
                    mountField(scopeSlot, controls.searchIn);

                    mountField(sortSlot, controls.sortBy);
                    mountField(sortSlot, controls.sortOrder);

                    mountField(rowsSlot, controls.perpage);

                    mountField(clicksSlot, controls.clickFilter);
                    mountField(clicksSlot, controls.clickLimit);

                    mountField(dateSlot, controls.dateFilter);
                    mountField(dateSlot, controls.dateFirst);
                    mountField(dateSlot, controls.dateAnd);
                    mountField(dateSlot, controls.dateSecond);

                    if (buttonsSlot.value instanceof HTMLElement) {
                        const actionButtons = Array.from(
                            controls.buttons.querySelectorAll("input"),
                        );
                        controls.buttons.replaceChildren(...actionButtons);
                        controls.buttons.classList.add(
                            "responsive-filter-buttons",
                        );

                        actionButtons.forEach((button) => {
                            if (button instanceof HTMLInputElement) {
                                button.classList.add(
                                    "responsive-filter-button",
                                );
                            }
                        });

                        controls.buttons
                            .querySelector("#submit-clear-filter")
                            ?.classList.add("is-tonal");
                        buttonsSlot.value.append(controls.buttons);
                    }
                });
            });

            return {
                ready,
                advancedOpen,
                disclosureOpen,
                searchSlot,
                scopeSlot,
                sortSlot,
                rowsSlot,
                clicksSlot,
                dateSlot,
                buttonsSlot,
            };
        },
        template: `
            <details v-if="ready" class="responsive-filter-disclosure" :open="disclosureOpen">
                <summary class="responsive-filter-disclosure-summary">
                    <span class="material-icons" aria-hidden="true">filter_alt</span>
                    <span class="responsive-filter-disclosure-text">Filters</span>
                </summary>
                <section class="responsive-filter-shell">
                    <div class="responsive-filter-quick">
                        <section class="responsive-filter-group is-search">
                            <p class="responsive-filter-group-heading-row">
                                <span class="responsive-filter-group-title">Search</span>
                                <span class="responsive-filter-group-hint">Keyword, URL, title, or IP</span>
                            </p>
                            <div ref="searchSlot" class="responsive-filter-group-controls"></div>
                        </section>
                        <section class="responsive-filter-group is-scope">
                            <p class="responsive-filter-group-title">In field</p>
                            <div ref="scopeSlot" class="responsive-filter-group-controls"></div>
                        </section>
                    </div>
                    <details class="responsive-filter-advanced" :open="advancedOpen">
                        <summary class="responsive-filter-advanced-summary">
                            <span class="material-icons" aria-hidden="true">tune</span>
                            <span>Advanced filters</span>
                        </summary>
                        <div class="responsive-filter-advanced-body">
                            <section class="responsive-filter-group is-sort">
                                <p class="responsive-filter-group-title">Sort</p>
                                <div ref="sortSlot" class="responsive-filter-group-controls"></div>
                            </section>
                            <section class="responsive-filter-group is-perpage">
                                <p class="responsive-filter-group-title">Rows</p>
                                <p class="responsive-filter-group-hint">Results per page</p>
                                <div ref="rowsSlot" class="responsive-filter-group-controls"></div>
                            </section>
                            <section class="responsive-filter-group is-clicks">
                                <p class="responsive-filter-group-title">Clicks</p>
                                <p class="responsive-filter-group-hint">Show links with more or less clicks</p>
                                <div ref="clicksSlot" class="responsive-filter-group-controls"></div>
                            </section>
                            <section class="responsive-filter-group is-date">
                                <p class="responsive-filter-group-title">Date</p>
                                <p class="responsive-filter-group-hint">Filter by creation date</p>
                                <div ref="dateSlot" class="responsive-filter-group-controls"></div>
                            </section>
                        </div>
                    </details>
                    <div ref="buttonsSlot"></div>
                </section>
            </details>
        `,
    },
    { shadowRoot: false },
);
