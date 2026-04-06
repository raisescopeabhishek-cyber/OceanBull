import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgePercent,
  Gift,
  Layers3,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Switch } from "../../../Admin/ui/Switch";
import { superAdminApi } from "@/utils/apiClients";

const defaultDepositForm = {
  minDeposit: "",
  maxDeposit: "",
  bonusPercent: "",
  title: "",
  isActive: true,
  sortOrder: 0,
};

const defaultTradeForm = {
  minLot: "",
  maxLot: "",
  bonusAmount: "",
  title: "",
  isActive: true,
  sortOrder: 0,
};

export default function BonusConfig() {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [loading, setLoading] = useState(false);
  const [savingMain, setSavingMain] = useState(false);
  const [error, setError] = useState("");

  const [config, setConfig] = useState({
    depositBonus: {
      isEnabled: true,
      ranges: [],
      maxBonusPerDeposit: "",
      applicableAccountTypes: [],
      notes: "",
    },
    tradeBonus: {
      isEnabled: true,
      ranges: [],
      notes: "",
    },
  });

  const [depositForm, setDepositForm] = useState(defaultDepositForm);
  const [tradeForm, setTradeForm] = useState(defaultTradeForm);
  const [accountTypeInput, setAccountTypeInput] = useState("");

  const depositRanges = useMemo(
    () =>
      [...(config?.depositBonus?.ranges || [])].sort(
        (a, b) =>
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
          Number(a.minDeposit || 0) - Number(b.minDeposit || 0)
      ),
    [config]
  );

  const tradeRanges = useMemo(
    () =>
      [...(config?.tradeBonus?.ranges || [])].sort(
        (a, b) =>
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
          Number(a.minLot || 0) - Number(b.minLot || 0)
      ),
    [config]
  );

  const fetchConfig = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await superAdminApi.get("/deposit-bonus-range-config");
      const data = res?.data?.data || {};

      setConfig({
        depositBonus: {
          isEnabled: data?.depositBonus?.isEnabled ?? true,
          ranges: data?.depositBonus?.ranges || [],
          maxBonusPerDeposit: data?.depositBonus?.maxBonusPerDeposit ?? "",
          applicableAccountTypes:
            data?.depositBonus?.applicableAccountTypes || [],
          notes: data?.depositBonus?.notes || "",
        },
        tradeBonus: {
          isEnabled: data?.tradeBonus?.isEnabled ?? true,
          ranges: data?.tradeBonus?.ranges || [],
          notes: data?.tradeBonus?.notes || "",
        },
      });
    } catch (err) {
      setError("Failed to fetch bonus configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateDepositSettingField = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      depositBonus: {
        ...prev.depositBonus,
        [key]: value,
      },
    }));
  };

  const updateTradeSettingField = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      tradeBonus: {
        ...prev.tradeBonus,
        [key]: value,
      },
    }));
  };

  const saveDepositSettings = async () => {
    const toastId = toast.loading("Saving deposit settings...");
    setSavingMain(true);

    try {
      const payload = {
        isEnabled: config.depositBonus.isEnabled,
        maxBonusPerDeposit:
          config.depositBonus.maxBonusPerDeposit === ""
            ? null
            : Number(config.depositBonus.maxBonusPerDeposit),
        applicableAccountTypes: config.depositBonus.applicableAccountTypes,
        notes: config.depositBonus.notes,
      };

      const res = await superAdminApi.patch(
        "/deposit-bonus-range-config/deposit",
        payload
      );

      if (res?.data?.success) {
        toast.success("Deposit settings updated", { id: toastId });
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to update", { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to save deposit settings", { id: toastId });
    } finally {
      setSavingMain(false);
    }
  };

  const saveTradeSettings = async () => {
    const toastId = toast.loading("Saving trade settings...");
    setSavingMain(true);

    try {
      const payload = {
        isEnabled: config.tradeBonus.isEnabled,
        notes: config.tradeBonus.notes,
      };

      const res = await superAdminApi.patch(
        "/deposit-bonus-range-config/trade",
        payload
      );

      if (res?.data?.success) {
        toast.success("Trade settings updated", { id: toastId });
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to update", { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to save trade settings", { id: toastId });
    } finally {
      setSavingMain(false);
    }
  };

  const addAccountType = () => {
    const value = accountTypeInput.trim();
    if (!value) return;

    const exists = config.depositBonus.applicableAccountTypes.some(
      (item) => item.toLowerCase() === value.toLowerCase()
    );

    if (exists) {
      toast.error("Account type already added");
      return;
    }

    updateDepositSettingField("applicableAccountTypes", [
      ...config.depositBonus.applicableAccountTypes,
      value,
    ]);
    setAccountTypeInput("");
  };

  const removeAccountType = (type) => {
    updateDepositSettingField(
      "applicableAccountTypes",
      config.depositBonus.applicableAccountTypes.filter((item) => item !== type)
    );
  };

  const addDepositRange = async () => {
    const toastId = toast.loading("Adding deposit range...");

    try {
      const payload = {
        minDeposit: Number(depositForm.minDeposit),
        maxDeposit: Number(depositForm.maxDeposit),
        bonusPercent: Number(depositForm.bonusPercent),
        title: depositForm.title,
        isActive: depositForm.isActive,
        sortOrder: Number(depositForm.sortOrder || 0),
      };

      const res = await superAdminApi.post(
        "/deposit-bonus-range-config/deposit/ranges",
        payload
      );

      if (res?.data?.success) {
        toast.success("Deposit range added", { id: toastId });
        setDepositForm(defaultDepositForm);
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to add range", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to add deposit range",
        { id: toastId }
      );
    }
  };

  const addTradeRange = async () => {
    const toastId = toast.loading("Adding trade range...");

    try {
      const payload = {
        minLot: Number(tradeForm.minLot),
        maxLot: Number(tradeForm.maxLot),
        bonusAmount: Number(tradeForm.bonusAmount),
        title: tradeForm.title,
        isActive: tradeForm.isActive,
        sortOrder: Number(tradeForm.sortOrder || 0),
      };

      const res = await superAdminApi.post(
        "/deposit-bonus-range-config/trade/ranges",
        payload
      );

      if (res?.data?.success) {
        toast.success("Trade range added", { id: toastId });
        setTradeForm(defaultTradeForm);
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to add range", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to add trade range",
        { id: toastId }
      );
    }
  };

  const toggleDepositRange = async (range) => {
    const toastId = toast.loading("Updating range...");
    try {
      const res = await superAdminApi.put(
        `/deposit-bonus-range-config/deposit/ranges/${range._id}`,
        {
          isActive: !range.isActive,
        }
      );

      if (res?.data?.success) {
        toast.success("Deposit range updated", { id: toastId });
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to update", { id: toastId });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update deposit range",
        { id: toastId }
      );
    }
  };

  const toggleTradeRange = async (range) => {
    const toastId = toast.loading("Updating range...");
    try {
      const res = await superAdminApi.put(
        `/deposit-bonus-range-config/trade/ranges/${range._id}`,
        {
          isActive: !range.isActive,
        }
      );

      if (res?.data?.success) {
        toast.success("Trade range updated", { id: toastId });
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to update", { id: toastId });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update trade range",
        { id: toastId }
      );
    }
  };

  const deleteDepositRange = async (id) => {
    const toastId = toast.loading("Deleting deposit range...");
    try {
      const res = await superAdminApi.delete(
        `/deposit-bonus-range-config/deposit/ranges/${id}`
      );

      if (res?.data?.success) {
        toast.success("Deposit range deleted", { id: toastId });
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to delete", { id: toastId });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete deposit range",
        { id: toastId }
      );
    }
  };

  const deleteTradeRange = async (id) => {
    const toastId = toast.loading("Deleting trade range...");
    try {
      const res = await superAdminApi.delete(
        `/deposit-bonus-range-config/trade/ranges/${id}`
      );

      if (res?.data?.success) {
        toast.success("Trade range deleted", { id: toastId });
        fetchConfig();
      } else {
        toast.error(res?.data?.message || "Failed to delete", { id: toastId });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete trade range",
        { id: toastId }
      );
    }
  };

  const cardClass = [
    "rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      : "border-orange-100 bg-white/70 shadow-[0_10px_30px_rgba(251,146,60,0.10)]",
  ].join(" ");

  const inputClass = [
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
  ].join(" ");

  const buttonPrimaryClass = [
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
    isDark
      ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
      : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.25)]",
  ].join(" ");

  const sectionTitleClass = [
    "text-lg font-semibold",
    isDark ? "text-white" : "text-slate-900",
  ].join(" ");

  const sectionSubClass = [
    "mt-1 text-sm",
    isDark ? "text-white/45" : "text-slate-500",
  ].join(" ");

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
            <Gift size={14} />
            Bonus Master Config
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Deposit & Trade Bonus Configuration
          </h2>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/55" : "text-slate-600",
            ].join(" ")}
          >
            Manage deposit bonus slabs, trade bonus slabs, toggles, caps, and
            notes from one screen.
          </p>
        </div>
      </div>

      {loading && (
        <div
          className={[
            "rounded-[20px] border px-4 py-6 text-sm",
            isDark
              ? "border-white/10 bg-white/[0.03] text-white/70"
              : "border-slate-200 bg-white/70 text-slate-600",
          ].join(" ")}
        >
          Loading bonus configuration...
        </div>
      )}

      {error && !loading && (
        <div
          className={[
            "flex items-center gap-2 rounded-[20px] border px-4 py-4 text-sm font-medium",
            isDark
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-red-200 bg-red-50 text-red-600",
          ].join(" ")}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Deposit Settings */}
          <div className={cardClass}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className={sectionTitleClass}>Deposit Bonus Settings</h3>
                <p className={sectionSubClass}>
                  Configure deposit bonus toggle, cap, account types, and
                  notes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={config.depositBonus.isEnabled}
                  onCheckedChange={(checked) =>
                    updateDepositSettingField("isEnabled", checked)
                  }
                />
                <span
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.12em]",
                    config.depositBonus.isEnabled
                      ? isDark
                        ? "text-emerald-300"
                        : "text-emerald-600"
                      : isDark
                      ? "text-rose-300"
                      : "text-rose-600",
                  ].join(" ")}
                >
                  {config.depositBonus.isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label
                  className={[
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-white/75" : "text-slate-700",
                  ].join(" ")}
                >
                  Max Bonus Per Deposit
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={config.depositBonus.maxBonusPerDeposit}
                  onChange={(e) =>
                    updateDepositSettingField(
                      "maxBonusPerDeposit",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  className={[
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-white/75" : "text-slate-700",
                  ].join(" ")}
                >
                  Add Applicable Account Type
                </label>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. standard"
                    value={accountTypeInput}
                    onChange={(e) => setAccountTypeInput(e.target.value)}
                    className={inputClass}
                  />
                  <button onClick={addAccountType} className={buttonPrimaryClass}>
                    <Plus size={16} />
                    Add
                  </button>
                </div>

                {config.depositBonus.applicableAccountTypes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {config.depositBonus.applicableAccountTypes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => removeAccountType(item)}
                        className={[
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                          isDark
                            ? "border-white/10 bg-white/[0.05] text-white/80"
                            : "border-slate-200 bg-slate-50 text-slate-700",
                        ].join(" ")}
                      >
                        {item}
                        <Trash2 size={13} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <label
                  className={[
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-white/75" : "text-slate-700",
                  ].join(" ")}
                >
                  Deposit Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Write deposit bonus related notes..."
                  value={config.depositBonus.notes}
                  onChange={(e) =>
                    updateDepositSettingField("notes", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={saveDepositSettings}
                disabled={savingMain}
                className={buttonPrimaryClass}
              >
                <Save size={16} />
                Save Deposit Settings
              </button>
            </div>
          </div>

          {/* Add Deposit Range */}
          <div className={cardClass}>
            <div className="mb-4">
              <h3 className={sectionTitleClass}>Add Deposit Bonus Range</h3>
              <p className={sectionSubClass}>
                Example: 100 to 199 deposit = 5% bonus.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
              <input
                type="number"
                placeholder="Min Deposit"
                value={depositForm.minDeposit}
                onChange={(e) =>
                  setDepositForm((prev) => ({
                    ...prev,
                    minDeposit: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Max Deposit"
                value={depositForm.maxDeposit}
                onChange={(e) =>
                  setDepositForm((prev) => ({
                    ...prev,
                    maxDeposit: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Bonus %"
                value={depositForm.bonusPercent}
                onChange={(e) =>
                  setDepositForm((prev) => ({
                    ...prev,
                    bonusPercent: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <input
                type="text"
                placeholder="Title"
                value={depositForm.title}
                onChange={(e) =>
                  setDepositForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Sort Order"
                value={depositForm.sortOrder}
                onChange={(e) =>
                  setDepositForm((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <button onClick={addDepositRange} className={buttonPrimaryClass}>
                <Plus size={16} />
                Add Range
              </button>
            </div>
          </div>

          {/* Deposit Range Table */}
          <div className={cardClass}>
            <div className="mb-4">
              <h3 className={sectionTitleClass}>Deposit Bonus Ranges</h3>
              <p className={sectionSubClass}>
                Manage deposit slabs and activate/deactivate each slab.
              </p>
            </div>

            {depositRanges.length === 0 ? (
              <div
                className={[
                  "rounded-[18px] border px-4 py-10 text-center text-sm",
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-white/55"
                    : "border-slate-200 bg-slate-50 text-slate-500",
                ].join(" ")}
              >
                No deposit bonus ranges found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div
                  className={[
                    "overflow-hidden rounded-[20px] border",
                    isDark ? "border-white/10" : "border-slate-200",
                  ].join(" ")}
                >
                  <table className="min-w-full">
                    <thead
                      className={[
                        isDark
                          ? "bg-white/[0.06] text-white/80"
                          : "bg-slate-100/80 text-slate-700",
                      ].join(" ")}
                    >
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Title
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Deposit Range
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Bonus %
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Sort
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Status
                        </th>
                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className={isDark ? "bg-transparent" : "bg-white/40"}>
                      {depositRanges.map((item) => (
                        <tr
                          key={item._id}
                          className={[
                            "border-t transition-colors duration-200",
                            isDark
                              ? "border-white/10 hover:bg-white/[0.03]"
                              : "border-slate-200 hover:bg-slate-50/80",
                          ].join(" ")}
                        >
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            {item.title || "-"}
                          </td>
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            ${item.minDeposit} - ${item.maxDeposit}
                          </td>
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            {item.bonusPercent}%
                          </td>
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            {item.sortOrder ?? 0}
                          </td>
                          <td className="px-4 py-4 text-sm sm:px-6">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() => toggleDepositRange(item)}
                              />
                              <span
                                className={[
                                  "text-xs font-semibold uppercase tracking-[0.12em]",
                                  item.isActive
                                    ? isDark
                                      ? "text-emerald-300"
                                      : "text-emerald-600"
                                    : isDark
                                    ? "text-rose-300"
                                    : "text-rose-600",
                                ].join(" ")}
                              >
                                {item.isActive ? "active" : "inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right sm:px-6">
                            <button
                              onClick={() =>
                                window.confirm(
                                  "Are you sure want to delete this deposit range?"
                                ) && deleteDepositRange(item._id)
                              }
                              className={[
                                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                isDark
                                  ? "text-red-300 hover:bg-red-500/10 hover:text-red-200"
                                  : "text-red-500 hover:bg-red-50 hover:text-red-600",
                              ].join(" ")}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Trade Settings */}
          <div className={cardClass}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className={sectionTitleClass}>Trade Bonus Settings</h3>
                <p className={sectionSubClass}>
                  Enable or disable trade bonus logic and manage notes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={config.tradeBonus.isEnabled}
                  onCheckedChange={(checked) =>
                    updateTradeSettingField("isEnabled", checked)
                  }
                />
                <span
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.12em]",
                    config.tradeBonus.isEnabled
                      ? isDark
                        ? "text-emerald-300"
                        : "text-emerald-600"
                      : isDark
                      ? "text-rose-300"
                      : "text-rose-600",
                  ].join(" ")}
                >
                  {config.tradeBonus.isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div>
              <label
                className={[
                  "mb-2 block text-sm font-medium",
                  isDark ? "text-white/75" : "text-slate-700",
                ].join(" ")}
              >
                Trade Notes
              </label>
              <textarea
                rows={4}
                placeholder="Write trade bonus related notes..."
                value={config.tradeBonus.notes}
                onChange={(e) =>
                  updateTradeSettingField("notes", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="mt-5">
              <button
                onClick={saveTradeSettings}
                disabled={savingMain}
                className={buttonPrimaryClass}
              >
                <Save size={16} />
                Save Trade Settings
              </button>
            </div>
          </div>

          {/* Add Trade Range */}
          <div className={cardClass}>
            <div className="mb-4">
              <h3 className={sectionTitleClass}>Add Trade Bonus Range</h3>
              <p className={sectionSubClass}>
                Example: 1 to 5 lot = $300 bonus.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
              <input
                type="number"
                placeholder="Min Lot"
                value={tradeForm.minLot}
                onChange={(e) =>
                  setTradeForm((prev) => ({ ...prev, minLot: e.target.value }))
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Max Lot"
                value={tradeForm.maxLot}
                onChange={(e) =>
                  setTradeForm((prev) => ({ ...prev, maxLot: e.target.value }))
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Bonus Amount"
                value={tradeForm.bonusAmount}
                onChange={(e) =>
                  setTradeForm((prev) => ({
                    ...prev,
                    bonusAmount: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <input
                type="text"
                placeholder="Title"
                value={tradeForm.title}
                onChange={(e) =>
                  setTradeForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Sort Order"
                value={tradeForm.sortOrder}
                onChange={(e) =>
                  setTradeForm((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <button onClick={addTradeRange} className={buttonPrimaryClass}>
                <Plus size={16} />
                Add Range
              </button>
            </div>
          </div>

          {/* Trade Range Table */}
          <div className={cardClass}>
            <div className="mb-4">
              <h3 className={sectionTitleClass}>Trade Bonus Ranges</h3>
              <p className={sectionSubClass}>
                Manage trade lot slabs and bonus amounts.
              </p>
            </div>

            {tradeRanges.length === 0 ? (
              <div
                className={[
                  "rounded-[18px] border px-4 py-10 text-center text-sm",
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-white/55"
                    : "border-slate-200 bg-slate-50 text-slate-500",
                ].join(" ")}
              >
                No trade bonus ranges found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div
                  className={[
                    "overflow-hidden rounded-[20px] border",
                    isDark ? "border-white/10" : "border-slate-200",
                  ].join(" ")}
                >
                  <table className="min-w-full">
                    <thead
                      className={[
                        isDark
                          ? "bg-white/[0.06] text-white/80"
                          : "bg-slate-100/80 text-slate-700",
                      ].join(" ")}
                    >
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Title
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Lot Range
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Bonus Amount
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Sort
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Status
                        </th>
                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className={isDark ? "bg-transparent" : "bg-white/40"}>
                      {tradeRanges.map((item) => (
                        <tr
                          key={item._id}
                          className={[
                            "border-t transition-colors duration-200",
                            isDark
                              ? "border-white/10 hover:bg-white/[0.03]"
                              : "border-slate-200 hover:bg-slate-50/80",
                          ].join(" ")}
                        >
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            {item.title || "-"}
                          </td>
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            {item.minLot} - {item.maxLot} lot
                          </td>
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            ${item.bonusAmount}
                          </td>
                          <td
                            className={[
                              "px-4 py-4 text-sm sm:px-6",
                              isDark ? "text-white/80" : "text-slate-700",
                            ].join(" ")}
                          >
                            {item.sortOrder ?? 0}
                          </td>
                          <td className="px-4 py-4 text-sm sm:px-6">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() => toggleTradeRange(item)}
                              />
                              <span
                                className={[
                                  "text-xs font-semibold uppercase tracking-[0.12em]",
                                  item.isActive
                                    ? isDark
                                      ? "text-emerald-300"
                                      : "text-emerald-600"
                                    : isDark
                                    ? "text-rose-300"
                                    : "text-rose-600",
                                ].join(" ")}
                              >
                                {item.isActive ? "active" : "inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right sm:px-6">
                            <button
                              onClick={() =>
                                window.confirm(
                                  "Are you sure want to delete this trade range?"
                                ) && deleteTradeRange(item._id)
                              }
                              className={[
                                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                isDark
                                  ? "text-red-300 hover:bg-red-500/10 hover:text-red-200"
                                  : "text-red-500 hover:bg-red-50 hover:text-red-600",
                              ].join(" ")}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Quick Summary */}
          <div className={cardClass}>
            <div className="flex items-start gap-3">
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  isDark
                    ? "bg-blue-500/10 text-blue-200"
                    : "bg-orange-50 text-orange-600",
                ].join(" ")}
              >
                <Layers3 size={20} />
              </div>

              <div className="flex-1">
                <h3 className={sectionTitleClass}>Current Summary</h3>
                <p className={sectionSubClass}>
                  A quick overview of active bonus configuration.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div
                    className={[
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      Deposit Bonus
                    </div>
                    <div
                      className={[
                        "mt-2 text-lg font-semibold",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {config.depositBonus.isEnabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>

                  <div
                    className={[
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      Deposit Ranges
                    </div>
                    <div
                      className={[
                        "mt-2 text-lg font-semibold",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {depositRanges.length}
                    </div>
                  </div>

                  <div
                    className={[
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      Trade Ranges
                    </div>
                    <div
                      className={[
                        "mt-2 text-lg font-semibold",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {tradeRanges.length}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {config.depositBonus.applicableAccountTypes?.map((type) => (
                    <span
                      key={type}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                        isDark
                          ? "border-white/10 bg-white/[0.05] text-white/75"
                          : "border-slate-200 bg-white text-slate-700",
                      ].join(" ")}
                    >
                      <BadgePercent size={13} />
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}