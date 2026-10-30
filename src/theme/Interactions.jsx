import { useEffect } from "react";

/**
 * The interaction layer from the prototype, mounted once for the whole app.
 *
 * Three behaviours that would otherwise have to be wired into every
 * component: a press ripple on buttons, a pointer spotlight on cards, and
 * the circular reveal when the theme changes (handled in ThemeProvider,
 * which sets the origin this reads).
 *
 * All of it is skipped when the device asks for reduced motion.
 */
const Interactions = () => {
  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return undefined;

    const onPointerDown = (e) => {
      const btn = e.target.closest?.("button, .ob-btn, [data-ripple]");
      if (!btn || btn.disabled) return;
      // Only ripple controls that opt in via the shared button styles.
      if (!btn.classList.contains("rounded-field") && !btn.dataset.ripple) return;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.cssText =
        `width:${size}px;height:${size}px;` +
        `left:${e.clientX - rect.left - size / 2}px;` +
        `top:${e.clientY - rect.top - size / 2}px;`;
      btn.appendChild(span);
      setTimeout(() => span.remove(), 650);
    };

    const onPointerMove = (e) => {
      const card = e.target.closest?.(".spot");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return null;
};

export default Interactions;
