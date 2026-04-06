import { cva } from "class-variance-authority";
import { computed, defineCustomElement, nextTick, onMounted, ref } from "vue";

/* Variant configs (CVA)
 ************************************************/

const loginButton = cva(
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
  {
    variants: {
      state: {
        disabled: "cursor-not-allowed bg-neutral-300 text-neutral-500",
        enabled:
          "cursor-pointer bg-brand-500 text-neutral-50 hover:bg-brand-600",
      },
    },
    defaultVariants: { state: "disabled" },
  },
);

const loginInput = cva(
  "block min-h-[44px] w-full rounded-lg border bg-neutral-50 px-4 py-3 text-base text-neutral-950 placeholder:text-neutral-400 focus:ring-2 focus:ring-offset-0 focus:outline-none",
  {
    variants: {
      state: {
        default:
          "border-neutral-300 focus:border-brand-500 focus:ring-brand-400",
        invalid: "border-error-500 focus:border-error-500 focus:ring-error-400",
      },
    },
    defaultVariants: { state: "default" },
  },
);

const loginAlert = cva("rounded-lg border px-4 py-3 text-sm", {
  variants: {
    severity: {
      error: "border-error-300 bg-error-50 text-error-700",
      warning: "border-secondary-300 bg-secondary-50 text-secondary-700",
      info: "border-tertiary-300 bg-tertiary-50 text-tertiary-700",
    },
  },
  defaultVariants: { severity: "info" },
});

/* Static chrome classes
 ************************************************/

const PAGE_CLASSES =
  "flex min-h-screen w-full items-center justify-center bg-neutral-100 px-4 py-12";

const CARD_CLASSES =
  "flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-neutral-50 p-8 shadow-xl ring-1 ring-neutral-200";

const BRAND_CLASSES =
  "text-center text-2xl font-extrabold tracking-tight text-brand-500";

const HEADING_CLASSES =
  "text-center text-2xl font-bold leading-tight text-neutral-950";

const TAGLINE_CLASSES = "text-center text-sm text-neutral-600";

const FIELD_LABEL_CLASSES = "block text-sm font-medium text-neutral-800 mb-2";

const FORM_CONTAINER_CLASSES = "flex flex-col gap-5";

const FIELD_GROUP_CLASSES = "flex flex-col";

const ALERT_ID = "rui-login-alert";

/* Element
 ************************************************/

