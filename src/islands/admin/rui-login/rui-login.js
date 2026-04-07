import {
  computed,
  defineCustomElement,
  nextTick,
  onMounted,
  ref,
  useHost,
} from "vue";

import { useI18n } from "../../composables/useI18n.js";
import { RuiInvariantError } from "../../lib/errors.js";

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

      const { t } = useI18n("login");

      const hasError = computed(() => errorMessage.value.length > 0);

      const bothFilled = computed(
        () =>
          username.value.trim().length > 0 && password.value.trim().length > 0,
      );

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

        if (!(container instanceof HTMLElement)) {
          throw new RuiInvariantError(
            "Expected container to exist before mount.",
            { code: "DOM_MISSING" },
          );
        }

        const form = container.querySelector("form");
        if (!(form instanceof HTMLFormElement)) {
          throw new RuiInvariantError("Expected form element to exist.", {
            code: "DOM_MISSING",
          });
        }

        formAction.value = form.getAttribute("action") ?? "";

        hiddenFields.value = Array.from(
          form.querySelectorAll('input[type="hidden"]'),
        ).map((input) => ({
          name: input.name,
          value: input.value,
        }));

        const errorEl = form.querySelector("#error-message");
        if (errorEl) {
          errorMessage.value = (errorEl.textContent ?? "").trim();
        }

        // Replace #login with our custom element host. Vue's custom
        // element runtime defers unmount across synchronous DOM moves,
        // so the component instance survives the relocation.
        if (!(host instanceof HTMLElement)) {
          throw new RuiInvariantError(
            "Expected host element to be an HTMLElement.",
            { code: "DOM_INVALID_TYPE" },
          );
        }

        if (!container.parentNode) {
          throw new RuiInvariantError(
            "Expected container to have a parent node.",
            { code: "DOM_MISSING" },
          );
        }
        container.parentNode.replaceChild(host, container);

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
        usernameDescribedBy,
        usernameInputRef,
        t,
        alertId: ALERT_ID,
      };
    },
    template: `
      <div
        v-if="ready"
        class="flex min-h-screen w-full items-start justify-center bg-base-200 px-6 py-10 sm:py-14"
      >
        <div
          class="w-full max-w-sm"
        >
          <div class="text-5xl font-black tracking-tight text-error lowercase">
            {{ t("brand") }}
          </div>
          <div class="mt-10 flex flex-col gap-3">
            <h1 class="text-4xl font-black leading-tight text-base-content sm:text-5xl">{{ t("heading") }}</h1>
            <p class="text-base text-base-content/80">
              {{ t("signupPrompt") }}
              <a href="#" class="link link-primary font-semibold no-underline hover:underline" @click.prevent>{{ t("signUpLabel") }}</a>
            </p>
          </div>
          <div
            v-if="hasError"
            :id="alertId"
            role="alert"
            class="alert alert-error alert-soft mt-6"
          >{{ errorMessage }}
          </div>
          <form
            method="post"
            :action="formAction"
            class="mt-9 flex flex-col gap-5"
          >
            <input
              v-for="field in hiddenFields"
              :key="field.name"
              type="hidden"
              :name="field.name"
              :value="field.value"
            />
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend sr-only">{{ t("heading") }}</legend>
              <label
                for="username"
                class="label text-base font-semibold text-base-content"
              >{{ t("emailLabel") }}</label>
              <input
                ref="usernameInputRef"
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                v-model="username"
                class="input h-12 w-full rounded-lg border-base-300 bg-base-100"
                :class="{ 'input-error': hasError }"
                :aria-invalid="hasError"
                :aria-describedby="usernameDescribedBy"
              />
              <label
                for="password"
                class="label mt-4 text-base font-semibold text-base-content"
              >{{ t("passwordLabel") }}</label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                v-model="password"
                class="input h-12 w-full rounded-lg border-base-300 bg-base-100"
                :class="{ 'input-error': hasError }"
                :aria-invalid="hasError"
              />
            </fieldset>
            <div class="text-right">
              <a href="#" class="link link-primary text-lg font-semibold no-underline hover:underline" @click.prevent>{{ t("forgotPasswordLabel") }}</a>
            </div>
            <button
              type="submit"
              name="submit"
              class="btn btn-primary btn-block h-12 rounded-lg text-base font-semibold"
              :disabled="!bothFilled"
            >{{ t("submitLabel") }}
            </button>
          </form>
          <div class="divider my-8 font-semibold text-base-content/60">{{ t("orLabel") }}</div>
          <div class="flex flex-col gap-3">
            <button type="button" class="btn btn-outline btn-block h-12 justify-center gap-2 rounded-lg border-base-300 bg-base-100 text-base font-semibold normal-case text-base-content">
              <iconify-icon icon="mdi:google" class="text-lg text-error" aria-hidden="true"></iconify-icon>
              <span>{{ t("continueWithGoogleLabel") }}</span>
            </button>
            <button type="button" class="btn btn-outline btn-block h-12 justify-center gap-2 rounded-lg border-base-300 bg-base-100 text-base font-semibold normal-case text-base-content">
              <iconify-icon icon="mdi:apple" class="text-lg" aria-hidden="true"></iconify-icon>
              <span>{{ t("continueWithAppleLabel") }}</span>
            </button>
            <button type="button" class="btn btn-outline btn-block h-12 justify-center gap-2 rounded-lg border-base-300 bg-base-100 text-base font-semibold normal-case text-base-content">
              <iconify-icon icon="mdi:key" class="text-xl" aria-hidden="true"></iconify-icon>
              <span>{{ t("continueWithSsoLabel") }}</span>
            </button>
          </div>
          <p class="mt-8 text-sm leading-relaxed text-base-content/70">
            {{ t("termsPrefix") }}
            <a href="#" class="link link-hover font-medium text-base-content/70" @click.prevent>{{ t("termsOfServiceLabel") }}</a>,
            <a href="#" class="link link-hover font-medium text-base-content/70" @click.prevent>{{ t("privacyPolicyLabel") }}</a>
            {{ t("andLabel") }}
            <a href="#" class="link link-hover font-medium text-base-content/70" @click.prevent>{{ t("acceptableUsePolicyLabel") }}</a>.
          </p>
        </div>
      </div>
    `,
  },
  { shadowRoot: false },
);
