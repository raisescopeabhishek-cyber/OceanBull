import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ThemeProvider({ children }) {
  const activeTheme = useSelector((s) => s.theme.activeTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Option A: if you store themes as tokens (recommended)
    if (activeTheme?.tokens) {
      Object.entries(activeTheme.tokens).forEach(([k, v]) => {
        root.style.setProperty(`--${k}`, String(v));
      });
      return;
    }

    // Option B: if you store themeName like "light", "dark"
    if (activeTheme?.slug) {
      root.setAttribute("data-theme", activeTheme.slug);
    }
  }, [activeTheme]);

  return children;
}
