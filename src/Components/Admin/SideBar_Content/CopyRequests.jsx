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
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User size={18} /> Copy Trade Requests
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
            placeholder="Search by user or email..."
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
        <p className="text-gray-300">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-300">No pending copy requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-indigo-800">
            <thead>
              <tr className="bg-indigo-800/50">
                <th className="p-3 text-left border border-indigo-800">User</th>
                <th className="p-3 text-left border border-indigo-800">Email</th>
                <th className="p-3 text-left border border-indigo-800">Accounts Requested</th>
                <th className="p-3 text-left border border-indigo-800">Role</th>
                <th className="p-3 text-left border border-indigo-800">Timestamp</th>
                <th className="p-3 text-left border border-indigo-800">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req._id}
                  className="hover:bg-indigo-800/30 transition duration-200"
                >
                  <td className="p-3 border border-indigo-800">
                    {req.user?.firstName} {req.user?.lastName}
                  </td>
                  <td className="p-3 border border-indigo-800 text-blue-300">
                    {req.user?.email}
                  </td>
                  <td className="p-3 border border-indigo-800">
                    {req.accounts && req.accounts.length > 0
                      ? req.accounts.join(", ")
                      : "-"}
                  </td>
                  <td className="p-3 border border-indigo-800 capitalize">
                    {req.role}
                  </td>
                  <td className="p-3 border border-indigo-800">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {dayjs(req.createdAt).format("DD MMM YYYY, HH:mm")}
                    </div>
                  </td>
                  <td className="p-3 border border-indigo-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(req._id, "approve")}
                        className="px-2 py-1 bg-green-600 rounded text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "reject")}
                        className="px-2 py-1 bg-red-600 rounded text-xs"
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

export default CopyRequests;
