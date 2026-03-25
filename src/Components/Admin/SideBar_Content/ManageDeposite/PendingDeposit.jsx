import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Wallet } from "lucide-react";

const PendingDeposit = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchDeposits = async () => {
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
        `${API_URL}/api/deposits?page=${page}&limit=10&search=${search}&status=pending`,
        config
      );

      setDeposits(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch deposits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [page, search]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Wallet size={18} /> Pending Deposits
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
        <p className="text-gray-300">Loading deposits...</p>
      ) : deposits.length === 0 ? (
        <p className="text-gray-300">No pending deposits found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="p-3 text-left border border-gray-700">User</th>
                <th className="p-3 text-left border border-gray-700">Email</th>
                <th className="p-3 text-left border border-gray-700">MT5 AC</th>
                <th className="p-3 text-left border border-gray-700">AC Type</th>
                <th className="p-3 text-left border border-gray-700">Deposit</th>
                <th className="p-3 text-left border border-gray-700">Requested At</th>
                <th className="p-3 text-left border border-gray-700">Proof</th>
                <th className="p-3 text-left border border-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr
                  key={d._id}
                  className="hover:bg-gray-800/30 transition duration-200"
                >
                  <td className="p-3 border border-gray-700">
                    {d.userId?.firstName} {d.userId?.lastName}
                  </td>
                  <td className="p-3 border border-gray-700 text-indigo-300">
                    {d.userId?.email}
                  </td>
                  <td className="p-3 border border-gray-700">{d.mt5Account}</td>
                  <td className="p-3 border border-gray-700">{d.accountType}</td>
                  <td className="p-3 border border-gray-700">${d.deposit}</td>
                  <td className="p-3 border border-gray-700">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border border-gray-700">
                    {d.depositSS ? (
                      <a
                        href={d.depositSS}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        View
                      </a>
                    ) : (
                      "No proof"
                    )}
                  </td>
                  <td className="p-3 border border-gray-700 flex gap-2">
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm">
                      Reject
                    </button>
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

export default PendingDeposit;