export const RuiLogin = defineCustomElement(
  {
    name: "RuiLogin",
    setup() {
      const ready = ref(false);
      const alertSlot = ref(null);
      const formSlot = ref(null);

      // Track only whether each field is non-empty — never the actual
      // credential values. This keeps plaintext out of Vue devtools and
      // any future reactive-state serialization.
      const usernameFilled = ref(false);
      const passwordFilled = ref(false);
      const hasError = ref(false);

      const strings = window.RESPONSIVEUI?.strings?.login ?? {};
      const brandText = strings.brand ?? "YOURLS";
      const headingText = strings.heading ?? "Sign in to your account";
      const taglineText =
        strings.tagline ?? "Enter your credentials to manage your short URLs.";

      const bothFilled = computed(
        () => usernameFilled.value && passwordFilled.value,
      );

      const buttonClasses = computed(() =>
        loginButton({ state: bothFilled.value ? "enabled" : "disabled" }),
      );

      const inputState = computed(() =>
        hasError.value ? "invalid" : "default",
      );

      const inputClasses = computed(() =>
        loginInput({ state: inputState.value }),
      );

      const alertClasses = computed(() => loginAlert({ severity: "error" }));

      let usernameInputEl = null;
      let passwordInputEl = null;
      let submitInputEl = null;

      const applyInputClasses = () => {
        const next = inputClasses.value;
        if (usernameInputEl) {
          usernameInputEl.className = next;
        }
        if (passwordInputEl) {
          passwordInputEl.className = next;
        }
      };

      const applyButtonClasses = () => {
        if (!submitInputEl) {
          return;
        }
        submitInputEl.className = buttonClasses.value;
        if (bothFilled.value) {
          submitInputEl.removeAttribute("disabled");
        } else {
          submitInputEl.setAttribute("disabled", "disabled");
        }
      };

      const isNonEmpty = (el) =>
        el instanceof HTMLInputElement && el.value.trim().length > 0;

      const handleUsernameInput = () => {
        usernameFilled.value = isNonEmpty(usernameInputEl);
        applyButtonClasses();
      };

      const handlePasswordInput = () => {
        passwordFilled.value = isNonEmpty(passwordInputEl);
        applyButtonClasses();
      };

      onMounted(async () => {
        const container = document.querySelector("#login");
        const form = container?.querySelector("form");

        if (
          !(container instanceof HTMLElement) ||
          !(form instanceof HTMLFormElement) ||
          container.dataset.ruiLoginEnhanced === "true"
        ) {
          return;
        }

        const usernameInput = form.querySelector('input[name="username"]');
        const passwordInput = form.querySelector('input[name="password"]');
        const submitInput = form.querySelector('input[type="submit"]');
        const errorEl = form.querySelector("#error-message");

        if (
          !(usernameInput instanceof HTMLInputElement) ||
          !(passwordInput instanceof HTMLInputElement) ||
          !(submitInput instanceof HTMLInputElement)
        ) {
          return;
        }

        usernameInputEl = usernameInput;
        passwordInputEl = passwordInput;
        submitInputEl = submitInput;

        // Detect error state — require non-empty message text so an
        // empty <p id="error-message"> doesn't render a styled-but-blank
        // alert.
        if (
          errorEl instanceof HTMLElement &&
          (errorEl.textContent ?? "").trim().length > 0
        ) {
          hasError.value = true;
        }

        // Seed filled flags from current input values (covers browser
        // autofill that may have already populated the fields).
        usernameFilled.value = isNonEmpty(usernameInput);
        passwordFilled.value = isNonEmpty(passwordInput);

        // Wire reactive listeners on the relocated inputs (they retain
        // identity across the move). Both `input` and `change` are
        // wired so password managers that prefill via `change`-only
        // still flip the submit button state.
        usernameInput.addEventListener("input", handleUsernameInput);
        usernameInput.addEventListener("change", handleUsernameInput);
        passwordInput.addEventListener("input", handlePasswordInput);
        passwordInput.addEventListener("change", handlePasswordInput);

        container.dataset.ruiLoginEnhanced = "true";

        // Flip `ready` so Vue commits the card shell, await nextTick
        // for the template refs to resolve, then move the native form
        // into the slot. All of this happens inside the current
        // microtask before the browser paints, so the user never sees
        // an empty-card flash.
        ready.value = true;
        await nextTick();

        if (!(formSlot.value instanceof HTMLElement)) {
          return;
        }

        // Move the form wholesale into our card slot. The DOM identity
        // of <form>, inputs, nonce, and submit button is preserved so
        // any existing event listeners and the form's submit wiring
        // continue to work.
        formSlot.value.append(form);

        // Tag the form so it lays out as a flex column matching the
        // card design.
        form.classList.add("flex", "flex-col", "gap-5");

        // Apply utility classes via CVA. The wholesale className
        // assignment inside applyInputClasses / applyButtonClasses
        // replaces any legacy classes the core markup emitted.
        applyInputClasses();
        applyButtonClasses();

        // Style the existing <p> wrappers + labels for the new
        // layout using the shared FIELD_LABEL_CLASSES constant.
        const labelClassTokens = FIELD_LABEL_CLASSES.split(" ");
        const usernameLabel = form.querySelector('label[for="username"]');
        const passwordLabel = form.querySelector('label[for="password"]');
        if (usernameLabel instanceof HTMLElement) {
          usernameLabel.classList.add(...labelClassTokens);
        }
        if (passwordLabel instanceof HTMLElement) {
          passwordLabel.classList.add(...labelClassTokens);
        }

        // Strip <br> wrappers between labels and inputs (label is now
        // a block element via Tailwind).
        form.querySelectorAll("br").forEach((br) => br.remove());

        // Reset inline alignment from the original submit <p>.
        form.querySelectorAll("p").forEach((p) => {
          p.removeAttribute("style");
          p.classList.add("m-0", "flex", "flex-col");
        });

        // Wire ARIA describedby for errors and surface the alert.
        if (hasError.value && errorEl instanceof HTMLElement) {
          usernameInput.setAttribute("aria-describedby", ALERT_ID);
          // Move the error node into the dedicated alert slot so we
          // can re-skin it without fighting the form layout.
          alertSlot.value?.append(errorEl);
          errorEl.id = ALERT_ID;
          errorEl.setAttribute("role", "alert");
          errorEl.className = alertClasses.value;
        } else {
          usernameInput.removeAttribute("aria-describedby");
        }

        // Hide the now-empty original container.
        container.style.display = "none";

        // Focus username input on render.
        usernameInput.focus();
      });

      return {
        ready,
        alertSlot,
        formSlot,
        hasError,
        brandText,
        headingText,
        taglineText,
        pageClasses: PAGE_CLASSES,
        cardClasses: CARD_CLASSES,
        brandClasses: BRAND_CLASSES,
        headingClasses: HEADING_CLASSES,
        taglineClasses: TAGLINE_CLASSES,
        fieldLabelClasses: FIELD_LABEL_CLASSES,
        formContainerClasses: FORM_CONTAINER_CLASSES,
        fieldGroupClasses: FIELD_GROUP_CLASSES,
      };
    },
    template: `
            <div v-if="ready" :class="pageClasses">
                <div :class="cardClasses">
                    <div :class="brandClasses">{{ brandText }}</div>
                    <div class="flex flex-col gap-2">
                        <h1 :class="headingClasses">{{ headingText }}</h1>
                        <p :class="taglineClasses">{{ taglineText }}</p>
                    </div>
                    <div ref="alertSlot"></div>
                    <div ref="formSlot" :class="formContainerClasses"></div>
                </div>
            </div>
        `,
  },
  { shadowRoot: false },
);
