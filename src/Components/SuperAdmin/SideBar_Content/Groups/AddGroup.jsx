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
          "rounded-card border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
        ].join(" ")}
      >
        <div className="mb-5">
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
            ].join(" ")}
          >
            <PlusCircle size={14} />
            Add Group
          </div>

          <h2
            className={[
              "text-2xl font-bold tracking-tight","text-text",
            ].join(" ")}
          >
            Add New Group
          </h2>

          <p
            className={[
              "mt-1 text-sm","text-subtle",
            ].join(" ")}
          >
            Select an API group and map it to a custom group name.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div>
            <label
              className={[
                "mb-2 block text-sm font-medium","text-muted",
              ].join(" ")}
            >
              API Group
            </label>

            <div className="relative">
              <select
                className={[
                  "w-full appearance-none rounded-card border px-4 py-3 pr-10 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text focus:border-line focus:ring-2 focus:ring-primary",
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
                  "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3","text-subtle",
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
                "mb-2 block text-sm font-medium","text-muted",
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
                "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
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
                    "inline-flex items-center gap-2 rounded-card px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50","bg-success-soft text-text hover:bg-success",
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
                    "inline-flex items-center gap-2 rounded-card px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50","bg-danger-soft text-text hover:bg-danger",
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
                  "inline-flex items-center gap-2 rounded-card px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-50","bg-primary-soft text-text hover:bg-primary",
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