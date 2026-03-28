import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Edit2,
  Check,
  X,
  RefreshCw,
  ShieldCheck,
  Layers3,
  BadgeDollarSign,
  Settings2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";

import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const EMPTY_LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  id: "",
  levelBonus: "",
}));

const StatCard = ({
  icon,
  amount,
  label,
  isDark,
}: {
  icon: React.ReactNode;
  amount: string;
  label: string;
  isDark: boolean;
}) => {
  return (
    <motion.div
      variants={cardVariants}
      className={[
        "group relative overflow-hidden rounded-[24px] border p-4 sm:p-5 transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
          : "border-orange-100/80 bg-white/75 shadow-[0_16px_40px_rgba(251,146,60,0.12)]",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          isDark ? "bg-blue-400/10" : "bg-orange-300/20",
        ].join(" ")}
      />
      <div className="relative flex items-center gap-4">
        <div
          className={[
            "grid h-12 w-12 place-items-center rounded-2xl border",
            isDark
              ? "border-blue-400/20 bg-blue-500/15 text-blue-200"
              : "border-orange-200 bg-orange-50 text-orange-600",
          ].join(" ")}
        >
          {icon}
        </div>

        <div>
          <p
            className={[
              "text-xs uppercase tracking-[0.16em]",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            {label}
          </p>
          <p
            className={[
              "mt-1 text-xl font-semibold",
              isDark ? "text-white/90" : "text-slate-900",
            ].join(" ")}
          >
            {amount}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Panel = ({
  title,
  subtitle,
  right,
  children,
  isDark,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
  className?: string;
}) => {
  return (
    <div
      className={[
        "overflow-hidden rounded-[24px] border backdrop-blur-xl transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
          : "border-orange-100/80 bg-white/72 shadow-[0_16px_42px_rgba(251,146,60,0.10)]",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6",
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-orange-100/80 bg-white/50",
        ].join(" ")}
      >
        <div>
          <h3
            className={[
              "text-base font-semibold",
              isDark ? "text-white/90" : "text-slate-900",
            ].join(" ")}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={[
                "mt-1 text-xs",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>

      <div className="p-4 sm:p-5 md:p-6">{children}</div>
    </div>
  );
};

const AdminIbZone = () => {
  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [formData, setFormData] = useState(EMPTY_LEVELS);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const [accountsTypes, setAccountsTypes] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  const configuredCount = useMemo(
    () =>
      formData.filter(
        (r) => r.levelBonus !== "" && Number(r.levelBonus) > 0
      ).length,
    [formData]
  );

  const totalLevels = formData.length;

  const totalConfiguredValue = useMemo(() => {
    return formData.reduce((sum, row) => {
      const value = Number(row.levelBonus || 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [formData]);

  const resetFormData = () => setFormData(EMPTY_LEVELS);

  const handleInputChange = (
    index: number,
    field: "levelBonus",
    value: string
  ) => {
    const updated = [...formData];
    updated[index][field] = value === "" ? "" : value;
    setFormData(updated);
  };

  const fetchAccountTypes = async () => {
    try {
      const res = await adminApi.get(`/get-custom-groups`);
      const types = res?.data?.data || [];
      setAccountsTypes(types);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load account types");
    }
  };

  const fetchIbs = async () => {
    if (!currentAccount?._id) return;

    setLoading(true);
    resetFormData();

    try {
      const res = await adminApi.get(`/admin-ibs`);
      const all = res?.data?.data || [];
      const filtered = all.filter(
        (v: any) => v.accountTypeId === currentAccount._id
      );

      if (filtered.length) {
        const updated = Array.from({ length: 10 }, (_, idx) => {
          const level = idx + 1;
          const found = filtered.find(
            (ib: any) =>
              ib.level === level && ib.accountTypeId === currentAccount._id
          );

          return {
            level,
            id: found ? found._id : "",
            levelBonus: found ? String(found.commission ?? "") : "",
          };
        });

        setFormData(updated);
      } else {
        resetFormData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load IB config");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => setEditingIndex(index);

  const handleSave = async (index: number) => {
    const row = formData[index];

    if (!currentAccount?._id) {
      toast.error("Please select an account type first.");
      return;
    }

    const numeric = row.levelBonus === "" ? NaN : Number(row.levelBonus);
    if (!Number.isFinite(numeric) || numeric < 0) {
      toast.error("Enter a valid non-negative number for Level Bonus.");
      return;
    }

    const toastId = toast.loading("Saving...");
    setSavingIdx(index);

    try {
      if (!row.id) {
        await adminApi.post(`/add-admin-ib`, {
          accountType: currentAccount.customGroup,
          accountTypeId: currentAccount._id,
          level: row.level,
          commission: Number(numeric),
        });
      } else {
        await adminApi.put(`/update-admin-ib/${row.id}`, {
          commission: Number(numeric),
        });
      }

      toast.success("Saved successfully", { id: toastId });
      setEditingIndex(-1);
      await fetchIbs();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed", {
        id: toastId,
      });
    } finally {
      setSavingIdx(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(-1);
    fetchIbs();
  };

  useEffect(() => {
    fetchAccountTypes();
  }, []);

  useEffect(() => {
    if (accountsTypes?.length && !currentAccount) {
      setCurrentAccount(accountsTypes[0]);
    }
  }, [accountsTypes, currentAccount]);

  useEffect(() => {
    if (currentAccount?._id) fetchIbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?._id]);

  return (
    <div className="relative min-h-screen">
      <AnimatedGrid />
      <FloatingParticles />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <div
          className={[
            "sticky top-0 z-20 -mx-4 mb-6 border-b px-4 pb-4 pt-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
            isDark
              ? "border-white/10 bg-[#05070b]/70"
              : "border-orange-100/80 bg-white/70",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "grid h-14 w-14 place-items-center rounded-[20px] border text-lg font-semibold",
                    isDark
                      ? "border-white/10 bg-white/[0.05] text-white/90"
                      : "border-orange-100 bg-white/80 text-slate-800",
                  ].join(" ")}
                >
                  <Settings2 className="h-6 w-6" />
                </div>

                <div>
                  <h1
                    className={[
                      "text-2xl font-bold md:text-3xl",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Admin IB Zone
                  </h1>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white/70"
                          : "border-orange-100 bg-white/80 text-slate-600",
                      ].join(" ")}
                    >
                      <Layers3 className="h-4 w-4" />
                      {currentAccount?.customGroup || "Select Account Type"}
                    </span>

                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white/70"
                          : "border-orange-100 bg-white/80 text-slate-600",
                      ].join(" ")}
                    >
                      <BadgeDollarSign className="h-4 w-4" />
                      {configuredCount}/{totalLevels} Levels Configured
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={currentAccount?._id || ""}
                  onChange={(e) => {
                    const selected =
                      accountsTypes.find((v) => v?._id === e.target.value) ||
                      null;
                    setCurrentAccount(selected);
                    setEditingIndex(-1);
                  }}
                  className={[
                    "min-w-[220px] appearance-none rounded-full border px-4 py-2.5 pr-10 text-sm font-medium outline-none transition-all duration-300",
                    isDark
                      ? "border-white/10 bg-white/[0.05] text-white/85 hover:bg-white/[0.08]"
                      : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  <option value="" disabled>
                    {accountsTypes.length ? "Select Account" : "Loading..."}
                  </option>
                  {accountsTypes.map((v) => (
                    <option key={v?._id} value={v?._id}>
                      {v?.customGroup}
                    </option>
                  ))}
                </select>

                <div
                  className={[
                    "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs",
                    isDark ? "text-white/50" : "text-slate-400",
                  ].join(" ")}
                >
                  ▾
                </div>
              </div>

              <button
                onClick={fetchIbs}
                disabled={loading || !currentAccount?._id}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
                  loading || !currentAccount?._id
                    ? isDark
                      ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/40"
                      : "cursor-not-allowed border-orange-100 bg-white/70 text-slate-400"
                    : isDark
                    ? "border-white/10 bg-white/[0.05] text-white/85 hover:bg-white/[0.08]"
                    : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                ].join(" ")}
              >
                <RefreshCw
                  className={["h-4 w-4", loading ? "animate-spin" : ""].join(
                    " "
                  )}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard
            isDark={isDark}
            icon={<Layers3 size={20} />}
            amount={`${accountsTypes.length}`}
            label="Account Types"
          />
          <StatCard
            isDark={isDark}
            icon={<ShieldCheck size={20} />}
            amount={`${configuredCount}/${totalLevels}`}
            label="Configured Levels"
          />
          <StatCard
            isDark={isDark}
            icon={<BadgeDollarSign size={20} />}
            amount={`${totalConfiguredValue}`}
            label="Total Bonus Sum"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          <Panel
            isDark={isDark}
            title="IB Configuration Table"
            subtitle="Manage per-level bonus for the selected account type"
            right={
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em]",
                  isDark
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                <ShieldCheck className="h-4 w-4" />
                {currentAccount?.customGroup || "No Account Selected"}
              </div>
            }
          >
            <div
              className={[
                "overflow-hidden rounded-[22px] border",
                isDark
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-orange-100/80 bg-white/70",
              ].join(" ")}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full whitespace-nowrap">
                  <thead>
                    <tr
                      className={
                        isDark
                          ? "border-b border-white/10 bg-white/[0.03]"
                          : "border-b border-orange-100 bg-orange-50/70"
                      }
                    >
                      <th
                        className={[
                          "px-4 py-4 text-left text-sm font-semibold",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        Level
                      </th>
                      <th
                        className={[
                          "px-4 py-4 text-left text-sm font-semibold",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        Level Bonus / Lot
                      </th>
                      <th
                        className={[
                          "px-4 py-4 text-left text-sm font-semibold",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {formData.map((row, index) => {
                      const isEditing = editingIndex === index;
                      const isSaving = savingIdx === index;

                      return (
                        <tr
                          key={row.level}
                          className={[
                            "border-b transition-all duration-200",
                            isDark
                              ? "border-white/10 hover:bg-white/[0.03]"
                              : "border-orange-100/70 hover:bg-orange-50/50",
                          ].join(" ")}
                        >
                          <td className="px-4 py-4">
                            <div className="inline-flex items-center gap-3">
                              <span
                                className={[
                                  "inline-flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold",
                                  isDark
                                    ? "bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20"
                                    : "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
                                ].join(" ")}
                              >
                                {row.level}
                              </span>
                              <span
                                className={
                                  isDark ? "text-white/80" : "text-slate-700"
                                }
                              >
                                Level {row.level}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {isEditing ? (
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                value={row.levelBonus}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "levelBonus",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. 3.50"
                                className={[
                                  "w-[180px] rounded-2xl border px-4 py-2.5 text-sm outline-none transition-all",
                                  isDark
                                    ? "border-white/10 bg-white/[0.05] text-white placeholder:text-white/30 focus:border-blue-400/30 focus:bg-white/[0.07]"
                                    : "border-orange-100 bg-white text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:bg-orange-50/30",
                                ].join(" ")}
                              />
                            ) : (
                              <span
                                className={[
                                  "text-sm font-medium",
                                  row.levelBonus !== ""
                                    ? isDark
                                      ? "text-white/90"
                                      : "text-slate-900"
                                    : isDark
                                    ? "text-white/40"
                                    : "text-slate-400",
                                ].join(" ")}
                              >
                                {row.levelBonus !== "" ? row.levelBonus : "Not set"}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {isEditing ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  disabled={isSaving}
                                  onClick={() => handleSave(index)}
                                  className={[
                                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                                    isDark
                                      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50",
                                  ].join(" ")}
                                >
                                  <Check className="h-4 w-4" />
                                  {isSaving ? "Saving..." : "Save"}
                                </button>

                                <button
                                  disabled={isSaving}
                                  onClick={handleCancel}
                                  className={[
                                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                                    isDark
                                      ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.08] disabled:opacity-50"
                                      : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50 disabled:opacity-50",
                                  ].join(" ")}
                                >
                                  <X className="h-4 w-4" />
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEdit(index)}
                                className={[
                                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                                  isDark
                                    ? "border-blue-400/20 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15"
                                    : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
                                ].join(" ")}
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {loading && (
                <div
                  className={[
                    "border-t px-4 py-6 text-center text-sm",
                    isDark
                      ? "border-white/10 text-white/50"
                      : "border-orange-100 text-slate-500",
                  ].join(" ")}
                >
                  Loading levels...
                </div>
              )}

              {!loading && !currentAccount?._id && (
                <div
                  className={[
                    "border-t px-4 py-6 text-center text-sm",
                    isDark
                      ? "border-white/10 text-white/50"
                      : "border-orange-100 text-slate-500",
                  ].join(" ")}
                >
                  Please select an account type to view IB configuration.
                </div>
              )}

              <div
                className={[
                  "flex items-center justify-between border-t px-4 py-3 text-xs sm:text-sm",
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-white/50"
                    : "border-orange-100 bg-orange-50/40 text-slate-500",
                ].join(" ")}
              >
                <div>
                  Account:{" "}
                  <span className={isDark ? "text-white/85" : "text-slate-800"}>
                    {currentAccount?.customGroup || "—"}
                  </span>
                </div>
                <div>
                  Configured:{" "}
                  <span className={isDark ? "text-white/85" : "text-slate-800"}>
                    {configuredCount}
                  </span>
                  /10
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default AdminIbZone;