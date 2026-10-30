import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import useAdminCopyRequest from "../../../hooks/admin/UseAdminCopyRequests";
import {
  Badge,
  BlotterPage,
  Button,
  EmptyState,
  Modal,
  Well,
} from "@/Components/ui";

/**
 * Copy-trading requests awaiting a decision.
 *
 * A blotter with one modal. The previous version had two — one to list the
 * requested accounts and one to decide — which meant the accounts were not
 * visible at the moment of deciding. They are now the body of the decision
 * modal, so approve and reject sit under the thing being approved.
 */

const AdminCopyRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionRowId, setActionRowId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const { data, pagination, refresh } = useAdminCopyRequest({
    page: currentPage,
    limit: 10,
    status: "Pending",
  });

  const closeDecision = () => {
    if (isActionLoading) return; // never close mid-request
    setIsDecisionOpen(false);
    setActionRowId(null);
  };

  const totalPages = Math.max(1, Number(pagination?.totalPages) || 1);

  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage((prev) => prev + 1);

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const openDecision = (item: any) => {
    setSelectedRequest(item);
    setActionRowId(item?._id || null);
    setIsDecisionOpen(true);
  };

  const handleConfirmAction = async (request: any, action: string) => {
    if (!request || isActionLoading) return;

    const toastId = toast.loading("Please wait..");
    setIsActionLoading(true);

    try {
      await adminApi.put(`/update-copy-request/${request?._id}`, {
        status: action,
      });

      toast.success(`Request ${action}`, { id: toastId });
      refresh();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(
        `${error?.response?.data?.message || "Something went wrong"}`,
        { id: toastId }
      );
    } finally {
      setIsActionLoading(false);
      setActionRowId(null);
      setIsDecisionOpen(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const rows = Array.isArray(data) ? data : [];

  const fullName = (item: any) =>
    [item?.user?.firstName, item?.user?.lastName].filter(Boolean).join(" ") ||
    "Not found";

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {fullName(item)}
          </div>
          <div className="numeric mt-0.5 truncate text-xs text-subtle">
            {item?.user?.email || "Not found"}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      secondary: true,
      cell: (item: any) => (
        <Badge tone="primary" dot={false}>
          {String(item?.role || "—").toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "accounts",
      header: "Accounts requested",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (item: any) => (
        <span className="font-semibold">{item?.accounts?.length ?? 0}</span>
      ),
    },
    {
      key: "updatedAt",
      header: "Requested",
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="numeric truncate text-xs text-text">
            {CFformatDate(item?.updatedAt)}
          </div>
          <div className="truncate text-[11px] text-subtle">
            {CFcalculateTimeSinceJoined(item?.updatedAt)}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (item: any) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="soft"
            onClick={(e: any) => {
              e.stopPropagation();
              openDecision(item);
            }}
            loading={isActionLoading && actionRowId === item._id}
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <BlotterPage
        breadcrumb="Copy trading / Requests"
        title="Copy-trading requests"
        description="Pending requests to link an account as a master or copier."
        actions={
          <Button variant="secondary" onClick={() => refresh()}>
            Refresh
          </Button>
        }
        readouts={[
          {
            key: "pending",
            label: "Pending requests",
            value: Number(pagination?.total ?? rows.length).toLocaleString(
              "en-US"
            ),
            helper: `${totalPages} pages`,
            tone: rows.length ? "warn" : "ok",
          },
          {
            key: "accounts",
            label: "Accounts on this page",
            value: rows.reduce(
              (sum: number, item: any) => sum + (item?.accounts?.length || 0),
              0
            ),
          },
          {
            key: "masters",
            label: "Master requests here",
            value: rows.filter(
              (item: any) => String(item?.role).toLowerCase() === "master"
            ).length,
          },
        ]}
        columns={columns}
        rows={rows}
        onRowClick={openDecision}
        rowEdge={() => "warning"}
        empty={
          <EmptyState
            title="No copy-trading requests"
            description="Nothing is waiting on a decision."
          />
        }
        footer={
          <>
            <span className="numeric text-xs text-subtle">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </>
        }
      />

      <Modal
        open={isDecisionOpen}
        onClose={closeDecision}
        title="Review copy request"
        size="md"
      >
        {selectedRequest ? (
          <div className="space-y-3">
            <Well>
              <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5">
                <span className="lbl">User</span>
                <span className="min-w-0 truncate text-xs text-text">
                  {fullName(selectedRequest)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5">
                <span className="lbl">Email</span>
                <span className="numeric min-w-0 truncate text-xs text-text">
                  {selectedRequest?.user?.email || "—"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5">
                <span className="lbl">Role</span>
                <span className="text-xs text-text">
                  {String(selectedRequest?.role || "—").toUpperCase()}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-1.5">
                <span className="lbl">Requested</span>
                <span className="numeric text-xs text-text">
                  {CFformatDate(selectedRequest?.updatedAt)}
                </span>
              </div>
            </Well>

            {/* The accounts are here, not in a second modal: the decision is
                about them, so they belong beside the buttons. */}
            <div>
              <span className="lbl">
                Requested accounts ({selectedRequest?.accounts?.length ?? 0})
              </span>

              {selectedRequest?.accounts?.length ? (
                <div className="mt-1.5 flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
                  {selectedRequest.accounts.map((account: any, i: number) => (
                    <Badge key={`${account}-${i}`} tone="neutral" dot={false}>
                      {typeof account === "object"
                        ? account?.mt5Account || account?.login || "—"
                        : account}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-subtle">
                  No accounts listed on this request.
                </p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="success"
                className="w-full"
                onClick={() => handleConfirmAction(selectedRequest, "Approved")}
                disabled={isActionLoading}
                loading={isActionLoading}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handleConfirmAction(selectedRequest, "Rejected")}
                disabled={isActionLoading}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default AdminCopyRequests;
