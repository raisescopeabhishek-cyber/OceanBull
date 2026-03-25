import { useEffect, useState } from "react";
import { Ban, CheckCircle, Eye, Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import useAdminCopyRequest from "../../../hooks/admin/UseAdminCopyRequests";

// ✨ ambient visuals (shared theme)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

const AdminCopyRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  // separate modals
  const [isAccountsOpen, setIsAccountsOpen] = useState(false); // shows requested accounts (replaces inline chips)
  const [isDecisionOpen, setIsDecisionOpen] = useState(false); // approve / reject

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionRowId, setActionRowId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const { data, pagination, refresh } = useAdminCopyRequest({
    page: currentPage,
    limit: 10,
    status: "Pending",
  });

  // --- helpers to reliably close the modals (fixes close button) ---
  const closeAccounts = () => {
    setIsAccountsOpen(false);
    setSelectedRequest(null);
  };
  const closeDecision = () => {
    if (isActionLoading) return; // prevent closing while processing
    setIsDecisionOpen(false);
    setActionRowId(null);
    // keep selectedRequest so summary remains if reopened; clear if you prefer:
    // setSelectedRequest(null);
  };

  // ensure overlay click / ESC also closes correctly in controlled mode
  const handleAccountsOpenChange = (open: boolean) => {
    if (open) setIsAccountsOpen(true);
    else closeAccounts();
  };
  const handleDecisionOpenChange = (open: boolean) => {
    if (open) setIsDecisionOpen(true);
    else closeDecision();
  };

  // pagination -------------------
  const totalPages = Math.max(1, Number(pagination?.totalPages) || 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  // handlers ---------------------
  const openAccounts = (item) => {
    setSelectedRequest(item);
    setIsAccountsOpen(true);
  };

  const openDecision = (item) => {
    setSelectedRequest(item);
    setActionRowId(item?._id || null);
    setIsDecisionOpen(true);
  };

  const handleConfirmAction = async (request, action) => {
    if (!request || isActionLoading) return;

    const toastId = toast.loading("Please wait..");
    setIsActionLoading(true);

    try {
      await adminApi.put(`/update-copy-request/${request?._id}`, {
        status: action, // use the function arg directly (avoid stale state)
      });

      toast.success(`Request ${action}`, { id: toastId });
      refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(`${error?.response?.data?.message || "Something went wrong"}`, {
        id: toastId,
      });
    } finally {
      setIsActionLoading(false);
      setActionRowId(null);
      setIsDecisionOpen(false);
    }
  };

  // effects ----------------------
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* ambient theme */}
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky top controls */}
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 backdrop-blur-md bg-gradient-to-b from-gray-900/80 to-transparent border-b border-slate-700/40">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow">
              Copy Trading Requests
            </h1>
            <div className="text-xs sm:text-sm text-slate-400">
              Total records:{" "}
              <span className="text-slate-200">{pagination?.totalItems || 0}</span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="mt-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto relative">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="w-full min-w-[880px] whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-800/60 backdrop-blur border-b border-slate-700/60">
                    <th className="py-3 px-4 text-left text-slate-200 font-medium">User | Email</th>
                    <th className="py-3 px-4 text-left text-slate-200 font-medium">Accounts Requested</th>
                    <th className="py-3 px-4 text-left text-slate-200 font-medium">Role</th>
                    <th className="py-3 px-4 text-left text-slate-200 font-medium">Timestamp</th>
                    <th className="py-3 px-4 text-left text-slate-200 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="text-slate-100">
                  {!data ? (
                    <tr>
                      <td colSpan={8} className="py-10">
                        <div className="flex justify-center items-center gap-3 text-slate-300">
                          <span>Loading...</span>
                          <Loader className="animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : data?.length ? (
                    data.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-700/50 bg-slate-900/20 hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-100">
                            {item?.user?.firstName ? item?.user?.firstName : "Not found!!"}{" "}
                            {item?.user?.lastName || ""}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {item?.user?.email ? item?.user?.email : "Not found!!"}
                          </div>
                        </td>

                        {/* 🔁 Replaced chips with a button that opens a modal */}
                        <td className="py-3 px-4">
                          <button
                            aria-label="View requested accounts"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-600/50 text-slate-200 hover:bg-slate-800/60 transition-all"
                            onClick={() => {
                              setSelectedRequest(item);
                              setIsAccountsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View Accounts
                          </button>
                        </td>

                        <td className="py-3 px-4 uppercase">
                          <div className="text-slate-200 text-sm">{item?.role}</div>
                        </td>

                        <td className="py-3 whitespace-nowrap px-4">
                          <div className="text-slate-200">{CFformatDate(item?.updatedAt)}</div>
                          <div className="text-xs text-slate-400">
                            {CFcalculateTimeSinceJoined(item?.updatedAt)}
                          </div>
                        </td>

                        <td className="py-2 px-4">
                          {isActionLoading && actionRowId === item._id ? (
                            <span className="text-slate-400">Please wait…</span>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                aria-label="Review request (approve/reject)"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/10 transition-all"
                                onClick={() => {
                                  setSelectedRequest(item);
                                  setActionRowId(item?._id || null);
                                  setIsDecisionOpen(true);
                                }}
                              >
                                Review
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <div className="text-center text-slate-400">No copy trading requests found.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* footer hint */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-700/50 bg-slate-900/30">
            <div className="text-xs sm:text-sm text-slate-400">
              Total records: <span className="text-slate-200">{pagination?.totalItems || 0}</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              Page <span className="text-slate-200">{currentPage}</span> of{" "}
              <span className="text-slate-200">{totalPages}</span>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-5 py-2 rounded-xl transition-all border ${
              currentPage === 1
                ? "bg-slate-800/40 text-slate-500 border-slate-700/60 cursor-not-allowed"
                : "bg-slate-900/60 text-slate-100 border-slate-700/60 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]"
            }`}
          >
            ← Previous
          </button>

          <span className="text-slate-300 text-sm">
            Page <span className="font-semibold text-slate-100">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-100">{totalPages}</span>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-5 py-2 rounded-xl transition-all border ${
              currentPage === totalPages
                ? "bg-slate-800/40 text-slate-500 border-slate-700/60 cursor-not-allowed"
                : "bg-slate-900/60 text-slate-100 border-slate-700/60 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(147,51,234,0.25)]"
            }`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ======================= Modal: Requested Accounts (separate) ======================= */}
      <AlertDialog open={isAccountsOpen} onOpenChange={handleAccountsOpenChange}>
        <AlertDialogContent className="max-w-xl bg-slate-950/90 text-slate-100 border border-slate-700/60 rounded-2xl backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Requested Accounts
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-slate-300">
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <p className="text-lg font-semibold text-slate-100 mb-1">User</p>
                  <p>
                    <span className="text-slate-400">Full name:</span>{" "}
                    <span className="font-semibold text-slate-200">
                      {selectedRequest?.user?.firstName
                        ? `${selectedRequest?.user?.firstName} ${selectedRequest?.user?.lastName || ""}`
                        : "Not found!!"}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">Email:</span>{" "}
                    <span className="font-semibold text-slate-200">
                      {selectedRequest?.user?.email || "Not found!!"}
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <p className="text-lg font-semibold text-slate-100 mb-2">Accounts</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest?.accounts?.length ? (
                      selectedRequest.accounts.map((value) => (
                        <span
                          key={value}
                          className="px-2 py-1 rounded-full text-xs bg-slate-800/60 text-slate-200 border border-slate-600/60"
                        >
                          {value}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">No accounts found.</span>
                    )}
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    <div>Updated: <span className="text-slate-200">{CFformatDate(selectedRequest?.updatedAt)}</span></div>
                    <div>{CFcalculateTimeSinceJoined(selectedRequest?.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeAccounts}
              className="px-4 py-2 rounded-xl border border-slate-700/60 text-slate-200 hover:bg-slate-800/60 transition-all"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ======================= Modal: Approve / Reject ======================= */}
      <AlertDialog open={isDecisionOpen} onOpenChange={handleDecisionOpenChange}>
        <AlertDialogContent className="max-w-xl bg-slate-950/90 text-slate-100 border border-slate-700/60 rounded-2xl backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Review Request
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-slate-300">
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <p className="text-lg font-semibold text-slate-100 mb-1">Request Summary</p>
                  <p><span className="text-slate-400">User:</span> {selectedRequest?.user?.firstName} {selectedRequest?.user?.lastName}</p>
                  <p><span className="text-slate-400">Email:</span> {selectedRequest?.user?.email}</p>
                  <p><span className="text-slate-400">Role:</span> <span className="uppercase">{selectedRequest?.role}</span></p>
                  <p className="mt-2"><span className="text-slate-400">Requested Accounts:</span></p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRequest?.accounts?.map((value) => (
                      <span
                        key={value}
                        className="px-2 py-1 rounded-full text-xs bg-slate-800/60 text-slate-200 border border-slate-600/60"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm">
                  Choose an action below to update this request.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-between">
            <AlertDialogCancel
              onClick={closeDecision}
              className="px-4 py-2 rounded-xl border border-slate-700/60 text-slate-200 hover:bg-slate-800/60 transition-all"
            >
              Close
            </AlertDialogCancel>

            <div className="flex gap-3">
              <button
                aria-label="Approve request"
                disabled={isActionLoading}
                onClick={() => selectedRequest && handleConfirmAction(selectedRequest, "Approved")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>

              <button
                aria-label="Reject request"
                disabled={isActionLoading}
                onClick={() => selectedRequest && handleConfirmAction(selectedRequest, "Rejected")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all disabled:opacity-60"
              >
                <Ban className="w-4 h-4" /> Reject
              </button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCopyRequests;
