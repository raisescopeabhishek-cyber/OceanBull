import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CheckCircle } from "lucide-react";

const ApprovedWithdrawals = () => {
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

  const fetchApprovedWithdrawals = async () => {
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
        `${API_URL}/withdrawals?page=${page}&limit=10&search=${search}&status=approved`,
        config
      );

      setWithdrawals(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch approved withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedWithdrawals();
  }, [page, search]);

  return (
    <div className="rounded-card p-6 text-text">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle size={18} /> Approved Withdrawals
      </h2>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            type="text"
            placeholder="Search by name, email, or MT5 account..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-4 py-2 border rounded-field w-full focus:outline-none focus:ring focus:ring-success text-text"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p className="text-muted">No approved withdrawals found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-success table-stack">
            <thead>
              <tr className="bg-success-soft">
                <th className="p-3 text-left border border-success">User</th>
                <th className="p-3 text-left border border-success">Email</th>
                <th className="p-3 text-left border border-success">MT5 Account</th>
                <th className="p-3 text-left border border-success">Method</th>
                <th className="p-3 text-left border border-success">Amount</th>
                <th className="p-3 text-left border border-success">Status</th>
                <th className="p-3 text-left border border-success">Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr
                  key={w._id}
                  className="hover:bg-success-soft transition duration-200"
                >
                  <td data-label="User" className="p-3 border border-success">
                    {w.userData?.firstName} {w.userData?.lastName}
                  </td>
                  <td data-label="Email" className="p-3 border border-success text-success">
                    {w.userData?.email}
                  </td>
                  <td data-label="MT5 Account" className="p-3 border border-success">{w.mt5Account}</td>
                  <td data-label="Method" className="p-3 border border-success">{w.method}</td>
                  <td data-label="Amount" className="p-3 border border-success">${w.amount}</td>
                  <td data-label="Status" className="p-3 border border-success capitalize">
                    {w.status}
                  </td>
                  <td data-label="Date" className="p-3 border border-success">
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
          className="px-3 py-1 bg-success text-text rounded disabled:bg-surface-3"
        >
          Prev
        </button>
        <span className="text-sm text-muted">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-success text-text rounded disabled:bg-surface-3"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ApprovedWithdrawals;
