import React, { useEffect, useState } from "react";
import { Trash2, Plus, BarChart3, AlertCircle, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Switch } from "../../../Admin/ui/Switch";
import { superAdminApi } from "@/utils/apiClients";

export default function TradeLotBonusConfig() {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    minLot: "",
    maxLot: "",
    bonusAmount: "",
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    minLot: "",
    maxLot: "",
    bonusAmount: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setForm({
      minLot: "",
      maxLot: "",
      bonusAmount: "",
      isActive: true,
    });
  };

  const getAllConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminApi.get("/deposit-bonus-config/trade-lot-bonus");
      setRows(res?.data?.data || []);
    } catch (err) {
      setError("Failed to fetch trade lot bonus configs");
    } finally {
      setLoading(false);
    }
  };

  const addConfig = async () => {
    const toastId = toast.loading("Creating config...");
    try {
      const payload = {
        minLot: Number(form.minLot),
        maxLot: Number(form.maxLot),
        bonusAmount: Number(form.bonusAmount),
        isActive: form.isActive,
      };

      const res = await superAdminApi.post(
        "/deposit-bonus-config/trade-lot-bonus",
        payload
      );

      if (res?.data?.success) {
        toast.success("Trade lot bonus config created", { id: toastId });
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
        `/deposit-bonus-config/trade-lot-bonus/${id}`
      );

      if (res?.data?.success) {
        setRows((prev) => prev.filter((item) => item._id !== id));
        toast.success("Trade lot bonus config deleted", { id: toastId });
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
        `/deposit-bonus-config/trade-lot-bonus/${row._id}`,
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
      minLot: row.minLot ?? "",
      maxLot: row.maxLot ?? "",
      bonusAmount: row.bonusAmount ?? "",
      isActive: !!row.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      minLot: "",
      maxLot: "",
      bonusAmount: "",
      isActive: true,
    });
  };

  const updateConfig = async () => {
    if (!editingId) return;

    const toastId = toast.loading("Updating config...");
    try {
      const payload = {
        minLot: Number(editForm.minLot),
        maxLot: Number(editForm.maxLot),
        bonusAmount: Number(editForm.bonusAmount),
        isActive: editForm.isActive,
      };

      const res = await superAdminApi.put(
        `/deposit-bonus-config/trade-lot-bonus/${editingId}`,
        payload
      );

      if (res?.data?.success) {
        toast.success("Trade lot bonus config updated", { id: toastId });
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
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
            ].join(" ")}
          >
            <BarChart3 size={14} />
            Trade Lot Bonus
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight","text-text",
            ].join(" ")}
          >
            Trade Lot Bonus Config
          </h2>

          <p
            className={[
              "mt-1 text-sm","text-subtle",
            ].join(" ")}
          >
            Manage lot range wise bonus amount settings.
          </p>
        </div>
      </div>

      <div
        className={[
          "rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
        ].join(" ")}
      >
        <div className="mb-4">
          <h3
            className={[
              "text-lg font-semibold","text-text",
            ].join(" ")}
          >
            Add New Trade Lot Bonus
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="number"
            placeholder="Min Lot"
            value={form.minLot}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, minLot: e.target.value }))
            }
            className={[
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle",
            ].join(" ")}
          />

          <input
            type="number"
            placeholder="Max Lot"
            value={form.maxLot}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, maxLot: e.target.value }))
            }
            className={[
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle",
            ].join(" ")}
          />

          <input
            type="number"
            placeholder="Bonus Amount"
            value={form.bonusAmount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, bonusAmount: e.target.value }))
            }
            className={[
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle",
            ].join(" ")}
          />

          <button
            onClick={addConfig}
            disabled={!form.minLot || !form.maxLot || !form.bonusAmount}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300",
              !form.minLot || !form.maxLot || !form.bonusAmount
                ?"cursor-not-allowed bg-surface-2 text-subtle"
                :"bg-primary-soft text-text hover:bg-primary",
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
            "mt-6 rounded-card border px-4 py-6 text-sm","border-line bg-surface-2 text-muted",
          ].join(" ")}
        >
          Loading configs...
        </div>
      )}

      {error && (
        <div
          className={[
            "mt-6 flex items-center gap-2 rounded-card border px-4 py-4 text-sm font-medium","border-danger bg-danger-soft text-danger",
          ].join(" ")}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          className={[
            "mt-6 rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
          ].join(" ")}
        >
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
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      S.No.
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      Min Lot
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      Max Lot
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      Bonus Amount
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase sm:px-6">
                      Active
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase sm:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className={"bg-transparent"}>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className={[
                          "px-4 py-8 text-center text-sm","text-subtle",
                        ].join(" ")}
                      >
                        No trade lot bonus config found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr
                        key={row._id}
                        className={[
                          "border-t transition-colors duration-200","border-line hover:bg-surface-2",
                        ].join(" ")}
                      >
                        <td data-label="S.No." className="px-4 py-4 sm:px-6">{index + 1}</td>

                        <td data-label="Min Lot" className="px-4 py-4 sm:px-6">
                          {editingId === row._id ? (
                            <input
                              type="number"
                              value={editForm.minLot}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  minLot: e.target.value,
                                }))
                              }
                              className="w-full rounded-field border px-3 py-2 text-sm text-text"
                            />
                          ) : (
                            row.minLot
                          )}
                        </td>

                        <td data-label="Max Lot" className="px-4 py-4 sm:px-6">
                          {editingId === row._id ? (
                            <input
                              type="number"
                              value={editForm.maxLot}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  maxLot: e.target.value,
                                }))
                              }
                              className="w-full rounded-field border px-3 py-2 text-sm text-text"
                            />
                          ) : (
                            row.maxLot
                          )}
                        </td>

                        <td data-label="Bonus Amount" className="px-4 py-4 sm:px-6">
                          {editingId === row._id ? (
                            <input
                              type="number"
                              value={editForm.bonusAmount}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  bonusAmount: e.target.value,
                                }))
                              }
                              className="w-full rounded-field border px-3 py-2 text-sm text-text"
                            />
                          ) : (
                            row.bonusAmount
                          )}
                        </td>

                        <td data-label="Active" className="px-4 py-4 sm:px-6">
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
                                    ?"text-success"
                                    :"text-danger",
                                ].join(" ")}
                              >
                                {row.isActive ? "active" : "inactive"}
                              </span>
                            </div>
                          )}
                        </td>

                        <td data-label="Actions" className="px-4 py-4 text-right sm:px-6">
                          <div className="inline-flex items-center gap-2">
                            {editingId === row._id ? (
                              <>
                                <button
                                  onClick={updateConfig}
                                  className="rounded-field bg-success px-3 py-2 text-xs font-semibold text-text"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="rounded-field bg-surface-3 px-3 py-2 text-xs font-semibold text-text"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(row)}
                                  className={[
                                    "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300","text-primary hover:bg-primary-soft",
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
                                    "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300","text-danger hover:bg-danger-soft",
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