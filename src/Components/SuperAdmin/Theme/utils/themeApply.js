// src/pages/theme/utils/themeApply.js
import { DEFAULT_THEME } from "../config/themeDefaults";
import { normalizeColorToTripletString } from "./themeColor";
import { normalizeBoolean, normalizePattern } from "./themeMisc";

export const applyThemeVarsToRoot = (theme) => {
  if (!theme) return;
  const root = document.documentElement;

  const set = (varName, value, fallback) =>
    root.style.setProperty(varName, normalizeColorToTripletString(value, fallback));

  // base
  set("--bg", theme.bg, DEFAULT_THEME.bg);
  set("--fg", theme.fg, DEFAULT_THEME.fg);
  set("--card", theme.card, DEFAULT_THEME.card);
  set("--border", theme.border, DEFAULT_THEME.border);
  root.style.setProperty("--radius", typeof theme.radius === "string" ? theme.radius : DEFAULT_THEME.radius);

  // brand
  set("--primary", theme.primary, DEFAULT_THEME.primary);
  set("--primary-fg", theme.primaryFg, DEFAULT_THEME.primaryFg);
  set("--accent", theme.accent, DEFAULT_THEME.accent);
  set("--accent-fg", theme.accentFg, DEFAULT_THEME.accentFg);

  // sidebar
  set("--sidebar", theme.sidebar, DEFAULT_THEME.sidebar);
  set("--sidebar-hover", theme.sidebarHover, DEFAULT_THEME.sidebarHover);
  set("--sidebar-active", theme.sidebarActive, DEFAULT_THEME.sidebarActive);

  // text
  set("--muted", theme.muted, DEFAULT_THEME.muted);
  set("--muted-fg", theme.mutedFg, DEFAULT_THEME.mutedFg);

  // surfaces
  set("--surface-1", theme.surface1, DEFAULT_THEME.surface1);
  set("--surface-2", theme.surface2, DEFAULT_THEME.surface2);
  set("--surface-3", theme.surface3, DEFAULT_THEME.surface3);

  // table
  set("--header-row", theme.headerRow, DEFAULT_THEME.headerRow);
  set("--row-hover", theme.rowHover, DEFAULT_THEME.rowHover);

  // inputs
  set("--input", theme.input, DEFAULT_THEME.input);
  set("--input-border", theme.inputBorder, DEFAULT_THEME.inputBorder);
  set("--ring", theme.ring, DEFAULT_THEME.ring);
  set("--placeholder", theme.placeholder, DEFAULT_THEME.placeholder);

  // status
  set("--success", theme.success, DEFAULT_THEME.success);
  set("--success-fg", theme.successFg, DEFAULT_THEME.successFg);
  set("--warning", theme.warning, DEFAULT_THEME.warning);
  set("--warning-fg", theme.warningFg, DEFAULT_THEME.warningFg);
  set("--danger", theme.danger, DEFAULT_THEME.danger);
  set("--danger-fg", theme.dangerFg, DEFAULT_THEME.dangerFg);
  set("--info", theme.info, DEFAULT_THEME.info);
  set("--info-fg", theme.infoFg, DEFAULT_THEME.infoFg);

  // gradients + glow/shadow
  set("--gradient-from", theme.gradientFrom, DEFAULT_THEME.gradientFrom);
  set("--gradient-to", theme.gradientTo, DEFAULT_THEME.gradientTo);
  set("--glow", theme.glow, DEFAULT_THEME.glow);
  set("--shadow-color", theme.shadowColor, DEFAULT_THEME.shadowColor);

  // effects flags as data-attrs
  const effectsEnabled = normalizeBoolean(theme.effectsEnabled, true);
  const pattern = normalizePattern(theme.pattern);

  root.dataset.effects = effectsEnabled ? "on" : "off";
  root.dataset.pattern = pattern;
};
