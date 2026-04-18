export function useResponsiveConfig() {
  const config =
    window.RESPONSIVEUI && typeof window.RESPONSIVEUI === "object"
      ? window.RESPONSIVEUI
      : {};

  return {
    ...config,
    isAuth: config?.flags?.authenticated === true,
  };
}
