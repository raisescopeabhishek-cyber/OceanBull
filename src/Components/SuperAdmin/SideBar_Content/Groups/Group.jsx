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
          "rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
          isDark
            ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
            : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              Group Records
            </div>

            <h2
              className={[
                "text-2xl font-bold tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Existing Groups
            </h2>

            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/50" : "text-slate-600",
              ].join(" ")}
            >
              View and manage all custom group mappings.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
              isDark
                ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.25)]",
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
              "flex justify-center items-center rounded-[18px] border py-10",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-slate-200 bg-slate-50",
            ].join(" ")}
          >
            <Loader2
              className={[
                "h-8 w-8 animate-spin",
                isDark ? "text-blue-300" : "text-orange-500",
              ].join(" ")}
            />
          </div>
        ) : customGroups.length === 0 ? (
          <div
            className={[
              "rounded-[18px] border py-10 text-center text-sm",
              isDark
                ? "border-white/10 bg-white/[0.03] text-white/55"
                : "border-slate-200 bg-slate-50 text-slate-500",
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

                  <tbody className={isDark ? "bg-transparent" : "bg-white/40"}>
                    {customGroups.map((value, index) => (
                      <tr
                        key={value._id || index}
                        className={[
                          "border-t transition-colors duration-200",
                          isDark
                            ? "border-white/10 hover:bg-white/[0.03]"
                            : "border-slate-200 hover:bg-slate-50/80",
                        ].join(" ")}
                      >
                        <td
                          className={[
                            "py-4 px-6 text-center text-sm font-medium",
                            isDark ? "text-white/85" : "text-slate-800",
                          ].join(" ")}
                        >
                          {index + 1}
                        </td>

                        <td
                          className={[
                            "py-4 px-6 text-center text-sm",
                            isDark ? "text-white/70" : "text-slate-700",
                          ].join(" ")}
                        >
                          {value?.apiGroup}
                        </td>

                        <td
                          className={[
                            "py-4 px-6 text-center text-sm font-medium",
                            isDark ? "text-white/85" : "text-slate-800",
                          ].join(" ")}
                        >
                          {value?.customGroup}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() =>
                              deleteHandler(value._id, value.customGroup)
                            }
                            disabled={isLoading}
                            className={[
                              "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 disabled:opacity-50",
                              isDark
                                ? "text-red-300 hover:bg-red-500/10 hover:text-red-200"
                                : "text-red-500 hover:bg-red-50 hover:text-red-600",
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
                    "rounded-[18px] border p-4 transition-all duration-300",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-slate-200 bg-white/80",
                  ].join(" ")}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Group #{index + 1}
                      </p>
                      <h3
                        className={[
                          "mt-1 text-base font-semibold",
                          isDark ? "text-white" : "text-slate-900",
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
                        "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 disabled:opacity-50",
                        isDark
                          ? "text-red-300 hover:bg-red-500/10 hover:text-red-200"
                          : "text-red-500 hover:bg-red-50 hover:text-red-600",
                      ].join(" ")}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        API Group
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        {value?.apiGroup}
                      </p>
                    </div>

                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Custom Group
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium",
                          isDark ? "text-white" : "text-slate-900",
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