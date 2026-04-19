import {
  computed,
  defineCustomElement,
  nextTick,
  onMounted,
  reactive,
  ref,
  useHost,
} from "vue";

import { useI18n } from "../../composables/useI18n.js";
import { ensureHostElement, replaceElementWithHost } from "../../lib/dom.js";
import { RuiInvariantError } from "../../lib/errors.js";

const ALERT_ID = "rui-login-alert";
const CAPSLOCK_HINT_ID = "rui-login-capslock-hint";
const LEGACY_LOGIN_SELECTOR = "#login";
const ADMIN_INDEX_PATH = "/admin/index.php";
const BRAND_LOGO_PATH = "/images/yourls-logo.svg";
const NON_ERROR_MESSAGE_KEYS = ["messageLogin", "messageLogout"];

function normalizeMessage(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveLegacyLoginContainer(host) {
  const container = host?.closest?.(LEGACY_LOGIN_SELECTOR);

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

function resolveLoginPageHref() {
  return new URL(ADMIN_INDEX_PATH, window.location.origin).href;
}

function resolveBrandLogoHref() {
  return new URL(BRAND_LOGO_PATH, window.location.origin).href;
}

export const RuiLogin = defineCustomElement(
  {
    name: "RuiLogin",
    setup() {
      const host = useHost();
      const { t } = useI18n("login");
      const { t: tBrand } = useI18n("brand");

      const isReady = ref(false);
      const credentials = reactive({
        username: "",
        password: "",
      });
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

      const nonErrorMessages = computed(() =>
        NON_ERROR_MESSAGE_KEYS.map((key) => normalizeMessage(t(key))),
      );

      const usernameFilled = computed(
        () => credentials.username.trim().length > 0,
      );
      const passwordFilled = computed(
        () => credentials.password.trim().length > 0,
      );

      const hasServerError = computed(
        () =>
          serverMessage.value.length > 0 &&
          !nonErrorMessages.value.includes(
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
        const hostElement = ensureHostElement(host);

        const container = resolveLegacyLoginContainer(hostElement);
        const legacyData = readLegacyLoginData(container);

        formAction.value = legacyData.formAction;
        hiddenFields.value = legacyData.hiddenFields;
        serverMessage.value = legacyData.serverMessage;
        brandLogoSrc.value = resolveBrandLogoHref();
        loginPageHref.value = resolveLoginPageHref();

        // Replace #login with our custom element host. Vue's custom
        // element runtime defers unmount across synchronous DOM moves,
        // so the component instance survives the relocation.
        replaceElementWithHost(container, hostElement);

        isReady.value = true;
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

      const togglePasswordVisibility = () => {
        showPassword.value = !showPassword.value;

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
        isReady,
        credentials,
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
      <div v-if="isReady" class="min-h-full bg-base-100 px-4 py-6 sm:py-10">
        <div class="mx-auto w-full max-w-xs space-y-5">
          <a
            :href="loginPageHref"
            class="btn h-auto px-0 btn-ghost"
            :aria-label="t('messageLogin')"
          >
            <img :src="brandLogoSrc" :alt="tBrand('name')" class="h-14" />
          </a>

          <div
            v-if="serverMessage"
            :id="alertId"
            :role="alertRole"
            :aria-live="alertAriaLive"
            class="alert alert-soft"
            :class="alertClass"
          >
            <p class="text-sm">{{ serverMessage }}</p>
          </div>

          <form
            method="post"
            :action="formAction"
            class="space-y-4"
            novalidate
            @submit="handleSubmit"
          >
            <input
              v-for="(field, index) in hiddenFields"
              :key="field.name + '-' + index"
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
                v-model="credentials.username"
                class="input w-full"
                :class="{ 'input-error': usernameHasError }"
                :aria-invalid="usernameHasError"
                :aria-describedby="usernameDescribedBy"
                @input="handleCredentialInput"
              />

              <label for="password" class="label"
                >{{ t("passwordLabel") }}</label
              >
              <div class="join w-full">
                <input
                  ref="passwordInputRef"
                  id="password"
                  name="password"
                  :type="passwordInputType"
                  autocomplete="current-password"
                  required
                  v-model="credentials.password"
                  class="input join-item grow"
                  :class="{ 'input-error': passwordHasError }"
                  :aria-invalid="passwordHasError"
                  :aria-describedby="passwordDescribedBy"
                  @input="handleCredentialInput"
                  @keydown="updateCapsLockState"
                  @keyup="updateCapsLockState"
                  @blur="clearCapsLockState"
                />
                <button
                  type="button"
                  class="btn join-item btn-square"
                  :aria-label="passwordToggleLabel"
                  :aria-pressed="showPassword"
                  :title="passwordToggleLabel"
                  aria-controls="password"
                  @click="togglePasswordVisibility"
                >
                  <span
                    class="swap"
                    :class="{ 'swap-active': showPassword }"
                    aria-hidden="true"
                  >
                    <iconify-icon
                      class="swap-off"
                      icon="mdi:eye-outline"
                    ></iconify-icon>
                    <iconify-icon
                      class="swap-on"
                      icon="mdi:eye-off-outline"
                    ></iconify-icon>
                  </span>
                </button>
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
