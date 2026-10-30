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
    "rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
  ].join(" ");

  const inputClass = [
    "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
  ].join(" ");

  const buttonPrimaryClass = [
    "inline-flex items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300","bg-primary-soft text-text hover:bg-primary",
  ].join(" ");

  const sectionTitleClass = [
    "text-lg font-semibold","text-text",
  ].join(" ");

  const sectionSubClass = [
    "mt-1 text-sm","text-subtle",
  ].join(" ");

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
            ].join(" ")}
          >
            <Gift size={14} />
            Bonus Master Config
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight","text-text",
            ].join(" ")}
          >
            Deposit & Trade Bonus Configuration
          </h2>

          <p
            className={[
              "mt-1 text-sm","text-subtle",
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
            "rounded-card border px-4 py-6 text-sm","border-line bg-surface-2 text-muted",
          ].join(" ")}
        >
          Loading bonus configuration...
        </div>
      )}

      {error && !loading && (
        <div
          className={[
            "flex items-center gap-2 rounded-card border px-4 py-4 text-sm font-medium","border-danger bg-danger-soft text-danger",
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
                      ?"text-success"
                      :"text-danger",
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
                    "mb-2 block text-sm font-medium","text-muted",
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
                    "mb-2 block text-sm font-medium","text-muted",
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
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium","border-line bg-surface-2 text-muted",
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
                    "mb-2 block text-sm font-medium","text-muted",
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
                  "rounded-card border px-4 py-10 text-center text-sm","border-line bg-surface-2 text-subtle",
                ].join(" ")}
              >
                No deposit bonus ranges found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div
                  className={[
                    "overflow-hidden rounded-card border","border-line",
                  ].join(" ")}
                >
                  <table className="min-w-full table-stack">
                    <thead
                      className={["bg-surface-2 text-muted",
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

                    <tbody className={"bg-transparent"}>
                      {depositRanges.map((item) => (
                        <tr
                          key={item._id}
                          className={[
                            "border-t transition-colors duration-200","border-line hover:bg-surface-2",
                          ].join(" ")}
                        >
                          <td data-label="Title"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            {item.title || "-"}
                          </td>
                          <td data-label="Deposit Range"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            ${item.minDeposit} - ${item.maxDeposit}
                          </td>
                          <td data-label="Bonus %"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            {item.bonusPercent}%
                          </td>
                          <td data-label="Sort"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            {item.sortOrder ?? 0}
                          </td>
                          <td data-label="Status" className="px-4 py-4 text-sm sm:px-6">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() => toggleDepositRange(item)}
                              />
                              <span
                                className={[
                                  "text-xs font-semibold uppercase tracking-[0.12em]",
                                  item.isActive
                                    ?"text-success"
                                    :"text-danger",
                                ].join(" ")}
                              >
                                {item.isActive ? "active" : "inactive"}
                              </span>
                            </div>
                          </td>
                          <td data-label="Actions" className="px-4 py-4 text-right sm:px-6">
                            <button
                              onClick={() =>
                                window.confirm(
                                  "Are you sure want to delete this deposit range?"
                                ) && deleteDepositRange(item._id)
                              }
                              className={[
                                "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300","text-danger hover:bg-danger-soft hover:text-danger",
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
                      ?"text-success"
                      :"text-danger",
                  ].join(" ")}
                >
                  {config.tradeBonus.isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div>
              <label
                className={[
                  "mb-2 block text-sm font-medium","text-muted",
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
                  "rounded-card border px-4 py-10 text-center text-sm","border-line bg-surface-2 text-subtle",
                ].join(" ")}
              >
                No trade bonus ranges found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div
                  className={[
                    "overflow-hidden rounded-card border","border-line",
                  ].join(" ")}
                >
                  <table className="min-w-full table-stack">
                    <thead
                      className={["bg-surface-2 text-muted",
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

                    <tbody className={"bg-transparent"}>
                      {tradeRanges.map((item) => (
                        <tr
                          key={item._id}
                          className={[
                            "border-t transition-colors duration-200","border-line hover:bg-surface-2",
                          ].join(" ")}
                        >
                          <td data-label="Title"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            {item.title || "-"}
                          </td>
                          <td data-label="Lot Range"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            {item.minLot} - {item.maxLot} lot
                          </td>
                          <td data-label="Bonus Amount"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            ${item.bonusAmount}
                          </td>
                          <td data-label="Sort"
                            className={[
                              "px-4 py-4 text-sm sm:px-6","text-muted",
                            ].join(" ")}
                          >
                            {item.sortOrder ?? 0}
                          </td>
                          <td data-label="Status" className="px-4 py-4 text-sm sm:px-6">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() => toggleTradeRange(item)}
                              />
                              <span
                                className={[
                                  "text-xs font-semibold uppercase tracking-[0.12em]",
                                  item.isActive
                                    ?"text-success"
                                    :"text-danger",
                                ].join(" ")}
                              >
                                {item.isActive ? "active" : "inactive"}
                              </span>
                            </div>
                          </td>
                          <td data-label="Actions" className="px-4 py-4 text-right sm:px-6">
                            <button
                              onClick={() =>
                                window.confirm(
                                  "Are you sure want to delete this trade range?"
                                ) && deleteTradeRange(item._id)
                              }
                              className={[
                                "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300","text-danger hover:bg-danger-soft hover:text-danger",
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
                  "flex h-11 w-11 items-center justify-center rounded-card","bg-primary-soft text-primary",
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
                      "rounded-card border p-4","border-line bg-surface-2",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs uppercase tracking-[0.14em]","text-subtle",
                      ].join(" ")}
                    >
                      Deposit Bonus
                    </div>
                    <div
                      className={[
                        "mt-2 text-lg font-semibold","text-text",
                      ].join(" ")}
                    >
                      {config.depositBonus.isEnabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>

                  <div
                    className={[
                      "rounded-card border p-4","border-line bg-surface-2",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs uppercase tracking-[0.14em]","text-subtle",
                      ].join(" ")}
                    >
                      Deposit Ranges
                    </div>
                    <div
                      className={[
                        "mt-2 text-lg font-semibold","text-text",
                      ].join(" ")}
                    >
                      {depositRanges.length}
                    </div>
                  </div>

                  <div
                    className={[
                      "rounded-card border p-4","border-line bg-surface-2",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs uppercase tracking-[0.14em]","text-subtle",
                      ].join(" ")}
                    >
                      Trade Ranges
                    </div>
                    <div
                      className={[
                        "mt-2 text-lg font-semibold","text-text",
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
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium","border-line bg-surface-2 text-muted",
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