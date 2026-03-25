import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CheckCircle, XCircle } from "lucide-react";

const KycUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchUsers = async () => {
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
        `${API_URL}/api/auth/kyc-users?page=${page}&limit=10&search=${search}`,
        config
      );

      setUsers(res?.data?.data || []);
      setPagination(res?.data?.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch KYC users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const emailVerifiedBadge = (verified) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    return verified ? (
      <span className={`${base} bg-green-900/30 text-green-300`}>
        <CheckCircle size={14} /> Yes
      </span>
    ) : (
      <span className={`${base} bg-red-900/30 text-red-300`}>
        <XCircle size={14} /> No
      </span>
    );
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const payload = {
        documentType: selectedUser.kycDetails?.documentType || "Passport",
        countryOfIssue: selectedUser.country || "N/A",
        purpose: selectedUser.kycDetails?.purpose || "Personal",
        occupation: selectedUser.kycDetails?.occupation || "",
        status: "approved",
      };

      await axios.put(
        `${API_URL}/api/auth/user/${selectedUser._id}/kyc-status`,
        payload,
        config
      );

      alert(`✅ Approved KYC for ${selectedUser.firstName}`);
      setShowModal(false);
      fetchUsers(); // refresh list
    } catch (err) {
      console.error("❌ Error approving KYC:", err);
      alert("Failed to approve KYC.");
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const payload = {
        documentType: selectedUser.kycDetails?.documentType || "Passport",
        countryOfIssue: selectedUser.country || "N/A",
        purpose: selectedUser.kycDetails?.purpose || "Personal",
        occupation: selectedUser.kycDetails?.occupation || "",
        status: "rejected",
      };

      await axios.put(
        `${API_URL}/api/auth/user/${selectedUser._id}/kyc-status`,
        payload,
        config
      );

      alert(`❌ Rejected KYC for ${selectedUser.firstName}`);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error("❌ Error rejecting KYC:", err);
      alert("Failed to reject KYC.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-4">📝 KYC Submitted Users</h2>

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
            className="pl-9 pr-4 py-2 rounded-lg w-full bg-indigo-800/20 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-indigo-800">
            <thead>
              <tr className="bg-indigo-800/50">
                <th className="p-3 text-left border border-indigo-800">User</th>
                <th className="p-3 text-left border border-indigo-800">
                  Email
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  Total AC
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  Email Verified
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  Country
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  Updated At
                </th>
                <th className="p-3 text-left border border-indigo-800">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-indigo-800/30 transition duration-200"
                >
                  <td className="p-3 border border-indigo-800">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-3 border border-indigo-800">{u.email}</td>
                  <td className="p-3 border border-indigo-800">
                    {u.accounts?.length || 0}
                  </td>
                  <td className="p-3 border border-indigo-800">
                    {emailVerifiedBadge(u.emailVerified)}
                  </td>
                  <td className="p-3 border border-indigo-800">
                    {u.country || "N/A"}
                  </td>
                  <td className="p-3 border border-indigo-800">
                    {u.updatedAt
                      ? new Date(u.updatedAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="p-3 border border-indigo-800">
                    <button
                      onClick={() => handleViewClick(u)}
                      className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-xs"
                    >
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
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-500/50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-300">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-500/50"
        >
          Next
        </button>
      </div>

      {/* Modal with KYC Review Card */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto p-4">
          <div className="bg-blue-950 rounded-lg max-w-3xl w-full relative shadow-lg p-6">
            {/* Header */}
            <h3 className="text-lg  font-bold mb-4">
              KYC Review - {selectedUser.firstName} {selectedUser.lastName}
            </h3>

            {/* Account Details Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold border-b pb-2 mb-4">
                Account Details
              </h4>
              <div className="grid grid-cols-2 gap-y-3">
                <div className="font-medium">Email:</div>
                <div>{selectedUser.email}</div>
                <div className="font-medium">Country:</div>
                <div>{selectedUser.country || "N/A"}</div>
                <div className="font-medium">Purpose:</div>
                <div>{selectedUser.kycDetails?.purpose || "Personal"}</div>
                <div className="font-medium">Occupation:</div>
                <div>{selectedUser.kycDetails?.occupation || "N/A"}</div>
                <div className="font-medium">Document Type:</div>
                <div>{selectedUser.kycDetails?.documentType || "N/A"}</div>
              </div>
            </div>

            {/* Document Images */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold border-b pb-2 mb-4">
                Documents
              </h4>

              {console.log(selectedUser)}

              <div className="space-y-4">
                <div>
                  <div className="font-medium">Front Side of Document</div>
                  {selectedUser.kycDetails?.frontSideOfDocument ? (
                    <a
                      href={selectedUser.kycDetails.frontSideOfDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Full Image
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm">Not uploaded</p>
                  )}
                </div>

                <div>
                  <div className="font-medium">Back Side of Document</div>
                  {selectedUser.kycDetails?.backImage ? (
                    <a
                      href={selectedUser.kycDetails.backImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Full Image
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm">Not uploaded</p>
                  )}
                </div>

                <div>
                  <div className="font-medium">Selfie With Document</div>
                  {selectedUser.kycDetails?.selfieImage ? (
                    <a
                      href={selectedUser.kycDetails.selfieImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Full Image
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm">Not uploaded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t pt-4">
              <textarea
                placeholder="Add a comment..."
                className="flex-1 border rounded-lg p-2 resize-none"
                rows={2}
              ></textarea>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycUsersTable;
