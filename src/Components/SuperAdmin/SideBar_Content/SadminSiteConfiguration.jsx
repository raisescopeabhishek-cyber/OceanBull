import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  X,
  Loader2,
  ExternalLink,
  Save,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Switch } from "@/Components/ui/switch";
import { superAdminApi } from "@/utils/apiClients";

const cleanUrl = (val) => (typeof val === "string" ? val.trim() : "");

const isDirectImageUrl = (url) => {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes("i.ibb.co/") ||
    u.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i)
  );
};

const isIbbViewerLink = (url) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return host === "ibb.co" || host === "imgbb.com";
  } catch {
    return false;
  }
};

const extractDirectFromHtml = (html) => {
  if (!html) return "";

  const og =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] || "";

  if (og) return og;

  const tw =
    html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] || "";

  return tw || "";
};

const resolveIbbToDirect = async (url, { timeoutMs = 8000 } = {}) => {
  const value = cleanUrl(url);
  if (!value) return "";
  if (isDirectImageUrl(value)) return value;
  if (!isIbbViewerLink(value)) return value;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(value, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "text/html",
      },
    });

    const html = await res.text();
    const direct = extractDirectFromHtml(html);

    return direct || value;
  } catch (err) {
    console.warn(
      "Could not auto-resolve ImgBB viewer link. Please paste direct link like https://i.ibb.co/.../image.png",
      err
    );
    return value;
  } finally {
    clearTimeout(t);
  }
};

