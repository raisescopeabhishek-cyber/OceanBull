import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

export default function IBWithdrawals() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status") || "";
  const page = parseInt(queryParams.get("page") || "1");
  const limit = parseInt(queryParams.get("limit") || "10");
  const search = queryParams.get("search") || "";

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_password_ref");

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/referral-withdrawals`,
        {
          params: { page, limit, search, status },
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": import.meta.env.VITE_API_KEY
          }
        }
      );

      setData(res.data.data || []);
      setPagination(res.data.pagination || { totalPages: 1, currentPage: 1 });
    } catch (err) {
      console.error("❌ Failed to fetch withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, status]);

  const handlePageChange = (newPage) => {
    queryParams.set("page", newPage);
    navigate(`/referral-withdrawals?${queryParams.toString()}`);
  };

  const handleSearchChange = (value) => {
    queryParams.set("search", value);
    queryParams.set("page", 1);
    navigate(`/referral-withdrawals?${queryParams.toString()}`);
  };

  return (
    <div className="rounded-card p-6 text-text">
      <h2 className="text-lg font-semibold mb-4">
        IB Withdrawals — {status || "All"}
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-field w-full focus:outline-none focus:ring focus:ring-line text-text"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted">Loading withdrawals...</p>
      ) : data.length === 0 ? (
        <p className="text-muted">No withdrawals found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-line table-stack">
            <thead>
              <tr className="bg-surface">
                <th className="p-3 text-left border border-line">MT5 AC</th>
                <th className="p-3 text-left border border-line">Status</th>
                <th className="p-3 text-left border border-line">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-surface transition duration-200"
                >
                  <td data-label="MT5 AC" className="p-3 border border-line">
                    {item.mt5Account}
                  </td>
                  <td data-label="Status" className="p-3 border border-line">{item.status}</td>
                  <td data-label="Amount" className="p-3 border border-line">
                    ${item.deposit}
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
          onClick={() => handlePageChange(page - 1)}
          className="px-3 py-1 bg-surface-3 text-text rounded disabled:bg-surface-3"
        >
          Prev
        </button>
        <span className="text-sm text-muted">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => handlePageChange(page + 1)}
          className="px-3 py-1 bg-surface-3 text-text rounded disabled:bg-surface-3"
        >
          Next
        </button>
      </div>
    </div>
  );
}
