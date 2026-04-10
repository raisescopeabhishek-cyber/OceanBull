import React, { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Plus,
  ShieldCheck,
  AlertCircle,
  Search,
  Pencil,
  RefreshCcw,
  BadgePercent,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Switch } from "../../../Admin/ui/Switch";
import { superAdminApi } from "@/utils/apiClients";

const initialForm = {
  exactAmount: "",
  insuranceChargesPercent: "",
  claimPercent: "",
  platformChargesPercent: "",
  isActive: true,
};

export default function InsuranceConfig() {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [configData, setConfigData] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return configData;

    return configData.filter((item) => {
      return (
        String(item?.exactAmount || "").toLowerCase().includes(keyword) ||
        String(item?.insuranceChargesPercent || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item?.claimPercent || "").toLowerCase().includes(keyword) ||
        String(item?.platformChargesPercent || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item?.isActive ? "active" : "inactive")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [configData, search]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getAllInsuranceConfigs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await superAdminApi.get("/insurance-config");
      const payload =
        res?.data?.data ||
        res?.data?.configs ||
        res?.data?.result ||
        [];

      setConfigData(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to fetch insurance configurations"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (
      form.exactAmount === "" ||
      form.insuranceChargesPercent === "" ||
      form.claimPercent === "" ||
      form.platformChargesPercent === ""
    ) {
      toast.error("Please fill all fields");
      return false;
    }

    const exactAmount = Number(form.exactAmount);
    const insuranceChargesPercent = Number(form.insuranceChargesPercent);
    const claimPercent = Number(form.claimPercent);
    const platformChargesPercent = Number(form.platformChargesPercent);

    if (
      Number.isNaN(exactAmount) ||
      Number.isNaN(insuranceChargesPercent) ||
      Number.isNaN(claimPercent) ||
      Number.isNaN(platformChargesPercent)
    ) {
      toast.error("Please enter valid numeric values");
      return false;
    }

    if (exactAmount < 0) {
      toast.error("Exact amount cannot be negative");
      return false;
    }

    if (
      insuranceChargesPercent < 0 ||
      insuranceChargesPercent > 100 ||
      claimPercent < 0 ||
      claimPercent > 100 ||
      platformChargesPercent < 0 ||
      platformChargesPercent > 100
    ) {
      toast.error("Percent values must be between 0 and 100");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const toastId = toast.loading(
      editingId ? "Updating configuration..." : "Creating configuration..."
    );
    setSubmitting(true);

    const payload = {
      exactAmount: Number(form.exactAmount),
      insuranceChargesPercent: Number(form.insuranceChargesPercent),
      claimPercent: Number(form.claimPercent),
      platformChargesPercent: Number(form.platformChargesPercent),
      isActive: !!form.isActive,
    };

    try {
      let res;

      if (editingId) {
        res = await superAdminApi.put(`/insurance-config/${editingId}`, payload);
        const updatedItem = res?.data?.data;

        setConfigData((prev) =>
          prev.map((item) => (item._id === editingId ? updatedItem : item))
        );

        toast.success(
          res?.data?.message || "Insurance configuration updated successfully",
          { id: toastId }
        );
      } else {
        res = await superAdminApi.post("/insurance-config", payload);
        const createdItem = res?.data?.data;

        setConfigData((prev) =>
          Array.isArray(prev) ? [createdItem, ...prev] : [createdItem]
        );

        toast.success(
          res?.data?.message || "Insurance configuration created successfully",
          { id: toastId }
        );
      }

      resetForm();
      getAllInsuranceConfigs();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong",
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      exactAmount: item?.exactAmount ?? "",
      insuranceChargesPercent: item?.insuranceChargesPercent ?? "",
      claimPercent: item?.claimPercent ?? "",
      platformChargesPercent: item?.platformChargesPercent ?? "",
      isActive: !!item?.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting configuration...");

    try {
      const res = await superAdminApi.delete(`/insurance-config/${id}`);

      setConfigData((prev) => prev.filter((item) => item._id !== id));

      toast.success(
        res?.data?.message || "Insurance configuration deleted successfully",
        { id: toastId }
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete configuration",
        { id: toastId }
      );
    }
  };

  const handleToggleStatus = async (item) => {
    const toastId = toast.loading("Updating status...");

    try {
      const res = await superAdminApi.patch(
        `/insurance-config/${item._id}/toggle-status`
      );

      const updatedItem = res?.data?.data;

      setConfigData((prev) =>
        prev.map((row) => (row._id === item._id ? updatedItem : row))
      );

      if (editingId === item._id) {
        setForm((prev) => ({
          ...prev,
          isActive: !!updatedItem?.isActive,
        }));
      }

      toast.success(res?.data?.message || "Status updated successfully", {
        id: toastId,
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update status",
        { id: toastId }
      );
    }
  };

  useEffect(() => {
    getAllInsuranceConfigs();
  }, []);

  const stats = useMemo(() => {
    const total = configData.length;
    const active = configData.filter((item) => item?.isActive).length;
    const inactive = total - active;
    const maxAmount = Math.max(...configData.map((item) => item?.exactAmount || 0), 0);

    return { total, active, inactive, maxAmount };
  }, [configData]);

  return (
    <div className="w-full px-2 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isDark
                ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                : "border-orange-200 bg-orange-50 text-orange-700",
            ].join(" ")}
          >
            <ShieldCheck size={14} />
            Insurance Control
          </div>

          <h2
            className={[
              "text-2xl font-bold tracking-tight sm:text-3xl",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Insurance Configuration
          </h2>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/55" : "text-slate-600",
            ].join(" ")}
          >
            Manage exact amount wise insurance charges, claim percentage, and
            platform charges with full control.
          </p>
        </div>

        <button
          onClick={getAllInsuranceConfigs}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
            isDark
              ? "border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.09]"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          ].join(" ")}
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Records",
            value: stats.total,
            icon: <ShieldCheck size={18} />,
          },
          {
            label: "Active",
            value: stats.active,
            icon: <BadgePercent size={18} />,
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: <AlertCircle size={18} />,
          },
          {
            label: "Highest Amount",
            value: `₹${Number(stats.maxAmount || 0).toFixed(2)}`,
            icon: <IndianRupee size={18} />,
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={[
              "rounded-[24px] border p-4 backdrop-blur-xl transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                : "border-orange-100 bg-white/70 shadow-[0_10px_30px_rgba(251,146,60,0.10)]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.14em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  {card.label}
                </p>
                <h3
                  className={[
                    "mt-3 text-2xl font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {card.value}
                </h3>
              </div>

              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  isDark
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "bg-orange-50 text-orange-600",
                ].join(" ")}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={[
          "rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
          isDark
            ? "border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            : "border-orange-100 bg-white/70 shadow-[0_10px_30px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3
              className={[
                "text-lg font-semibold",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {editingId ? "Update Insurance Configuration" : "Add Insurance Configuration"}
            </h3>
            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              Set exact amount, insurance charge %, claim %, and platform charge %.
            </p>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                isDark
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="number"
            placeholder="Exact amount"
            value={form.exactAmount}
            onChange={(e) => handleChange("exactAmount", e.target.value)}
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-500/20"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
            ].join(" ")}
          />

          <input
            type="number"
            placeholder="Insurance charges %"
            value={form.insuranceChargesPercent}
            onChange={(e) =>
              handleChange("insuranceChargesPercent", e.target.value)
            }
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-500/20"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
            ].join(" ")}
          />

          <input
            type="number"
            placeholder="Claim %"
            value={form.claimPercent}
            onChange={(e) => handleChange("claimPercent", e.target.value)}
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-500/20"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
            ].join(" ")}
          />

          <input
            type="number"
            placeholder="Platform charges %"
            value={form.platformChargesPercent}
            onChange={(e) =>
              handleChange("platformChargesPercent", e.target.value)
            }
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-500/20"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
            ].join(" ")}
          />
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={(value) => handleChange("isActive", !!value)}
            />
            <span
              className={[
                "text-sm font-medium",
                form.isActive
                  ? isDark
                    ? "text-emerald-300"
                    : "text-emerald-600"
                  : isDark
                  ? "text-rose-300"
                  : "text-rose-600",
              ].join(" ")}
            >
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={[
              "inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
              submitting
                ? isDark
                  ? "cursor-not-allowed bg-white/10 text-white/35"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
                : isDark
                ? "bg-cyan-500/90 text-white hover:bg-cyan-500 shadow-[0_10px_25px_rgba(6,182,212,0.25)]"
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.25)]",
            ].join(" ")}
          >
            {editingId ? <Pencil size={16} /> : <Plus size={16} />}
            {editingId ? "Update Config" : "Add Config"}
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
          Loading insurance configurations...
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className={[
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                Insurance Records
              </h3>
              <p
                className={[
                  "mt-1 text-sm",
                  isDark ? "text-white/45" : "text-slate-500",
                ].join(" ")}
              >
                View and manage all configured insurance slabs.
              </p>
            </div>

            <div className="relative w-full sm:w-[300px]">
              <Search
                size={16}
                className={[
                  "absolute left-3 top-1/2 -translate-y-1/2",
                  isDark ? "text-white/35" : "text-slate-400",
                ].join(" ")}
              />
              <input
                type="text"
                placeholder="Search amount, percent, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={[
                  "w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-300",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-500/20"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
                ].join(" ")}
              />
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div
              className={[
                "rounded-[18px] border px-4 py-10 text-center text-sm",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white/55"
                  : "border-slate-200 bg-slate-50 text-slate-500",
              ].join(" ")}
            >
              No insurance configurations found.
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
                        S.No.
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Exact Amount
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Insurance %
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Claim %
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Platform %
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Status
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className={[isDark ? "bg-transparent" : "bg-white/40"].join(" ")}>
                    {filteredData.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className={[
                          "border-t transition-colors duration-200",
                          isDark
                            ? "border-white/10 hover:bg-white/[0.03]"
                            : "border-slate-200 hover:bg-slate-50/80",
                        ].join(" ")}
                      >
                        <td
                          className={[
                            "px-4 py-4 text-sm font-medium sm:px-6",
                            isDark ? "text-white/85" : "text-slate-800",
                          ].join(" ")}
                        >
                          {index + 1}
                        </td>

                        <td
                          className={[
                            "px-4 py-4 text-sm font-semibold sm:px-6",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          ₹{Number(item?.exactAmount || 0).toFixed(2)}
                        </td>

                        <td
                          className={[
                            "px-4 py-4 text-sm sm:px-6",
                            isDark ? "text-cyan-300" : "text-sky-700",
                          ].join(" ")}
                        >
                          {Number(item?.insuranceChargesPercent || 0).toFixed(2)}%
                        </td>

                        <td
                          className={[
                            "px-4 py-4 text-sm sm:px-6",
                            isDark ? "text-emerald-300" : "text-emerald-700",
                          ].join(" ")}
                        >
                          {Number(item?.claimPercent || 0).toFixed(2)}%
                        </td>

                        <td
                          className={[
                            "px-4 py-4 text-sm sm:px-6",
                            isDark ? "text-violet-300" : "text-violet-700",
                          ].join(" ")}
                        >
                          {Number(item?.platformChargesPercent || 0).toFixed(2)}%
                        </td>

                        <td className="px-4 py-4 text-sm sm:px-6">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={!!item?.isActive}
                              onCheckedChange={() => handleToggleStatus(item)}
                            />
                            <span
                              className={[
                                "text-xs font-semibold uppercase tracking-[0.12em]",
                                item?.isActive
                                  ? isDark
                                    ? "text-emerald-300"
                                    : "text-emerald-600"
                                  : isDark
                                  ? "text-rose-300"
                                  : "text-rose-600",
                              ].join(" ")}
                            >
                              {item?.isActive ? "active" : "inactive"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className={[
                                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                isDark
                                  ? "text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
                                  : "text-blue-500 hover:bg-blue-50 hover:text-blue-600",
                              ].join(" ")}
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() =>
                                window.confirm("Are you sure want to delete?") &&
                                handleDelete(item._id)
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}