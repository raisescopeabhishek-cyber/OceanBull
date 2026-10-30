import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftRight,
  CircleCheckBig,
  CircleX,
  Image,
  LoaderIcon,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";

import DepositDetailsModal from "../admin/DepositDetailsModal.jsx";
import { BlotterPage, Button, EmptyState } from "@/Components/ui";

const PAGE_LIMIT = 10;

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

/* -------------------------------------------------------------------------- */
/* Local independent AlertDialog components for DepositsStatus only            */
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

const DepositsStatus = () => {
  const [depositData, setDepositData] = useState<any[]>([]);
  const [allDepositData, setAllDepositData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [summary, setSummary] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"" | "approve" | "reject">("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [comment, setComment] = useState("");

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil(
        (Number(pagination?.totalDeposits || pagination?.totalRecords) || 0) /
          PAGE_LIMIT
      )
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

  const fetchApiData = async () => {
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
      }

      const res = await adminApi.get(`/deposits?${params.toString()}`);
      const finalRes = res?.data || {};

      setDepositData(finalRes?.data || []);
      setPagination(finalRes?.pagination || {});
      setSummary(finalRes?.summary || {});
    } catch (error) {
      console.log("Error fetching deposits:", error);
      toast.error("Something went wrong while fetching deposits");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setAllLoading(true);
    try {
      const res = await adminApi.get(`/deposits`);
      const finalRes = res?.data || {};
      setAllDepositData(finalRes?.data || []);
    } catch (error) {
      console.log("Error fetching all deposits:", error);
    } finally {
      setAllLoading(false);
    }
  };

  const togglePreview = (item: any) => {
    setSelectedDeposit(item);
    setShowPreview(true);
  };

  const toggleDetails = (item: any) => {
    setSelectedDeposit(item);
    setShowDetails(true);
  };

  const handleActionClick = (deposit: any, action: "approve" | "reject") => {
    setSelectedDeposit(deposit);
    setActionType(action);
    setComment("");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async (selected: any) => {
    if (isActionLoading) return;

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
      await adminApi.put("/update-deposit", {
        _id: selected._id,
        status: actionType,
        mt5Account: selected.mt5Account,
        amount: selected.baseDepositAmount || selected.deposit,
        email: selected.user?.email,
        selectedDeposit: selected,
        comment: finalComment,
      });

      toast.success(
        actionType === "approve" ? "Deposit Approved" : "Deposit Rejected",
        { id: toastId }
      );

      setIsDialogOpen(false);
      setComment("");
      await fetchApiData();
      await fetchAllData();
    } catch (err) {
      console.log(err);
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

  const getValidDate = (value?: string | null) => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date;
  };

  const formatDateTime = (value?: string | null) => {
    const date = getValidDate(value);
    if (!date) return "N/A";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getTimeAgo = (value?: string | null) => {
    const date = getValidDate(value);
    if (!date) return "N/A";

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return "Just now";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const getDepositTimeValue = (item: any) => {
    return item?.createdAt || item?.updatedAt || item?.approvedAt || null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchApiData();
  }, [currentPage, debouncedSearch, filters.status]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const TotalBonus = useMemo(
    () =>
      allDepositData
        .filter((item) => item?.status === "approved")
        .reduce(
          (total, item) => total + Number(item?.bonusDetails?.bonusAmount || 0),
          0
        )
        .toFixed(2),
    [allDepositData]
  );

  const TotalDeposits = useMemo(
    () =>
      allDepositData
        .reduce((total, item) => total + Number(item?.deposit || 0), 0)
        .toFixed(2),
    [allDepositData]
  );

  const TotalPendingDeposits = useMemo(
    () =>
      allDepositData
        .filter((i) => i.status === "pending")
        .reduce((t, i) => t + Number(i?.deposit || 0), 0)
        .toFixed(2),
    [allDepositData]
  );

  const TotalSuccessfulDeposits = useMemo(
    () =>
      allDepositData
        .filter((i) => i.status === "approved")
        .reduce((t, i) => t + Number(i?.deposit || 0), 0)
        .toFixed(2),
    [allDepositData]
  );

  const getDepositProofUrl = (path?: string | null) => {
    if (!path) return "";

    const rawPath = String(path).trim().replace(/\\/g, "/");

    if (/^https?:\/\//i.test(rawPath)) {
      return rawPath;
    }

    const uploadsMatch = rawPath.match(/\/?uploads\/.+$/i);

    const publicPath = uploadsMatch?.[0]
      ? uploadsMatch[0].startsWith("/")
        ? uploadsMatch[0]
        : `/${uploadsMatch[0]}`
      : rawPath.startsWith("/")
        ? rawPath
        : `/${rawPath}`;

    const apiBase = String(import.meta.env.VITE_API_BASE_URL || "")
      .replace(/\/api\/?$/i, "")
      .replace(/\/$/, "");

    if (window.location.hostname === "localhost") {
      return `${apiBase}${publicPath}`;
    }

    return publicPath;
  };

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

  const getInsuranceBadge = (insuranceDetails?: any) => {
    if (!insuranceDetails) {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium","bg-surface-2 text-muted",
          ].join(" ")}
        >
          <Shield size={14} />
          No Insurance
        </span>
      );
    }

    const status = String(insuranceDetails?.status || "").toLowerCase();

    if (status === "claimed") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium","bg-primary-soft text-primary",
          ].join(" ")}
        >
          <Shield size={14} />
          Claimed
        </span>
      );
    }

    if (status === "pending_coverage") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium","bg-warning-soft text-warning",
          ].join(" ")}
        >
          <Shield size={14} />
          Pending Coverage
        </span>
      );
    }

    return (
      <span
        className={[
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium","bg-success-soft text-success",
        ].join(" ")}
      >
        <Shield size={14} />
        Active
      </span>
    );
  };

  const renderDetailValue = (value: any, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") return fallback;
    return value;
  };

  /* ---- blotter columns -------------------------------------------------
     One definition drives both layouts. `primary` and `secondary` pick what
     heads each phone row, `trailing` is its right-hand figure, and the rest
     become labelled detail lines.
     -------------------------------------------------------------------- */
  const money = (v: any) =>
    "$" +
    Number(v || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-text">
            {item?.userId?.name || item?.name || "—"}
          </div>
          <div className="numeric mt-0.5 truncate text-[10px] text-subtle">
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
        <span className="numeric text-[11px] text-muted">
          {item?.accountType || item?.groupName || "—"}
        </span>
      ),
    },
    {
      key: "deposit",
      header: "Deposit",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (item: any) => (
        <span className="font-bold">{money(item?.deposit)}</span>
      ),
    },
    {
      key: "bonus",
      header: "Bonus",
      align: "right",
      numeric: true,
      cell: (item: any) =>
        Number(item?.bonusDetails?.bonusAmount || 0) > 0 ? (
          <span className="text-primary">
            +{money(item.bonusDetails.bonusAmount)}
          </span>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "insurance",
      header: "Insurance",
      cell: (item: any) => getInsuranceBadge(item?.insuranceDetails),
    },
    {
      key: "proof",
      header: "Proof",
      cell: (item: any) =>
        item?.depositSS ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePreview(item);
            }}
            className="numeric text-[10px] font-bold uppercase tracking-[0.1em] text-info underline"
          >
            View
          </button>
        ) : (
          <span className="numeric text-[10px] font-bold uppercase tracking-[0.1em] text-warning">
            Missing
          </span>
        ),
    },
    {
      key: "time",
      header: "Requested",
      cell: (item: any) => (
        <span className="numeric text-[11px] text-subtle">
          {getTimeAgo(getDepositTimeValue(item))}
        </span>
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
              size="xs"
              variant="success-soft"
              onClick={(e: any) => {
                e.stopPropagation();
                handleActionClick(item, "approve");
              }}
            >
              Approve
            </Button>
            <Button
              size="xs"
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
          <span className="numeric text-[10px] text-subtle">—</span>
        ),
    },
  ];

  const pendingCount = allDepositData.filter(
    (i: any) => i?.status === "pending"
  ).length;

  const totalRecords =
    pagination?.totalDeposits || pagination?.totalRecords || 0;

  return (
    <>
      <BlotterPage
        breadcrumb="Clients / Deposits"
        title="Deposits"
        description="Review and clear client deposit requests."
        actions={
          <Button variant="secondary" onClick={() => fetchApiData()}>
            Refresh
          </Button>
        }
        readouts={[
          {
            key: "pending",
            label: "Pending value",
            value: money(TotalPendingDeposits),
            delta: pendingCount + " req",
            trend: pendingCount ? "down" : "flat",
          },
          {
            key: "approved",
            label: "Approved value",
            value: money(TotalSuccessfulDeposits),
            trend: "up",
          },
          {
            key: "total",
            label: "All deposits",
            value: money(TotalDeposits),
            helper: allDepositData.length + " records",
          },
          {
            key: "bonus",
            label: "Bonus credited",
            value: money(TotalBonus),
            trend: "up",
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
            { key: "pending", label: "Pending", tone: "warning", count: pendingCount },
            { key: "approved", label: "Approved", tone: "success" },
            { key: "rejected", label: "Rejected", tone: "danger" },
          ],
          summary: totalRecords + " records",
        }}
        columns={columns}
        rows={depositData}
        loading={loading}
        onRowClick={(item: any) => toggleDetails(item)}
        rowEdge={(item: any) =>
          String(item?.status).toLowerCase() === "pending" ? "warning" : null
        }
        empty={
          <EmptyState
            title="No deposits found"
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
            <span className="numeric text-[10px] text-subtle">
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
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={"mt-1 text-subtle"}
            >
              {actionType === "approve"
                ? "Comment is optional for approval."
                : "Please enter a rejection reason before continuing."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <textarea
              rows={5}
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
              disabled={
                isActionLoading || (actionType === "reject" && !comment.trim())
              }
              onClick={() =>
                selectedDeposit && handleConfirmAction(selectedDeposit)
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

      <DepositDetailsModal
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        selectedDeposit={selectedDeposit}
        getStatusBadge={getStatusBadge}
        renderDetailValue={renderDetailValue}
      />

      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent
          className={[
            "max-w-4xl rounded-card border p-5 backdrop-blur-xl sm:p-6","border-line bg-surface text-text",
          ].join(" ")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Proof Of Deposit
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="mt-4">
                {selectedDeposit?.depositSS ? (
                  <img
                    src={getDepositProofUrl(selectedDeposit?.depositSS)}
                    alt="Deposit proof"
                    className="max-h-[70vh] w-full rounded-card object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      toast.error("Deposit proof image load nahi ho paayi");
                    }}
                  />
                ) : (
                  <div
                    className={[
                      "rounded-card border p-8 text-center","border-line bg-surface-2 text-subtle",
                    ].join(" ")}
                  >
                    No screenshot uploaded.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DepositsStatus;
