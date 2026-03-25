import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";

const AccountTypes = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [existingData, setExistingData] = useState([]);
  const [newAccountType, setNewAccountType] = useState({
    accountType: "",
    apiGroup: "",
    leverage: [{ label: "", value: "" }],
    accountSize: [{ deposit: "", balance: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchAccountTypes = async () => {
    setIsFetching(true);
    try {
      const res = await backendApi.get(`/get-custom-groups`);
      setAccountTypes(res.data.data);
    } catch (error) {
      console.log("Error fetching account types", error);
      toast.error("Failed to fetch account types");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchExistingData = async () => {
    setIsFetching(true);
    try {
      const res = await backendApi.get(`/get-account-types`);
      setExistingData(res.data.data);
    } catch (error) {
      console.log("Error fetching existing account types data", error);
      toast.error("Failed to fetch existing data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e, index, field, subfield) => {
    const { name, value } = e.target;
    setNewAccountType((prev) => {
      const updated = { ...prev };
      if (field) {
        updated[field][index][subfield] = value;
      } else if (name === "accountType") {
        const selectedType = accountTypes.find(
          (type) => type.customGroup === value
        );
        if (selectedType) {
          updated.accountType = selectedType.customGroup;
          updated.apiGroup = selectedType.apiGroup;
        } else {
          updated.apiGroup = "";
        }
      } else {
        updated[name] = value;
      }
      return updated;
    });
  };

  const addField = (field) => {
    setNewAccountType((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "leverage"
          ? { label: "", value: "" }
          : { deposit: "", balance: "" },
      ],
    }));
  };

  const removeField = (field, index) => {
    setNewAccountType((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await backendApi.post(`/add-account-type`, {
        apiGroup: newAccountType.apiGroup,
        accountType: newAccountType.accountType,
        leverage: newAccountType.leverage,
        accountSize: newAccountType.accountSize,
      });
      if (res.data.status) {
        setNewAccountType({
          accountType: "",
          leverage: [{ label: "", value: "" }],
          accountSize: [{ deposit: "", balance: "" }],
        });
        toast.success("Account type added successfully!");
        fetchExistingData();
      }
    } catch (error) {
      console.error("Error adding account type:", error);
      toast.error("Failed to add account type");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHandler = async (id, accountTypeName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the account type "${accountTypeName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await backendApi.delete(`/delete-account-type?id=${id}`);
      toast.success("Account type deleted successfully!");
      fetchExistingData();
    } catch (error) {
      console.error("Error deleting account type:", error);
      toast.error("Failed to delete account type");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAccountTypes();
    fetchExistingData();
  };

  useEffect(() => {
    fetchAccountTypes();
    fetchExistingData();
  }, []);

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          Configure Account Types
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-all"
        >
          {isFetching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Add New Account Type Form */}
      <div className="bg-primary-800 rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Add New Account Type
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Account Type
            </label>
            <div className="relative">
              <select
                name="accountType"
                value={newAccountType.accountType}
                onChange={(e) => handleInputChange(e)}
                required
                disabled={isLoading || isFetching}
                className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:opacity-50 transition-all appearance-none"
              >
                <option value="" disabled>
                  Select an account type
                </option>
                {accountTypes?.map((type) => (
                  <option key={type._id} value={type.customGroup}>
                    {type.customGroup}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {isFetching ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Leverage
            </label>
            {newAccountType.leverage.map((lev, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-3 mb-3 items-center"
              >
                <input
                  type="text"
                  placeholder="Label (e.g. 1:100)"
                  value={lev.label}
                  onChange={(e) =>
                    handleInputChange(e, index, "leverage", "label")
                  }
                  required
                  disabled={isLoading}
                  className="flex-1 p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={lev.value}
                  onChange={(e) =>
                    handleInputChange(e, index, "leverage", "value")
                  }
                  required
                  disabled={isLoading}
                  className="flex-1 p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeField("leverage", index)}
                  disabled={isLoading}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-all"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField("leverage")}
              disabled={isLoading}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-all"
            >
              <PlusCircle className="h-5 w-5" />
              Add Leverage
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || isFetching}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PlusCircle className="h-5 w-5" />
            )}
            Add Account Type
          </button>
        </form>
      </div>

      {/* Existing Account Types Table */}
      <div className="bg-primary-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Existing Account Types
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-600">
                <th className="px-6 py-3 text-left text-gray-100 font-medium">
                  Account Type
                </th>
                <th className="px-6 py-3 text-left text-gray-100 font-medium">
                  Leverage
                </th>
                <th className="px-6 py-3 text-center text-gray-100 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {existingData?.length === 0 && !isFetching ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-300"
                  >
                    No account types found
                  </td>
                </tr>
              ) : (
                existingData?.map((type) => (
                  <tr
                    key={type._id}
                    className="border-t border-primary-700 hover:bg-primary-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-200">
                      {type.accountType}
                    </td>
                    <td className="px-6 py-4 text-gray-200">
                      {type.leverage?.map((lev, i) => (
                        <div
                          key={i}
                          className="py-1 border-b border-primary-600 last:border-b-0"
                        >
                          <p>
                            <span className="text-gray-400">Label:</span>{" "}
                            {lev.label}
                          </p>
                          <p>
                            <span className="text-gray-400">Value:</span>{" "}
                            {lev.value}
                          </p>
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          deleteHandler(type._id, type.accountType)
                        }
                        disabled={isLoading}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountTypes;
