import { useEffect, useState } from "react";
import {
  Ban,
  CheckCircle,
  Copy,
  LoaderIcon,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import { RiUserSharedFill } from "react-icons/ri";
import { setLoggedUser } from "../../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import UseUserHook from "../../../hooks/user/UseUserHook";
import { Link } from "react-router-dom";

const PAGE_LIMIT = 10;

const IbUsers = () => {
  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [ibUsers, setIbUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>({
    totalPages: 1,
    totalUsers: 0,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const extractedUrl = (() => {
    try {
      return new URL(window.location.href).origin;
    } catch {
      return "";
    }
  })();

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((Number(pagination?.totalUsers) || 0) / PAGE_LIMIT)
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
    });
    setDebouncedSearch("");
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        `/get-users?page=${currentPage}&limit=${PAGE_LIMIT}&search=${encodeURIComponent(
          debouncedSearch
        )}&referralUsers=true`
      );
      setPagination(res.data?.pagination || { totalPages: 1, totalUsers: 0 });
      setIbUsers(res.data?.data || []);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };

  const handleLoginAsUser = (user: any) => {
    getReset();
    dispatch(setLoggedUser(user));
    window.open("/user/dashboard", "_blank");
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(handler);
  }, [filters.search]);

  useEffect(() => {
    fetchUsersData();
  }, [currentPage, debouncedSearch]);

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
                    Referral Users
                  </h1>
                  <p
                    className={[
                      "mt-1 text-sm leading-6",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Search and manage all IB users from one place.
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
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
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
                  {pagination?.totalUsers || 0}
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
                  Search
                </p>
                <p
                  className={[
                    "mt-1 truncate text-lg font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {debouncedSearch || "None"}
                </p>
              </div>
            </div>
          </div>
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
            <table className="w-full min-w-[1200px]">
              <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
                <tr
                  className={[
                    "border-b",
                    isDark ? "border-white/10" : "border-orange-200",
                  ].join(" ")}
                >
                  {[
                    "User",
                    "MT5 Accounts",
                    "Email",
                    "KYC",
                    "IB ID",
                    "IB Balance",
                    "Referral Link",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={[
                        "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                        heading === "MT5 Accounts" ||
                        heading === "Email" ||
                        heading === "KYC" ||
                        heading === "IB ID" ||
                        heading === "IB Balance"
                          ? "text-center"
                          : "",
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
                        <span>Loading IB users...</span>
                      </div>
                    </td>
                  </tr>
                ) : ibUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p
                        className={[
                          "text-lg font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        No IB users found
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Try changing your search options.
                      </p>
                    </td>
                  </tr>
                ) : (
                  ibUsers.map((item: any) => {
                    const link = `${extractedUrl}/user/signup/${item?.referralAccount}`;
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
                          <div className="flex gap-3 items-start">
                            <button
                              onClick={() => handleLoginAsUser(item)}
                              className={isDark ? "text-blue-300" : "text-blue-600"}
                              title="Login as user"
                            >
                              <RiUserSharedFill size={22} />
                            </button>

                            <div>
                              <p
                                className={[
                                  "font-semibold",
                                  isDark ? "text-white" : "text-slate-900",
                                ].join(" ")}
                              >
                                {item?.firstName || "Not found"}
                              </p>

                              <Link
                                to={`/admin/user-detail/${item?._id}`}
                                className={[
                                  "text-sm hover:underline",
                                  isDark ? "text-blue-300" : "text-primary-600",
                                ].join(" ")}
                              >
                                {item?.email || "Not found"}
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                              isDark
                                ? "bg-sky-500/10 text-sky-300"
                                : "bg-sky-50 text-sky-700",
                            ].join(" ")}
                          >
                            {item?.accounts?.length || 0}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          {item?.emailVerified ? (
                            <span
                              className={[
                                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                                isDark
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-emerald-50 text-emerald-700",
                              ].join(" ")}
                            >
                              <CheckCircle size={16} />
                              Verified
                            </span>
                          ) : (
                            <span
                              className={[
                                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                                isDark
                                  ? "bg-red-500/10 text-red-300"
                                  : "bg-red-50 text-red-700",
                              ].join(" ")}
                            >
                              <Ban size={16} />
                              Not verified
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {item?.kycVerified ? (
                            <span
                              className={[
                                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                                isDark
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-emerald-50 text-emerald-700",
                              ].join(" ")}
                            >
                              <CheckCircle size={16} />
                              Verified
                            </span>
                          ) : (
                            <span
                              className={[
                                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                                isDark
                                  ? "bg-red-500/10 text-red-300"
                                  : "bg-red-50 text-red-700",
                              ].join(" ")}
                            >
                              <Ban size={16} />
                              Not verified
                            </span>
                          )}
                        </td>

                        <td
                          className={[
                            "px-5 py-4 text-center font-medium",
                            isDark ? "text-white/80" : "text-slate-700",
                          ].join(" ")}
                        >
                          {item?.referralAccount || "N/A"}
                        </td>

                        <td
                          className={[
                            "px-5 py-4 text-center font-semibold",
                            isDark ? "text-emerald-300" : "text-emerald-700",
                          ].join(" ")}
                        >
                          {Number(item?.ibBalance || 0).toFixed(4)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2 items-center">
                            <input
                              readOnly
                              value={link}
                              className={[
                                "w-[320px] rounded-xl border px-3 py-2 text-sm outline-none",
                                isDark
                                  ? "border-white/10 bg-white/[0.04] text-white"
                                  : "border-orange-200 bg-white text-slate-900",
                              ].join(" ")}
                            />
                            <button
                              onClick={() => copyToClipboard(link)}
                              className={[
                                "rounded-xl border p-2 transition",
                                isDark
                                  ? "border-white/10 bg-white/[0.04] text-blue-300 hover:bg-white/[0.07]"
                                  : "border-orange-200 bg-white text-blue-600 hover:bg-orange-50",
                              ].join(" ")}
                              title="Copy referral link"
                            >
                              <Copy size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                <span>Loading IB users...</span>
              </div>
            </div>
          ) : ibUsers.length === 0 ? (
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
                No IB users found
              </p>
              <p
                className={[
                  "mt-1 text-sm",
                  isDark ? "text-white/40" : "text-slate-500",
                ].join(" ")}
              >
                Try changing your search options.
              </p>
            </div>
          ) : (
            ibUsers.map((item: any) => {
              const link = `${extractedUrl}/user/signup/${item?.referralAccount}`;
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
                        {item?.firstName || "Not found"}
                      </h3>
                      <Link
                        to={`/admin/user-detail/${item?._id}`}
                        className={[
                          "block truncate text-sm hover:underline",
                          isDark ? "text-blue-300" : "text-primary-600",
                        ].join(" ")}
                      >
                        {item?.email || "Not found"}
                      </Link>
                    </div>

                    <button
                      onClick={() => handleLoginAsUser(item)}
                      className={[
                        "shrink-0 rounded-xl border p-2",
                        isDark
                          ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                          : "border-blue-200 bg-blue-50 text-blue-600",
                      ].join(" ")}
                    >
                      <RiUserSharedFill size={18} />
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
                        MT5 Accounts
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {item?.accounts?.length || 0}
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
                        IB ID
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {item?.referralAccount || "N/A"}
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
                        Email
                      </p>
                      <div className="mt-1">
                        {item?.emailVerified ? (
                          <span
                            className={[
                              "inline-flex items-center gap-1 text-sm font-medium",
                              isDark ? "text-emerald-300" : "text-emerald-700",
                            ].join(" ")}
                          >
                            <CheckCircle size={15} />
                            Verified
                          </span>
                        ) : (
                          <span
                            className={[
                              "inline-flex items-center gap-1 text-sm font-medium",
                              isDark ? "text-red-300" : "text-red-700",
                            ].join(" ")}
                          >
                            <Ban size={15} />
                            Not verified
                          </span>
                        )}
                      </div>
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
                        KYC
                      </p>
                      <div className="mt-1">
                        {item?.kycVerified ? (
                          <span
                            className={[
                              "inline-flex items-center gap-1 text-sm font-medium",
                              isDark ? "text-emerald-300" : "text-emerald-700",
                            ].join(" ")}
                          >
                            <CheckCircle size={15} />
                            Verified
                          </span>
                        ) : (
                          <span
                            className={[
                              "inline-flex items-center gap-1 text-sm font-medium",
                              isDark ? "text-red-300" : "text-red-700",
                            ].join(" ")}
                          >
                            <Ban size={15} />
                            Not verified
                          </span>
                        )}
                      </div>
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
                        "text-[11px] font-semibold uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      IB Balance
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-semibold",
                        isDark ? "text-emerald-300" : "text-emerald-700",
                      ].join(" ")}
                    >
                      {Number(item?.ibBalance || 0).toFixed(4)}
                    </p>

                    <div className="mt-4">
                      <p
                        className={[
                          "mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Referral Link
                      </p>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={link}
                          className={[
                            "flex-1 rounded-xl border px-3 py-2 text-sm outline-none",
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-white"
                              : "border-orange-200 bg-white text-slate-900",
                          ].join(" ")}
                        />
                        <button
                          onClick={() => copyToClipboard(link)}
                          className={[
                            "rounded-xl border p-2",
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-blue-300"
                              : "border-orange-200 bg-white text-blue-600",
                          ].join(" ")}
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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
    </div>
  );
};

export default IbUsers;