export function useResponsiveConfig() {
  const config = window.RUI && typeof window.RUI === "object" ? window.RUI : {};

  return {
    ...config,
    isAuth: config?.flags?.authenticated === true,
  };
}
