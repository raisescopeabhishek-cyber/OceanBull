import { useEffect, useState } from "react";
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
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
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
import { useSelector } from "react-redux";

const PAGE_LIMIT = 10;

const DepositsStatus = () => {
  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [depositData, setDepositData] = useState<any[]>([]);
  const [allDepositData, setAllDepositData] = useState<any[]>([]);
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

  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"" | "approve" | "reject">("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [comment, setComment] = useState("");

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((Number(pagination?.totalDeposits) || 0) / PAGE_LIMIT)
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
      } else {
        params.append("status", "");
      }

      const res = await adminApi.get(`/deposits?${params.toString()}`);
      const finalRes = res?.data;

      setDepositData(finalRes?.data || []);
      setPagination(finalRes?.pagination || {});
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
      setAllDepositData(res?.data?.data || []);
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

  const handleActionClick = (deposit: any, action: "approve" | "reject") => {
    setSelectedDeposit(deposit);
    setActionType(action);
    setComment("");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async (selected: any) => {
    if (isActionLoading || !comment.trim()) return;

    const toastId = toast.loading("Please wait...");
    setIsActionLoading(true);

    try {
      await adminApi.put("/update-deposit", {
        _id: selected._id,
        status: actionType,
        mt5Account: selected.mt5Account,
        amount: selected.deposit,
        email: selected.userId?.email,
        selectedDeposit: selected,
        comment,
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
    fetchApiData();
  }, [currentPage, debouncedSearch, filters.status]);

  useEffect(() => {
    fetchAllData();
  }, []);

    const TotalBonus = allDepositData
    .reduce((total, item) => total + Number(item.bonus || 0), 0)
    .toFixed(2);

  const TotalDeposits = allDepositData
    .reduce((total, item) => total + Number(item.deposit || 0), 0)
    .toFixed(2);

  const TotalPendingDeposits = allDepositData
    .filter((i) => i.status === "pending")
    .reduce((t, i) => t + Number(i.deposit || 0), 0)
    .toFixed(2);

  const TotalSuccessfulDeposits = allDepositData
    .filter((i) => i.status === "approved")
    .reduce((t, i) => t + Number(i.deposit || 0), 0)
    .toFixed(2);

  const TotalRejectedDeposits = allDepositData
    .filter((i) => i.status === "rejected")
    .reduce((t, i) => t + Number(i.deposit || 0), 0)
    .toFixed(2);

  const imgUrl = (p?: string) =>
    p ? `${import.meta.env.VITE_API_BASE_URL}/${p}` : "";

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

  return (
    <div className="w-full">
      <div className="space-y-4 lg:space-y-5">
        {/* Top Section */}
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
                    Search, filter and manage all deposit requests from one place.
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
                  {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {isFiltersOpen ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Row */}
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
                  {pagination?.totalDeposits || 0}
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

        {/* Stats Cards */}
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
            // {
            //   label: "Rejected Deposits",
            //   amount: TotalRejectedDeposits,
            // },
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

        {/* Desktop Table */}
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
                    "MT5 Account",
                    "Account Type",
                    "Deposit",
                     "Bonus",
                    "Date",
                    "Proof",
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
                        <span>Loading deposits...</span>
                      </div>
                    </td>
                  </tr>
                ) : depositData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
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
                  depositData.map((item) => (
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
                            {item?.userId?.firstName || "Not found"}{" "}
                            {item?.userId?.lastName || ""}
                          </p>
                          <p
                            className={[
                              "text-sm",
                              isDark ? "text-blue-300" : "text-primary-600",
                            ].join(" ")}
                          >
                            {item?.userId?.email || "Not found"}
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
                          ${Number(item?.deposit || 0).toFixed(2)}
                        </span>
                      </td>

                 <td className="px-5 py-4">
  <div className="flex flex-col">
    <span
      className={[
        "text-sm font-semibold leading-none",
        isDark ? "text-white" : "text-slate-900",
      ].join(" ")}
    >
      ${Number(item?.bonus || 0).toFixed(2)}
    </span>

    <span
      className={[
        "mt-1 text-xs font-medium",
        isDark ? "text-slate-400" : "text-slate-500",
      ].join(" ")}
    >
      {Number(item?.deposit || 0) > 0
        ? `${((Number(item?.bonus || 0) / Number(item?.deposit || 0)) * 100).toFixed(2)}% bonus`
        : "—"}
    </span>
  </div>
</td>

                      <td className="px-5 py-4">
                        <p
                          className={[
                            "font-medium",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {CFformatDate(
                            item?.status === "approved" || item?.status === "rejected"
                              ? item?.updatedAt
                              : item?.createdAt
                          )}
                        </p>
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          {CFcalculateTimeSinceJoined(
                            item?.status === "approved" || item?.status === "rejected"
                              ? item?.updatedAt
                              : item?.createdAt
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => togglePreview(item)}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                              : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                          ].join(" ")}
                        >
                          <Image size={16} />
                          View
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        {item?.status === "pending" ? (
                          isActionLoading ? (
                            <span
                              className={isDark ? "text-white/50" : "text-slate-500"}
                            >
                              Please wait...
                            </span>
                          ) : (
                            <div className="flex items-center gap-3">
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

        {/* Mobile Cards */}
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
            depositData.map((item) => (
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
                      {item?.userId?.firstName || "Not found"}{" "}
                      {item?.userId?.lastName || ""}
                    </h3>
                    <p
                      className={[
                        "block truncate text-sm",
                        isDark ? "text-blue-300" : "text-primary-600",
                      ].join(" ")}
                    >
                      {item?.userId?.email || "Not found"}
                    </p>
                  </div>

                  <button
                    onClick={() => togglePreview(item)}
                    className={[
                      "shrink-0 rounded-xl border p-2",
                      isDark
                        ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                        : "border-blue-200 bg-blue-50 text-blue-600",
                    ].join(" ")}
                  >
                    <Image size={18} />
                  </button>
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
                      Deposit
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      ${Number(item?.deposit || 0).toFixed(2)}
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
                    {CFformatDate(
                      item?.status === "approved" || item?.status === "rejected"
                        ? item?.updatedAt
                        : item?.createdAt
                    )}
                  </p>
                  <p
                    className={[
                      "text-xs",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    {CFcalculateTimeSinceJoined(
                      item?.status === "approved" || item?.status === "rejected"
                        ? item?.updatedAt
                        : item?.createdAt
                    )}
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

        {/* Pagination */}
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

      {/* Action Dialog */}
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setComment("");
        }}
      >
        <AlertDialogContent
          className={[
            "max-w-xl rounded-2xl backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-[#0b1220] text-white"
              : "border-orange-200 bg-white text-slate-900",
          ].join(" ")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              {actionType === "approve" ? "Approve Deposit" : "Reject Deposit"}
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              {selectedDeposit && (
                <div className={isDark ? "text-white/70" : "text-slate-600"}>
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
                        User Information
                      </p>
                      <p>
                        Name: {selectedDeposit.userId?.firstName}{" "}
                        {selectedDeposit.userId?.lastName}
                      </p>
                      <p>Email: {selectedDeposit.userId?.email}</p>
                      <p>Phone: {selectedDeposit.userId?.phone}</p>
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
                        Deposit Details
                      </p>
                      <p>Deposit Amount: ${selectedDeposit.deposit}</p>
                      <p>AC Number: {selectedDeposit?.mt5Account}</p>
                      <p>AC Type: {selectedDeposit.accountType}</p>
                      <p>Transaction ID: {selectedDeposit?.transactionId}</p>
                      <p>
                        Date:{" "}
                        {CFformatDate(
                          selectedDeposit?.updatedAt || selectedDeposit?.createdAt
                        )}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="admin-comment"
                        className={[
                          "mb-2 block text-sm font-medium",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        Admin Comment *
                      </label>
                      <textarea
                        id="admin-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={300}
                        placeholder={
                          actionType === "approve"
                            ? "Add a note for the user"
                            : "Reason for rejection"
                        }
                        className={[
                          "min-h-[90px] w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition",
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40"
                            : "border-orange-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300",
                        ].join(" ")}
                      />
                      <div
                        className={[
                          "mt-1 text-right text-xs",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        {comment.length}/300
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className={[
                "rounded-xl border px-4 py-2",
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
              disabled={isActionLoading || !comment.trim()}
              onClick={() =>
                selectedDeposit && handleConfirmAction(selectedDeposit)
              }
              className={[
                "rounded-xl border px-4 py-2 text-white disabled:opacity-60",
                actionType === "approve"
                  ? "border-emerald-500 bg-emerald-600 hover:bg-emerald-700"
                  : "border-red-500 bg-red-600 hover:bg-red-700",
              ].join(" ")}
            >
              {isActionLoading
                ? "Processing..."
                : `Confirm ${actionType === "approve" ? "Approval" : "Rejection"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Proof Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent
          className={[
            "max-w-3xl rounded-2xl backdrop-blur-xl",
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
              <div>
                <img
                  src={imgUrl(selectedDeposit?.depositSS)}
                  alt="Proof of Deposit"
                  className="my-6 h-auto w-full rounded-xl border object-contain"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className={[
                "rounded-xl border px-4 py-2",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                  : "border-orange-200 bg-white text-slate-700 hover:bg-orange-50",
              ].join(" ")}
            >
              Close
            </AlertDialogCancel>

            <AlertDialogAction className="rounded-xl border border-blue-500 bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <a
                target="_blank"
                rel="noreferrer"
                href={imgUrl(selectedDeposit?.depositSS)}
              >
                View Full Image
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepositsStatus;