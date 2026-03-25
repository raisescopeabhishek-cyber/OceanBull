// src/components/AccountTypes/AccountTypeForm.jsx
import React from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const AccountTypeForm = ({
  accountTypes,
  newAccountType,
  isLoading,
  isFetching,
  handleInputChange,
  addField,
  removeField,
  handleSubmit,
}) => {
  return (
    <div className="bg-primary-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Add New Account Type
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Account Type
          </label>
          <select
            name="accountType"
            value={newAccountType.accountType}
            onChange={(e) => handleInputChange(e)}
            required
            disabled={isLoading || isFetching}
            className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300"
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
        </div>

        {/* Leverage Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Leverage
          </label>
          {newAccountType.leverage.map((lev, index) => (
            <div key={index} className="flex gap-3 mb-3 items-center">
              <input
                type="text"
                placeholder="Label"
                value={lev.label}
                onChange={(e) =>
                  handleInputChange(e, index, "leverage", "label")
                }
                required
                disabled={isLoading}
                className="flex-1 p-3 bg-white text-gray-900 rounded-lg border"
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
                className="flex-1 p-3 bg-white text-gray-900 rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeField("leverage", index)}
                disabled={isLoading}
                className="p-2 bg-red-600 text-white rounded-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField("leverage")}
            disabled={isLoading}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <PlusCircle className="h-5 w-5" />
            Add Leverage
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || isFetching}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg"
        >
          <PlusCircle className="h-5 w-5" />
          Add Account Type
        </button>
      </form>
    </div>
  );
};

export default AccountTypeForm;
