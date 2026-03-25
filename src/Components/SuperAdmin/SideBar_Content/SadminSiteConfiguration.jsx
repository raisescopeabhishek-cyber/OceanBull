// ✅ Super Admin Site Configuration - Platform Theme UI (FULL UPDATED)
// ✅ Now supports pasting ImgBB "viewer links" (https://ibb.co/xxxx) and auto-resolves to direct image URL (https://i.ibb.co/.../file.png)

import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  X,
  Loader2,
  ExternalLink,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "@/Components/ui/switch";
import { superAdminApi } from "@/utils/apiClients";

// ✅ Common Dark Input Class (fixes black-on-black)
const INPUT_CLASS =
  "w-full px-4 py-2 rounded-md border border-gray-700 bg-primary-900/60 text-white placeholder:text-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 " +
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

/* ============================
   ✅ ImgBB URL Resolver Helpers
   ============================ */

// Basic cleanup
const cleanUrl = (val) => (typeof val === "string" ? val.trim() : "");

// Recognize "direct image" links
const isDirectImageUrl = (url) => {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes("i.ibb.co/") ||
    u.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i)
  );
};

// Recognize ImgBB "viewer links"
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

// Parse og:image / twitter:image from HTML
const extractDirectFromHtml = (html) => {
  if (!html) return "";

  // og:image first
  const og =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] || "";

  if (og) return og;

  // twitter:image fallback
  const tw =
    html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] || "";

  return tw || "";
};

// Resolve ImgBB viewer link -> direct link (best-effort)
// NOTE: Some browsers may block cross-origin HTML fetch due to CORS on ibb.co.
// If that happens, we gracefully fallback to the original URL and show a console warning.
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
      // mode: "cors" is default. If ibb blocks CORS, it will throw.
      headers: {
        "Accept": "text/html",
      },
    });

    const html = await res.text();
    const direct = extractDirectFromHtml(html);

    return direct || value;
  } catch (err) {
    console.warn(
      "⚠️ Could not auto-resolve ImgBB viewer link (likely CORS). Please paste direct link like https://i.ibb.co/.../image.png",
      err
    );
    return value;
  } finally {
    clearTimeout(t);
  }
};

const SadminSiteConfiguration = () => {
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

  // ✅ Resolved preview URLs (so even if user pastes viewer link, preview uses direct URL)
  const [resolvedMedia, setResolvedMedia] = useState({
    logo: "",
    favicon: "",
  });

  // ✅ Avoid resolving on every keystroke too aggressively
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
    { name: "ibZone", description: "Enable/Disable IB panel" },
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

      // ✅ build resolved previews after fetch
      const nextLogo = await resolveIbbToDirect(incoming.logo || "");
      const nextFav = await resolveIbbToDirect(incoming.favicon || "");
      setResolvedMedia({
        logo: nextLogo,
        favicon: nextFav,
      });
    } catch (err) {
      console.error("❌ Fetch Error:", err);
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

    // ✅ If media URL, resolve viewer link -> direct link (debounced)
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
      // ✅ Always save DIRECT links if we could resolve them
      const normalizedLogo = await resolveIbbToDirect(details.logo);
      const normalizedFavicon = await resolveIbbToDirect(details.favicon);

      const payload = {
        ...details,
        logo: normalizedLogo,
        favicon: normalizedFavicon,
      };

      await superAdminApi.put("/site-config", payload);

      // ✅ Update state to show saved normalized URLs
      setDetails(payload);
      setResolvedMedia({
        logo: normalizedLogo,
        favicon: normalizedFavicon,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      // cleanup debounce timers
      Object.values(resolveTimersRef.current).forEach((t) => t && clearTimeout(t));
    };
  }, []);

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
        Site Configuration
      </h2>

      {/* Header Action Bar */}
      <div className="bg-primary-700/40 text-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <p className="text-sm text-gray-200">
            Manage website core settings and appearance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Save Success */}
      {saveSuccess && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-green-500/20 text-green-300 border border-green-500/40">
          <CheckCircle2 className="w-5 h-5" /> Changes saved successfully!
        </div>
      )}

      {/* Loader */}
      {loading ? (
        <div className="mt-6 bg-primary-700/40 text-white rounded-lg shadow-lg p-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Loading configuration...</p>
        </div>
      ) : (
        <>
          {/* General Settings */}
          <Section title="General Settings">
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
                />
              ))}
            </div>
          </Section>

          {/* UI Settings */}
          <Section title="UI Settings" subtitle="Configure user interface preferences">
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
                />
              ))}
            </div>
          </Section>

          {/* Media Assets */}
          <Section title="Media Assets">
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
                />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

