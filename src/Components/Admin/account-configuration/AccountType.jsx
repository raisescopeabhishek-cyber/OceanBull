import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  Loader2,
  RefreshCw,
  Layers3,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { superAdminApi } from "../../../utils/apiClients";

const AccountTypes = () => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

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
      setAccountTypes(res.data.data || []);
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
      const res = await superAdminApi.get(`/get-account-types`);
      setExistingData(res.data.data || []);
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
          updated.accountType = value;
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
      const res = await superAdminApi.post(`/add-account-type`, {
        apiGroup: newAccountType.apiGroup,
        accountType: newAccountType.accountType,
        leverage: newAccountType.leverage,
        accountSize: newAccountType.accountSize,
      });

      if (res.data.status) {
        setNewAccountType({
          accountType: "",
          apiGroup: "",
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
      await superAdminApi.delete(`/delete-account-type?id=${id}`);
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
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            Account Configuration
          </div>

          <h1
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Configure Account Types
          </h1>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/50" : "text-slate-600",
            ].join(" ")}
          >
            Create and manage account types with leverage and balance settings.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
            isDark
              ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.22)]",
          ].join(" ")}
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Add Form */}
      <div
        className={[
          "rounded-[24px] border p-4 sm:p-5 mb-6 backdrop-blur-xl transition-all duration-300",
          isDark
            ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
            : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="mb-5">
          <h2
            className={[
              "text-xl sm:text-2xl font-semibold",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Add New Account Type
          </h2>
          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            Select a custom group and configure leverage options for the account
            type.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Type Select */}
          <div>
            <label
              className={[
                "mb-2 block text-sm font-medium",
                isDark ? "text-white/75" : "text-slate-700",
              ].join(" ")}
            >
              Account Type
            </label>

            <div className="relative">
              <select
                name="accountType"
                value={newAccountType.accountType}
                onChange={(e) => handleInputChange(e)}
                required
                disabled={isLoading || isFetching}
                className={[
                  "w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition-all duration-300",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
                ].join(" ")}
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

              <div
                className={[
                  "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
                  isDark ? "text-white/40" : "text-slate-500",
                ].join(" ")}
              >
                {isFetching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>

          {/* Leverage Fields */}
          <div>
            <label
              className={[
                "mb-2 block text-sm font-medium",
                isDark ? "text-white/75" : "text-slate-700",
              ].join(" ")}
            >
              Leverage
            </label>

            <div className="space-y-3">
              {newAccountType.leverage.map((lev, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-3 items-center"
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
                    className={[
                      "w-full flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
                    ].join(" ")}
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
                    className={[
                      "w-full flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
                    ].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => removeField("leverage", index)}
                    disabled={isLoading}
                    className={[
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 disabled:opacity-50",
                      isDark
                        ? "text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        : "text-red-500 hover:bg-red-50 hover:text-red-600",
                    ].join(" ")}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addField("leverage")}
              disabled={isLoading}
              className={[
                "mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                isDark
                  ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.22)]",
              ].join(" ")}
            >
              <PlusCircle className="h-4 w-4" />
              Add Leverage
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || isFetching}
            className={[
              "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
              isDark
                ? "bg-emerald-500/90 text-white hover:bg-emerald-500 shadow-[0_10px_25px_rgba(16,185,129,0.25)]"
                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_10px_25px_rgba(16,185,129,0.20)]",
            ].join(" ")}
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

      {/* Existing Table */}
      <div
        className={[
          "rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
          isDark
            ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
            : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="mb-5">
          <h2
            className={[
              "text-xl sm:text-2xl font-semibold",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Existing Account Types
          </h2>
          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            Review existing account types and their leverage settings.
          </p>
        </div>

        {isFetching && existingData.length === 0 ? (
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
        ) : existingData?.length === 0 ? (
          <div
            className={[
              "rounded-[18px] border py-10 text-center text-sm",
              isDark
                ? "border-white/10 bg-white/[0.03] text-white/55"
                : "border-slate-200 bg-slate-50 text-slate-500",
            ].join(" ")}
          >
            No account types found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div
              className={[
                "overflow-hidden rounded-[20px] border",
                isDark ? "border-white/10" : "border-slate-200",
              ].join(" ")}
            >
              <table className="w-full border-collapse">
                <thead
                  className={[
                    isDark
                      ? "bg-white/[0.06] text-white/80"
                      : "bg-slate-100/80 text-slate-700",
                  ].join(" ")}
                >
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">
                      Account Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">
                      Leverage
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className={isDark ? "bg-transparent" : "bg-white/40"}>
                  {existingData?.map((type) => (
                    <tr
                      key={type._id}
                      className={[
                        "border-t transition-colors duration-200",
                        isDark
                          ? "border-white/10 hover:bg-white/[0.03]"
                          : "border-slate-200 hover:bg-slate-50/80",
                      ].join(" ")}
                    >
                      <td
                        className={[
                          "px-6 py-4 text-sm font-medium",
                          isDark ? "text-white/85" : "text-slate-800",
                        ].join(" ")}
                      >
                        {type.accountType}
                      </td>

                      <td
                        className={[
                          "px-6 py-4 text-sm",
                          isDark ? "text-white/75" : "text-slate-700",
                        ].join(" ")}
                      >
                        <div className="space-y-2">
                          {type.leverage?.map((lev, i) => (
                            <div
                              key={i}
                              className={[
                                "rounded-xl border px-3 py-2",
                                isDark
                                  ? "border-white/10 bg-white/[0.03]"
                                  : "border-slate-200 bg-slate-50/80",
                              ].join(" ")}
                            >
                              <p>
                                <span
                                  className={
                                    isDark ? "text-white/40" : "text-slate-500"
                                  }
                                >
                                  Label:
                                </span>{" "}
                                <span
                                  className={
                                    isDark ? "text-white/85" : "text-slate-800"
                                  }
                                >
                                  {lev.label}
                                </span>
                              </p>
                              <p className="mt-1">
                                <span
                                  className={
                                    isDark ? "text-white/40" : "text-slate-500"
                                  }
                                >
                                  Value:
                                </span>{" "}
                                <span
                                  className={
                                    isDark ? "text-white/85" : "text-slate-800"
                                  }
                                >
                                  {lev.value}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            deleteHandler(type._id, type.accountType)
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
        )}
      </div>
    </div>
  );
};

export default AccountTypes;