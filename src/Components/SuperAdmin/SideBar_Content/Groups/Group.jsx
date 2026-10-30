import React, { useEffect, useState } from "react";
import { Trash2, Loader2, RefreshCw, Layers3 } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { superAdminApi } from "@/utils/apiClients";

export default function Group({ refresh }) {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [customGroups, setCustomGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminApi.get(`/get-custom-groups`);
      setCustomGroups(res.data.data || []);
    } catch (error) {
      console.log("Error in custom list group", error);
      toast.error("Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHandler = async (id, groupName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the custom group "${groupName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);

    try {
      await superAdminApi.delete(`/delete-custom-group?id=${id}`);
      toast.success("Group deleted successfully");
      fetchData();
    } catch (error) {
      console.log("Error in custom list group", error);
      toast.error("Failed to delete group");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div
        className={[
          "rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
        ].join(" ")}
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div
              className={[
                "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
              ].join(" ")}
            >
              <Layers3 size={14} />
              Group Records
            </div>

            <h2
              className={[
                "text-2xl font-bold tracking-tight","text-text",
              ].join(" ")}
            >
              Existing Groups
            </h2>

            <p
              className={[
                "mt-1 text-sm","text-subtle",
              ].join(" ")}
            >
              View and manage all custom group mappings.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className={[
              "inline-flex items-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50","bg-primary-soft text-text hover:bg-primary",
            ].join(" ")}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div
            className={[
              "flex justify-center items-center rounded-card border py-10","border-line bg-surface-2",
            ].join(" ")}
          >
            <Loader2
              className={[
                "h-8 w-8 animate-spin","text-primary",
              ].join(" ")}
            />
          </div>
        ) : customGroups.length === 0 ? (
          <div
            className={[
              "rounded-card border py-10 text-center text-sm","border-line bg-surface-2 text-subtle",
            ].join(" ")}
          >
            No custom groups found
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
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
                      <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                        Sr. No.
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                        API Group
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                        Custom Group
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className={"bg-transparent"}>
                    {customGroups.map((value, index) => (
                      <tr
                        key={value._id || index}
                        className={[
                          "border-t transition-colors duration-200","border-line hover:bg-surface-2",
                        ].join(" ")}
                      >
                        <td data-label="Sr. No."
                          className={[
                            "py-4 px-6 text-center text-sm font-medium","text-muted",
                          ].join(" ")}
                        >
                          {index + 1}
                        </td>

                        <td data-label="API Group"
                          className={[
                            "py-4 px-6 text-center text-sm","text-muted",
                          ].join(" ")}
                        >
                          {value?.apiGroup}
                        </td>

                        <td data-label="Custom Group"
                          className={[
                            "py-4 px-6 text-center text-sm font-medium","text-muted",
                          ].join(" ")}
                        >
                          {value?.customGroup}
                        </td>

                        <td data-label="Action" className="py-4 px-6 text-center">
                          <button
                            onClick={() =>
                              deleteHandler(value._id, value.customGroup)
                            }
                            disabled={isLoading}
                            className={[
                              "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300 disabled:opacity-50","text-danger hover:bg-danger-soft hover:text-danger",
                            ].join(" ")}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 sm:hidden">
              {customGroups.map((value, index) => (
                <div
                  key={value._id || index}
                  className={[
                    "rounded-card border p-4 transition-all duration-300","border-line bg-surface-2",
                  ].join(" ")}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]","text-subtle",
                        ].join(" ")}
                      >
                        Group #{index + 1}
                      </p>
                      <h3
                        className={[
                          "mt-1 text-base font-semibold","text-text",
                        ].join(" ")}
                      >
                        {value?.customGroup}
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        deleteHandler(value._id, value.customGroup)
                      }
                      disabled={isLoading}
                      className={[
                        "inline-flex h-10 w-10 items-center justify-center rounded-card transition-all duration-300 disabled:opacity-50","text-danger hover:bg-danger-soft hover:text-danger",
                      ].join(" ")}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]","text-subtle",
                        ].join(" ")}
                      >
                        API Group
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm","text-muted",
                        ].join(" ")}
                      >
                        {value?.apiGroup}
                      </p>
                    </div>

                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]","text-subtle",
                        ].join(" ")}
                      >
                        Custom Group
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium","text-text",
                        ].join(" ")}
                      >
                        {value?.customGroup}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}