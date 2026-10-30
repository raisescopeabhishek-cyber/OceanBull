import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeft,
  ArrowLeftRight,
  CircleCheckBig,
  CircleX,
  LoaderIcon,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  WalletCardsIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import { BlotterPage, Button, EmptyState } from "@/Components/ui";

const PAGE_LIMIT = 10;

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

/* -------------------------------------------------------------------------- */
/* Local independent AlertDialog components for WithdrawalStatus only          */
/* -------------------------------------------------------------------------- */

const AlertDialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        onClose={() => onOpenChange(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {children}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const AlertDialogContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-200"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-150"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Dialog.Panel
        className={cn(
          "w-full overflow-hidden text-left align-middle transition-all",
          className
        )}
      >
        {children}
      </Dialog.Panel>
    </Transition.Child>
  );
};

const AlertDialogHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={className || "mb-4"}>{children}</div>;
};

const AlertDialogTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Dialog.Title className={cn("font-bold", className || "text-2xl")}>
      {children}
    </Dialog.Title>
  );
};

const AlertDialogDescription = ({
  children,
  className = "",
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) => {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;

    return React.cloneElement(child, {
      className: cn(child.props?.className, className),
    });
  }

  return <div className={cn("text-sm", className)}>{children}</div>;
};

const AlertDialogFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={
        className || "mt-5 flex flex-wrap items-center justify-end gap-3"
      }
    >
      {children}
    </div>
  );
};

