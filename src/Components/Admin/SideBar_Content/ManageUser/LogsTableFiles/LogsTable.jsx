import React, { useEffect, useState } from "react";
import { adminApi } from "../../../../../../src/utils/apiClients.js"; // adjust relative path
import { Mail, Search } from "lucide-react";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // If you DID NOT add x-api-key globally in adminApi, keep this cfg:
      const cfg = { headers: { "x-api-key": API_KEY } };

      // If your working endpoint is /api/auth/logs and adminApi baseURL is `${BASE}/api`
      const res = await adminApi.get("/logs", cfg);

      setLogs(res?.data?.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!log?.userId) return false;
    const fields = [
      log?.userId?.firstName,
      log?.userId?.lastName,
      log?.userId?.email,
      log?.userId?.phone,
      log?.ip,
      log?.browser,
      log?.os,
      log?.country,
    ];
    return fields.some((field) =>
      field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="rounded-card p-6 text-text">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-lg font-semibold">📜 User Login Logs</h2>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-subtle" size={18} />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 rounded-field bg-surface border border-line text-sm text-text placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-subtle text-sm">Loading logs...</p>
      ) : filteredLogs.length === 0 ? (
        <p className="text-subtle text-sm">No matching logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-line text-sm table-stack">
            <thead>
              <tr className="bg-surface">
                <th className="p-3 text-left border border-line">Name</th>
                <th className="p-3 text-left border border-line">Email</th>
                <th className="p-3 text-left border border-line">Phone</th>
                <th className="p-3 text-left border border-line">IP</th>
                <th className="p-3 text-left border border-line">Browser</th>
                <th className="p-3 text-left border border-line">OS</th>
                <th className="p-3 text-left border border-line">Country</th>
                <th className="p-3 text-left border border-line">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-surface transition duration-200"
                >
                  <td data-label="Name" className="p-3 border border-line">
                    {log?.userId?.firstName} {log?.userId?.lastName}
                  </td>
                  <td data-label="Email" className="p-3 border border-line">
                    <div className="flex items-center gap-2">
                      <Mail size={16} /> {log?.userId?.email}
                    </div>
                  </td>
                  <td data-label="Phone" className="p-3 border border-line">
                    {log?.userId?.phone}
                  </td>
                  <td data-label="IP" className="p-3 border border-line">{log?.ip}</td>
                  <td data-label="Browser" className="p-3 border border-line">{log?.browser}</td>
                  <td data-label="OS" className="p-3 border border-line">{log?.os}</td>
                  <td data-label="Country" className="p-3 border border-line">{log?.country}</td>
                  <td data-label="Date" className="p-3 border border-line">
                    {log?.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogsTable;
