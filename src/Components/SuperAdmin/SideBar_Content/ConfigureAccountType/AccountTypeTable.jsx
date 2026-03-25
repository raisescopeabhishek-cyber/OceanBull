// src/components/AccountTypes/AccountTypeTable.jsx
import React from "react";
import { Trash2 } from "lucide-react";

const AccountTypeTable = ({ existingData, isFetching, isLoading, deleteHandler }) => {
  return (
    <div className="bg-primary-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Existing Account Types
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-600">
              <th className="px-6 py-3 text-left text-gray-100">Account Type</th>
              <th className="px-6 py-3 text-left text-gray-100">Leverage</th>
              <th className="px-6 py-3 text-center text-gray-100">Action</th>
            </tr>
          </thead>
          <tbody>
            {existingData?.length === 0 && !isFetching ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-300">
                  No account types found
                </td>
              </tr>
            ) : (
              existingData?.map((type) => (
                <tr
                  key={type._id}
                  className="border-t border-primary-700 hover:bg-primary-700/50"
                >
                  <td className="px-6 py-4 text-gray-200">{type.accountType}</td>
                  <td className="px-6 py-4 text-gray-200">
                    {type.leverage?.map((lev, i) => (
                      <div key={i}>
                        <p>Label: {lev.label}</p>
                        <p>Value: {lev.value}</p>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => deleteHandler(type._id, type.accountType)}
                      disabled={isLoading}
                      className="p-2 bg-red-600 text-white rounded-lg"
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
  );
};

export default AccountTypeTable;