/* ===== Platform-theme Subcomponents ===== */

const Section = ({ title, subtitle, children }) => (
  <div className="mt-6 bg-primary-700/40 text-white rounded-lg shadow-lg p-4 sm:p-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-gray-200 mt-1">{subtitle}</p>}
    </div>

    <div className="border border-gray-700 rounded-lg p-4 bg-primary-700/30">
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
}) => (
  <div className="border border-gray-700 rounded-lg p-4 bg-primary-700/40">
    <p className="text-xs text-gray-200 mb-2">{formatLabel(field.name)}</p>

    {isEditing ? (
      <input
        type={field.type}
        name={field.name}
        value={details[field.name] ?? ""}
        onChange={handleChange}
        disabled={saving}
        placeholder={field.placeholder}
        className={INPUT_CLASS}
      />
    ) : (
      <div className="px-4 py-2 border border-gray-700 rounded-md bg-primary-700/50">
        {details[field.name] !== "" && details[field.name] !== null ? (
          <span className="text-white">{String(details[field.name])}</span>
        ) : (
          <span className="text-gray-300 italic">Not Set</span>
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
}) => (
  <div className="border border-gray-700 rounded-lg p-4 bg-primary-700/40 flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-white">
        {formatLabel(setting.name)}
      </p>
      <p className="text-xs text-gray-200 mt-1">{setting.description}</p>
    </div>

    {isEditing ? (
      <Switch
        checked={!!details[setting.name]}
        onCheckedChange={(val) => onToggle(setting.name, val)}
        disabled={saving}
      />
    ) : (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          details[setting.name]
            ? "bg-green-500/20 text-green-300 border-green-500/40"
            : "bg-red-500/20 text-red-300 border-red-500/40"
        }`}
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
}) => {
  const rawUrl = details[asset.name] || "";
  const previewUrl = resolvedMedia?.[asset.name] || rawUrl;

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-primary-700/40">
      <p className="text-xs text-gray-200 mb-2">{formatLabel(asset.name)}</p>

      {isEditing ? (
        <>
          {(previewUrl || rawUrl) && (
            <div className="mb-4 flex items-center gap-4 border border-gray-700 rounded-lg p-3 bg-primary-700/30">
              <div className="w-28 h-16 flex items-center justify-center bg-primary-700/50 rounded-md overflow-hidden border border-gray-700">
                <img
                  src={previewUrl}
                  alt={asset.altText}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    // If preview fails, don't break UI
                    e.currentTarget.style.opacity = "0.4";
                  }}
                />
              </div>

              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 text-sm inline-flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" /> View
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
            className={INPUT_CLASS}
          />

          {/* Small hint if user pasted viewer link */}
          {rawUrl && (rawUrl.includes("ibb.co/") || rawUrl.includes("imgbb.com/")) && (
            <p className="mt-2 text-xs text-gray-300">
              Tip: You can paste viewer link — we’ll try to auto-convert to direct link.
              If preview doesn’t load, use direct format like{" "}
              <span className="text-blue-300">https://i.ibb.co/.../logo.png</span>
            </p>
          )}
        </>
      ) : previewUrl ? (
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-36 h-20 flex items-center justify-center bg-primary-700/50 rounded-md p-2 border border-gray-700">
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
            <p className="text-blue-300 text-sm break-all">{previewUrl}</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm border border-blue-500/30"
            >
              <ExternalLink className="w-4 h-4" /> Open
            </a>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 italic">No {formatLabel(asset.name)} Set</p>
      )}
    </div>
  );
};

export default SadminSiteConfiguration;
