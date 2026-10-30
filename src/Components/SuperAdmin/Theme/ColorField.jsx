import React, { useEffect, useMemo, useRef, useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
  safePolygon,
} from "@floating-ui/react";

function clamp255(n) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(255, x));
}

function rgbTripletStringToHex(input) {
  if (!input) return null;
  const s = String(input).trim();

  if (s.startsWith("#")) {
    const hex = s.toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(hex)) return hex;
    if (/^#[0-9A-F]{3}$/.test(hex)) {
      return (
        "#" +
        hex[1] + hex[1] +
        hex[2] + hex[2] +
        hex[3] + hex[3]
      );
    }
    return null;
  }

  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length !== 3) return null;

  const r = clamp255(parseInt(parts[0], 10));
  const g = clamp255(parseInt(parts[1], 10));
  const b = clamp255(parseInt(parts[2], 10));

  const toHex2 = (v) => v.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

export default function ColorField({
  label,
  value,
  placeholder,
  openKey,
  setOpenKey,
  myKey,
  onChange,
  onPickHex,
}) {
  const open = openKey === myKey;
  const setOpen = (v) => setOpenKey(v ? myKey : null);

  const parsedHex = useMemo(() => rgbTripletStringToHex(value) || "#000000", [value]);
  const [hex, setHex] = useState(parsedHex);

  useEffect(() => setHex(parsedHex), [parsedHex]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  // ✅ Hover open (with safePolygon so moving cursor into picker doesn't close it)
  const hover = useHover(context, {
    delay: { open: 120, close: 120 },
    handleClose: safePolygon(),
    move: false,
  });

  // ✅ Click also works (mobile friendly)
  const click = useClick(context, { event: "click" });

  const dismiss = useDismiss(context, { outsidePressEvent: "pointerdown" });
  const role = useRole(context, { role: "dialog" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    dismiss,
    role,
  ]);

  // ✅ rAF throttle: drag smooth (no "hang")
  const rafRef = useRef(0);
  const pendingHexRef = useRef(null);

  const emitPickHex = (nextHex) => {
    pendingHexRef.current = nextHex;

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const h = pendingHexRef.current;
      pendingHexRef.current = null;
      if (h) onPickHex?.(h);
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const applyHex = (nextHex) => {
    const cleaned = String(nextHex || "").trim();
    setHex(cleaned);
    emitPickHex(cleaned);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted">{label}</label>

      <div className="flex items-center gap-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-card border border-line bg-black/60 px-3 py-2 text-sm text-text placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-line"
        />

        <button
          type="button"
          ref={refs.setReference}
          {...getReferenceProps()}
          className="h-10 w-12 rounded-card border border-line bg-surface-2 hover:bg-surface-2 transition relative"
          title="Hover / click to open picker"
        >
          <span
            className="absolute inset-1 rounded-field border border-line"
            style={{ background: hex }}
          />
        </button>
      </div>

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className="z-[99999] w-[280px] rounded-card border border-line bg-black/60 backdrop-blur-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted">Pick color</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs px-2 py-1 rounded-field border border-line bg-surface-2 hover:bg-surface-2 transition text-muted"
                >
                  Close
                </button>
              </div>

              <div className="rounded-card overflow-hidden border border-line">
                <HexColorPicker color={hex} onChange={applyHex} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div
                  className="h-9 w-10 rounded-card border border-line"
                  style={{ background: hex }}
                  title={hex}
                />
                <HexColorInput
                  color={hex}
                  onChange={applyHex}
                  prefixed
                  className="h-9 flex-1 rounded-card border border-line bg-black/60 px-3 text-sm text-text placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-line"
                />
              </div>

              <div className="mt-2 text-[11px] text-subtle">
                Smooth mode: updates are throttled, so picker drag won’t hang.
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
