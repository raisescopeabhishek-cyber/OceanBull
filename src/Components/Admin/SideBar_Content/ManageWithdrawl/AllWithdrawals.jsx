import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Wallet } from "lucide-react";

const AllWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_password_ref");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const res = await axios.get(
        `${API_URL}/withdrawals?page=${page}&limit=10&search=${search}&status=`,
        config
      );

      setWithdrawals(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [page, search]);

  const statusColors = {
    approved: "text-green-400 bg-green-900/40",
    rejected: "text-red-400 bg-red-900/40",
    pending: "text-yellow-400 bg-yellow-900/40",
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Wallet size={18} /> All Withdrawals
      </h2>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or MT5 account..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-indigo-300 text-black"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-300">Loading withdrawals...</p>
      ) : withdrawals.length === 0 ? (
        <p className="text-gray-300">No withdrawals found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="p-3 text-left border border-gray-700">User</th>
                <th className="p-3 text-left border border-gray-700">Email</th>
                <th className="p-3 text-left border border-gray-700">MT5 Account</th>
                <th className="p-3 text-left border border-gray-700">Method</th>
                <th className="p-3 text-left border border-gray-700">Amount</th>
                <th className="p-3 text-left border border-gray-700">Status</th>
                <th className="p-3 text-left border border-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr
                  key={w._id}
                  className="hover:bg-gray-800/30 transition duration-200"
                >
                  <td className="p-3 border border-gray-700">
                    {w.userData?.firstName} {w.userData?.lastName}
                  </td>
                  <td className="p-3 border border-gray-700 text-indigo-300">
                    {w.userData?.email}
                  </td>
                  <td className="p-3 border border-gray-700">{w.mt5Account}</td>
                  <td className="p-3 border border-gray-700">{w.method}</td>
                  <td className="p-3 border border-gray-700">${w.amount}</td>
                  <td className="p-3 border border-gray-700">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusColors[w.status] || "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-700">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
          Prev
        </button>
        <span className="text-sm text-gray-300">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllWithdrawals;
