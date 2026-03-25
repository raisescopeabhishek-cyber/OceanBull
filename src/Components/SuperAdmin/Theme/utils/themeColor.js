// src/pages/theme/utils/themeColor.js

const isRgbTriplet = (v) =>
  typeof v === "string" && /^\s*\d{1,3}\s+\d{1,3}\s+\d{1,3}\s*$/.test(v);

const inRange255 = (n) => Number.isFinite(n) && n >= 0 && n <= 255;

export const parseTriplet = (v) => {
  if (!isRgbTriplet(v)) return null;
  const parts = v.trim().split(/\s+/).map((x) => Number(x));
  if (parts.length !== 3) return null;
  if (!parts.every(inRange255)) return null;
  return parts;
};

const isHex = (v) =>
  typeof v === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());

export const hexToTriplet = (hex) => {
  if (!isHex(hex)) return null;
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (![r, g, b].every(inRange255)) return null;
  return [r, g, b];
};

export const tripletToHex = (tripletString) => {
  const t = parseTriplet(tripletString);
  if (!t) return "#000000";
  const to2 = (n) => n.toString(16).padStart(2, "0");
  return `#${to2(t[0])}${to2(t[1])}${to2(t[2])}`;
};

export const normalizeColorToTripletString = (value, fallbackTripletString) => {
  if (typeof value !== "string") return fallbackTripletString;
  const v = value.trim();
  const t1 = parseTriplet(v);
  if (t1) return `${t1[0]} ${t1[1]} ${t1[2]}`;
  const t2 = hexToTriplet(v);
  if (t2) return `${t2[0]} ${t2[1]} ${t2[2]}`;
  return fallbackTripletString;
};

export const toCssRgb = (tripletString) => {
  const t = parseTriplet(tripletString);
  if (!t) return "rgb(0,0,0)";
  return `rgb(${t[0]}, ${t[1]}, ${t[2]})`;
};
