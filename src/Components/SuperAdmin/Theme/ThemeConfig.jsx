import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { setActiveTheme, setThemes } from "@/redux/theme/themeSlice";
import {
  Palette,
  Plus,
  Save,
  Trash2,
  RefreshCcw,
  Copy,
  Upload,
  Download,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import ColorField from "./ColorField";
import { normalizeBoolean, normalizePattern } from "./utils/themeMisc";
import {
  normalizeColorToTripletString,
  toCssRgb,
  hexToTriplet,
} from "./utils/themeColor";
import { applyThemeVarsToRoot } from "./utils/themeApply";
import { SECTIONS } from "./config/themeSections";
import { DEFAULT_THEME } from "./config/themeDefaults";

import {
  apiFetchThemes,
  apiCreateTheme,
  apiUpdateTheme,
  apiDeleteTheme,
  apiActivateTheme,
} from "./services/themeApi";

const makeThemeKey = (count = 0) => {
  const uuid = globalThis?.crypto?.randomUUID?.();
  if (uuid) return `theme_${uuid}`;
  return `theme_${Date.now()}_${count + 1}`;
};

export default function ThemeConfig() {
  const dispatch = useDispatch();
  const { themes, activeThemeId } = useSelector((s) => s.theme);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [livePreview, setLivePreview] = useState(true);

  const [selectedId, setSelectedId] = useState(activeThemeId || null);
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);

  const [openPickerKey, setOpenPickerKey] = useState(null);
  const [openSections, setOpenSections] = useState(() => {
    const map = {};
    SECTIONS.forEach((s) => (map[s.id] = s.id === "base" || s.id === "brand"));
    return map;
  });

  const fileRef = useRef(null);

  const filteredThemes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = themes || [];
    if (!q) return list;
    return list.filter((t) => {
      const a = (t?.name || "").toLowerCase();
      const b = (t?.key || "").toLowerCase();
      return a.includes(q) || b.includes(q);
    });
  }, [themes, search]);

  const selectedTheme = useMemo(() => {
    return (themes || []).find((t) => t.key === selectedId) || null;
  }, [themes, selectedId]);

  useEffect(() => {
    if (!selectedId && activeThemeId) setSelectedId(activeThemeId);
  }, [activeThemeId, selectedId]);

  useEffect(() => {
    if (!selectedTheme) return;
    setDraft({ ...DEFAULT_THEME, ...selectedTheme });
    setDirty(false);

    if (livePreview) applyThemeVarsToRoot({ ...DEFAULT_THEME, ...selectedTheme });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTheme?.key]);

  // ✅ Debounced Live Preview (prevents hang)
  const previewTimerRef = useRef(null);
  const schedulePreviewApply = (themeObj) => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      applyThemeVarsToRoot(themeObj);
    }, 60);
  };

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!livePreview || !draft) return;
    const r = validateAndNormalizeDraft(draft);
    if (!r.ok) return;
    schedulePreviewApply(r.normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, livePreview]);

  const fetchThemes = async () => {
    const toastId = toast.loading("Fetching themes...");
    setLoading(true);
    try {
      const res = await apiFetchThemes();
      if (res?.status) {
        const list = (res?.data?.themes || res?.themes || []).map((t) => ({
          ...DEFAULT_THEME,
          ...t,
        }));

        const activeId = res?.data?.activeThemeId || res?.activeThemeId || null;

        dispatch(setThemes(list));
        if (activeId) dispatch(setActiveTheme(activeId));

        setSelectedId(activeId || list?.[0]?.key || null);
        toast.success(res?.msg || "Themes loaded", { id: toastId });
      } else {
        toast.error(res?.msg || "Failed to fetch themes", { id: toastId });
      }
    } catch (e) {
      toast.error(e?.response?.data?.msg || "Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const createTheme = async () => {
    const toastId = toast.loading("Creating mode...");

    const payload = {
      ...DEFAULT_THEME,
      key: makeThemeKey((themes || []).length),
      name: `Mode ${((themes || []).length || 0) + 1}`,
      isActive: true,
    };

    try {
      const res = await apiCreateTheme(payload);

      if (res?.status) {
        const created = res?.data || null;

        if (created?.key) {
          const updated = [...(themes || []), { ...DEFAULT_THEME, ...created }];

          dispatch(setThemes(updated));
          dispatch(setActiveTheme(created.key));

          setSelectedId(created.key);
          setDraft({ ...DEFAULT_THEME, ...created });
          setDirty(false);

          toast.success(res?.msg || "Mode created", { id: toastId });
        } else {
          toast.success(res?.msg || "Mode created", { id: toastId });
          await fetchThemes();
        }
      } else {
        toast.error(res?.msg || "Create failed", { id: toastId });
      }
    } catch (e) {
      toast.error(e?.response?.data?.msg || "Something went wrong", { id: toastId });
    }
  };

  const deleteTheme = async (key) => {
    if (!key) return;
    const ok = window.confirm("Delete this theme mode?");
    if (!ok) return;

    const toastId = toast.loading("Deleting...");

    try {
      const res = await apiDeleteTheme(key);

      if (res?.status) {
        const updated = (themes || []).filter((t) => t.key !== key);
        dispatch(setThemes(updated));

        if (activeThemeId === key) {
          const next = updated[0]?.key || null;
          if (next) dispatch(setActiveTheme(next));
          setSelectedId(next);
        } else if (selectedId === key) {
          setSelectedId(updated[0]?.key || null);
        }

        setDraft(null);
        setDirty(false);
        toast.success(res?.msg || "Theme deleted", { id: toastId });
      } else {
        toast.error(res?.msg || "Delete failed", { id: toastId });
      }
    } catch (e) {
      toast.error(e?.response?.data?.msg || "Something went wrong", { id: toastId });
    }
  };

  const setActive = async (key) => {
    if (!key) return;

    const toastId = toast.loading("Activating...");
    try {
      const res = await apiActivateTheme(key);

      if (res?.status) {
        const list = (res?.data?.themes || []).map((t) => ({ ...DEFAULT_THEME, ...t }));
        const activeKey = res?.data?.activeThemeId || key;

        if (list.length) dispatch(setThemes(list));
        dispatch(setActiveTheme(activeKey));
        setSelectedId(activeKey);

        const t = (list.length ? list : themes || []).find((x) => x.key === activeKey);
        if (t && livePreview) applyThemeVarsToRoot({ ...DEFAULT_THEME, ...t });

        toast.success(res?.msg || "Active mode updated", { id: toastId });
      } else {
        toast.error(res?.msg || "Activate failed", { id: toastId });
      }
    } catch (e) {
      toast.error(e?.response?.data?.msg || "Something went wrong", { id: toastId });
    }
  };

  const updateDraft = (key, value) => {
    setDraft((p) => ({ ...(p || {}), [key]: value }));
    setDirty(true);
  };

  // ✅ made pure function (so effect can call it)
  const validateAndNormalizeDraft = (d) => {
    if (!d) return { ok: false, msg: "No theme selected" };
    const normalized = { ...DEFAULT_THEME, ...d };

    normalized.key = String(normalized.key || "").trim();
    if (!normalized.key) return { ok: false, msg: "Theme key is missing" };

    normalized.name = (normalized.name || "").trim() || "Untitled Theme";
    normalized.radius = (normalized.radius || "").trim() || DEFAULT_THEME.radius;

    normalized.effectsEnabled = normalizeBoolean(normalized.effectsEnabled, true);
    normalized.pattern = normalizePattern(normalized.pattern);

    const colorKeys = [
      "bg","fg","card","border","primary","primaryFg","accent","accentFg",
      "sidebar","sidebarHover","sidebarActive","muted","mutedFg",
      "surface1","surface2","surface3","headerRow","rowHover",
      "input","inputBorder","ring","placeholder",
      "success","successFg","warning","warningFg","danger","dangerFg",
      "info","infoFg","gradientFrom","gradientTo","glow","shadowColor",
    ];

    for (const k of colorKeys) {
      normalized[k] = normalizeColorToTripletString(normalized[k], DEFAULT_THEME[k]);
    }

    return { ok: true, normalized };
  };

  const saveTheme = async () => {
    const toastId = toast.loading("Saving...");

    const r = validateAndNormalizeDraft(draft);
    if (!r.ok) {
      toast.error(r.msg || "Invalid theme", { id: toastId });
      return;
    }

    const normalized = r.normalized;
    const { key, _id, createdAt, updatedAt, ...updates } = normalized;

    try {
      const res = await apiUpdateTheme(key, updates);

      if (res?.status) {
        const updatedTheme = res?.data || { ...normalized };

        const updated = (themes || []).map((t) =>
          t.key === key ? { ...DEFAULT_THEME, ...updatedTheme } : t
        );
        dispatch(setThemes(updated));

        if (activeThemeId === key) dispatch(setActiveTheme(key));

        setDirty(false);
        if (livePreview) applyThemeVarsToRoot({ ...DEFAULT_THEME, ...updatedTheme });

        toast.success(res?.msg || "Theme saved", { id: toastId });
      } else {
        toast.error(res?.msg || "Save failed", { id: toastId });
      }
    } catch (e) {
      toast.error(e?.response?.data?.msg || "Something went wrong", { id: toastId });
    }
  };

  const copyJson = async () => {
    try {
      const payload = JSON.stringify(
        { activeThemeId: activeThemeId || null, themes: themes || [] },
        null,
        2
      );
      await navigator.clipboard.writeText(payload);
      toast.success("Copied JSON");
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadJson = () => {
    const payload = JSON.stringify(
      { activeThemeId: activeThemeId || null, themes: themes || [] },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "themes.json";
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Downloaded themes.json");
  };

  const importJson = async (file) => {
    if (!file) return;
    const toastId = toast.loading("Importing...");
    try {
      const text = await file.text();
      const obj = JSON.parse(text);

      const listRaw = Array.isArray(obj?.themes) ? obj.themes : [];
      const list = listRaw.map((t) => ({ ...DEFAULT_THEME, ...t }));
      const activeId = obj?.activeThemeId || list?.[0]?.key || null;

      dispatch(setThemes(list));
      if (activeId) dispatch(setActiveTheme(activeId));

      setSelectedId(activeId);
      toast.success("Imported themes", { id: toastId });
    } catch (e) {
      toast.error("Invalid JSON file", { id: toastId });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleSection = (id) => {
    setOpenSections((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">Theme Config</h2>
          <p className="text-white/60 text-sm">
            Multiple modes create karo, full site theme control ke liye extra tokens included.
          </p>
          <p className="text-white/40 text-xs mt-1">
            Tip: Colors <b>"R G B"</b> or <b>"#RRGGBB"</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLivePreview((v) => !v)}
            className="h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2"
            title="Apply CSS variables to <html> for preview"
          >
            {livePreview ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="text-sm">
              {livePreview ? "Live Preview: ON" : "Live Preview: OFF"}
            </span>
          </button>

          <button
            onClick={fetchThemes}
            disabled={loading}
            className={[
              "h-10 px-3 rounded-lg border border-white/10",
              "bg-white/10 hover:bg-white/15 transition flex items-center gap-2",
              loading ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <RefreshCcw size={16} />
            {loading ? "Loading..." : "Fetch Themes"}
          </button>

          <button
            onClick={createTheme}
            className="h-10 px-3 rounded-lg border border-white/10 bg-emerald-500/15 hover:bg-emerald-500/20 transition flex items-center gap-2"
          >
            <Plus size={16} />
            New Mode
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* LEFT */}
        <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Palette size={16} />
              <span className="text-sm tracking-wide font-semibold">Modes</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyJson}
                className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                title="Copy themes JSON"
              >
                <Copy size={16} />
              </button>

              <button
                onClick={downloadJson}
                className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                title="Download themes JSON"
              >
                <Download size={16} />
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                title="Import themes JSON"
              >
                <Upload size={16} />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => importJson(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search theme name / key..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>

            <div className="text-xs text-white/55 mb-3">
              Active Theme ID:{" "}
              <span className="text-white/85 font-semibold">{activeThemeId || "-"}</span>
            </div>

            <div className="space-y-2">
              {filteredThemes.map((t) => {
                const isActive = activeThemeId === t.key;
                const isSelected = selectedId === t.key;

                const swatchBg = toCssRgb(normalizeColorToTripletString(t.bg, DEFAULT_THEME.bg));
                const swatchPrimary = toCssRgb(
                  normalizeColorToTripletString(t.primary, DEFAULT_THEME.primary)
                );

                return (
                  <div
                    key={t.key}
                    className={[
                      "rounded-xl border p-3 transition",
                      isSelected
                        ? "border-white/25 bg-white/10"
                        : "border-white/10 bg-black/10 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <button onClick={() => setSelectedId(t.key)} className="w-full text-left">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white/85 truncate">{t.name}</div>
                          <div className="text-[11px] text-white/45 truncate">{t.key}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-md border border-white/10"
                            style={{ background: swatchBg }}
                            title="bg"
                          />
                          <div
                            className="h-6 w-6 rounded-md border border-white/10"
                            style={{ background: swatchPrimary }}
                            title="primary"
                          />
                        </div>
                      </div>
                    </button>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActive(t.key)}
                        className={[
                          "h-9 px-3 rounded-lg border text-sm transition flex items-center gap-2",
                          isActive
                            ? "border-emerald-400/30 bg-emerald-500/15 text-white"
                            : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80",
                        ].join(" ")}
                        title="Set Active"
                      >
                        <CheckCircle2 size={16} />
                        {isActive ? "Active" : "Set Active"}
                      </button>

                      <button
                        onClick={() => deleteTheme(t.key)}
                        className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/15 hover:border-red-400/20 transition grid place-items-center"
                        title="Delete mode"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredThemes.length === 0 && (
                <div className="text-sm text-white/45 py-8 text-center">No modes found.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white/85 truncate">
                {draft?.name || "Select a mode"}
              </div>
              <div className="text-xs text-white/45 truncate">
                {draft?.key ? `Editing: ${draft.key}` : "No mode selected"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!draft || !dirty}
                onClick={() => {
                  if (!selectedTheme) return;
                  setDraft({ ...DEFAULT_THEME, ...selectedTheme });
                  setDirty(false);
                  toast.success("Changes discarded");
                }}
                className={[
                  "h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm",
                  !draft || !dirty ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                Reset
              </button>

              <button
                disabled={!draft}
                onClick={() => {
                  if (!draft) return;
                  const r = validateAndNormalizeDraft(draft);
                  if (r.ok) applyThemeVarsToRoot(r.normalized);
                  toast.success("Applied preview");
                }}
                className={[
                  "h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm",
                  !draft ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                Apply
              </button>

              <button
                disabled={!draft || !dirty}
                onClick={saveTheme}
                className={[
                  "h-10 px-3 rounded-lg border border-white/10 bg-indigo-500/20 hover:bg-indigo-500/25 transition text-sm flex items-center gap-2",
                  !draft || !dirty ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>

          <div className="p-5">
            {!draft ? (
              <div className="text-white/50 text-sm py-10 text-center">
                Select a mode from left, or create a new one.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {SECTIONS.map((section) => {
                    const open = !!openSections[section.id];

                    return (
                      <div
                        key={section.id}
                        className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition"
                        >
                          <div className="text-sm font-semibold text-white/85">{section.title}</div>
                          {open ? (
                            <ChevronDown className="w-4 h-4 text-white/70" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/70" />
                          )}
                        </button>

                        {open && (
                          <div className="p-4 grid gap-4 sm:grid-cols-2">
                            {section.fields.map((f) => {
                              const val = draft?.[f.key];

                              if (f.type === "boolean") {
                                return (
                                  <div key={f.key} className="space-y-2">
                                    <label className="text-xs text-white/70">{f.label}</label>
                                    <button
                                      type="button"
                                      onClick={() => updateDraft(f.key, !normalizeBoolean(val, true))}
                                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm flex items-center justify-center"
                                    >
                                      {normalizeBoolean(val, true) ? "ON" : "OFF"}
                                    </button>
                                  </div>
                                );
                              }

                              if (f.type === "select") {
                                return (
                                  <div key={f.key} className="space-y-2">
                                    <label className="text-xs text-white/70">{f.label}</label>
                                    <select
                                      value={String(val || "grid")}
                                      onChange={(e) => updateDraft(f.key, e.target.value)}
                                      className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                                    >
                                      {(f.options || []).map((opt) => (
                                        <option key={opt} value={opt} className="bg-black text-white">
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              }

                              if (f.type === "colorText") {
                                return (
                                  <ColorField
                                    key={f.key}
                                    label={f.label}
                                    value={val ?? ""}
                                    placeholder={f.placeholder}
                                    openKey={openPickerKey}
                                    setOpenKey={setOpenPickerKey}
                                    myKey={`${section.id}:${f.key}`}
                                    onChange={(v) => updateDraft(f.key, v)}
                                    onPickHex={(hex) => {
                                      const t = hexToTriplet(hex);
                                      if (!t) return;
                                      updateDraft(f.key, `${t[0]} ${t[1]} ${t[2]}`);
                                    }}
                                  />
                                );
                              }

                              return (
                                <div key={f.key} className="space-y-2">
                                  <label className="text-xs text-white/70">{f.label}</label>
                                  <input
                                    value={val ?? ""}
                                    onChange={(e) => updateDraft(f.key, e.target.value)}
                                    placeholder={f.placeholder}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {dirty && (
                  <div className="mt-5 text-xs text-amber-300/80">
                    You have unsaved changes. Click <b>Save</b>.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-white/40">
        Live Preview applies vars to <code className="text-white/55">document.documentElement</code>.
      </div>
    </div>
  );
}
