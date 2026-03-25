import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import axios from "axios";

const UserBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
const API_URL =  import.meta.env.VITE_API_BASE_URL;
const API_KEY =  import.meta.env.VITE_API_KEY;
  const fetchUserReport = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const res = await axios.get(
        `${API_URL}/api/auth/user-report`,
        config
      );

      const data = res?.data?.data;

      const formatted = [
        { title: "Total Users", value: data.totalUsers },
        { title: "KYC Verified", value: data.kycVerified },
        { title: "KYC Unverified", value: data.kycUnverified },
        { title: "Email Verified", value: data.emailVerified },
        { title: "Email Unverified", value: data.emailUnverified },
        { title: "Today Users", value: data.emailUnverified }, // update when API supports
        { title: "Last Week Users", value: data.emailUnverified }, // update when API supports
        { title: "Last Month Users", value: data.emailUnverified }, // update when API supports
        { title: "Total IB Users", value: data.totalIbUsers },
        { title: "Total Referrals", value: data.totalReferralUsers },
      ];

      setChartData(formatted);
    } catch (err) {
      console.error("Failed to fetch user report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReport();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 p-4 rounded-sm shadow-md text-white">
      <h2 className="text-lg font-semibold mb-4">User Report Overview</h2>
      {loading ? (
        <p className="text-center text-sm">Loading chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="title" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1b4b",
                border: "none",
                color: "#fff",
              }}
            />
            <Bar dataKey="value" fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default UserBarChart;
