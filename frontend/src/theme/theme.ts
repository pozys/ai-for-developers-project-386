export type ThemeMode = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

export const themeStorageKey = "app-theme";

const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function getSystemTheme(): ResolvedTheme {
  try {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return "light";
    }

    return window.matchMedia(THEME_MEDIA_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function resolveTheme(
  mode: ThemeMode,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  return mode === "system" ? systemTheme : mode;
}

export function getStoredTheme(): ThemeMode {
  try {
    if (typeof window === "undefined") {
      return "system";
    }

    const storedTheme = window.localStorage.getItem(themeStorageKey);

    return isThemeMode(storedTheme) ? storedTheme : "system";
  } catch {
    return "system";
  }
}

export function getInitialTheme(): ThemeMode {
  return getStoredTheme();
}

export function applyTheme(resolvedTheme: ResolvedTheme) {
  const rootElement = document.documentElement;

  rootElement.classList.toggle("dark", resolvedTheme === "dark");
  rootElement.style.colorScheme = resolvedTheme;
}
