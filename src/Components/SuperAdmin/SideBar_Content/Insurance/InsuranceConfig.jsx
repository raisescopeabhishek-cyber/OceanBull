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
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
            ].join(" ")}
          >
            <ShieldCheck size={14} />
            Insurance Control
          </div>

          <h2
            className={[
              "text-2xl font-bold tracking-tight sm:text-3xl","text-text",
            ].join(" ")}
          >
            Insurance Configuration
          </h2>

          <p
            className={[
              "mt-1 text-sm","text-subtle",
            ].join(" ")}
          >
            Manage exact amount wise insurance charges, claim percentage, and
            platform charges with full control.
          </p>
        </div>

        <button
          onClick={getAllInsuranceConfigs}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300","border border-line bg-surface-2 text-text hover:bg-surface-2",
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
              "rounded-card border p-4 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.14em]","text-subtle",
                  ].join(" ")}
                >
                  {card.label}
                </p>
                <h3
                  className={[
                    "mt-3 text-2xl font-bold","text-text",
                  ].join(" ")}
                >
                  {card.value}
                </h3>
              </div>

              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-card","bg-primary-soft text-primary",
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
          "rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
        ].join(" ")}
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3
              className={[
                "text-lg font-semibold","text-text",
              ].join(" ")}
            >
              {editingId ? "Update Insurance Configuration" : "Add Insurance Configuration"}
            </h3>
            <p
              className={[
                "mt-1 text-sm","text-subtle",
              ].join(" ")}
            >
              Set exact amount, insurance charge %, claim %, and platform charge %.
            </p>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300","bg-surface-2 text-text hover:bg-surface-2",
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
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
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
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
            ].join(" ")}
          />

          <input
            type="number"
            placeholder="Claim %"
            value={form.claimPercent}
            onChange={(e) => handleChange("claimPercent", e.target.value)}
            className={[
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
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
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
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
                  ?"text-success"
                  :"text-danger",
              ].join(" ")}
            >
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={[
              "inline-flex min-w-[180px] items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300",
              submitting
                ?"cursor-not-allowed bg-surface-2 text-subtle"
                :"bg-primary-soft text-text hover:bg-primary",
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
            "mt-6 rounded-card border px-4 py-6 text-sm","border-line bg-surface-2 text-muted",
          ].join(" ")}
        >
          Loading insurance configurations...
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className={[
                  "text-lg font-semibold","text-text",
                ].join(" ")}
              >
                Insurance Records
              </h3>
              <p
                className={[
                  "mt-1 text-sm","text-subtle",
                ].join(" ")}
              >
                View and manage all configured insurance slabs.
              </p>
            </div>

            <div className="relative w-full sm:w-[300px]">
              <Search
                size={16}
                className={[
                  "absolute left-3 top-1/2 -translate-y-1/2","text-subtle",
                ].join(" ")}
              />
              <input
                type="text"
                placeholder="Search amount, percent, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={[
                  "w-full rounded-card border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
                ].join(" ")}
              />
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div
              className={[
                "rounded-card border px-4 py-10 text-center text-sm","border-line bg-surface-2 text-subtle",
              ].join(" ")}
            >
              No insurance configurations found.
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

                  <tbody className={["bg-transparent"].join(" ")}>
                    {filteredData.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className={[
                          "border-t transition-colors duration-200","border-line hover:bg-surface-2",
                        ].join(" ")}
                      >
                        <td data-label="S.No."
                          className={[
                            "px-4 py-4 text-sm font-medium sm:px-6","text-muted",
                          ].join(" ")}
                        >
                          {index + 1}
                        </td>

                        <td data-label="Exact Amount"
                          className={[
                            "px-4 py-4 text-sm font-semibold sm:px-6","text-text",
                          ].join(" ")}
                        >
                          ₹{Number(item?.exactAmount || 0).toFixed(2)}
                        </td>

                        <td data-label="Insurance %"
                          className={[
                            "px-4 py-4 text-sm sm:px-6","text-primary",
                          ].join(" ")}
                        >
                          {Number(item?.insuranceChargesPercent || 0).toFixed(2)}%
                        </td>

                        <td data-label="Claim %"
                          className={[
                            "px-4 py-4 text-sm sm:px-6","text-success",
                          ].join(" ")}
                        >
                          {Number(item?.claimPercent || 0).toFixed(2)}%
                        </td>

                        <td data-label="Platform %"
                          className={[
                            "px-4 py-4 text-sm sm:px-6","text-primary",
                          ].join(" ")}
                        >
                          {Number(item?.platformChargesPercent || 0).toFixed(2)}%
                        </td>

                        <td data-label="Status" className="px-4 py-4 text-sm sm:px-6">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={!!item?.isActive}
                              onCheckedChange={() => handleToggleStatus(item)}
                            />
                            <span
                              className={[
                                "text-xs font-semibold uppercase tracking-[0.12em]",
                                item?.isActive
                                  ?"text-success"
                                  :"text-danger",
                              ].join(" ")}
                            >
                              {item?.isActive ? "active" : "inactive"}
                            </span>
                          </div>
                        </td>

                        <td data-label="Actions" className="px-4 py-4 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className={[
                                "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300","text-primary hover:bg-primary-soft hover:text-primary",
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
                                "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300","text-danger hover:bg-danger-soft hover:text-danger",
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