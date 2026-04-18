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
const CAPSLOCK_HINT_ID = "rui-login-capslock-hint";

function normalizeMessage(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveLegacyLoginContainer(host) {
  const container = host?.closest?.("#login");

  if (!(container instanceof HTMLElement)) {
    throw new RuiInvariantError("Expected container to exist before mount.", {
      code: "DOM_MISSING",
    });
  }

  return container;
}

function readLegacyLoginData(container) {
  const form = container.querySelector("form");
  if (!(form instanceof HTMLFormElement)) {
    throw new RuiInvariantError("Expected form element to exist.", {
      code: "DOM_MISSING",
    });
  }

  const hiddenFields = Array.from(
    form.querySelectorAll('input[type="hidden"]'),
  ).map((input) => ({
    name: input.name,
    value: input.value,
  }));

  const errorEl = form.querySelector("#error-message");
  const serverMessage = errorEl ? (errorEl.textContent ?? "").trim() : "";

  return {
    formAction: form.getAttribute("action") ?? "",
    hiddenFields,
    serverMessage,
  };
}

function resolveBrandLogoSource() {
  const legacyLogo = document.querySelector("#yourls-logo");
  if (
    legacyLogo instanceof HTMLImageElement &&
    legacyLogo.src.trim().length > 0
  ) {
    return legacyLogo.src;
  }

  return new URL("../images/yourls-logo.svg", window.location.href).href;
}

function resolveLoginPageHref() {
  const pathname = window.location.pathname || "/admin/index.php";

  return new URL(pathname, window.location.origin).href;
}

export const RuiLogin = defineCustomElement(
  {
    name: "RuiLogin",
    setup() {
      const host = useHost();
      const { t } = useI18n("login");
      const { t: tBrand } = useI18n("brand");

      const ready = ref(false);
      const username = ref("");
      const password = ref("");
      const serverMessage = ref("");
      const brandLogoSrc = ref("");
      const loginPageHref = ref("");
      const didAttemptSubmit = ref(false);
      const showPassword = ref(false);
      const capsLockOn = ref(false);
      const formAction = ref("");
      const hiddenFields = ref([]);

      const usernameInputRef = ref(null);
      const passwordInputRef = ref(null);

      const NON_ERROR_MESSAGES = computed(() =>
        ["messageLogin", "messageLogout"].map((key) =>
          normalizeMessage(t(key)),
        ),
      );

      const usernameFilled = computed(() => username.value.trim().length > 0);
      const passwordFilled = computed(() => password.value.trim().length > 0);

      const hasServerError = computed(
        () =>
          serverMessage.value.length > 0 &&
          !NON_ERROR_MESSAGES.value.includes(
            normalizeMessage(serverMessage.value),
          ),
      );
      const alertRole = computed(() =>
        hasServerError.value ? "alert" : "status",
      );
      const alertAriaLive = computed(() =>
        hasServerError.value ? "assertive" : "polite",
      );
      const alertClass = computed(() =>
        hasServerError.value ? "alert-error" : "alert-info",
      );

      const usernameHasError = computed(
        () =>
          hasServerError.value ||
          (didAttemptSubmit.value && !usernameFilled.value),
      );

      const passwordHasError = computed(
        () =>
          hasServerError.value ||
          (didAttemptSubmit.value && !passwordFilled.value),
      );

      const usernameDescribedBy = computed(() => {
        if (hasServerError.value) {
          return ALERT_ID;
        }

        return null;
      });

      const passwordDescribedBy = computed(() => {
        const ids = [];
        if (hasServerError.value) {
          ids.push(ALERT_ID);
        }
        if (capsLockOn.value) {
          ids.push(CAPSLOCK_HINT_ID);
        }

        return ids.length > 0 ? ids.join(" ") : null;
      });

      const passwordInputType = computed(() =>
        showPassword.value ? "text" : "password",
      );

      const passwordToggleLabel = computed(() =>
        showPassword.value ? t("hidePassword") : t("showPassword"),
      );

      onMounted(async () => {
        if (!(host instanceof HTMLElement)) {
          throw new RuiInvariantError(
            "Expected host element to be an HTMLElement.",
            { code: "DOM_INVALID_TYPE" },
          );
        }

        const container = resolveLegacyLoginContainer(host);
        const legacyData = readLegacyLoginData(container);

        formAction.value = legacyData.formAction;
        hiddenFields.value = legacyData.hiddenFields;
        serverMessage.value = legacyData.serverMessage;
        brandLogoSrc.value = resolveBrandLogoSource();
        loginPageHref.value = resolveLoginPageHref();

        // Replace #login with our custom element host. Vue's custom
        // element runtime defers unmount across synchronous DOM moves,
        // so the component instance survives the relocation.
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

      const handleCredentialInput = () => {
        if (hasServerError.value) {
          serverMessage.value = "";
        }
      };

      const updateCapsLockState = (event) => {
        capsLockOn.value = Boolean(event.getModifierState?.("CapsLock"));
      };

      const clearCapsLockState = () => {
        capsLockOn.value = false;
      };

      const togglePasswordVisibility = (event) => {
        if (event?.target instanceof HTMLInputElement) {
          showPassword.value = event.target.checked;
        } else {
          showPassword.value = !showPassword.value;
        }

        nextTick(() => {
          passwordInputRef.value?.focus();
        });
      };

      const handleSubmit = (event) => {
        didAttemptSubmit.value = true;

        if (!usernameFilled.value || !passwordFilled.value) {
          event.preventDefault();
          if (!usernameFilled.value) {
            usernameInputRef.value?.focus();
            return;
          }
          passwordInputRef.value?.focus();
        }
      };

      return {
        ready,
        username,
        password,
        brandLogoSrc,
        loginPageHref,
        formAction,
        hiddenFields,
        hasServerError,
        alertRole,
        alertAriaLive,
        alertClass,
        serverMessage,
        usernameHasError,
        passwordHasError,
        usernameDescribedBy,
        passwordDescribedBy,
        usernameInputRef,
        passwordInputRef,
        showPassword,
        passwordInputType,
        passwordToggleLabel,
        capsLockOn,
        handleCredentialInput,
        updateCapsLockState,
        clearCapsLockState,
        togglePasswordVisibility,
        handleSubmit,
        t,
        tBrand,
        alertId: ALERT_ID,
        capsLockHintId: CAPSLOCK_HINT_ID,
      };
    },
    template: /* HTML */ `
      <div v-if="ready" class="min-h-full bg-base-100 px-4 py-6 sm:py-10">
        <div class="mx-auto w-full max-w-xs space-y-5">
          <div class="flex items-center gap-6">
            <a
              :href="loginPageHref"
              class="btn h-auto min-h-0 shrink-0 px-1 py-1 btn-ghost"
              :aria-label="t('messageLogin')"
              :title="t('messageLogin')"
            >
              <img
                v-if="brandLogoSrc"
                :src="brandLogoSrc"
                :alt="tBrand('name')"
                class="h-14 w-auto shrink-0"
              />
              <span
                v-else
                class="text-4xl font-semibold tracking-tight text-brand-500"
              >
                {{ tBrand("name") }}
              </span>
            </a>
            <p class="text-sm text-base-content/50">{{ tBrand("tagline") }}</p>
          </div>

          <div
            v-if="serverMessage"
            :id="alertId"
            :role="alertRole"
            :aria-live="alertAriaLive"
            class="alert alert-soft"
            :class="alertClass"
          >
            <div class="flex flex-col gap-1 text-sm">
              <span>{{ serverMessage }}</span>
            </div>
          </div>

          <form
            method="post"
            :action="formAction"
            class="space-y-4"
            novalidate
            @submit="handleSubmit"
          >
            <input
              v-for="field in hiddenFields"
              :key="field.name"
              type="hidden"
              :name="field.name"
              :value="field.value"
            />
            <fieldset class="fieldset">
              <legend class="sr-only fieldset-legend">{{ t("legend") }}</legend>

              <label for="username" class="label"
                >{{ t("usernameLabel") }}</label
              >
              <input
                ref="usernameInputRef"
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                v-model="username"
                class="input w-full"
                :class="{ 'input-error': usernameHasError }"
                :aria-invalid="usernameHasError"
                :aria-describedby="usernameDescribedBy"
                @input="handleCredentialInput"
              />

              <label for="password" class="label"
                >{{ t("passwordLabel") }}</label
              >
              <input
                ref="passwordInputRef"
                id="password"
                name="password"
                :type="passwordInputType"
                autocomplete="current-password"
                required
                v-model="password"
                class="input w-full"
                :class="{ 'input-error': passwordHasError }"
                :aria-invalid="passwordHasError"
                :aria-describedby="passwordDescribedBy"
                @input="handleCredentialInput"
                @keydown="updateCapsLockState"
                @keyup="updateCapsLockState"
                @blur="clearCapsLockState"
              />
              <div class="mt-1 flex gap-2 text-xs text-base-content/60">
                <label>
                  <input
                    id="show-password-toggle"
                    type="checkbox"
                    :checked="showPassword"
                    @change="togglePasswordVisibility"
                    class="toggle toggle-xs"
                  />
                </label>
                <label for="show-password-toggle">
                  {{ passwordToggleLabel }}
                </label>
              </div>
              <p
                v-if="capsLockOn"
                :id="capsLockHintId"
                class="mt-1 text-warning"
              >
                {{ t("capsLockWarning") }}
              </p>
            </fieldset>

            <button type="submit" name="submit" class="btn w-full btn-primary">
              {{ t("submitLabel") }}
            </button>
          </form>
        </div>
      </div>
    `,
  },
  { shadowRoot: false },
);
