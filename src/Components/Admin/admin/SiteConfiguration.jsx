import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { adminApi } from "@/utils/apiClients";
import {
  Button,
  Field,
  FormPage,
  Input,
  SectionStep,
  Skeleton,
} from "@/Components/ui";

/**
 * Site configuration.
 *
 * The entry archetype, grouped by what each field actually affects: money
 * conversion, the MT5 server, branding, and the download links. The summary
 * rail restates the values that change what clients are charged, because
 * those are the ones worth re-reading before saving.
 *
 * Read-only until Edit is pressed — this page sets live conversion rates, so
 * an accidental keystroke should not be one character away from a save.
 */

const DEFAULT_THEME_COLOR = "#F23645";

const EMPTY_DETAILS = {
  dollarDepositRate: "",
  dollarWithdrawalRate: "",
  serverName: "",
  themeColor: DEFAULT_THEME_COLOR,
  mt5Digit: "",
  websiteName: "",
  logo: "",
  favicon: "",
  tNcLink: "",
  androidDL: "",
  iosDL: "",
  windowsDL: "",
  webLink: "",
  inrUi: false,
};

const SiteConfiguration = () => {
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/site-config`);
      const data = res.data.data;
      if (data) {
        setDetails({
          dollarDepositRate: data.dollarDepositRate || "",
          dollarWithdrawalRate: data.dollarWithdrawalRate || "",
          serverName: data.serverName || "",
          themeColor: data.themeColor || DEFAULT_THEME_COLOR,
          mt5Digit: data.mt5Digit || "",
          websiteName: data.websiteName || "",
          logo: data.logo || "",
          favicon: data.favicon || "",
          tNcLink: data.tNcLink || "",
          androidDL: data.androidDL || "",
          iosDL: data.iosDL || "",
          windowsDL: data.windowsDL || "",
          webLink: data.webLink || "",
          inrUi: data.inrUi || false,
        });
      }
    } catch (error) {
      console.error("Error fetching site config:", error);
      toast.error("Failed to load site configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDetails({
      ...details,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put(`/site-config`, details);
      setIsEditing(false);
      toast.success("Site configuration saved");
    } catch (error) {
      console.error("Error updating site config:", error);
      toast.error("Failed to save site configuration");
    } finally {
      setSaving(false);
    }
  };

  /** Cancel discards the edits by reloading what the server holds. */
  const handleCancel = async () => {
    setIsEditing(false);
    await fetchData();
  };

  const handleResetTheme = async () => {
    setDetails((prevDetails) => ({
      ...prevDetails,
      themeColor: DEFAULT_THEME_COLOR,
    }));
    try {
      await adminApi.put(`/site-config`, {
        ...details,
        themeColor: DEFAULT_THEME_COLOR,
      });
      toast.success("Theme colour reset");
    } catch (error) {
      console.error("Error resetting theme:", error);
      toast.error("Failed to reset theme colour");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const text = (name, label, props = {}) => (
    <Field label={label} htmlFor={`cfg-${name}`} hint={props.hint}>
      <Input
        id={`cfg-${name}`}
        name={name}
        value={details[name] ?? ""}
        onChange={handleChange}
        disabled={!isEditing}
        placeholder={props.placeholder}
        type={props.type}
        className={props.numeric ? "numeric" : undefined}
      />
    </Field>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <FormPage
      breadcrumb="Configuration / Site"
      title="Site configuration"
      description="Conversion rates, MT5 server, branding and the client download links."
      actions={
        isEditing ? (
          <Button variant="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )
      }
      summary={{
        title: "Affects clients",
        rows: [
          {
            label: "Deposit rate",
            value: details.dollarDepositRate || "—",
            tone: "profit",
          },
          {
            label: "Withdrawal rate",
            value: details.dollarWithdrawalRate || "—",
            tone: "loss",
          },
          { label: "MT5 server", value: details.serverName || "—" },
          { label: "MT5 digits", value: details.mt5Digit || "—" },
          {
            label: "INR interface",
            value: details.inrUi ? "On" : "Off",
            weight: "bold",
          },
        ],
        checks: isEditing
          ? ["Rates apply to new deposits and withdrawals immediately."]
          : undefined,
      }}
      submit={
        isEditing
          ? {
              label: "Save configuration",
              onClick: handleSave,
              loading: saving,
            }
          : undefined
      }
    >
      <SectionStep
        index={1}
        title="Money"
        hint="Conversion applied when a client deposits or withdraws."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {text("dollarDepositRate", "Dollar deposit rate", {
            numeric: true,
            placeholder: "86.50",
          })}
          {text("dollarWithdrawalRate", "Dollar withdrawal rate", {
            numeric: true,
            placeholder: "85.00",
          })}
        </div>

        <Field
          label="INR interface"
          className="mt-3"
          hint="Shows amounts to clients in rupees as well as dollars."
        >
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              name="inrUi"
              checked={!!details.inrUi}
              onChange={handleChange}
              disabled={!isEditing}
              className="h-4 w-4 rounded border-line-strong accent-primary disabled:opacity-50"
            />
            <span className="text-sm text-muted">
              {details.inrUi ? "Enabled" : "Disabled"}
            </span>
          </label>
        </Field>
      </SectionStep>

      <SectionStep index={2} title="MT5 server" hint="Where accounts are opened.">
        <div className="grid gap-3 sm:grid-cols-2">
          {text("serverName", "Server name", { placeholder: "OceanBull-Live" })}
          {text("mt5Digit", "Account digits", {
            numeric: true,
            placeholder: "2",
          })}
        </div>
      </SectionStep>

      <SectionStep index={3} title="Branding" hint="Name, marks and theme colour.">
        <div className="grid gap-3 sm:grid-cols-2">
          {text("websiteName", "Website name", { placeholder: "Ocean Bull" })}
          {text("tNcLink", "Terms link", { placeholder: "https://…" })}
          {text("logo", "Logo URL", { placeholder: "https://…" })}
          {text("favicon", "Favicon URL", { placeholder: "https://…" })}
        </div>

        <Field
          label="Theme colour"
          className="mt-3"
          hint="Used in client-facing emails and marketing pages."
          action={
            isEditing ? (
              <button
                type="button"
                onClick={handleResetTheme}
                className="lbl-sm text-primary hover:underline"
              >
                Reset to default
              </button>
            ) : null
          }
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="themeColor"
              value={details.themeColor || DEFAULT_THEME_COLOR}
              onChange={handleChange}
              disabled={!isEditing}
              aria-label="Theme colour"
              className="h-9 w-12 shrink-0 cursor-pointer rounded-field border border-line bg-surface p-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <Input
              name="themeColor"
              value={details.themeColor || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={DEFAULT_THEME_COLOR}
              aria-label="Theme colour hex"
              className="numeric"
            />
          </div>
        </Field>
      </SectionStep>

      <SectionStep
        index={4}
        title="Download links"
        hint="Where the client apps are fetched from."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {text("androidDL", "Android", { placeholder: "https://…" })}
          {text("iosDL", "iOS", { placeholder: "https://…" })}
          {text("windowsDL", "Windows", { placeholder: "https://…" })}
          {text("webLink", "Web terminal", { placeholder: "https://…" })}
        </div>
      </SectionStep>
    </FormPage>
  );
};

export default SiteConfiguration;
