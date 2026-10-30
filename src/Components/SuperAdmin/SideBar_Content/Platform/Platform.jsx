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
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
            ].join(" ")}
          >
            <Layers3 size={14} />
            Platform Control
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight","text-text",
            ].join(" ")}
          >
            List of Platforms
          </h2>

          <p
            className={[
              "mt-1 text-sm","text-subtle",
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
          "rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
        ].join(" ")}
      >
        <div className="mb-4">
          <h3
            className={[
              "text-lg font-semibold","text-text",
            ].join(" ")}
          >
            Add New Platform
          </h3>
          <p
            className={[
              "mt-1 text-sm","text-subtle",
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
              "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
            ].join(" ")}
          />

          <button
            onClick={addField}
            disabled={!newField.name}
            className={[
              "inline-flex min-w-[120px] items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300",
              !newField.name
                ?"cursor-not-allowed bg-surface-2 text-subtle"
                :"bg-primary-soft text-text hover:bg-primary",
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
            "mt-6 rounded-card border px-4 py-6 text-sm","border-line bg-surface-2 text-muted",
          ].join(" ")}
        >
          Loading platforms...
        </div>
      )}

      {/* error */}
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

      {/* table section */}
      {!loading && !error && (
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
              Platform Records
            </h3>
            <p
              className={[
                "mt-1 text-sm","text-subtle",
              ].join(" ")}
            >
              View all platforms and manage their current status.
            </p>
          </div>

          {platformData.length === 0 ? (
            <div
              className={[
                "rounded-card border px-4 py-10 text-center text-sm","border-line bg-surface-2 text-subtle",
              ].join(" ")}
            >
              No platforms found.
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
                    className={["bg-transparent",
                    ].join(" ")}
                  >
                    {platformData.map((platform, index) => (
                      <tr
                        key={platform._id || index}
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

                        <td data-label="Name"
                          className={[
                            "px-4 py-4 text-sm sm:px-6","text-muted",
                          ].join(" ")}
                        >
                          {platform.name}
                        </td>

                        <td data-label="Status" className="px-4 py-4 text-sm sm:px-6">
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
                                  ?"text-success"
                                  :"text-danger",
                              ].join(" ")}
                            >
                              {platform.status}
                            </span>
                          </div>
                        </td>

                        <td data-label="Actions" className="px-4 py-4 text-right sm:px-6">
                          <button
                            onClick={() =>
                              window.confirm("Are you sure want to delete?") &&
                              deletePlatform(platform._id)
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
      )}
    </div>
  );
}