function getResponsiveFlags() {
  const config = window.RESPONSIVEUI;
  const rawFlags = config?.flags;

  if (!config || typeof config !== "object") {
    return {};
  }

  if (rawFlags && typeof rawFlags === "object" && !Array.isArray(rawFlags)) {
    return rawFlags;
  }

  // Backward compatibility for old array-based payloads.
  if (Array.isArray(rawFlags)) {
    return Object.fromEntries(rawFlags.map((flag) => [flag, true]));
  }

  return {};
}

export function useResponsiveFlags() {
  const flags = getResponsiveFlags();

  return {
    flags,
    isAuth: flags.authenticated === true,
  };
}
