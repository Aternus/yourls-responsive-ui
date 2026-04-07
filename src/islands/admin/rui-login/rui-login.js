import { cva } from "class-variance-authority";
import {
  computed,
  defineCustomElement,
  nextTick,
  onMounted,
  ref,
  useHost,
} from "vue";

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

const ALERT_ID = "rui-login-alert";

/* Element
 ************************************************/

export const RuiLogin = defineCustomElement(
  {
    name: "RuiLogin",
    setup() {
      const host = useHost();

      const ready = ref(false);
      const username = ref("");
      const password = ref("");
      const errorMessage = ref("");
      const formAction = ref("");
      const hiddenFields = ref([]);

      const usernameInputRef = ref(null);

      const strings = window.RESPONSIVEUI?.strings?.login ?? {};
      const brandText = strings.brand ?? "YOURLS";
      const headingText = strings.heading ?? "Sign in to your account";
      const taglineText =
        strings.tagline ?? "Enter your credentials to manage your short URLs.";
      const usernameLabelText = strings.usernameLabel ?? "Username";
      const passwordLabelText = strings.passwordLabel ?? "Password";
      const submitLabelText = strings.submitLabel ?? "Login";

      const hasError = computed(() => errorMessage.value.length > 0);

      const bothFilled = computed(
        () =>
          username.value.trim().length > 0 && password.value.trim().length > 0,
      );

      const buttonClasses = computed(() =>
        loginButton({ state: bothFilled.value ? "enabled" : "disabled" }),
      );

      const inputClasses = computed(() =>
        loginInput({ state: hasError.value ? "invalid" : "default" }),
      );

      const alertClasses = computed(() => loginAlert({ severity: "error" }));

      const usernameDescribedBy = computed(() =>
        hasError.value ? ALERT_ID : null,
      );

      onMounted(async () => {
        // The element is rendered inside the legacy `#login` container via
        // the `login_form_top` action. Locate that container, harvest the
        // server-rendered nonce + error, then replace it wholesale with our
        // own host element so Vue owns the markup.
        const container =
          host?.closest?.("#login") ?? document.querySelector("#login");

        if (container instanceof HTMLElement) {
          const form = container.querySelector("form");

          if (form instanceof HTMLFormElement) {
            formAction.value = form.getAttribute("action") ?? "";

            hiddenFields.value = Array.from(
              form.querySelectorAll('input[type="hidden"]'),
            ).map((input) => ({
              name: input.name,
              value: input.value,
            }));

            const errorEl = form.querySelector("#error-message");
            if (errorEl instanceof HTMLElement) {
              errorMessage.value = (errorEl.textContent ?? "").trim();
            }
          }

          // Replace #login with our custom element host. Vue's custom
          // element runtime defers unmount across synchronous DOM moves,
          // so the component instance survives the relocation.
          if (host instanceof HTMLElement && container.parentNode) {
            container.parentNode.replaceChild(host, container);
          }
        }

        ready.value = true;
        await nextTick();
        usernameInputRef.value?.focus();
      });

      return {
        ready,
        username,
        password,
        formAction,
        hiddenFields,
        errorMessage,
        hasError,
        bothFilled,
        buttonClasses,
        inputClasses,
        alertClasses,
        usernameDescribedBy,
        usernameInputRef,
        brandText,
        headingText,
        taglineText,
        usernameLabelText,
        passwordLabelText,
        submitLabelText,
        alertId: ALERT_ID,
      };
    },
    template: `
            <div
                v-if="ready"
                class="flex min-h-screen w-full items-center justify-center bg-neutral-100 px-4 py-12"
            >
                <div class="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-neutral-50 p-8 shadow-xl ring-1 ring-neutral-200">
                    <div class="text-center text-2xl font-extrabold tracking-tight text-brand-500">{{ brandText }}</div>
                    <div class="flex flex-col gap-2">
                        <h1 class="text-center text-2xl font-bold leading-tight text-neutral-950">{{ headingText }}</h1>
                        <p class="text-center text-sm text-neutral-600">{{ taglineText }}</p>
                    </div>
                    <div
                        v-if="hasError"
                        :id="alertId"
                        role="alert"
                        :class="alertClasses"
                    >{{ errorMessage }}</div>
                    <form
                        method="post"
                        :action="formAction"
                        class="flex flex-col gap-5"
                    >
                        <input
                            v-for="field in hiddenFields"
                            :key="field.name"
                            type="hidden"
                            :name="field.name"
                            :value="field.value"
                        />
                        <div class="flex flex-col">
                            <label
                                for="username"
                                class="block text-sm font-medium text-neutral-800 mb-2"
                            >{{ usernameLabelText }}</label>
                            <input
                                ref="usernameInputRef"
                                id="username"
                                name="username"
                                type="text"
                                autocomplete="username"
                                v-model="username"
                                :class="inputClasses"
                                :aria-invalid="hasError"
                                :aria-describedby="usernameDescribedBy"
                            />
                        </div>
                        <div class="flex flex-col">
                            <label
                                for="password"
                                class="block text-sm font-medium text-neutral-800 mb-2"
                            >{{ passwordLabelText }}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autocomplete="current-password"
                                v-model="password"
                                :class="inputClasses"
                                :aria-invalid="hasError"
                            />
                        </div>
                        <button
                            type="submit"
                            name="submit"
                            :class="buttonClasses"
                            :disabled="!bothFilled"
                        >{{ submitLabelText }}</button>
                    </form>
                </div>
            </div>
        `,
  },
  { shadowRoot: false },
);
