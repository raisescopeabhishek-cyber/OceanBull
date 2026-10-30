import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Theme runtime.
 *
 * `mode` is what the user picked: "light", "dark" or "system".
 * `resolved` is what's actually painted, after resolving "system" against the
 * OS setting. Only `resolved` ever reaches the DOM.
 *
 * The <html data-theme> attribute drives every colour in styles/tokens.css,
 * so nothing here needs to know about individual components.
 */

export const THEME_STORAGE_KEY = "ob_theme_mode";

const ThemeContext = createContext(null);

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const readStoredMode = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : null;
  } catch {
    // Private browsing / blocked storage — fall back to the default.
    return null;
  }
};

// Light is the base; "system" follows the OS.
const resolveMode = (mode) =>
  mode === "system" ? (prefersDark() ? "dark" : "light") : mode;

export function ThemeProvider({ children, defaultMode = "system" }) {
  const [mode, setMode] = useState(() => readStoredMode() ?? defaultMode);
  const [resolved, setResolved] = useState(() =>
    resolveMode(readStoredMode() ?? defaultMode)
  );

  // Paint the resolved theme and keep the browser UI (scrollbars, form
  // controls, address bar) in step with it.
  useEffect(() => {
    const next = resolveMode(mode);
    setResolved(next);

    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", next === "dark" ? "#0a111f" : "#f3f5f9");
    }
  }, [mode]);

  // Follow the OS while the user is on "system".
  useEffect(() => {
    if (mode !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = query.matches ? "dark" : "light";
      setResolved(next);
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.style.colorScheme = next;
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  const applyMode = useCallback((next) => {
    setMode(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Not persisting is survivable; the session still themes correctly.
    }
  }, []);

  /**
   * Toggle with the prototype's circular reveal: the new theme spreads from
   * the control that was pressed. Falls back to a plain switch where the
   * View Transition API is unavailable or motion is reduced.
   */
  const toggle = useCallback(
    (event) => {
      const next = resolveMode(mode) === "dark" ? "light" : "dark";
      const run = () => applyMode(next);

      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (!document.startViewTransition || reduced) return run();

      const el = event?.currentTarget;
      const rect = el?.getBoundingClientRect?.();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const y = rect ? rect.top + rect.height / 2 : 0;

      const root = document.documentElement;
      root.style.setProperty("--vt-x", `${x}px`);
      root.style.setProperty("--vt-y", `${y}px`);
      root.style.setProperty(
        "--vt-r",
        `${Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )}px`
      );

      document.startViewTransition(run);
    },
    [applyMode, mode]
  );

  const value = useMemo(
    () => ({
      mode,
      resolved,
      isDark: resolved === "dark",
      setMode: applyMode,
      toggle,
    }),
    [mode, resolved, applyMode, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

/**
 * Convenience hook for components still written around an `isDark` prop.
 * Lets them drop the prop-threading without being rewritten all at once.
 */
export function useIsDark() {
  return useTheme().isDark;
}

export default ThemeProvider;