const SadminSiteConfiguration = () => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const inputClass = [
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  ].join(" ");

  const [details, setDetails] = useState({
    serverName: "",
    mt5Digit: "",
    websiteName: "",
    logo: "",
    favicon: "",
    inrUi: false,
    bankDetailsUi: false,
    kycForWithdrawal: false,
    emailToAll: false,
    ibZone: false,
    logoSize: 4,
  });

  const [resolvedMedia, setResolvedMedia] = useState({
    logo: "",
    favicon: "",
  });

  const resolveTimersRef = useRef({ logo: null, favicon: null });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const generalSettingsFields = [
    { name: "serverName", type: "text", placeholder: "Enter server name" },
    { name: "mt5Digit", type: "text", placeholder: "Enter MT5 digit" },
    { name: "websiteName", type: "text", placeholder: "Enter website name" },
    { name: "logoSize", type: "number", placeholder: "Logo size in rem" },
  ];

  const uiSettings = [
    { name: "inrUi", description: "Enable or disable INR UI" },
    { name: "bankDetailsUi", description: "Show bank details in account" },
    { name: "kycForWithdrawal", description: "Require KYC for withdrawal" },
    { name: "emailToAll", description: "Allow admin to email all users" },
    { name: "ibZone", description: "Enable or disable IB panel" },
  ];

  const mediaAssets = [
    { name: "logo", placeholder: "Logo URL (ibb.co or i.ibb.co)", altText: "Logo" },
    { name: "favicon", placeholder: "Favicon URL (ibb.co or i.ibb.co)", altText: "Favicon" },
  ];

  const fetchData = async () => {
    try {
      const res = await superAdminApi.get("/site-config");
      const incoming = res.data?.data || {};
      setDetails((prev) => ({ ...prev, ...incoming }));

      const nextLogo = await resolveIbbToDirect(incoming.logo || "");
      const nextFav = await resolveIbbToDirect(incoming.favicon || "");

      setResolvedMedia({
        logo: nextLogo,
        favicon: nextFav,
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setDetails((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));

    if (name === "logo" || name === "favicon") {
      if (resolveTimersRef.current[name]) {
        clearTimeout(resolveTimersRef.current[name]);
      }

      resolveTimersRef.current[name] = setTimeout(async () => {
        const direct = await resolveIbbToDirect(value);
        setResolvedMedia((prev) => ({ ...prev, [name]: direct }));
      }, 500);
    }
  };

  const handleToggle = (name, value) => {
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalizedLogo = await resolveIbbToDirect(details.logo);
      const normalizedFavicon = await resolveIbbToDirect(details.favicon);

      const payload = {
        ...details,
        logo: normalizedLogo,
        favicon: normalizedFavicon,
      };

      await superAdminApi.put("/site-config", payload);

      setDetails(payload);
      setResolvedMedia({
        logo: normalizedLogo,
        favicon: normalizedFavicon,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsEditing(false);
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      Object.values(resolveTimersRef.current).forEach(
        (t) => t && clearTimeout(t)
      );
    };
  }, []);

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isDark
                ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                : "border-orange-200 bg-orange-50 text-orange-700",
            ].join(" ")}
          >
            <Settings2 size={14} />
            Site Configuration
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Site Configuration
          </h2>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/50" : "text-slate-600",
            ].join(" ")}
          >
            Manage website core settings, media assets, and interface behavior.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                  isDark
                    ? "bg-emerald-500/90 text-white hover:bg-emerald-500 shadow-[0_10px_25px_rgba(16,185,129,0.25)]"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_10px_25px_rgba(16,185,129,0.20)]",
                ].join(" ")}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                  isDark
                    ? "bg-red-500/90 text-white hover:bg-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.20)]"
                    : "bg-red-500 text-white hover:bg-red-600 shadow-[0_10px_25px_rgba(239,68,68,0.18)]",
                ].join(" ")}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                isDark
                  ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.22)]",
              ].join(" ")}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div
          className={[
            "mb-6 flex items-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-medium",
            isDark
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          <CheckCircle2 className="h-5 w-5" />
          Changes saved successfully!
        </div>
      )}

      {loading ? (
        <div
          className={[
            "rounded-[24px] border p-6 flex items-center gap-3",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
              : "border-orange-100 bg-white/70 text-slate-700 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <Loader2
            className={[
              "h-5 w-5 animate-spin",
              isDark ? "text-blue-300" : "text-orange-500",
            ].join(" ")}
          />
          <p>Loading configuration...</p>
        </div>
      ) : (
        <>
          <Section
            title="General Settings"
            isDark={isDark}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generalSettingsFields.map((field) => (
                <SettingCard
                  key={field.name}
                  field={field}
                  details={details}
                  isEditing={isEditing}
                  saving={saving}
                  handleChange={handleChange}
                  formatLabel={formatLabel}
                  inputClass={inputClass}
                  isDark={isDark}
                />
              ))}
            </div>
          </Section>

          <Section
            title="UI Settings"
            subtitle="Configure user interface preferences"
            isDark={isDark}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uiSettings.map((setting) => (
                <ToggleCard
                  key={setting.name}
                  setting={setting}
                  details={details}
                  isEditing={isEditing}
                  saving={saving}
                  onToggle={handleToggle}
                  formatLabel={formatLabel}
                  isDark={isDark}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Media Assets"
            isDark={isDark}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mediaAssets.map((asset) => (
                <MediaCard
                  key={asset.name}
                  asset={asset}
                  details={details}
                  resolvedMedia={resolvedMedia}
                  isEditing={isEditing}
                  saving={saving}
                  handleChange={handleChange}
                  formatLabel={formatLabel}
                  inputClass={inputClass}
                  isDark={isDark}
                />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

const Section = ({ title, subtitle, children, isDark }) => (
  <div
    className={[
      "mt-6 rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
      isDark
        ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
        : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
    ].join(" ")}
  >
    <div className="mb-4">
      <h3
        className={[
          "text-lg font-semibold",
          isDark ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className={[
            "mt-1 text-sm",
            isDark ? "text-white/45" : "text-slate-500",
          ].join(" ")}
        >
          {subtitle}
        </p>
      )}
    </div>

    <div
      className={[
        "rounded-[20px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white/50",
      ].join(" ")}
    >
      {children}
    </div>
  </div>
);

const SettingCard = ({
  field,
  details,
  isEditing,
  saving,
  handleChange,
  formatLabel,
  inputClass,
  isDark,
}) => (
  <div
    className={[
      "rounded-[18px] border p-4",
      isDark
        ? "border-white/10 bg-white/[0.03]"
        : "border-slate-200 bg-white/70",
    ].join(" ")}
  >
    <p
      className={[
        "mb-2 text-xs font-medium uppercase tracking-[0.12em]",
        isDark ? "text-white/45" : "text-slate-500",
      ].join(" ")}
    >
      {formatLabel(field.name)}
    </p>

    {isEditing ? (
      <input
        type={field.type}
        name={field.name}
        value={details[field.name] ?? ""}
        onChange={handleChange}
        disabled={saving}
        placeholder={field.placeholder}
        className={inputClass}
      />
    ) : (
      <div
        className={[
          "rounded-xl border px-4 py-3 text-sm",
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-slate-200 bg-slate-50",
        ].join(" ")}
      >
        {details[field.name] !== "" && details[field.name] !== null ? (
          <span className={isDark ? "text-white" : "text-slate-900"}>
            {String(details[field.name])}
          </span>
        ) : (
          <span className={isDark ? "text-white/40 italic" : "text-slate-400 italic"}>
            Not Set
          </span>
        )}
      </div>
    )}
  </div>
);

const ToggleCard = ({
  setting,
  details,
  isEditing,
  saving,
  onToggle,
  formatLabel,
  isDark,
}) => (
  <div
    className={[
      "rounded-[18px] border p-4 flex items-center justify-between gap-4",
      isDark
        ? "border-white/10 bg-white/[0.03]"
        : "border-slate-200 bg-white/70",
    ].join(" ")}
  >
    <div>
      <p
        className={[
          "text-sm font-semibold",
          isDark ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {formatLabel(setting.name)}
      </p>
      <p
        className={[
          "mt-1 text-xs",
          isDark ? "text-white/45" : "text-slate-500",
        ].join(" ")}
      >
        {setting.description}
      </p>
    </div>

    {isEditing ? (
      <Switch
        checked={!!details[setting.name]}
        onCheckedChange={(val) => onToggle(setting.name, val)}
        disabled={saving}
      />
    ) : (
      <span
        className={[
          "px-3 py-1 rounded-full text-xs font-medium border",
          details[setting.name]
            ? isDark
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
            : isDark
            ? "bg-red-500/20 text-red-300 border-red-500/40"
            : "bg-red-50 text-red-600 border-red-200",
        ].join(" ")}
      >
        {details[setting.name] ? "Enabled" : "Disabled"}
      </span>
    )}
  </div>
);

const MediaCard = ({
  asset,
  details,
  resolvedMedia,
  isEditing,
  saving,
  handleChange,
  formatLabel,
  inputClass,
  isDark,
}) => {
  const rawUrl = details[asset.name] || "";
  const previewUrl = resolvedMedia?.[asset.name] || rawUrl;

  return (
    <div
      className={[
        "rounded-[18px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white/70",
      ].join(" ")}
    >
      <p
        className={[
          "mb-2 text-xs font-medium uppercase tracking-[0.12em]",
          isDark ? "text-white/45" : "text-slate-500",
        ].join(" ")}
      >
        {formatLabel(asset.name)}
      </p>

      {isEditing ? (
        <>
          {(previewUrl || rawUrl) && (
            <div
              className={[
                "mb-4 flex items-center gap-4 rounded-[16px] border p-3",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-slate-200 bg-slate-50",
              ].join(" ")}
            >
              <div
                className={[
                  "w-28 h-16 flex items-center justify-center rounded-xl overflow-hidden border",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-slate-200 bg-white",
                ].join(" ")}
              >
                <img
                  src={previewUrl}
                  alt={asset.altText}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0.4";
                  }}
                />
              </div>

              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "text-sm inline-flex items-center gap-1",
                  isDark ? "text-blue-300" : "text-orange-600",
                ].join(" ")}
              >
                <ExternalLink className="w-4 h-4" />
                View
              </a>
            </div>
          )}

          <input
            type="text"
            name={asset.name}
            value={rawUrl}
            onChange={handleChange}
            placeholder={asset.placeholder}
            disabled={saving}
            className={inputClass}
          />

          {rawUrl &&
            (rawUrl.includes("ibb.co/") || rawUrl.includes("imgbb.com/")) && (
              <p
                className={[
                  "mt-2 text-xs",
                  isDark ? "text-white/45" : "text-slate-500",
                ].join(" ")}
              >
                Tip: You can paste viewer link — we’ll try to auto-convert to a
                direct link. If preview doesn’t load, use direct format like{" "}
                <span
                  className={isDark ? "text-blue-300" : "text-orange-600"}
                >
                  https://i.ibb.co/.../logo.png
                </span>
              </p>
            )}
        </>
      ) : previewUrl ? (
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div
            className={[
              "w-36 h-20 flex items-center justify-center rounded-xl p-2 border",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-slate-200 bg-white",
            ].join(" ")}
          >
            <img
              src={previewUrl}
              alt={asset.altText}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.opacity = "0.4";
              }}
            />
          </div>

          <div>
            <p
              className={[
                "text-sm break-all",
                isDark ? "text-blue-300" : "text-orange-600",
              ].join(" ")}
            >
              {previewUrl}
            </p>

            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                "inline-flex items-center gap-1 mt-2 rounded-lg px-3 py-1.5 text-sm border",
                isDark
                  ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                  : "bg-orange-50 text-orange-700 border-orange-200",
              ].join(" ")}
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>
      ) : (
        <p className={isDark ? "text-white/40 italic" : "text-slate-400 italic"}>
          No {formatLabel(asset.name)} Set
        </p>
      )}
    </div>
  );
};

export default SadminSiteConfiguration;