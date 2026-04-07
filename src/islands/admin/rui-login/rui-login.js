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
        class="hero min-h-screen bg-base-200 px-4 py-8 sm:px-6"
      >
        <div class="hero-content w-full max-w-md p-0">
          <div
            class="card w-full border border-base-300 bg-base-100 shadow-xl"
          >
            <div class="card-body gap-6 p-6 sm:p-8">
              <div class="space-y-3">
                <div class="text-4xl font-black tracking-tight text-error lowercase">
                  {{ t("brand") }}
                </div>
                <h1 class="card-title text-3xl font-black sm:text-4xl">{{ t("heading") }}</h1>
                <p class="text-base text-base-content/80">{{ t("tagline") }}</p>
              </div>

              <div
                v-if="hasError"
                :id="alertId"
                role="alert"
                class="alert alert-error alert-soft"
              >{{ errorMessage }}
              </div>

              <form
                method="post"
                :action="formAction"
                class="space-y-4"
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
                    class="label text-base font-semibold"
                  >{{ t("usernameLabel") }}</label>
                  <input
                    ref="usernameInputRef"
                    id="username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    v-model="username"
                    class="input w-full"
                    :class="{ 'input-error': hasError }"
                    :aria-invalid="hasError"
                    :aria-describedby="usernameDescribedBy"
                  />
                  <label
                    for="password"
                    class="label mt-2 text-base font-semibold"
                  >{{ t("passwordLabel") }}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    v-model="password"
                    class="input w-full"
                    :class="{ 'input-error': hasError }"
                    :aria-invalid="hasError"
                  />
                </fieldset>
                <button
                  type="submit"
                  name="submit"
                  class="btn btn-primary w-full"
                  :disabled="!bothFilled"
                >{{ t("submitLabel") }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  { shadowRoot: false },
);
