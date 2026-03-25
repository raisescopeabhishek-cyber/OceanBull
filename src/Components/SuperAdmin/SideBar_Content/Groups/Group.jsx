import React, { useEffect, useState } from "react";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { superAdminApi } from "@/utils/apiClients";
export default function Group({ refresh }) {
  const [customGroups, setCustomGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminApi.get(`/get-custom-groups`);
      setCustomGroups(res.data.data);
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

    // https://demo-ncrm.testcrm.top/api/auth/delete-custom-group?id=689c4f2f082a170960724409

    console.log(id);

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
  }, [refresh]); // refresh when AccountGroup adds new

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Existing Groups</h1>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : customGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-primary-800 rounded-xl shadow-lg">
          No custom groups found
        </div>
      ) : (
        <div className="hidden sm:block overflow-x-auto bg-primary-800 rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-primary-700">
            <thead className="bg-primary-600">
              <tr>
                <th className="py-3 px-6 text-center text-sm font-medium text-gray-100">
                  Sr. No.
                </th>
                <th className="py-3 px-6 text-center text-sm font-medium text-gray-100">
                  API Group
                </th>
                <th className="py-3 px-6 text-center text-sm font-medium text-gray-100">
                  Custom Group
                </th>
                <th className="py-3 px-6 text-center text-sm font-medium text-gray-100">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {customGroups.map((value, index) => (
                <tr key={index} className="text-white hover:bg-primary-700/50">
                  <td className="py-4 px-6 text-center">{index + 1}</td>
                  <td className="py-4 px-6 text-center">{value?.apiGroup}</td>
                  <td className="py-4 px-6 text-center">
                    {value?.customGroup}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() =>
                        deleteHandler(value._id, value.customGroup)
                      }
                      disabled={isLoading}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
