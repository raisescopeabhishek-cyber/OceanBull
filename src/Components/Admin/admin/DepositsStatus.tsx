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
import { useSelector } from "react-redux";

import DepositDetailsModal from "../admin/DepositDetailsModal.jsx";

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
          "w-full overflow-hidden text-left align-middle shadow-2xl transition-all",
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
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
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
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const DepositsStatus = () => {
  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

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
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
            isDark
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-emerald-50 text-emerald-700",
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
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
            isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-700",
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
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
          isDark
            ? "bg-yellow-500/10 text-yellow-300"
            : "bg-yellow-50 text-yellow-700",
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
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
            isDark
              ? "bg-white/10 text-white/65"
              : "bg-slate-100 text-slate-600",
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
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
            isDark
              ? "bg-blue-500/10 text-blue-300"
              : "bg-blue-50 text-blue-700",
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
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
            isDark
              ? "bg-yellow-500/10 text-yellow-300"
              : "bg-yellow-50 text-yellow-700",
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
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
          isDark
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-emerald-50 text-emerald-700",
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

  return (
    <div className="w-full">
      <div className="space-y-4 lg:space-y-5">
        <div
          className={[
            "rounded-[24px] border backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
              : "border-orange-200 bg-white/65 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "border-b px-4 py-4 sm:px-5 sm:py-5",
              isDark ? "border-white/10" : "border-orange-100/80",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => window.history.back()}
                  className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1
                    className={[
                      "text-xl font-bold sm:text-2xl",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Funds Management
                  </h1>
                  <p
                    className={[
                      "mt-1 text-sm leading-6",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Search, filter and manage all deposit requests from one
                    place.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <div className="relative w-full sm:min-w-[280px]">
                  <Search
                    size={18}
                    className={[
                      "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                      isDark ? "text-white/35" : "text-slate-400",
                    ].join(" ")}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email or account"
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className={[
                      "h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-400/15"
                        : "border-orange-200 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200/60",
                    ].join(" ")}
                  />
                </div>

                <button
                  onClick={resetFilters}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>

                <button
                  onClick={() => setIsFiltersOpen((prev) => !prev)}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  {isFiltersOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {isFiltersOpen ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>
          </div>

          <div
            className={[
              "overflow-hidden transition-all duration-300 ease-in-out",
              isFiltersOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
              <div>
                <label
                  className={[
                    "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Deposit Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className={[
                    "h-11 w-full rounded-xl border px-3 text-sm outline-none transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/15"
                      : "border-orange-200 bg-white/80 text-slate-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/60",
                  ].join(" ")}
                >
                  <option value="all">All Deposits</option>
                  <option value="approved">Approved Deposits</option>
                  <option value="pending">Pending Deposits</option>
                  <option value="rejected">Rejected Deposits</option>
                </select>
              </div>

              <div
                className={[
                  "rounded-xl border px-4 py-3",
                  isDark
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-orange-200 bg-white/55",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.14em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Total Records
                </p>
                <p
                  className={[
                    "mt-1 text-lg font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {summary?.totalRecords || pagination?.totalDeposits || 0}
                </p>
              </div>

              <div
                className={[
                  "rounded-xl border px-4 py-3",
                  isDark
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-orange-200/80 bg-white/55",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.14em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Page
                </p>
                <p
                  className={[
                    "mt-1 text-lg font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {currentPage} / {totalPages}
                </p>
              </div>

              <div
                className={[
                  "rounded-xl border px-4 py-3",
                  isDark
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-orange-200/80 bg-white/55",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.14em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Current Filter
                </p>
                <p
                  className={[
                    "mt-1 text-lg font-bold capitalize",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {filters.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Deposits",
              amount: TotalDeposits,
            },
            {
              label: "Successful Deposits",
              amount: TotalSuccessfulDeposits,
            },
            {
              label: "Total Bonus",
              amount: TotalBonus,
            },
            {
              label: "Pending Deposits",
              amount: TotalPendingDeposits,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={[
                "rounded-[24px] border p-4 backdrop-blur-xl transition",
                isDark
                  ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  : "border-orange-200 bg-white/65 hover:bg-white/80",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    isDark
                      ? "bg-blue-500/10 text-blue-300"
                      : "bg-orange-100 text-orange-600",
                  ].join(" ")}
                >
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <p
                    className={[
                      "text-xs font-semibold uppercase tracking-[0.14em]",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={[
                      "mt-1 text-xl font-bold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {allLoading ? "Loading..." : `$${stat.amount}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={[
            "hidden overflow-hidden rounded-[24px] border backdrop-blur-xl lg:block",
            isDark
              ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
              : "border-orange-200 bg-white/90 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1650px]">
              <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
                <tr
                  className={[
                    "border-b",
                    isDark ? "border-white/10" : "border-orange-200",
                  ].join(" ")}
                >
                  {[
                    "User",
                    "MT5 Account",
                    "Account Type",
                    "Deposit",
                    "Insurance",
                    "Details",
                    "Proof",
                    "Time",
                    "Status / Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={[
                        "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12">
                      <div
                        className={[
                          "flex items-center justify-center gap-3",
                          isDark ? "text-white/65" : "text-slate-600",
                        ].join(" ")}
                      >
                        <LoaderIcon className="animate-spin" />
                        <span>Loading deposits...</span>
                      </div>
                    </td>
                  </tr>
                ) : depositData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <p
                        className={[
                          "text-lg font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        No deposits found
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Try changing your search or filter options.
                      </p>
                    </td>
                  </tr>
                ) : (
                  depositData.map((item) => {
                    const timeValue = getDepositTimeValue(item);

                    return (
                      <tr
                        key={item?._id}
                        className={[
                          "border-b transition",
                          isDark
                            ? "border-white/10 hover:bg-white/[0.03]"
                            : "border-orange-200 hover:bg-orange-50/40",
                        ].join(" ")}
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p
                              className={[
                                "font-semibold",
                                isDark ? "text-white" : "text-slate-900",
                              ].join(" ")}
                            >
                              {item?.user?.fullName ||
                                `${item?.user?.firstName || ""} ${
                                  item?.user?.lastName || ""
                                }`.trim() ||
                                "Not found"}
                            </p>
                            <p
                              className={[
                                "text-sm",
                                isDark ? "text-blue-300" : "text-primary-600",
                              ].join(" ")}
                            >
                              {item?.user?.email || "Not found"}
                            </p>
                          </div>
                        </td>

                        <td
                          className={[
                            "px-5 py-4 font-medium",
                            isDark ? "text-white/80" : "text-slate-700",
                          ].join(" ")}
                        >
                          {item?.mt5Account || "N/A"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex min-w-[44px] items-center justify-center rounded-full px-3 py-1 text-sm font-semibold",
                              isDark
                                ? "bg-blue-500/10 text-blue-300"
                                : "bg-orange-50 text-orange-700",
                            ].join(" ")}
                          >
                            {item?.accountType || "--"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span
                              className={[
                                "text-sm font-semibold",
                                isDark ? "text-white" : "text-slate-900",
                              ].join(" ")}
                            >
                              ${Number(item?.deposit || 0).toFixed(2)}
                            </span>
                            <span
                              className={[
                                "mt-1 text-xs",
                                isDark ? "text-white/40" : "text-slate-500",
                              ].join(" ")}
                            >
                              Base: $
                              {Number(item?.baseDepositAmount || 0).toFixed(2)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            {getInsuranceBadge(item?.insuranceDetails)}
                            {item?.insuranceDetails ? (
                              <div
                                className={[
                                  "space-y-1 text-xs",
                                  isDark ? "text-white/55" : "text-slate-500",
                                ].join(" ")}
                              >
                                <p>
                                  Charge: $
                                  {Number(
                                    item?.insuranceDetails
                                      ?.insuranceChargeAmount || 0
                                  ).toFixed(2)}
                                </p>
                                <p>
                                  Claim: $
                                  {Number(
                                    item?.insuranceDetails?.claimAmount || 0
                                  ).toFixed(2)}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleDetails(item)}
                            className={[
                              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                              isDark
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                            ].join(" ")}
                          >
                            <Eye size={16} />
                            Details
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              item?.depositSS && togglePreview(item)
                            }
                            disabled={!item?.depositSS}
                            className={[
                              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                              isDark
                                ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                                : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                            ].join(" ")}
                          >
                            <Image size={16} />
                            {item?.depositSS ? "View" : "No Proof"}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="min-w-[155px]">
                            <p
                              className={[
                                "text-sm font-semibold",
                                isDark ? "text-white" : "text-slate-900",
                              ].join(" ")}
                            >
                              {formatDateTime(timeValue)}
                            </p>
                            <p
                              className={[
                                "mt-1 text-xs font-medium",
                                isDark ? "text-white/45" : "text-slate-500",
                              ].join(" ")}
                            >
                              {getTimeAgo(timeValue)}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {item?.status === "pending" ? (
                            isActionLoading ? (
                              <span
                                className={
                                  isDark ? "text-white/50" : "text-slate-500"
                                }
                              >
                                Please wait...
                              </span>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    handleActionClick(item, "approve")
                                  }
                                  className={[
                                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                                    isDark
                                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                                  ].join(" ")}
                                >
                                  <CircleCheckBig size={16} />
                                  Approve
                                </button>

                                <button
                                  onClick={() =>
                                    handleActionClick(item, "reject")
                                  }
                                  className={[
                                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                                    isDark
                                      ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                                      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                                  ].join(" ")}
                                >
                                  <CircleX size={16} />
                                  Reject
                                </button>
                              </div>
                            )
                          ) : (
                            getStatusBadge(item?.status)
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:hidden">
          {loading ? (
            <div
              className={[
                "rounded-[24px] border p-8 backdrop-blur-xl",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-orange-100/80 bg-white/65",
              ].join(" ")}
            >
              <div
                className={[
                  "flex items-center justify-center gap-3",
                  isDark ? "text-white/65" : "text-slate-600",
                ].join(" ")}
              >
                <LoaderIcon className="animate-spin" />
                <span>Loading deposits...</span>
              </div>
            </div>
          ) : depositData.length === 0 ? (
            <div
              className={[
                "rounded-[24px] border p-8 text-center backdrop-blur-xl",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-orange-100/80 bg-white/65",
              ].join(" ")}
            >
              <p
                className={[
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                No deposits found
              </p>
              <p
                className={[
                  "mt-1 text-sm",
                  isDark ? "text-white/40" : "text-slate-500",
                ].join(" ")}
              >
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            depositData.map((item) => {
              const timeValue = getDepositTimeValue(item);

              return (
                <div
                  key={item?._id}
                  className={[
                    "rounded-[24px] border p-4 backdrop-blur-xl",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-orange-100/80 bg-white/65",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3
                        className={[
                          "truncate text-base font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {item?.user?.fullName ||
                          `${item?.user?.firstName || ""} ${
                            item?.user?.lastName || ""
                          }`.trim() ||
                          "Not found"}
                      </h3>
                      <p
                        className={[
                          "block truncate text-sm",
                          isDark ? "text-blue-300" : "text-primary-600",
                        ].join(" ")}
                      >
                        {item?.user?.email || "Not found"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDetails(item)}
                        className={[
                          "shrink-0 rounded-xl border p-2",
                          isDark
                            ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                            : "border-blue-200 bg-blue-50 text-blue-600",
                        ].join(" ")}
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => item?.depositSS && togglePreview(item)}
                        disabled={!item?.depositSS}
                        className={[
                          "shrink-0 rounded-xl border p-2 disabled:cursor-not-allowed disabled:opacity-50",
                          isDark
                            ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                            : "border-blue-200 bg-blue-50 text-blue-600",
                        ].join(" ")}
                      >
                        <Image size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div
                      className={[
                        "rounded-xl p-3",
                        isDark ? "bg-white/[0.035]" : "bg-white/55",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] font-semibold uppercase tracking-[0.14em]",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        MT5 Account
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {item?.mt5Account || "N/A"}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-xl p-3",
                        isDark ? "bg-white/[0.035]" : "bg-white/55",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] font-semibold uppercase tracking-[0.14em]",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Status
                      </p>
                      <div className="mt-1">{getStatusBadge(item?.status)}</div>
                    </div>

                    <div
                      className={[
                        "rounded-xl p-3",
                        isDark ? "bg-white/[0.035]" : "bg-white/55",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] font-semibold uppercase tracking-[0.14em]",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Deposit
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        ${Number(item?.deposit || 0).toFixed(2)}
                      </p>
                      <p
                        className={[
                          "mt-1 text-xs",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Base: ${Number(item?.baseDepositAmount || 0).toFixed(2)}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-xl p-3",
                        isDark ? "bg-white/[0.035]" : "bg-white/55",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] font-semibold uppercase tracking-[0.14em]",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Time
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {formatDateTime(timeValue)}
                      </p>
                      <p
                        className={[
                          "mt-1 text-xs font-medium",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        {getTimeAgo(timeValue)}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-xl p-3",
                        isDark ? "bg-white/[0.035]" : "bg-white/55",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] font-semibold uppercase tracking-[0.14em]",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Insurance
                      </p>
                      <div className="mt-1">
                        {getInsuranceBadge(item?.insuranceDetails)}
                      </div>
                      {item?.insuranceDetails ? (
                        <p
                          className={[
                            "mt-2 text-xs",
                            isDark ? "text-white/45" : "text-slate-500",
                          ].join(" ")}
                        >
                          Claim: $
                          {Number(
                            item?.insuranceDetails?.claimAmount || 0
                          ).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    {item?.status === "pending" ? (
                      isActionLoading ? (
                        <span
                          className={
                            isDark ? "text-white/50" : "text-slate-500"
                          }
                        >
                          Please wait...
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleActionClick(item, "approve")}
                            className={[
                              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                              isDark
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                            ].join(" ")}
                          >
                            <CircleCheckBig size={16} />
                            Approve
                          </button>

                          <button
                            onClick={() => handleActionClick(item, "reject")}
                            className={[
                              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                              isDark
                                ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                            ].join(" ")}
                          >
                            <CircleX size={16} />
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
                      <div>{getStatusBadge(item?.status)}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            className={[
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
            ].join(" ")}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div
            className={[
              "text-sm font-medium",
              isDark ? "text-white/65" : "text-slate-600",
            ].join(" ")}
          >
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className={[
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
            ].join(" ")}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isActionLoading) setIsDialogOpen(open);
        }}
      >
        <AlertDialogContent
          className={[
            "max-w-xl rounded-2xl border p-5 backdrop-blur-xl sm:p-6",
            isDark
              ? "border-white/10 bg-[#0b1220] text-white"
              : "border-orange-200 bg-white text-slate-900",
          ].join(" ")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isDark ? "mt-1 text-white/60" : "mt-1 text-slate-500"}
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
                "w-full resize-none rounded-xl border p-3 text-sm outline-none transition",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/15"
                  : "border-orange-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/60",
              ].join(" ")}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isActionLoading}
              className={[
                "border",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                  : "border-orange-200 bg-white text-slate-700 hover:bg-orange-50",
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
                "border text-white",
                actionType === "approve"
                  ? "border-emerald-500 bg-emerald-600 hover:bg-emerald-700"
                  : "border-red-500 bg-red-600 hover:bg-red-700",
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
        isDark={isDark}
        getStatusBadge={getStatusBadge}
        renderDetailValue={renderDetailValue}
      />

      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent
          className={[
            "max-w-4xl rounded-2xl border p-5 backdrop-blur-xl sm:p-6",
            isDark
              ? "border-white/10 bg-[#0b1220] text-white"
              : "border-orange-200 bg-white text-slate-900",
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
                    className="max-h-[70vh] w-full rounded-xl object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      toast.error("Deposit proof image load nahi ho paayi");
                    }}
                  />
                ) : (
                  <div
                    className={[
                      "rounded-xl border p-8 text-center",
                      isDark
                        ? "border-white/10 bg-white/[0.03] text-white/60"
                        : "border-slate-200 bg-slate-50 text-slate-500",
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
    </div>
  );
};

export default DepositsStatus;