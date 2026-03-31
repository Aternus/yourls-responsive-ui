import { onMounted, ref } from "vue";

export const ResponsiveSearchFilters = {
    name: "ResponsiveSearchFilters",
    props: {
        controls: { type: Object, required: true },
        hasAdvancedValues: { type: Boolean, required: true },
        hasFiltersApplied: { type: Boolean, required: true },
    },
    setup(props) {
        const searchSlot = ref(null);
        const scopeSlot = ref(null);
        const sortSlot = ref(null);
        const rowsSlot = ref(null);
        const clicksSlot = ref(null);
        const dateSlot = ref(null);
        const buttonsSlot = ref(null);

        const advancedOpen = ref(props.hasAdvancedValues);
        const disclosureOpen = ref(props.hasFiltersApplied);

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
            const controls = props.controls;

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
                controls.buttons.classList.add("responsive-filter-buttons");

                actionButtons.forEach((button) => {
                    if (button instanceof HTMLInputElement) {
                        button.classList.add("responsive-filter-button");
                    }
                });

                controls.buttons
                    .querySelector("#submit-clear-filter")
                    ?.classList.add("is-tonal");
                buttonsSlot.value.append(controls.buttons);
            }
        });

        return {
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
        <details class="responsive-filter-disclosure" :open="disclosureOpen">
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
};
