export function useI18n(context) {
  const contextMap = window.RESPONSIVEUI?.i18n?.[context];
  const t = (key) => {
    const value = contextMap?.[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }

    return key;
  };

  return { t };
}
