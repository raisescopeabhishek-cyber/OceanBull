// src/components/AccountTypes/AccountTypes.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, RefreshCw } from "lucide-react";
import AccountTypeForm from "./AccountTypeForm";
import AccountTypeTable from "./AccountTypeTable";
import { superAdminApi } from "@/utils/apiClients";
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
      const res = await superAdminApi.get(`/get-custom-groups`);
      setAccountTypes(res.data.data);
    } catch {
      toast.error("Failed to fetch account types");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchExistingData = async () => {
    setIsFetching(true);
    try {
      const res = await superAdminApi.get(`/get-account-types`);
      setExistingData(res.data.data);
    } catch {
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
        updated.accountType = selectedType?.customGroup || "";
        updated.apiGroup = selectedType?.apiGroup || "";
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
      await superAdminApi.post(`/add-account-type`, {
        apiGroup: newAccountType.apiGroup,
        accountType: newAccountType.accountType,
        leverage: newAccountType.leverage,
        accountSize: newAccountType.accountSize,
      });
      toast.success("Account type added successfully!");
      setNewAccountType({
        accountType: "",
        leverage: [{ label: "", value: "" }],
        accountSize: [{ deposit: "", balance: "" }],
      });
      fetchExistingData();
    } catch {
      toast.error("Failed to add account type");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHandler = async (id, accountTypeName) => {
    if (!window.confirm(`Delete "${accountTypeName}"?`)) return;
    setIsLoading(true);
    try {
      await superAdminApi.delete(`/delete-account-type?id=${id}`);
      toast.success("Deleted successfully!");
      fetchExistingData();
    } catch {
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
        <h1 className="text-3xl font-bold text-white">Configure Account Types</h1>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          <span>Refresh</span>
        </button>
      </div>

      <AccountTypeForm
        accountTypes={accountTypes}
        newAccountType={newAccountType}
        isLoading={isLoading}
        isFetching={isFetching}
        handleInputChange={handleInputChange}
        addField={addField}
        removeField={removeField}
        handleSubmit={handleSubmit}
      />

      <AccountTypeTable
        existingData={existingData}
        isFetching={isFetching}
        isLoading={isLoading}
        deleteHandler={deleteHandler}
      />
    </div>
  );
};

export default AccountTypes;