const AlertDialogCancel = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-card px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const AlertDialogAction = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-card px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const WithdrawalStatus = () => {
  const [withdrawalData, setWithdrawalData] = useState<any[]>([]);
  const [allWithdrawalData, setAllWithdrawalData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"" | "approve" | "reject">("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [comment, setComment] = useState("");

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((Number(pagination?.totalWithdrawals) || 0) / PAGE_LIMIT)
  );

  const updateFilter = (key: string, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters({
      search: "",
      status: "all",
    });
    setDebouncedSearch("");
  };

  const fetchWithdrawalData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PAGE_LIMIT.toString(),
        search: debouncedSearch,
      });

      if (filters.status === "approved") {
        params.append("status", "approved");
      } else if (filters.status === "pending") {
        params.append("status", "pending");
      } else if (filters.status === "rejected") {
        params.append("status", "rejected");
      } else {
        params.append("status", "");
      }

      const res = await adminApi.get(`/withdrawals?${params.toString()}`);
      const finalRes = res?.data;

      setWithdrawalData(finalRes?.data || []);
      setPagination(finalRes?.pagination || {});
    } catch (error) {
      console.log("Error fetching withdrawals:", error);
      toast.error("Something went wrong while fetching withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setAllLoading(true);
    try {
      const res = await adminApi.get(`/withdrawals`);
      setAllWithdrawalData(res?.data?.data || []);
    } catch (error) {
      console.log("Error fetching all withdrawals:", error);
    } finally {
      setAllLoading(false);
    }
  };

  const handleActionClick = (
    withdrawal: any,
    action: "approve" | "reject"
  ) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setComment("");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async (withdrawal: any) => {
    if (isActionLoading || !withdrawal) return;

    if (actionType === "reject" && !comment.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    const finalComment =
      actionType === "approve"
        ? comment.trim() || "Approved by admin"
        : comment.trim();

    const toastId = toast.loading("Please wait...");
    setIsActionLoading(true);

    try {
      await adminApi.put("/update-withdrawal", {
        _id: withdrawal._id,
        status: actionType,
        mt5Account: withdrawal.mt5Account,
        amount: withdrawal.amount,
        email: withdrawal?.userData?.email,
        withdrawalData: withdrawal,
        comment: finalComment,
      });

      toast.success(
        actionType === "approve"
          ? "Withdrawal Approved"
          : "Withdrawal Rejected",
        { id: toastId }
      );

      setIsDialogOpen(false);
      setComment("");
      await fetchWithdrawalData();
      await fetchAllData();
    } catch (error) {
      console.log("Withdrawal action error:", error);
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev: number) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev: number) => prev + 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchWithdrawalData();
  }, [currentPage, debouncedSearch, filters.status]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const totalWithdrawalsAmount = allWithdrawalData
    .reduce((total, item) => total + Number(item.amount || 0), 0)
    .toFixed(2);

  const totalPendingWithdrawals = allWithdrawalData
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + Number(item.amount || 0), 0)
    .toFixed(2);

  const totalApprovedWithdrawals = allWithdrawalData
    .filter((item) => item.status === "approved")
    .reduce((total, item) => total + Number(item.amount || 0), 0)
    .toFixed(2);

  const totalRejectedWithdrawals = allWithdrawalData
    .filter((item) => item.status === "rejected")
    .reduce((total, item) => total + Number(item.amount || 0), 0)
    .toFixed(2);

  const getStatusBadge = (value: string) => {
    if (value === "approved") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium","bg-success-soft text-success",
          ].join(" ")}
        >
          <CircleCheckBig size={16} />
          Approved
        </span>
      );
    }

    if (value === "rejected") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium","bg-danger-soft text-danger",
          ].join(" ")}
        >
          <CircleX size={16} />
          Rejected
        </span>
      );
    }

    return (
      <span
        className={[
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium","bg-warning-soft text-warning",
        ].join(" ")}
      >
        <ArrowLeftRight size={16} />
        Pending
      </span>
    );
  };

  const getDecisionDate = (item: any) => {
    if (item?.status === "approved" || item?.status === "rejected") {
      return item?.updatedAt || item?.createdAt;
    }

    return item?.createdAt || item?.updatedAt;
  };

  const renderPaymentInfo = (withdrawal: any) => {
    if (!withdrawal) return <div>—</div>;

    if (withdrawal.method === "Bank Transfer") {
      return (
        <div className="space-y-1">
          <div className="mb-2 flex items-center gap-2">
            <WalletCardsIcon size={18} />
            <span className="font-semibold">{withdrawal?.method}</span>
          </div>

          <p>
            <span className="font-medium">Bank Name:</span>{" "}
            {withdrawal?.userData?.bankDetails?.bankName || "—"}
          </p>
          <p>
            <span className="font-medium">Holder Name:</span>{" "}
            {withdrawal?.userData?.bankDetails?.holderName || "—"}
          </p>
          <p>
            <span className="font-medium">Account Number:</span>{" "}
            {withdrawal?.userData?.bankDetails?.accountNumber || "—"}
          </p>
          <p>
            <span className="font-medium">IFSC Code:</span>{" "}
            {withdrawal?.userData?.bankDetails?.ifscCode || "—"}
          </p>
          <p>
            <span className="font-medium">Swift Code:</span>{" "}
            {withdrawal?.userData?.bankDetails?.swiftCode || "—"}
          </p>
          <p>
            <span className="font-medium">UPI ID:</span>{" "}
            {withdrawal?.userData?.bankDetails?.upiId || "—"}
          </p>
        </div>
      );
    }

    if (withdrawal?.method === "USDT(Trc20)") {
      return (
        <div className="flex items-start gap-2 break-all">
          <WalletCardsIcon size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-medium">USDT-TRC20:</span>{" "}
            {withdrawal?.userData?.walletDetails?.tetherAddress || "—"}
          </p>
        </div>
      );
    }

    if (withdrawal?.method === "USDT(Bep20)") {
      return (
        <div className="flex items-start gap-2 break-all">
          <WalletCardsIcon size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-medium">USDT-BEP20:</span>{" "}
            {withdrawal?.userData?.walletDetails?.ethAddress || "—"}
          </p>
        </div>
      );
    }

    if (withdrawal?.method === "BinanceID") {
      return (
        <div className="flex items-start gap-2 break-all">
          <WalletCardsIcon size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-medium">Binance ID:</span>{" "}
            {withdrawal?.userData?.walletDetails?.accountNumber || "—"}
          </p>
        </div>
      );
    }

    if (withdrawal?.method === "BTCAddress") {
      return (
        <div className="flex items-start gap-2 break-all">
          <WalletCardsIcon size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-medium">BTC Address:</span>{" "}
            {withdrawal?.userData?.walletDetails?.trxAddress || "—"}
          </p>
        </div>
      );
    }

    return <div>—</div>;
  };

  /* ---- columns -------------------------------------------------------
     One definition drives the desktop table and the phone rows. `primary`
     and `secondary` head each phone row, `trailing` is its right-hand
     figure, and the rest become labelled detail lines.
     ------------------------------------------------------------------ */
  const money = (v: any) =>
    "$" +
    Number(v || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const when = (v: any) => {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {item?.userId?.name || item?.name || "—"}
          </div>
          <div className="numeric mt-0.5 truncate text-xs text-subtle">
            {item?.userId?.email || item?.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "mt5Account",
      header: "MT5 account",
      secondary: true,
      numeric: true,
      cell: (item: any) => item?.mt5Account || "—",
    },
    {
      key: "accountType",
      header: "Account type",
      cell: (item: any) => (
        <span className="text-muted">
          {item?.accountType || item?.groupName || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (item: any) => (
        <span className="font-semibold">{money(item?.amount)}</span>
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (item: any) => item?.method || "—",
    },
    {
      key: "lastBalance",
      header: "Balance after",
      align: "right",
      numeric: true,
      cell: (item: any) =>
        item?.lastBalance ? (
          money(item.lastBalance)
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "Requested",
      cell: (item: any) => (
        <span className="text-subtle">{when(item?.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: any) => getStatusBadge(item?.status),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (item: any) =>
        String(item?.status).toLowerCase() === "pending" ? (
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="success-soft"
              onClick={(e: any) => {
                e.stopPropagation();
                handleActionClick(item, "approve");
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger-soft"
              onClick={(e: any) => {
                e.stopPropagation();
                handleActionClick(item, "reject");
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
  ];

  const pendingCount = allWithdrawalData.filter(
    (i: any) => i?.status === "pending"
  ).length;

  const totalRecords =
    pagination?.totalWithdrawals || pagination?.totalRecords || 0;

  return (
    <>
      <BlotterPage
        breadcrumb="Clients / Withdrawals"
        title="Withdrawals"
        description="Review and clear client payout requests."
        actions={
          <Button variant="secondary" onClick={() => fetchWithdrawalData()}>
            Refresh
          </Button>
        }
        readouts={[
          {
            key: "pending",
            label: "Pending value",
            value: money(totalPendingWithdrawals),
            delta: pendingCount + " requests",
            trend: pendingCount ? "down" : "flat",
            tone: "warn",
          },
          {
            key: "approved",
            label: "Approved value",
            value: money(totalApprovedWithdrawals),
            tone: "ok",
          },
          {
            key: "rejected",
            label: "Rejected value",
            value: money(totalRejectedWithdrawals),
            tone: "bad",
          },
          {
            key: "total",
            label: "All withdrawals",
            value: money(totalWithdrawalsAmount),
            helper: allWithdrawalData.length + " records",
            tone: "brand",
          },
        ]}
        filter={{
          search: filters.search,
          onSearchChange: (v: string) => updateFilter("search", v),
          searchPlaceholder: "name, email, MT5 account",
          activeChip: filters.status,
          onChipChange: (key: string) => updateFilter("status", key),
          chips: [
            { key: "all", label: "All", tone: "primary" },
            {
              key: "pending",
              label: "Pending",
              tone: "warning",
              count: pendingCount,
            },
            { key: "approved", label: "Approved", tone: "success" },
            { key: "rejected", label: "Rejected", tone: "danger" },
          ],
          summary: totalRecords + " records",
        }}
        columns={columns}
        rows={withdrawalData}
        loading={loading}
        rowEdge={(item: any) =>
          String(item?.status).toLowerCase() === "pending" ? "warning" : null
        }
        empty={
          <EmptyState
            title="No withdrawals found"
            description="Try a different search or filter."
            action={
              <Button variant="soft" onClick={resetFilters}>
                Reset filters
              </Button>
            }
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
                disabled={currentPage <= 1 || loading}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </>
        }
      />
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isActionLoading) setIsDialogOpen(open);
        }}
      >
        <AlertDialogContent
          className={[
            "max-w-xl rounded-card border p-5 backdrop-blur-xl sm:p-6","border-line bg-surface text-text",
          ].join(" ")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              {actionType === "approve"
                ? "Approve Withdrawal"
                : "Reject Withdrawal"}
            </AlertDialogTitle>

            <AlertDialogDescription
              className={"mt-1 text-subtle"}
            >
              {actionType === "approve"
                ? "Comment is optional for approval."
                : "Please enter a rejection reason before continuing."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div
                className={[
                  "rounded-card border p-4","border-line bg-surface-2",
                ].join(" ")}
              >
                <p
                  className={[
                    "mb-2 text-base font-semibold","text-text",
                  ].join(" ")}
                >
                  User Info
                </p>

                <div
                  className={[
                    "space-y-1 text-sm","text-muted",
                  ].join(" ")}
                >
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedWithdrawal.userData?.firstName || "Not found"}{" "}
                    {selectedWithdrawal.userData?.lastName || ""}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedWithdrawal.userData?.email || "Not found"}
                  </p>
                  <p>
                    <span className="font-medium">Withdrawal Amount:</span> $
                    {Number(selectedWithdrawal?.amount || 0).toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Account:</span>{" "}
                    {selectedWithdrawal?.mt5Account || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {CFformatDate(
                      selectedWithdrawal?.updatedAt ||
                        selectedWithdrawal?.createdAt
                    )}
                  </p>
                </div>
              </div>

              <div
                className={[
                  "rounded-card border p-4","border-line bg-surface-2",
                ].join(" ")}
              >
                <p
                  className={[
                    "mb-2 text-base font-semibold","text-text",
                  ].join(" ")}
                >
                  Payment Info
                </p>

                <div
                  className={[
                    "text-sm","text-muted",
                  ].join(" ")}
                >
                  {renderPaymentInfo(selectedWithdrawal)}
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Write reason for ${
                    actionType === "approve" ? "approval" : "rejection"
                  }...`}
                  className={[
                    "w-full resize-none rounded-card border p-3 text-sm outline-none transition","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
                  ].join(" ")}
                />
              </div>

              <p
                className={[
                  "text-sm","text-subtle",
                ].join(" ")}
              >
                Are you sure you want to{" "}
                <span
                  className={
                    actionType === "approve"
                      ?"font-bold text-success"
                      :"font-bold text-danger"
                  }
                >
                  {actionType === "approve" ? "approve" : "reject"}
                </span>{" "}
                this withdrawal?
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isActionLoading}
              className={[
                "border","border-line bg-surface-2 text-text hover:bg-surface-2",
              ].join(" ")}
              onClick={() => {
                setIsDialogOpen(false);
                setComment("");
              }}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() =>
                selectedWithdrawal && handleConfirmAction(selectedWithdrawal)
              }
              disabled={
                isActionLoading || (actionType === "reject" && !comment.trim())
              }
              className={[
                "border text-text",
                actionType === "approve"
                  ? "border-success bg-success hover:bg-success"
                  : "border-danger bg-danger hover:bg-danger",
              ].join(" ")}
            >
              {isActionLoading
                ? "Processing..."
                : `Confirm ${
                    actionType === "approve" ? "Approval" : "Rejection"
                  }`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default WithdrawalStatus;
