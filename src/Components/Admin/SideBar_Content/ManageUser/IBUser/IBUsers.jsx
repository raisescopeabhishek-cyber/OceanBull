import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Users, CheckCircle, XCircle, Copy } from "lucide-react";

const IBUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [copiedId, setCopiedId] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchReferralUsers = async () => {
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
        `${API_URL}/api/auth/get-users?page=${page}&limit=10&search=${search}&referralUsers=true`,
        config
      );

      setUsers(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch referral users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralUsers();
  }, [page, search]);

  const statusIcon = (isVerified) =>
    isVerified ? (
      <CheckCircle className="text-green-400" size={18} />
    ) : (
      <XCircle className="text-red-400" size={18} />
    );

  const handleCopy = (text, userId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users size={18} /> Referral Users
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
            placeholder="Search by name or email..."
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
      ) : users.length === 0 ? (
        <p className="text-gray-300">No referral users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-indigo-800">
            <thead>
              <tr className="bg-indigo-800/50">
                <th className="p-3 text-left border border-indigo-800">Name</th>
                <th className="p-3 text-left border border-indigo-800">
                  Email
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  MT5 Account
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  Email Verified
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  KYC Verified
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  IB ID
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  IB Balance
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  Referral Link
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const referralLink = `https://demo.testcrm.co.in/user/signup/${u.referralAccount}`;
                return (
                  <tr
                    key={u._id}
                    className="hover:bg-indigo-800/30 transition duration-200"
                  >
                    <td className="p-3 border border-indigo-800">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3 border border-indigo-800">{u.email}</td>
                    <td className="p-3 border border-indigo-800">
                      {u.accounts.length}
                    </td>
                    <td className="p-3 border border-indigo-800">
                      {statusIcon(u.emailVerified)}
                    </td>
                    <td className="p-3 border border-indigo-800">
                      {statusIcon(u.kycVerified)}
                    </td>
                    <td className="p-3 border border-indigo-800">
                      {u.referralAccount}
                    </td>
                    <td className="p-3 border border-indigo-800">
                      {u.ibBalance}
                    </td>
                    <td className="p-3 border border-indigo-800 flex items-center gap-2">
                      <span className="truncate max-w-[200px]">
                        {referralLink}
                      </span>
                      <button
                        onClick={() => handleCopy(referralLink, u._id)}
                        className="text-blue-400 hover:text-blue-500"
                      >
                        <Copy size={16} />
                      </button>
                      {copiedId === u._id && (
                        <span className="text-green-400 text-xs">Copied!</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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

export default IBUsers;
