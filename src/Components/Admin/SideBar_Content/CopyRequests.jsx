import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, User, Mail, Clock } from "lucide-react";
import dayjs from "dayjs";

const CopyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchRequests = async () => {
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
        `${API_URL}/api/copy-requests?page=${page}&limit=10&status=Pending&search=${search}`,
        config
      );

      setRequests(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch copy requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, search]);

  const handleAction = (id, action) => {
    console.log(`Performing ${action} on request ${id}`);
    // Here you can call approve/reject API
  };

  return (
    <div className="rounded-card p-6 text-text">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User size={18} /> Copy Trade Requests
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
            placeholder="Search by user or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-4 py-2 border rounded-field w-full focus:outline-none focus:ring focus:ring-primary text-text"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-muted">No pending copy requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-line table-stack">
            <thead>
              <tr className="bg-surface">
                <th className="p-3 text-left border border-line">User</th>
                <th className="p-3 text-left border border-line">Email</th>
                <th className="p-3 text-left border border-line">Accounts Requested</th>
                <th className="p-3 text-left border border-line">Role</th>
                <th className="p-3 text-left border border-line">Timestamp</th>
                <th className="p-3 text-left border border-line">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req._id}
                  className="hover:bg-surface transition duration-200"
                >
                  <td data-label="User" className="p-3 border border-line">
                    {req.user?.firstName} {req.user?.lastName}
                  </td>
                  <td data-label="Email" className="p-3 border border-line text-primary">
                    {req.user?.email}
                  </td>
                  <td data-label="Accounts Requested" className="p-3 border border-line">
                    {req.accounts && req.accounts.length > 0
                      ? req.accounts.join(", ")
                      : "-"}
                  </td>
                  <td data-label="Role" className="p-3 border border-line capitalize">
                    {req.role}
                  </td>
                  <td data-label="Timestamp" className="p-3 border border-line">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {dayjs(req.createdAt).format("DD MMM YYYY, HH:mm")}
                    </div>
                  </td>
                  <td data-label="Action" className="p-3 border border-line">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(req._id, "approve")}
                        className="px-2 py-1 bg-success rounded text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "reject")}
                        className="px-2 py-1 bg-danger rounded text-xs"
                      >
                        Reject
                      </button>
                    </div>
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
          className="px-3 py-1 bg-primary text-text rounded disabled:bg-surface-3"
        >
          Prev
        </button>
        <span className="text-sm text-muted">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-primary text-text rounded disabled:bg-surface-3"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CopyRequests;
