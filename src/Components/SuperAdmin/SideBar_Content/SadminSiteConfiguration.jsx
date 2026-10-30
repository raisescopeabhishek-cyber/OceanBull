import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  X,
  Loader2,
  ExternalLink,
  Save,
  CheckCircle2,
  Settings2,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Switch } from "@/Components/ui/switch";
import { superAdminApi } from "@/utils/apiClients";

const initialDetails = {
  dollarDepositRate: 85,
  dollarWithdrawalRate: 85,
  serverName: "",
  themeColor: "#6080FF",
  mt5Digit: 6,
  websiteName: "",
  logo: "",
  bgImage: "",
  favicon: "",
  tNcLink: "",
  androidDL: "",
  iosDL: "",
  windowsDL: "",
  webLink: "",
  inrUi: true,
  logoSize: 4,
};

const imageFields = ["logo", "bgImage", "favicon"];

const getApiOrigin = () => {
  const baseURL = superAdminApi?.defaults?.baseURL || "";

  try {
    return new URL(baseURL, window.location.origin).origin;
  } catch {
    return "";
  }
};

const getPreviewUrl = (value) => {
  if (!value) return "";

  if (
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const apiOrigin = getApiOrigin();

  if (!apiOrigin) return value;

  return `${apiOrigin}${value.startsWith("/") ? value : `/${value}`}`;
};

const SadminSiteConfiguration = () => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const inputClass = [
    "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  ].join(" ");

  const [details, setDetails] = useState(initialDetails);
  const [selectedFiles, setSelectedFiles] = useState({
    logo: null,
    bgImage: null,
    favicon: null,
  });
  const [localPreviews, setLocalPreviews] = useState({
    logo: "",
    bgImage: "",
    favicon: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const financialFields = [
    {
      name: "dollarDepositRate",
      type: "number",
      placeholder: "Enter dollar deposit rate",
    },
    {
      name: "dollarWithdrawalRate",
      type: "number",
      placeholder: "Enter dollar withdrawal rate",
    },
  ];

  const generalSettingsFields = [
    { name: "serverName", type: "text", placeholder: "Enter server name" },
    { name: "websiteName", type: "text", placeholder: "Enter website name" },
    { name: "themeColor", type: "color", placeholder: "Choose theme color" },
    { name: "mt5Digit", type: "number", placeholder: "Enter MT5 digit" },
    { name: "logoSize", type: "number", placeholder: "Logo size in rem" },
  ];

  const linkFields = [
    { name: "tNcLink", type: "text", placeholder: "Terms and conditions link" },
    { name: "androidDL", type: "text", placeholder: "Android download link" },
    { name: "iosDL", type: "text", placeholder: "iOS download link" },
    { name: "windowsDL", type: "text", placeholder: "Windows download link" },
    { name: "webLink", type: "text", placeholder: "Web platform link" },
  ];

  const mediaAssets = [
    { name: "logo", label: "Logo", altText: "Logo" },
    { name: "bgImage", label: "Background Image", altText: "Background Image" },
    { name: "favicon", label: "Favicon", altText: "Favicon" },
  ];

  const hasChanges = useMemo(() => {
    return imageFields.some((field) => selectedFiles[field]);
  }, [selectedFiles]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await superAdminApi.get("/site-config");
      const incoming = res.data?.data || {};

      setDetails({
        ...initialDetails,
        ...incoming,
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetLocalFiles = () => {
    Object.values(localPreviews).forEach((url) => {
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    setSelectedFiles({
      logo: null,
      bgImage: null,
      favicon: null,
    });

    setLocalPreviews({
      logo: "",
      bgImage: "",
      favicon: "",
    });
  };

  const handleCancel = () => {
    resetLocalFiles();
    setIsEditing(false);
    fetchData();
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setDetails((prev) => ({
      ...prev,
      [name]: type === "number" ? value : value,
    }));
  };

  const handleToggle = (name, value) => {
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name, file) => {
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    const oldPreview = localPreviews[name];

    if (oldPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(oldPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedFiles((prev) => ({
      ...prev,
      [name]: file,
    }));

    setLocalPreviews((prev) => ({
      ...prev,
      [name]: previewUrl,
    }));
  };

  const handleRemoveImage = (name) => {
    const oldPreview = localPreviews[name];

    if (oldPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(oldPreview);
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [name]: null,
    }));

    setLocalPreviews((prev) => ({
      ...prev,
      [name]: "",
    }));

    setDetails((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const appendValue = (formData, key, value) => {
    if (value === undefined || value === null) {
      formData.append(key, "");
      return;
    }

    formData.append(key, String(value));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const formData = new FormData();

      Object.keys(initialDetails).forEach((key) => {
        appendValue(formData, key, details[key]);
      });

      imageFields.forEach((field) => {
        if (selectedFiles[field]) {
          formData.append(field, selectedFiles[field]);
        }
      });

      const res = await superAdminApi.put("/site-config", formData);

      const updated = res.data?.data || {};

      setDetails({
        ...initialDetails,
        ...updated,
      });

      resetLocalFiles();

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
      Object.values(localPreviews).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const formatLabel = (key) =>
    key
      .replace(/DL$/, " Download")
      .replace(/Ui$/, " UI")
      .replace(/tNc/, "T&C")
      .replace(/mt5/, "MT5")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
            ].join(" ")}
          >
            <Settings2 size={14} />
            Site Configuration
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight","text-text",
            ].join(" ")}
          >
            Site Configuration
          </h2>

          <p
            className={[
              "mt-1 text-sm","text-subtle",
            ].join(" ")}
          >
            Manage website core settings, media assets, links, and interface behavior.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={[
                  "inline-flex items-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50","bg-success-soft text-text hover:bg-success",
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
                onClick={handleCancel}
                disabled={saving}
                className={[
                  "inline-flex items-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50","bg-danger-soft text-text hover:bg-danger",
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
                "inline-flex items-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition-all duration-300","bg-primary-soft text-text hover:bg-primary",
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
            "mb-6 flex items-center gap-2 rounded-card border px-4 py-3 text-sm font-medium","border-success bg-success-soft text-success",
          ].join(" ")}
        >
          <CheckCircle2 className="h-5 w-5" />
          Changes saved successfully!
        </div>
      )}

      {loading ? (
        <div
          className={[
            "rounded-card border p-6 flex items-center gap-3","border-line bg-surface-2 text-text",
          ].join(" ")}
        >
          <Loader2
            className={[
              "h-5 w-5 animate-spin","text-primary",
            ].join(" ")}
          />
          <p>Loading configuration...</p>
        </div>
      ) : (
        <>
          <Section title="Financial Settings" isDark={isDark}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialFields.map((field) => (
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

          <Section title="General Settings" isDark={isDark}>
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
              <ToggleCard
                setting={{
                  name: "inrUi",
                  description: "Enable or disable INR UI",
                }}
                details={details}
                isEditing={isEditing}
                saving={saving}
                onToggle={handleToggle}
                formatLabel={formatLabel}
                isDark={isDark}
              />
            </div>
          </Section>

          <Section title="Download & Web Links" isDark={isDark}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {linkFields.map((field) => (
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
            title="Media Assets"
            subtitle="Upload logo, background image, and favicon directly from your computer"
            isDark={isDark}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mediaAssets.map((asset) => (
                <MediaUploadCard
                  key={asset.name}
                  asset={asset}
                  details={details}
                  localPreviews={localPreviews}
                  isEditing={isEditing}
                  saving={saving}
                  onFileChange={handleFileChange}
                  onRemoveImage={handleRemoveImage}
                  isDark={isDark}
                />
              ))}
            </div>

            {isEditing && hasChanges && (
              <p
                className={[
                  "mt-4 text-xs","text-subtle",
                ].join(" ")}
              >
                Selected images will be uploaded after you click Save.
              </p>
            )}
          </Section>
        </>
      )}
    </div>
  );
};

const Section = ({ title, subtitle, children, isDark }) => (
  <div
    className={[
      "mt-6 rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
    ].join(" ")}
  >
    <div className="mb-4">
      <h3
        className={[
          "text-lg font-semibold","text-text",
        ].join(" ")}
      >
        {title}
      </h3>

      {subtitle && (
        <p
          className={[
            "mt-1 text-sm","text-subtle",
          ].join(" ")}
        >
          {subtitle}
        </p>
      )}
    </div>

    <div
      className={[
        "rounded-card border p-4","border-line bg-surface-2",
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
}) => {
  const value = details[field.name] ?? "";

  return (
    <div
      className={[
        "rounded-card border p-4","border-line bg-surface-2",
      ].join(" ")}
    >
      <p
        className={[
          "mb-2 text-xs font-medium uppercase tracking-[0.12em]","text-subtle",
        ].join(" ")}
      >
        {formatLabel(field.name)}
      </p>

      {isEditing ? (
        <input
          type={field.type}
          name={field.name}
          value={value}
          onChange={handleChange}
          disabled={saving}
          placeholder={field.placeholder}
          className={
            field.type === "color"
              ? [
                  inputClass,
                  "h-[46px] cursor-pointer p-1",
                ].join(" ")
              : inputClass
          }
        />
      ) : (
        <div
          className={[
            "rounded-card border px-4 py-3 text-sm min-h-[46px] flex items-center","border-line bg-surface-2",
          ].join(" ")}
        >
          {value !== "" && value !== null ? (
            field.type === "color" ? (
              <div className="flex items-center gap-3">
                <span
                  className="h-6 w-10 rounded-field border border-line"
                  style={{ backgroundColor: value }}
                />
                <span className={"text-text"}>
                  {String(value)}
                </span>
              </div>
            ) : (
              <span className={"text-text"}>
                {String(value)}
              </span>
            )
          ) : (
            <span
              className={"text-subtle italic"}
            >
              Not Set
            </span>
          )}
        </div>
      )}
    </div>
  );
};

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
      "rounded-card border p-4 flex items-center justify-between gap-4","border-line bg-surface-2",
    ].join(" ")}
  >
    <div>
      <p
        className={[
          "text-sm font-semibold","text-text",
        ].join(" ")}
      >
        {formatLabel(setting.name)}
      </p>

      <p
        className={[
          "mt-1 text-xs","text-subtle",
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
            ?"bg-success-soft text-success border-success"
            :"bg-danger-soft text-danger border-danger",
        ].join(" ")}
      >
        {details[setting.name] ? "Enabled" : "Disabled"}
      </span>
    )}
  </div>
);

const MediaUploadCard = ({
  asset,
  details,
  localPreviews,
  isEditing,
  saving,
  onFileChange,
  onRemoveImage,
  isDark,
}) => {
  const existingUrl = details[asset.name] || "";
  const previewUrl = localPreviews[asset.name] || getPreviewUrl(existingUrl);

  return (
    <div
      className={[
        "rounded-card border p-4","border-line bg-surface-2",
      ].join(" ")}
    >
      <p
        className={[
          "mb-2 text-xs font-medium uppercase tracking-[0.12em]","text-subtle",
        ].join(" ")}
      >
        {asset.label}
      </p>

      {previewUrl ? (
        <div className="flex flex-col gap-4">
          <div
            className={[
              "h-32 w-full flex items-center justify-center rounded-card overflow-hidden border p-3","border-line bg-surface-2",
            ].join(" ")}
          >
            <img
              src={previewUrl}
              alt={asset.altText}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.opacity = "0.35";
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {existingUrl && (
              <a
                href={getPreviewUrl(existingUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "inline-flex items-center gap-1 rounded-field px-3 py-1.5 text-sm border","bg-primary-soft text-primary border-line",
                ].join(" ")}
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => onRemoveImage(asset.name)}
                disabled={saving}
                className={[
                  "inline-flex items-center gap-1 rounded-field px-3 py-1.5 text-sm border disabled:opacity-50","bg-danger-soft text-danger border-danger",
                ].join(" ")}
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={[
            "h-32 rounded-card border border-dashed flex items-center justify-center text-sm","border-line bg-surface-2 text-subtle",
          ].join(" ")}
        >
          No {asset.label} Uploaded
        </div>
      )}

      {isEditing && (
        <label
          className={[
            "mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-semibold transition-all duration-300",
            saving ? "pointer-events-none opacity-50" : "","border-line bg-primary-soft text-primary hover:bg-primary-soft",
          ].join(" ")}
        >
          <UploadCloud className="h-4 w-4" />
          Upload {asset.label}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={saving}
            onChange={(e) => onFileChange(asset.name, e.target.files?.[0])}
          />
        </label>
      )}

      {existingUrl && (
        <p
          className={[
            "mt-3 break-all text-xs","text-subtle",
          ].join(" ")}
        >
          {existingUrl}
        </p>
      )}
    </div>
  );
};

export default SadminSiteConfiguration;