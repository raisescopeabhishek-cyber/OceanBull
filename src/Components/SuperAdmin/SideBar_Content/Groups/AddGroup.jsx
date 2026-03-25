import React, { useState, useEffect } from "react";
import { Check, X, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { superAdminApi } from "@/utils/apiClients";

const AddGroup = ({ refresh, setRefresh }) => {
  const [apiGroups, setApiGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [customGroup, setCustomGroup] = useState("");
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGroups, setIsFetchingGroups] = useState(false);

  const fetchApiGroups = async () => {
    setIsFetchingGroups(true);
    try {
      const res = await superAdminApi.get(
        `/server-groups`
      );
      console.log(res);
      
      return res.data.data;
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
    <div className="container mx-auto p-6 max-w-5xl">
      <h2 className="text-white text-3xl font-bold mb-6">Add New Group</h2>
      <div className="bg-primary-800 rounded-xl shadow-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              API Group
            </label>
            <div className="relative">
              <select
                className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 pr-10"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={editing || isFetchingGroups}
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {isFetchingGroups ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Custom Group Name
            </label>
            <input
              type="text"
              placeholder="Enter custom group name"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300"
              disabled={editing}
            />
          </div>

          <div className="flex justify-center gap-4">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                disabled={!apiGroups.length || isFetchingGroups}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
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
