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
    <div className=" w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <ModernHeading text="Request History" />
          <button
            onClick={refresh}
            className="flex items-center gap-2  px-4 py-2 rounded-md text-blue-400 hover:text-blue-400/80 transition-colors disabled:opacity-50"
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
          <div className=" mt-6 text-red-500 p-3 rounded mb-4 flex items-center justify-center gap-2">
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
              <p className="text-gray-400/60 flex items-center justify-center gap-2 text-center py-4">
                <Ban></Ban>
                No requests found.
              </p>
            ) : (
              <table className="w-full text-left text-gray-200">
                <thead>
                  <tr className="border-b border-gray-700">
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
                      className="border-b border-gray-700/60"
                    >
                      <td className="py-3 whitespace-nowrap px-4">
                        <div>{CFformatDate(request?.createdAt)}</div>
                        <div className="text-sm text-gray-400">
                          {CFcalculateTimeSinceJoined(request?.createdAt)}
                        </div>
                      </td>{" "}
                      <td className="py-3 px-4 uppercase">{request.role}</td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            request.status === "Approved"
                              ? "bg-green-500/20 text-green-500"
                              : request.status === "Pending"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-red-500/20 text-red-500"
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
