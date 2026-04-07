import {
  defineCustomElement,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import { stripSearchProtocol } from "../../lib/search-query.js";

function isSelectAtDefault(selectControl) {
  if (!(selectControl instanceof HTMLSelectElement)) {
    return true;
  }

  const defaultValue = selectControl.dataset.ruiDefault ?? "";
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

function usDateToIso(value) {
  if (typeof value !== "string") {
    return "";
  }

  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return "";
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(year)
  ) {
    return "";
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function isoDateToUs(value) {
  if (typeof value !== "string") {
    return "";
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return "";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(year)
  ) {
    return "";
  }

  return `${month}/${day}/${year}`;
}

function prepareNativeDateInput(input) {
  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  const isoValue = usDateToIso(input.value);
  input.type = "date";

  if (isoValue !== "") {
    input.value = isoValue;
  }
}

function normalizeNativeDateForSubmit(input) {
  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  const usValue = isoDateToUs(input.value);
  if (usValue !== "") {
    if (input.type === "date") {
      input.type = "text";
    }
    input.value = usValue;
  }
}

export const RuiSearch = defineCustomElement(
  {
    name: "RuiSearch",
    setup() {
      const searchSlot = ref(null);
      const searchButtonSlot = ref(null);
      const scopeSlot = ref(null);
      const sortSlot = ref(null);
      const rowsSlot = ref(null);
      const clicksSlot = ref(null);
      const dateSlot = ref(null);
      const drawerDialog = ref(null);

      const ready = ref(false);
      const drawerOpen = ref(false);
      const drawerContentVisible = ref(false);
      const filtersActive = ref(false);

      const mountField = (slot, control) => {
        slot?.append(control);
      };

      const createIconButton = ({
        type = "button",
        className,
        icon,
        label,
      }) => {
        const button = document.createElement("button");
        button.type = type;
        button.className = className;
        button.title = label;
        button.setAttribute("aria-label", label);

        const iconElement = document.createElement("span");
        iconElement.className = "material-symbols-outlined";
        iconElement.setAttribute("aria-hidden", "true");
        iconElement.textContent = icon;

        button.append(iconElement);
        return button;
      };

      const openDrawer = () => {
        drawerOpen.value = true;
      };

      const closeDrawer = () => {
        drawerOpen.value = false;
      };

      const toggleDrawer = () => {
        if (drawerOpen.value) {
          closeDrawer();
          return;
        }

        openDrawer();
      };

      let requestSearchSubmit = null;

      const submitFilters = () => {
        if (typeof requestSearchSubmit === "function") {
          requestSearchSubmit();
        }
      };

      const clearFilters = () => {
        window.parent.location.href = "index.php";
      };

      const requestDrawerClose = () => {
        drawerOpen.value = false;
      };

      const handleDrawerAfterLeave = () => {
        const dialog = drawerDialog.value;
        if (!(dialog instanceof HTMLDialogElement) || drawerOpen.value) {
          return;
        }

        if (dialog.open) {
          dialog.close();
        }
      };

      const handleDrawerDialogClose = () => {
        drawerOpen.value = false;
        drawerContentVisible.value = false;
      };

      let removeSearchEnterListener = null;
      let removeDateSubmitListener = null;

      watch(drawerOpen, async (isOpen) => {
        const dialog = drawerDialog.value;
        if (!(dialog instanceof HTMLDialogElement)) {
          drawerContentVisible.value = isOpen;
          return;
        }

        if (isOpen) {
          if (!dialog.open) {
            dialog.showModal();
          }

          await nextTick();
          drawerContentVisible.value = true;
          return;
        }

        drawerContentVisible.value = false;
      });

      onMounted(() => {
        const filterFormContainer = document.querySelector("#filter_form");
        const mainTable = document.querySelector("#main_table");
        if (
          filterFormContainer instanceof HTMLElement &&
          mainTable instanceof HTMLElement &&
          filterFormContainer.dataset.ruiPinnedTop !== "true"
        ) {
          const tableParent = mainTable.parentElement;
          if (tableParent instanceof HTMLElement) {
            tableParent.insertBefore(filterFormContainer, mainTable);
            filterFormContainer.dataset.ruiPinnedTop = "true";
          }
        }

        const filterForm = document.querySelector("#filter_form form");
        const filterOptions = document.querySelector("#filter_options");

        if (
          !(filterForm instanceof HTMLFormElement) ||
          !(filterOptions instanceof HTMLElement) ||
          filterOptions.dataset.ruiEnhanced === "true"
        ) {
          return;
        }

        const controls = getFilterControls(filterForm, filterOptions);
        if (!controls) {
          return;
        }

        const host = document.querySelector("rui-search");
        if (host instanceof HTMLElement) {
          filterOptions.replaceChildren(host);
        }

        const { hasFiltersApplied } = resolveFilterState(controls);

        filtersActive.value = hasFiltersApplied;
        drawerOpen.value = false;
        ready.value = true;

        filterOptions.dataset.ruiEnhanced = "true";

        // Wait for template to render before moving controls
        requestAnimationFrame(() => {
          mountField(searchSlot.value, controls.search);
          mountField(scopeSlot.value, controls.searchIn);

          mountField(sortSlot.value, controls.sortBy);
          mountField(sortSlot.value, controls.sortOrder);

          mountField(rowsSlot.value, controls.perpage);
          if (controls.perpage instanceof HTMLInputElement) {
            controls.perpage.type = "number";
            controls.perpage.inputMode = "numeric";
            controls.perpage.min = "1";
            controls.perpage.step = "1";
          }

          mountField(clicksSlot.value, controls.clickFilter);
          mountField(clicksSlot.value, controls.clickLimit);
          if (controls.clickLimit instanceof HTMLInputElement) {
            controls.clickLimit.type = "number";
            controls.clickLimit.inputMode = "numeric";
            controls.clickLimit.min = "0";
            controls.clickLimit.step = "1";
          }

          mountField(dateSlot.value, controls.dateFilter);
          mountField(dateSlot.value, controls.dateFirst);
          mountField(dateSlot.value, controls.dateAnd);
          mountField(dateSlot.value, controls.dateSecond);

          prepareNativeDateInput(controls.dateFirst);
          prepareNativeDateInput(controls.dateSecond);

          const handleDateSubmit = () => {
            if (controls.search instanceof HTMLInputElement) {
              controls.search.value = stripSearchProtocol(
                controls.search.value,
              );
            }
            normalizeNativeDateForSubmit(controls.dateFirst);
            normalizeNativeDateForSubmit(controls.dateSecond);
          };
          filterForm.addEventListener("submit", handleDateSubmit);
          removeDateSubmitListener = () => {
            filterForm.removeEventListener("submit", handleDateSubmit);
          };

          const actionButtons = Array.from(
            controls.buttons.querySelectorAll("input"),
          );

          const submitButton = actionButtons.find(
            (button) =>
              button instanceof HTMLInputElement && button.type === "submit",
          );
          if (submitButton instanceof HTMLInputElement) {
            const searchButton = createIconButton({
              type: "submit",
              className: "button primary rui-search__submit-button",
              icon: "search",
              label: "Search",
            });
            mountField(searchButtonSlot.value, searchButton);
            requestSearchSubmit = () => {
              searchButton.click();
            };

            submitButton.remove();

            if (controls.search instanceof HTMLInputElement) {
              const handleSearchEnter = (event) => {
                if (event.key !== "Enter") {
                  return;
                }

                event.preventDefault();
                searchButton.click();
              };

              controls.search.addEventListener("keydown", handleSearchEnter);
              removeSearchEnterListener = () => {
                controls.search.removeEventListener(
                  "keydown",
                  handleSearchEnter,
                );
              };
            }
          } else if (controls.search instanceof HTMLInputElement) {
            const fallbackSearchButton = createIconButton({
              type: "button",
              className: "button primary rui-search__submit-button",
              icon: "search",
              label: "Search",
            });
            fallbackSearchButton.addEventListener("click", () => {
              filterForm.requestSubmit();
            });
            mountField(searchButtonSlot.value, fallbackSearchButton);
            requestSearchSubmit = () => {
              filterForm.requestSubmit();
            };

            const handleSearchEnter = (event) => {
              if (event.key !== "Enter") {
                return;
              }

              event.preventDefault();
              filterForm.requestSubmit();
            };

            controls.search.addEventListener("keydown", handleSearchEnter);
            removeSearchEnterListener = () => {
              controls.search.removeEventListener("keydown", handleSearchEnter);
            };
          }
        });
      });

      onBeforeUnmount(() => {
        if (typeof removeSearchEnterListener === "function") {
          removeSearchEnterListener();
          removeSearchEnterListener = null;
        }

        if (typeof removeDateSubmitListener === "function") {
          removeDateSubmitListener();
          removeDateSubmitListener = null;
        }
      });

      return {
        ready,
        drawerOpen,
        drawerContentVisible,
        filtersActive,
        searchSlot,
        searchButtonSlot,
        scopeSlot,
        sortSlot,
        rowsSlot,
        clicksSlot,
        dateSlot,
        drawerDialog,
        closeDrawer,
        requestDrawerClose,
        handleDrawerAfterLeave,
        handleDrawerDialogClose,
        openDrawer,
        toggleDrawer,
        submitFilters,
        clearFilters,
      };
    },
    template: `
            <section v-if="ready" class="rui-search__surface">
                <div class="rui-search__row">
                    <div ref="searchSlot" class="rui-search__input-slot"></div>
                    <div ref="searchButtonSlot" class="rui-search__submit-slot"></div>
                    <button
                        type="button"
                        class="rui-search__toggle"
                        :class="{ 'is-active': filtersActive || drawerOpen }"
                        title="Filters"
                        aria-label="Filters"
                        :aria-expanded="drawerOpen ? 'true' : 'false'"
                        aria-controls="rui-filter-drawer"
                        @click="toggleDrawer"
                    >
                        <span class="material-symbols-outlined" aria-hidden="true">
                            {{ filtersActive ? 'filter_alt' : 'filter_alt_off' }}
                        </span>
                    </button>
                </div>
                <dialog
                    id="rui-filter-drawer"
                    ref="drawerDialog"
                    class="rui-drawer rui-search__filter-drawer"
                    @close="handleDrawerDialogClose"
                    @cancel.prevent="requestDrawerClose"
                >
                    <Transition
                        name="rui-drawer-surface"
                        @after-leave="handleDrawerAfterLeave"
                    >
                        <div v-show="drawerContentVisible" class="rui-drawer__shell">
                            <div class="rui-drawer__titlebar">
                                <div class="rui-drawer__heading">
                                    <div class="rui-drawer__heading-text">
                                        <span class="rui-drawer__heading-title">Filters</span>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm-message rui-drawer__body">
                                <section class="rui-drawer__content rui-search__filter-body">
                                    <section class="rui-search__filter-group is-scope">
                                        <p class="rui-search__filter-group-title">In field</p>
                                        <div ref="scopeSlot" class="rui-search__filter-controls"></div>
                                    </section>
                                    <div class="rui-search__filter-divider" aria-hidden="true"></div>
                                    <section class="rui-search__filter-group is-sort">
                                        <p class="rui-search__filter-group-title">Sort</p>
                                        <div ref="sortSlot" class="rui-search__filter-controls"></div>
                                    </section>
                                    <section class="rui-search__filter-group is-perpage">
                                        <div class="rui-search__filter-heading is-stacked">
                                            <p class="rui-search__filter-group-title">Rows</p>
                                            <p class="rui-search__filter-group-hint">Results per page</p>
                                        </div>
                                        <div ref="rowsSlot" class="rui-search__filter-controls"></div>
                                    </section>
                                    <section class="rui-search__filter-group is-clicks">
                                        <div class="rui-search__filter-heading is-stacked">
                                            <p class="rui-search__filter-group-title">Clicks</p>
                                            <p class="rui-search__filter-group-hint">Show links with more or less clicks</p>
                                        </div>
                                        <div ref="clicksSlot" class="rui-search__filter-controls"></div>
                                    </section>
                                    <section class="rui-search__filter-group is-date">
                                        <div class="rui-search__filter-heading">
                                            <p class="rui-search__filter-group-title">Date</p>
                                            <p class="rui-search__filter-group-hint">Filter by creation date</p>
                                        </div>
                                        <div ref="dateSlot" class="rui-search__filter-controls"></div>
                                    </section>
                                </section>
                            </div>
                            <div class="button-group rui-drawer__actions rui-drawer__footer rui-search__filter-actions">
                                <button
                                    type="button"
                                    class="button rui-drawer__button rui-drawer__button--primary rui-search__filter-submit"
                                    aria-label="Apply filters"
                                    title="Apply filters"
                                    @click="submitFilters"
                                >
                                    <span class="material-symbols-outlined" aria-hidden="true">check</span>
                                </button>
                                <button
                                    type="button"
                                    class="button rui-drawer__button rui-drawer__button--tonal rui-search__filter-clear"
                                    aria-label="Clear filters"
                                    title="Clear filters"
                                    @click="clearFilters"
                                >
                                    <span class="material-symbols-outlined" aria-hidden="true">filter_alt_off</span>
                                </button>
                                <button
                                    type="button"
                                    class="button rui-drawer__button rui-drawer__button--tonal rui-search__filter-close"
                                    aria-label="Close"
                                    title="Close"
                                    @click="closeDrawer"
                                >
                                    <span class="material-symbols-outlined" aria-hidden="true">close</span>
                                </button>
                            </div>
                        </div>
                    </Transition>
                </dialog>
            </section>
        `,
  },
  { shadowRoot: false },
);
