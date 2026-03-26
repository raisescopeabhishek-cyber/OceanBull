import React, { useState, useEffect } from "react";
import { Check, X, Loader2, ChevronDown, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { superAdminApi } from "@/utils/apiClients";

const AddGroup = ({ refresh, setRefresh }) => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [apiGroups, setApiGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [customGroup, setCustomGroup] = useState("");
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGroups, setIsFetchingGroups] = useState(false);

  const fetchApiGroups = async () => {
    setIsFetchingGroups(true);
    try {
      const res = await superAdminApi.get(`/server-groups`);
      return res.data.data || [];
    } catch (error) {
      toast.error("Failed to fetch API groups");
      return [];
    } finally {
      setIsFetchingGroups(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGroup || !customGroup) {
      toast.error("Please select a group and enter a custom group name.");
      return;
    }

    setIsLoading(true);
    try {
      await superAdminApi.post("/add-custom-group", {
        apiGroup: selectedGroup,
        customGroup: customGroup,
      });
      toast.success("Group added successfully");
      setRefresh(!refresh);
      setEditing(false);
      setSelectedGroup("");
      setCustomGroup("");
    } catch (error) {
      console.log("Error in adding custom group", error);
      toast.error("Failed to add group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSelectedGroup("");
    setCustomGroup("");
  };

  useEffect(() => {
    const loadApiGroups = async () => {
      const groups = await fetchApiGroups();
      setApiGroups(groups);
    };
    loadApiGroups();
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
        <div className="mb-5">
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isDark
                ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                : "border-orange-200 bg-orange-50 text-orange-700",
            ].join(" ")}
          >
            <PlusCircle size={14} />
            Add Group
          </div>

          <h2
            className={[
              "text-2xl font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Add New Group
          </h2>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/50" : "text-slate-600",
            ].join(" ")}
          >
            Select an API group and map it to a custom group name.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div>
            <label
              className={[
                "mb-2 block text-sm font-medium",
                isDark ? "text-white/75" : "text-slate-700",
              ].join(" ")}
            >
              API Group
            </label>

            <div className="relative">
              <select
                className={[
                  "w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition-all duration-300",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
                ].join(" ")}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={!editing || isFetchingGroups}
              >
                <option value="" disabled>
                  Select a group
                </option>
                {apiGroups.map((group, index) => (
                  <option key={index} value={group}>
                    {group}
                  </option>
                ))}
              </select>

              <div
                className={[
                  "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
                  isDark ? "text-white/40" : "text-slate-500",
                ].join(" ")}
              >
                {isFetchingGroups ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label
              className={[
                "mb-2 block text-sm font-medium",
                isDark ? "text-white/75" : "text-slate-700",
              ].join(" ")}
            >
              Custom Group Name
            </label>

            <input
              type="text"
              placeholder="Enter custom group name"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              disabled={!editing}
              className={[
                "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
              ].join(" ")}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-1">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                    isDark
                      ? "bg-emerald-500/90 text-white hover:bg-emerald-500 shadow-[0_10px_25px_rgba(16,185,129,0.25)]"
                      : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_10px_25px_rgba(16,185,129,0.20)]",
                  ].join(" ")}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Save</span>
                </button>

                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                    isDark
                      ? "bg-red-500/90 text-white hover:bg-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.20)]"
                      : "bg-red-500 text-white hover:bg-red-600 shadow-[0_10px_25px_rgba(239,68,68,0.18)]",
                  ].join(" ")}
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                disabled={!apiGroups.length || isFetchingGroups}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                  isDark
                    ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.22)]",
                ].join(" ")}
              >
                <PlusCircle className="h-4 w-4" />
                Add Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGroup;