import React from "react";

const WithdrawalSummary = ({ report }) => {
  const formatNumber = (num) => (num || num === 0 ? num.toLocaleString() : "-");

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">📤 Withdrawal Summary</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        <li>Total: {formatNumber(report?.total)}</li>
        <li>Approved: {formatNumber(report?.approved)}</li>
        <li>Pending: {formatNumber(report?.pending)}</li>
        <li>Rejected: {formatNumber(report?.rejected)}</li>
      </ul>
    </div>
  );
};

export default WithdrawalSummary;
