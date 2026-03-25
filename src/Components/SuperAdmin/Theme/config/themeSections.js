// src/pages/theme/config/themeSections.js

export const SECTIONS = [
  {
    id: "base",
    title: "Base",
    fields: [
      { key: "name", label: "Theme Name", type: "text", placeholder: "e.g. Dark Pro" },
      { key: "bg", label: "Background (--bg)", type: "colorText", placeholder: 'e.g. "0 0 0" or "#000000"' },
      { key: "fg", label: "Foreground (--fg)", type: "colorText", placeholder: 'e.g. "255 255 255" or "#ffffff"' },
      { key: "card", label: "Card (--card)", type: "colorText", placeholder: "e.g. 18 18 18" },
      { key: "border", label: "Border (--border)", type: "colorText", placeholder: "e.g. 255 255 255" },
      { key: "radius", label: "Radius (--radius)", type: "text", placeholder: "e.g. 14px" },
    ],
  },
  {
    id: "brand",
    title: "Brand / Accent",
    fields: [
      { key: "primary", label: "Primary (--primary)", type: "colorText", placeholder: "e.g. 34 197 94" },
      { key: "primaryFg", label: "Primary FG (--primary-fg)", type: "colorText", placeholder: "e.g. 0 0 0" },
      { key: "accent", label: "Accent (--accent)", type: "colorText", placeholder: "e.g. 59 130 246" },
      { key: "accentFg", label: "Accent FG (--accent-fg)", type: "colorText", placeholder: "e.g. 255 255 255" },
      { key: "gradientFrom", label: "Gradient From (--gradient-from)", type: "colorText", placeholder: "e.g. 59 130 246" },
      { key: "gradientTo", label: "Gradient To (--gradient-to)", type: "colorText", placeholder: "e.g. 147 51 234" },
      { key: "glow", label: "Glow Color (--glow)", type: "colorText", placeholder: "e.g. 59 130 246" },
      { key: "shadowColor", label: "Shadow Color (--shadow-color)", type: "colorText", placeholder: "e.g. 0 0 0" },
    ],
  },
  {
    id: "sidebar",
    title: "Sidebar",
    fields: [
      { key: "sidebar", label: "Sidebar (--sidebar)", type: "colorText", placeholder: "e.g. 25 25 25" },
      { key: "sidebarHover", label: "Sidebar Hover (--sidebar-hover)", type: "colorText", placeholder: "e.g. 40 40 40" },
      { key: "sidebarActive", label: "Sidebar Active (--sidebar-active)", type: "colorText", placeholder: "e.g. 34 197 94" },
    ],
  },
  {
    id: "text",
    title: "Text Variants",
    fields: [
      { key: "muted", label: "Muted (--muted)", type: "colorText", placeholder: "e.g. 148 163 184" },
      { key: "mutedFg", label: "Muted FG (--muted-fg)", type: "colorText", placeholder: "e.g. 226 232 240" },
      { key: "placeholder", label: "Placeholder (--placeholder)", type: "colorText", placeholder: "e.g. 148 163 184" },
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces / Layers",
    fields: [
      { key: "surface1", label: "Surface 1 (--surface-1)", type: "colorText", placeholder: "e.g. 10 10 10" },
      { key: "surface2", label: "Surface 2 (--surface-2)", type: "colorText", placeholder: "e.g. 18 18 18" },
      { key: "surface3", label: "Surface 3 (--surface-3)", type: "colorText", placeholder: "e.g. 30 30 30" },
    ],
  },
  {
    id: "table",
    title: "Table / Rows",
    fields: [
      { key: "headerRow", label: "Header Row (--header-row)", type: "colorText", placeholder: "e.g. 30 41 59" },
      { key: "rowHover", label: "Row Hover (--row-hover)", type: "colorText", placeholder: "e.g. 15 23 42" },
    ],
  },
  {
    id: "inputs",
    title: "Inputs / Focus",
    fields: [
      { key: "input", label: "Input BG (--input)", type: "colorText", placeholder: "e.g. 51 65 85" },
      { key: "inputBorder", label: "Input Border (--input-border)", type: "colorText", placeholder: "e.g. 100 116 139" },
      { key: "ring", label: "Focus Ring (--ring)", type: "colorText", placeholder: "e.g. 59 130 246" },
    ],
  },
  {
    id: "status",
    title: "Status Colors",
    fields: [
      { key: "success", label: "Success (--success)", type: "colorText", placeholder: "e.g. 34 197 94" },
      { key: "successFg", label: "Success FG (--success-fg)", type: "colorText", placeholder: "e.g. 0 0 0" },
      { key: "warning", label: "Warning (--warning)", type: "colorText", placeholder: "e.g. 234 179 8" },
      { key: "warningFg", label: "Warning FG (--warning-fg)", type: "colorText", placeholder: "e.g. 0 0 0" },
      { key: "danger", label: "Danger (--danger)", type: "colorText", placeholder: "e.g. 244 63 94" },
      { key: "dangerFg", label: "Danger FG (--danger-fg)", type: "colorText", placeholder: "e.g. 255 255 255" },
      { key: "info", label: "Info (--info)", type: "colorText", placeholder: "e.g. 56 189 248" },
      { key: "infoFg", label: "Info FG (--info-fg)", type: "colorText", placeholder: "e.g. 0 0 0" },
    ],
  },
  {
    id: "effects",
    title: "Effects",
    fields: [
      { key: "effectsEnabled", label: "Enable Effects", type: "boolean" },
      { key: "pattern", label: "Pattern", type: "select", options: ["grid", "dots", "none"] },
    ],
  },
];
