import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, XCircle } from "lucide-react";

const RejectedWithdrawals = () => {
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

  const fetchRejectedWithdrawals = async () => {
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
        `${API_URL}/withdrawals?page=${page}&limit=10&search=${search}&status=rejected`,
        config
      );

      setWithdrawals(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch rejected withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedWithdrawals();
  }, [page, search]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <XCircle size={18} /> Rejected Withdrawals
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
            className="pl-9 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-red-300 text-black"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p className="text-gray-300">No rejected withdrawals found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-red-800">
            <thead>
              <tr className="bg-red-800/50">
                <th className="p-3 text-left border border-red-800">User</th>
                <th className="p-3 text-left border border-red-800">Email</th>
                <th className="p-3 text-left border border-red-800">MT5 Account</th>
                <th className="p-3 text-left border border-red-800">Method</th>
                <th className="p-3 text-left border border-red-800">Amount</th>
                <th className="p-3 text-left border border-red-800">Status</th>
                <th className="p-3 text-left border border-red-800">Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr
                  key={w._id}
                  className="hover:bg-red-800/30 transition duration-200"
                >
                  <td className="p-3 border border-red-800">
                    {w.userData?.firstName} {w.userData?.lastName}
                  </td>
                  <td className="p-3 border border-red-800 text-red-300">
                    {w.userData?.email}
                  </td>
                  <td className="p-3 border border-red-800">{w.mt5Account}</td>
                  <td className="p-3 border border-red-800">{w.method}</td>
                  <td className="p-3 border border-red-800">${w.amount}</td>
                  <td className="p-3 border border-red-800 capitalize text-red-400 font-semibold">
                    {w.status}
                  </td>
                  <td className="p-3 border border-red-800">
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
          className="px-3 py-1 bg-red-600 text-white rounded disabled:bg-gray-400"
        >
          Prev
        </button>
        <span className="text-sm text-gray-300">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-red-600 text-white rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RejectedWithdrawals;
