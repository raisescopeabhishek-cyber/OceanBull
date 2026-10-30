import useUserCopyRequest from "../../hooks/user/UseUserCopyRequest";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, Ban } from "lucide-react";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../utils/CustomFunctions";
import ModernHeading from "../lib/ModernHeading";
import DynamicLoder from "../Loader/DynamicLoder";

export default function UserCopyRequestHistory() {
  const { data, isLoading, isError, refresh } = useUserCopyRequest();

  return (
    <div className="w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <ModernHeading text="Request History" />
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-field text-primary hover:text-primary transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="mt-6 text-danger p-3 rounded mb-4 flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Failed to load requests history. Please try again.
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <DynamicLoder></DynamicLoder>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !isError && (
          <div className="mt-4 overflow-x-auto">
            {data?.length === 0 ? (
              <p className="text-subtle flex items-center justify-center gap-2 text-center py-4">
                <Ban></Ban>
                No requests found.
              </p>
            ) : (
              <table className="w-full text-left text-muted table-stack">
                <thead>
                  <tr className="border-b border-line">
                    <th className="py-3 px-4 text-sm font-medium">Timestamp</th>
                    <th className="py-3 px-4 text-sm font-medium">Role</th>
                    <th className="py-3 px-4 text-sm font-medium">Accounts</th>
                    <th className="py-3 px-4 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-line"
                    >
                      <td data-label="Timestamp" className="py-3 whitespace-nowrap px-4">
                        <div>{CFformatDate(request?.createdAt)}</div>
                        <div className="text-sm text-subtle">
                          {CFcalculateTimeSinceJoined(request?.createdAt)}
                        </div>
                      </td>{" "}
                      <td data-label="Role" className="py-3 px-4 uppercase">{request.role}</td>
                      <td data-label="Accounts" className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {request.accounts.map((account, index) => (
                            <span
                              key={index}
                              className="bg-secondary-500-10 px-2 py-1 rounded-full text-secondary-500 text-xs"
                            >
                              {account}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td data-label="Status" className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            request.status === "Approved"
                              ? "bg-success-soft text-success"
                              : request.status === "Pending"
                              ? "bg-warning-soft text-warning"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
