// src/components/AccountTypes/AccountTypeTable.jsx
import React from "react";
import { Trash2 } from "lucide-react";

const AccountTypeTable = ({ existingData, isFetching, isLoading, deleteHandler }) => {
  return (
    <div className="bg-primary-800 rounded-card p-6">
      <h2 className="text-2xl font-semibold text-text mb-6">
        Existing Account Types
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-stack">
          <thead>
            <tr className="bg-primary-600">
              <th className="px-6 py-3 text-left text-text">Account Type</th>
              <th className="px-6 py-3 text-left text-text">Leverage</th>
              <th className="px-6 py-3 text-center text-text">Action</th>
            </tr>
          </thead>
          <tbody>
            {existingData?.length === 0 && !isFetching ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-muted">
                  No account types found
                </td>
              </tr>
            ) : (
              existingData?.map((type) => (
                <tr
                  key={type._id}
                  className="border-t border-primary-700 hover:bg-primary-700/50"
                >
                  <td data-label="Account Type" className="px-6 py-4 text-muted">{type.accountType}</td>
                  <td data-label="Leverage" className="px-6 py-4 text-muted">
                    {type.leverage?.map((lev, i) => (
                      <div key={i}>
                        <p>Label: {lev.label}</p>
                        <p>Value: {lev.value}</p>
                      </div>
                    ))}
                  </td>
                  <td data-label="Action" className="px-6 py-4 text-center">
                    <button
                      onClick={() => deleteHandler(type._id, type.accountType)}
                      disabled={isLoading}
                      className="p-2 bg-danger text-text rounded-field"
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
