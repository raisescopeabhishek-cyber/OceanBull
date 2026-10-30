import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, MailX } from "lucide-react";

const EmailUnverified = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchUnverifiedUsers = async () => {
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
        `${API_URL}/api/auth/get-users?page=${page}&limit=10&search=${search}&emailVerified=false`,
        config
      );

      setUsers(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch unverified users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedUsers();
  }, [page, search]);

  return (
    <div className="rounded-card p-6 text-text">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MailX size={18} /> Email Unverified Users
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-4 py-2 border rounded-field w-full focus:outline-none focus:ring focus:ring-danger text-text"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-muted">No email unverified users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-danger table-stack">
            <thead>
              <tr className="bg-danger-soft">
                <th className="p-3 text-left border border-danger">Name</th>
                <th className="p-3 text-left border border-danger">Email</th>
                <th className="p-3 text-left border border-danger">Phone</th>
                <th className="p-3 text-left border border-danger">Email varified</th>
                <th className="p-3 text-left border border-danger">Country</th>
                <th className="p-3 text-left border border-danger">Accounts</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-danger-soft transition duration-200"
                >
                  <td data-label="Name" className="p-3 border border-danger">
                    {u.firstName} {u.lastName}
                  </td>
                  <td data-label="Email" className="p-3 border border-danger text-warning">
                    {u.email}
                  </td>
                  <td data-label="Phone" className="p-3 border border-danger">{u.phone || "-"}</td>
                  <td data-label="Email varified" className="p-3 border border-danger">{u.phone || "-"}</td>

                  <td data-label="Country" className="p-3 border border-danger">{u.country || "-"}</td>
                  <td data-label="Accounts" className="p-3 border border-danger">
                    {u.accounts && u.accounts.length > 0 ? (
                      <div className="space-y-1">
                        {u.accounts.map((acc) => (
                          <div
                            key={acc._id}
                            className="bg-danger-soft text-danger px-2 py-1 rounded-field text-xs"
                          >
                            {acc.accountNumber} ({acc.platform})
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
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
          className="px-3 py-1 bg-danger text-text rounded disabled:bg-surface-3"
        >
          Prev
        </button>
        <span className="text-sm text-muted">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-danger text-text rounded disabled:bg-surface-3"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmailUnverified;
