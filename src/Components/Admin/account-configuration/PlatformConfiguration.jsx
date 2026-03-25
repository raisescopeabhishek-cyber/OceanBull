import React, { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Switch } from "../../ui/switch";
import axios from "axios";
import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";

export default function PlatformConfiguration() {
  const [platformData, setPlatformData] = useState([]);
  const [newField, setNewField] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addField = async () => {
    const toastId = toast.loading("Please wait...");
    if (newField.name) {
      try {
        const res = await backendApi.post(`/add-platform`, {
          name: newField.name,
          status: "active",
        });
        if (res.data.status) {
          setPlatformData([
            ...platformData,
            { id: platformData.length + 1, ...newField, active: false },
          ]);
          toast.success("Platform added", { id: toastId });
          getAllPlatforms();
        } else {
          toast.error("Value already exists", { id: toastId });
        }
      } catch (error) {
        toast.error("Something went wrong", { id: toastId });
      }
      setNewField({ name: "" });
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await backendApi.put(`/update-platform`, {
        id,
        status: newStatus,
      });
      if (res.data.status) {
        setPlatformData(
          platformData.map((platform) =>
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
      const res = await backendApi.delete(`/delete-platform/?id=${id}`);
      if (res.data.status) {
        setPlatformData(platformData.filter((platform) => platform._id !== id));
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
      const res = await backendApi.get(`/get-platforms`);
      setPlatformData(res.data.data);
    } catch (error) {
      setError("Failed to fetch platform data");
    }
    setLoading(false);
  };

  useEffect(() => {
    getAllPlatforms();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
        List of Platforms
      </h2>

      {loading && <p className="text-white">Loading platforms...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 bg-primary-700/40 text-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Field</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newField.name}
              onChange={(e) =>
                setNewField({ ...newField, name: e.target.value })
              }
              className="w-full px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addField}
              disabled={!newField.name}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                !newField.name
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <Plus className="mx-auto" size={18} />
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-primary-400 text-white">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium sm:px-6">
                        S.No.
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium sm:px-6">
                        Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium sm:px-6">
                        Status
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary-700 divide-y text-white divide-gray-700">
                    {platformData?.map((platform, index) => (
                      <tr key={platform.id}>
                        <td className="px-3 py-4 text-sm font-medium whitespace-nowrap sm:px-6">
                          {index + 1}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap sm:px-6">
                          {platform.name}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap sm:px-6">
                          <Switch
                            checked={platform.status === "active"}
                            onCheckedChange={() =>
                              toggleActive(platform._id, platform.status)
                            }
                          />
                        </td>
                        <td className="px-3 py-4 text-sm text-right whitespace-nowrap sm:px-6">
                          <button
                            onClick={() =>
                              window.confirm("Are you sure want to delete?") &&
                              deletePlatform(platform?._id)
                            }
                            className="text-red-600 hover:text-red-900 hover:scale-110 transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
