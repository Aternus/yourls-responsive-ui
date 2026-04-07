import { onBeforeUnmount, ref } from "vue";

export function useCopyFeedback(options = {}) {
  const {
    defaultIcon = "mdi:content-copy",
    defaultLabel = "Copy short URL",
    copiedIcon = "mdi:check",
    copiedLabel = "Copied",
    resetAfterMs = 1200,
  } = options;

  const iconName = ref(defaultIcon);
  const label = ref(defaultLabel);
  let resetTimer = 0;

  const clearResetTimer = () => {
    if (!resetTimer) {
      return;
    }

    window.clearTimeout(resetTimer);
    resetTimer = 0;
  };

  const reset = () => {
    clearResetTimer();
    iconName.value = defaultIcon;
    label.value = defaultLabel;
  };

  const markCopied = () => {
    clearResetTimer();
    iconName.value = copiedIcon;
    label.value = copiedLabel;

    resetTimer = window.setTimeout(() => {
      iconName.value = defaultIcon;
      label.value = defaultLabel;
      resetTimer = 0;
    }, resetAfterMs);
  };

  onBeforeUnmount(() => {
    clearResetTimer();
  });

  return {
    iconName,
    label,
    markCopied,
    reset,
  };
}
