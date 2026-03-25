import React, { useEffect, useState } from "react";
import axios from "axios";

const DepositSummary = () => {
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const formatNumber = (num) => (num || num === 0 ? num.toLocaleString() : "-");

  const fetchWithdrawalReport = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const res = await axios.get(`${API_URL}/auth/withdrawal-report`, config);
      setReport(res?.data?.data || {});
    } catch (err) {
      console.error("❌ Failed to fetch withdrawal report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalReport();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        📊 Withdrawal Summary
      </h3>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700">
          <li>Total: {formatNumber(report?.total)}</li>
          <li>Approved: {formatNumber(report?.approved)}</li>
          <li>Pending: {formatNumber(report?.pending)}</li>
          <li>Rejected: {formatNumber(report?.rejected)}</li>
          <li>Today Approved: {formatNumber(report?.todayApproved)}</li>
          <li>Last Week Approved: {formatNumber(report?.lastWeekApproved)}</li>
          <li>Last Month Approved: {formatNumber(report?.lastMonthApproved)}</li>
        </ul>
      )}
    </div>
  );
};

export default DepositSummary;
