import React, { useEffect, useState } from "react";
import { Trash2, Plus, Gift, AlertCircle, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Switch } from "../../../Admin/ui/Switch";
import { superAdminApi } from "@/utils/apiClients";

export default function DepositBonusConfig() {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    depositAmount: "",
    bonusPercent: "",
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    depositAmount: "",
    bonusPercent: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setForm({
      depositAmount: "",
      bonusPercent: "",
      isActive: true,
    });
  };

  const getAllConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminApi.get("/deposit-bonus-config/deposit-bonus");
      setRows(res?.data?.data || []);
    } catch (err) {
      setError("Failed to fetch deposit bonus configs");
    } finally {
      setLoading(false);
    }
  };

  const addConfig = async () => {
    const toastId = toast.loading("Creating config...");
    try {
      const payload = {
        depositAmount: Number(form.depositAmount),
        bonusPercent: Number(form.bonusPercent),
        isActive: form.isActive,
      };

      const res = await superAdminApi.post(
        "/deposit-bonus-config/deposit-bonus",
        payload
      );

      if (res?.data?.success) {
        toast.success("Deposit bonus config created", { id: toastId });
        resetForm();
        getAllConfigs();
      } else {
        toast.error(res?.data?.message || "Failed to create config", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong while creating",
        { id: toastId }
      );
    }
  };

  const deleteConfig = async (id) => {
    const toastId = toast.loading("Deleting config...");
    try {
      const res = await superAdminApi.delete(
        `/deposit-bonus-config/deposit-bonus/${id}`
      );

      if (res?.data?.success) {
        setRows((prev) => prev.filter((item) => item._id !== id));
        toast.success("Deposit bonus config deleted", { id: toastId });
      } else {
        toast.error(res?.data?.message || "Failed to delete config", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong while deleting",
        { id: toastId }
      );
    }
  };

  const toggleActive = async (row) => {
    const toastId = toast.loading("Updating status...");
    try {
      const payload = {
        isActive: !row.isActive,
      };

      const res = await superAdminApi.put(
        `/deposit-bonus-config/deposit-bonus/${row._id}`,
        payload
      );

      if (res?.data?.success) {
        setRows((prev) =>
          prev.map((item) =>
            item._id === row._id ? { ...item, isActive: !row.isActive } : item
          )
        );
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res?.data?.message || "Failed to update status", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong while updating",
        { id: toastId }
      );
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setEditForm({
      depositAmount: row.depositAmount ?? "",
      bonusPercent: row.bonusPercent ?? "",
      isActive: !!row.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      depositAmount: "",
      bonusPercent: "",
      isActive: true,
    });
  };

  const updateConfig = async () => {
    if (!editingId) return;

    const toastId = toast.loading("Updating config...");
    try {
      const payload = {
        depositAmount: Number(editForm.depositAmount),
        bonusPercent: Number(editForm.bonusPercent),
        isActive: editForm.isActive,
      };

      const res = await superAdminApi.put(
        `/deposit-bonus-config/deposit-bonus/${editingId}`,
        payload
      );

      if (res?.data?.success) {
        toast.success("Deposit bonus config updated", { id: toastId });
        cancelEdit();
        getAllConfigs();
      } else {
        toast.error(res?.data?.message || "Failed to update config", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong while updating",
        { id: toastId }
      );
    }
  };

  useEffect(() => {
    getAllConfigs();
  }, []);

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
            Deposit Bonus
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Deposit Bonus Config
          </h2>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/55" : "text-slate-600",
            ].join(" ")}
          >
            Manage deposit amount wise bonus percentage settings.
          </p>
        </div>
      </div>

      <div
        className={[
          "rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
          isDark
            ? "border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            : "border-orange-100 bg-white/70 shadow-[0_10px_30px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="mb-4">
          <h3
            className={[
              "text-lg font-semibold",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Add New Deposit Bonus
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Deposit Amount"
            value={form.depositAmount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, depositAmount: e.target.value }))
            }
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
            ].join(" ")}
          />

          <input
            type="number"
            placeholder="Bonus Percent"
            value={form.bonusPercent}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, bonusPercent: e.target.value }))
            }
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
            ].join(" ")}
          />

          <button
            onClick={addConfig}
            disabled={!form.depositAmount || !form.bonusPercent}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
              !form.depositAmount || !form.bonusPercent
                ? isDark
                  ? "cursor-not-allowed bg-white/10 text-white/35"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
                : isDark
                ? "bg-blue-500/90 text-white hover:bg-blue-500"
                : "bg-orange-500 text-white hover:bg-orange-600",
            ].join(" ")}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {loading && (
        <div
          className={[
            "mt-6 rounded-[20px] border px-4 py-6 text-sm",
            isDark
              ? "border-white/10 bg-white/[0.03] text-white/70"
              : "border-slate-200 bg-white/70 text-slate-600",
          ].join(" ")}
        >
          Loading configs...
        </div>
      )}

      {error && (
        <div
          className={[
            "mt-6 flex items-center gap-2 rounded-[20px] border px-4 py-4 text-sm font-medium",
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
        <div
          className={[
            "mt-6 rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
              : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
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
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      S.No.
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      Deposit Amount
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      Bonus %
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      Active
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase sm:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className={isDark ? "bg-transparent" : "bg-white/40"}>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className={[
                          "px-4 py-8 text-center text-sm",
                          isDark ? "text-white/55" : "text-slate-500",
                        ].join(" ")}
                      >
                        No deposit bonus config found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr
                        key={row._id}
                        className={[
                          "border-t transition-colors duration-200",
                          isDark
                            ? "border-white/10 hover:bg-white/[0.03]"
                            : "border-slate-200 hover:bg-slate-50/80",
                        ].join(" ")}
                      >
                        <td className="px-4 py-4 sm:px-6">{index + 1}</td>

                        <td className="px-4 py-4 sm:px-6">
                          {editingId === row._id ? (
                            <input
                              type="number"
                              value={editForm.depositAmount}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  depositAmount: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border px-3 py-2 text-sm text-black"
                            />
                          ) : (
                            row.depositAmount
                          )}
                        </td>

                        <td className="px-4 py-4 sm:px-6">
                          {editingId === row._id ? (
                            <input
                              type="number"
                              value={editForm.bonusPercent}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  bonusPercent: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border px-3 py-2 text-sm text-black"
                            />
                          ) : (
                            `${row.bonusPercent}%`
                          )}
                        </td>

                        <td className="px-4 py-4 sm:px-6">
                          {editingId === row._id ? (
                            <Switch
                              checked={editForm.isActive}
                              onCheckedChange={(checked) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  isActive: checked,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={row.isActive}
                                onCheckedChange={() => toggleActive(row)}
                              />
                              <span
                                className={[
                                  "text-xs font-semibold uppercase",
                                  row.isActive
                                    ? isDark
                                      ? "text-emerald-300"
                                      : "text-emerald-600"
                                    : isDark
                                    ? "text-rose-300"
                                    : "text-rose-600",
                                ].join(" ")}
                              >
                                {row.isActive ? "active" : "inactive"}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right sm:px-6">
                          <div className="inline-flex items-center gap-2">
                            {editingId === row._id ? (
                              <>
                                <button
                                  onClick={updateConfig}
                                  className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="rounded-lg bg-slate-500 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(row)}
                                  className={[
                                    "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                    isDark
                                      ? "text-blue-300 hover:bg-blue-500/10"
                                      : "text-blue-500 hover:bg-blue-50",
                                  ].join(" ")}
                                >
                                  <Pencil size={18} />
                                </button>

                                <button
                                  onClick={() =>
                                    window.confirm(
                                      "Are you sure want to delete?"
                                    ) && deleteConfig(row._id)
                                  }
                                  className={[
                                    "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                    isDark
                                      ? "text-red-300 hover:bg-red-500/10"
                                      : "text-red-500 hover:bg-red-50",
                                  ].join(" ")}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}