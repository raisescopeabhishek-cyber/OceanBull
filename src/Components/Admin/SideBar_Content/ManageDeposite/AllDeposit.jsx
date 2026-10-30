// AllDeposit.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

const AllDeposit = () => {
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
        `${API_URL}/api/deposits?page=${page}&limit=10&search=${search}&status=`,
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
    <div className="rounded-card p-6 text-text">
      <h2 className="text-lg font-semibold mb-4">All Deposits</h2>

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
            className="pl-9 pr-4 py-2 border rounded-field w-full focus:outline-none focus:ring focus:ring-line text-text"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted">Loading deposits...</p>
      ) : deposits.length === 0 ? (
        <p className="text-muted">No deposits found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-line table-stack">
            <thead>
              <tr className="bg-surface">
                <th className="p-3 text-left border border-line">User</th>
                <th className="p-3 text-left border border-line">Email</th>
                <th className="p-3 text-left border border-line">MT5 AC</th>
                <th className="p-3 text-left border border-line">AC Type</th>
                <th className="p-3 text-left border border-line">Deposit</th>
                <th className="p-3 text-left border border-line">Requested At</th>
                <th className="p-3 text-left border border-line">Proof</th>
                <th className="p-3 text-left border border-line">Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr
                  key={d._id}
                  className="hover:bg-surface transition duration-200"
                >
                  <td data-label="User" className="p-3 border border-line">
                    {d.userId?.firstName} {d.userId?.lastName}
                  </td>
                  <td data-label="Email" className="p-3 border border-line text-primary">
                    {d.userId?.email}
                  </td>
                  <td data-label="MT5 AC" className="p-3 border border-line">{d.mt5Account}</td>
                  <td data-label="AC Type" className="p-3 border border-line">{d.accountType}</td>
                  <td data-label="Deposit" className="p-3 border border-line">${d.deposit}</td>
                  <td data-label="Requested At" className="p-3 border border-line">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td data-label="Proof" className="p-3 border border-line">
                    {d.depositSS ? (
                      <a
                        href={d.depositSS}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    ) : (
                      "No proof"
                    )}
                  </td>
                  <td data-label="Action" className="p-3 border border-line">
                    <button className="px-3 py-1 bg-primary hover:bg-primary-soft rounded text-text text-sm">
                      View
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
          className="px-3 py-1 bg-surface-3 text-text rounded disabled:bg-surface-3"
        >
          Prev
        </button>
        <span className="text-sm text-muted">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-surface-3 text-text rounded disabled:bg-surface-3"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllDeposit;
