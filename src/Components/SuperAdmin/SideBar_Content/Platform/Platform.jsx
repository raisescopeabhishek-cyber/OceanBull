import React, { useEffect, useState } from "react";
import { Trash2, Plus, Layers3, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Switch } from "../../../Admin/ui/Switch";
import { superAdminApi } from "@/utils/apiClients";

export default function Platform() {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [platformData, setPlatformData] = useState([]);
  const [newField, setNewField] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addField = async () => {
    const toastId = toast.loading("Please wait...");
    if (newField.name) {
      try {
        const res = await superAdminApi.post(`/add-platform`, {
          name: newField.name,
          status: "active",
        });

        if (res.data.status) {
          toast.success("Platform added", { id: toastId });
          setNewField({ name: "" });
          getAllPlatforms();
        } else {
          toast.error("Value already exists", { id: toastId });
        }
      } catch (error) {
        toast.error("Something went wrong", { id: toastId });
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const res = await superAdminApi.put(`/update-platform`, {
        id,
        status: newStatus,
      });

      if (res.data.status) {
        setPlatformData((prev) =>
          prev.map((platform) =>
            platform._id === id ? { ...platform, status: newStatus } : platform
          )
        );
        toast.success("Platform status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update platform status", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Something went wrong while updating status", {
        id: toastId,
      });
    }
  };

  const deletePlatform = async (id) => {
    const toastId = toast.loading("Please wait...");
    try {
      const res = await superAdminApi.delete(`/delete-platform?id=${id}`);

      if (res.data.status) {
        setPlatformData((prev) =>
          prev.filter((platform) => platform._id !== id)
        );
        toast.success("Platform deleted successfully", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to delete platform", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const getAllPlatforms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminApi.get(`/get-platforms`);
      setPlatformData(res.data.data || []);
    } catch (error) {
      setError("Failed to fetch platform data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPlatforms();
  }, []);

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* top title section */}
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
            <Layers3 size={14} />
            Platform Control
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            List of Platforms
          </h2>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/55" : "text-slate-600",
            ].join(" ")}
          >
            Create, enable, disable, and remove platform entries from the
            dashboard.
          </p>
        </div>
      </div>

      {/* add form */}
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
            Add New Platform
          </h3>
          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            Enter a platform name and add it to the list.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter platform name"
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
            ].join(" ")}
          />

          <button
            onClick={addField}
            disabled={!newField.name}
            className={[
              "inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
              !newField.name
                ? isDark
                  ? "cursor-not-allowed bg-white/10 text-white/35"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
                : isDark
                ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.25)]",
            ].join(" ")}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* loading */}
      {loading && (
        <div
          className={[
            "mt-6 rounded-[20px] border px-4 py-6 text-sm",
            isDark
              ? "border-white/10 bg-white/[0.03] text-white/70"
              : "border-slate-200 bg-white/70 text-slate-600",
          ].join(" ")}
        >
          Loading platforms...
        </div>
      )}

      {/* error */}
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

      {/* table section */}
      {!loading && !error && (
        <div
          className={[
            "mt-6 rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
              : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div className="mb-4">
            <h3
              className={[
                "text-lg font-semibold",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Platform Records
            </h3>
            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              View all platforms and manage their current status.
            </p>
          </div>

          {platformData.length === 0 ? (
            <div
              className={[
                "rounded-[18px] border px-4 py-10 text-center text-sm",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white/55"
                  : "border-slate-200 bg-slate-50 text-slate-500",
              ].join(" ")}
            >
              No platforms found.
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
                        Name
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Status
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody
                    className={[
                      isDark ? "bg-transparent" : "bg-white/40",
                    ].join(" ")}
                  >
                    {platformData.map((platform, index) => (
                      <tr
                        key={platform._id || index}
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
                            "px-4 py-4 text-sm sm:px-6",
                            isDark ? "text-white/75" : "text-slate-700",
                          ].join(" ")}
                        >
                          {platform.name}
                        </td>

                        <td className="px-4 py-4 text-sm sm:px-6">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={platform.status === "active"}
                              onCheckedChange={() =>
                                toggleActive(platform._id, platform.status)
                              }
                            />
                            <span
                              className={[
                                "text-xs font-semibold uppercase tracking-[0.12em]",
                                platform.status === "active"
                                  ? isDark
                                    ? "text-emerald-300"
                                    : "text-emerald-600"
                                  : isDark
                                  ? "text-rose-300"
                                  : "text-rose-600",
                              ].join(" ")}
                            >
                              {platform.status}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right sm:px-6">
                          <button
                            onClick={() =>
                              window.confirm("Are you sure want to delete?") &&
                              deletePlatform(platform._id)
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
      )}
    </div>
  );
}