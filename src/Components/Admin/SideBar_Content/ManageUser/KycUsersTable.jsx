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
      <span className={`${base} bg-success-soft text-success`}>
        <CheckCircle size={14} /> Yes
      </span>
    ) : (
      <span className={`${base} bg-danger-soft text-danger`}>
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
    <div className="rounded-card p-6 text-text">
      <h2 className="text-lg font-semibold mb-4">📝 KYC Submitted Users</h2>

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
            className="pl-9 pr-4 py-2 rounded-field w-full bg-surface text-text placeholder:text-subtle focus:outline-none focus:ring focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-subtle text-sm">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-subtle text-sm">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-line table-stack">
            <thead>
              <tr className="bg-surface">
                <th className="p-3 text-left border border-line">User</th>
                <th className="p-3 text-left border border-line">
                  Email
                </th>
                <th className="p-3 text-left border border-line">
                  Total AC
                </th>
                <th className="p-3 text-left border border-line">
                  Email Verified
                </th>
                <th className="p-3 text-left border border-line">
                  Country
                </th>
                <th className="p-3 text-left border border-line">
                  Updated At
                </th>
                <th className="p-3 text-left border border-line">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-surface transition duration-200"
                >
                  <td data-label="User" className="p-3 border border-line">
                    {u.firstName} {u.lastName}
                  </td>
                  <td data-label="Email" className="p-3 border border-line">{u.email}</td>
                  <td data-label="Total AC" className="p-3 border border-line">
                    {u.accounts?.length || 0}
                  </td>
                  <td data-label="Email Verified" className="p-3 border border-line">
                    {emailVerifiedBadge(u.emailVerified)}
                  </td>
                  <td data-label="Country" className="p-3 border border-line">
                    {u.country || "N/A"}
                  </td>
                  <td data-label="Updated At" className="p-3 border border-line">
                    {u.updatedAt
                      ? new Date(u.updatedAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td data-label="Action" className="p-3 border border-line">
                    <button
                      onClick={() => handleViewClick(u)}
                      className="bg-primary hover:bg-primary-soft px-3 py-1 rounded text-xs"
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

      {/* Modal with KYC Review Card */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-surface bg-opacity-50 flex justify-center items-center z-50 overflow-auto p-4">
          <div className="bg-surface rounded-field max-w-3xl w-full relative p-6">
            {/* Header */}
            <h3 className="text-lg font-bold mb-4">
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
                      className="text-primary hover:underline"
                    >
                      View Full Image
                    </a>
                  ) : (
                    <p className="text-subtle text-sm">Not uploaded</p>
                  )}
                </div>

                <div>
                  <div className="font-medium">Back Side of Document</div>
                  {selectedUser.kycDetails?.backImage ? (
                    <a
                      href={selectedUser.kycDetails.backImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Full Image
                    </a>
                  ) : (
                    <p className="text-subtle text-sm">Not uploaded</p>
                  )}
                </div>

                <div>
                  <div className="font-medium">Selfie With Document</div>
                  {selectedUser.kycDetails?.selfieImage ? (
                    <a
                      href={selectedUser.kycDetails.selfieImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Full Image
                    </a>
                  ) : (
                    <p className="text-subtle text-sm">Not uploaded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t pt-4">
              <textarea
                placeholder="Add a comment..."
                className="flex-1 border rounded-field p-2 resize-none"
                rows={2}
              ></textarea>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-surface-3 hover:bg-surface-3 rounded-field"
              >
                Close
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-success text-text hover:bg-success rounded-field"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-danger text-text hover:bg-danger rounded-field"
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
