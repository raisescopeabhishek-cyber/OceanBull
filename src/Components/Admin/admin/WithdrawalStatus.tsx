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
import { useSelector } from "react-redux";

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

const WithdrawalStatus = () => {
  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

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
            isDark
              ? "bg-red-500/10 text-red-300"
              : "bg-red-50 text-red-700",
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
                    Payout Management
                  </h1>
                  <p
                    className={[
                      "mt-1 text-sm leading-6",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Search, filter and manage all withdrawal requests from one
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
                    placeholder="Search by name or email"
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
                  Withdrawal Status
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
                  <option value="all">All Withdrawals</option>
                  <option value="approved">Approved Withdrawals</option>
                  <option value="pending">Pending Withdrawals</option>
                  <option value="rejected">Rejected Withdrawals</option>
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
                  {pagination?.totalWithdrawals || 0}
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
              label: "Total Withdrawals",
              amount: totalWithdrawalsAmount,
            },
            {
              label: "Successful Withdrawals",
              amount: totalApprovedWithdrawals,
            },
            {
              label: "Pending Withdrawals",
              amount: totalPendingWithdrawals,
            },
            {
              label: "Rejected Withdrawals",
              amount: totalRejectedWithdrawals,
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
            <table className="w-full min-w-[1150px]">
              <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
                <tr
                  className={[
                    "border-b",
                    isDark ? "border-white/10" : "border-orange-200",
                  ].join(" ")}
                >
                  {[
                    "User",
                    "Account",
                    "Account Type",
                    "Withdrawal",
                    "Method",
                    "Date",
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
                    <td colSpan={7} className="px-5 py-12">
                      <div
                        className={[
                          "flex items-center justify-center gap-3",
                          isDark ? "text-white/65" : "text-slate-600",
                        ].join(" ")}
                      >
                        <LoaderIcon className="animate-spin" />
                        <span>Loading withdrawals...</span>
                      </div>
                    </td>
                  </tr>
                ) : withdrawalData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p
                        className={[
                          "text-lg font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        No withdrawals found
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
                  withdrawalData.map((item) => (
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
                            {item?.userData?.firstName || "Not found"}{" "}
                            {item?.userData?.lastName || ""}
                          </p>
                          <p
                            className={[
                              "text-sm",
                              isDark ? "text-blue-300" : "text-primary-600",
                            ].join(" ")}
                          >
                            {item?.userData?.email || "Not found"}
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
                        <span
                          className={[
                            "text-sm font-semibold",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          ${Number(item?.amount || 0).toFixed(2)}
                        </span>
                      </td>

                      <td
                        className={[
                          "px-5 py-4 font-medium",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        {item?.method || "--"}
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={[
                            "font-medium",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {CFformatDate(getDecisionDate(item))}
                        </p>
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          {CFcalculateTimeSinceJoined(getDecisionDate(item))}
                        </p>
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
                  ))
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
                <span>Loading withdrawals...</span>
              </div>
            </div>
          ) : withdrawalData.length === 0 ? (
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
                No withdrawals found
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
            withdrawalData.map((item) => (
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
                      {item?.userData?.firstName || "Not found"}{" "}
                      {item?.userData?.lastName || ""}
                    </h3>
                    <p
                      className={[
                        "block truncate text-sm",
                        isDark ? "text-blue-300" : "text-primary-600",
                      ].join(" ")}
                    >
                      {item?.userData?.email || "Not found"}
                    </p>
                  </div>

                  <div className="shrink-0">{getStatusBadge(item?.status)}</div>
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
                      Account
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
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
                      Account Type
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {item?.accountType || "--"}
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
                      Withdrawal
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      ${Number(item?.amount || 0).toFixed(2)}
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
                      Method
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {item?.method || "--"}
                    </p>
                  </div>
                </div>

                <div
                  className={[
                    "mt-4 border-t pt-4",
                    isDark ? "border-white/10" : "border-orange-100/80",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {CFformatDate(getDecisionDate(item))}
                  </p>
                  <p
                    className={[
                      "text-xs",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    {CFcalculateTimeSinceJoined(getDecisionDate(item))}
                  </p>

                  {item?.status === "pending" && (
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => handleActionClick(item, "approve")}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                          isDark
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                        ].join(" ")}
                      >
                        <CircleCheckBig size={15} />
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
                        <CircleX size={15} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className={[
            "rounded-[24px] border p-4 backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
              : "border-orange-100/80 bg-white/65 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={[
                "text-sm",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              Showing page{" "}
              <span
                className={[
                  "font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                {currentPage}
              </span>{" "}
              of{" "}
              <span
                className={[
                  "font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                {totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                  currentPage === 1
                    ? isDark
                      ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/25"
                      : "cursor-not-allowed border border-orange-100 bg-white/60 text-slate-300"
                    : isDark
                      ? "border border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50"
                }`}
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                  currentPage === totalPages
                    ? isDark
                      ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/25"
                      : "cursor-not-allowed border border-orange-100 bg-white/60 text-slate-300"
                    : isDark
                      ? "bg-blue-500/90 text-white hover:bg-blue-500"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
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
              {actionType === "approve"
                ? "Approve Withdrawal"
                : "Reject Withdrawal"}
            </AlertDialogTitle>

            <AlertDialogDescription
              className={isDark ? "mt-1 text-white/60" : "mt-1 text-slate-500"}
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
                  "rounded-xl border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-orange-100 bg-orange-50/40",
                ].join(" ")}
              >
                <p
                  className={[
                    "mb-2 text-base font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  User Info
                </p>

                <div
                  className={[
                    "space-y-1 text-sm",
                    isDark ? "text-white/70" : "text-slate-600",
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
                  "rounded-xl border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-orange-100 bg-orange-50/40",
                ].join(" ")}
              >
                <p
                  className={[
                    "mb-2 text-base font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  Payment Info
                </p>

                <div
                  className={[
                    "text-sm",
                    isDark ? "text-white/70" : "text-slate-600",
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
                    "w-full resize-none rounded-xl border p-3 text-sm outline-none transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/15"
                      : "border-orange-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/60",
                  ].join(" ")}
                />
              </div>

              <p
                className={[
                  "text-sm",
                  isDark ? "text-white/60" : "text-slate-600",
                ].join(" ")}
              >
                Are you sure you want to{" "}
                <span
                  className={
                    actionType === "approve"
                      ? isDark
                        ? "font-bold text-emerald-300"
                        : "font-bold text-emerald-700"
                      : isDark
                        ? "font-bold text-red-300"
                        : "font-bold text-red-700"
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
              onClick={() =>
                selectedWithdrawal && handleConfirmAction(selectedWithdrawal)
              }
              disabled={
                isActionLoading || (actionType === "reject" && !comment.trim())
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
    </div>
  );
};

export default WithdrawalStatus;