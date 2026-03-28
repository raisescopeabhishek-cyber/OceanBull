import { useEffect, useState } from "react";
import {
  BadgeCheck,
  LoaderIcon,
  OctagonAlert,
  OctagonX,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedUser } from "@/redux/user/userSlice";
import UseUserHook from "@/hooks/user/UseUserHook";
import toast from "react-hot-toast";
import { RiUserSharedFill } from "react-icons/ri";
import { FaUserEdit } from "react-icons/fa";
import { adminApi } from "@/utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "@/utils/CustomFunctions";

const PAGE_LIMIT = 10;

const ManageUsers = () => {
  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    emailStatus: "all",
    kycStatus: "all",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.max(
    1,
    Math.ceil((pagination?.totalUsers || 0) / PAGE_LIMIT)
  );

  const updateFilter = (key, value) => {
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
      emailStatus: "all",
      kycStatus: "all",
    });
  };

  const userRedirectHandler = (user) => {
    getReset();
    dispatch(setLoggedUser(user));
    window.open("/user/dashboard", "_blank");
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PAGE_LIMIT.toString(),
        search: debouncedSearch,
      });

      if (filters.emailStatus === "verified") {
        params.append("emailVerified", "true");
      } else if (filters.emailStatus === "unverified") {
        params.append("emailVerified", "false");
      }

      if (filters.kycStatus === "verified") {
        params.append("kycVerified", "true");
      } else if (filters.kycStatus === "unverified") {
        params.append("kycVerified", "false");
      }

      const res = await adminApi.get(`/get-users?${params.toString()}`);
      const finalRes = res?.data;

      setUsers(finalRes?.data || []);
      setPagination(finalRes?.pagination || {});
    } catch (error) {
      console.log("Error fetching users:", error);
      toast.error("Something went wrong while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchUsersData();
  }, [currentPage, debouncedSearch, filters.emailStatus, filters.kycStatus]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
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
              <div>
                <h1
                  className={[
                    "text-xl font-bold sm:text-2xl",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  Client Management
                </h1>
                <p
                  className={[
                    "mt-1 text-sm leading-6",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Search, filter and manage all platform users from one place.
                </p>
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
                  onClick={()=>navigate('/admin/kyc-users')}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  Manage Kyc
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
                  Email Status
                </label>
                <select
                  value={filters.emailStatus}
                  onChange={(e) => updateFilter("emailStatus", e.target.value)}
                  className={[
                    "h-11 w-full rounded-xl border px-3 text-sm outline-none transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/15"
                      : "border-orange-200 bg-white/80 text-slate-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/60",
                  ].join(" ")}
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Email</option>
                  <option value="unverified">Unverified Email</option>
                </select>
              </div>

              <div>
                <label
                  className={[
                    "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  KYC Status
                </label>
                <select
                  value={filters.kycStatus}
                  onChange={(e) => updateFilter("kycStatus", e.target.value)}
                  className={[
                    "h-11 w-full rounded-xl border px-3 text-sm outline-none transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/15"
                      : "border-orange-200 bg-white/80 text-slate-900 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/60",
                  ].join(" ")}
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified KYC</option>
                  <option value="unverified">Unverified KYC</option>
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
            <table className="w-full min-w-[1100px]">
              <thead className={[isDark ? "bg-white/[0.03]" : "bg-white/40"].join(" ")}>
                <tr
                  className={[
                    "border-b",
                    isDark ? "border-white/10" : "border-orange-200",
                  ].join(" ")}
                >
                  {["User", "Country", "Email", "KYC", "Accounts", "Joined", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className={[
                          "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12">
                      <div
                        className={[
                          "flex items-center justify-center gap-3",
                          isDark ? "text-white/65" : "text-slate-600",
                        ].join(" ")}
                      >
                        <LoaderIcon className="animate-spin" />
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center">
                      <p
                        className={[
                          "text-lg font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        No users found
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
                  users.map((user) => (
                    <tr
                      key={user?._id}
                      className={[
                        "border-b transition",
                        isDark
                          ? "border-white/10 hover:bg-white/[0.03]"
                          : "border-orange-200 hover:bg-orange-50/40",
                      ].join(" ")}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => userRedirectHandler(user)}
                            className={[
                              "rounded-xl border p-2 transition",
                              isDark
                                ? "border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                                : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100",
                            ].join(" ")}
                          >
                            <RiUserSharedFill size={18} />
                          </button>

                          <div>
                            <p
                              className={[
                                "font-semibold",
                                isDark ? "text-white" : "text-slate-900",
                              ].join(" ")}
                            >
                              {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                                "N/A"}
                            </p>
                            <Link
                              to={`/admin/user-detail/${user?._id}`}
                              className={[
                                "text-sm hover:underline",
                                isDark ? "text-blue-300" : "text-primary-600",
                              ].join(" ")}
                            >
                              {user?.email}
                            </Link>
                          </div>
                        </div>
                      </td>

                      <td
                        className={[
                          "px-5 py-4",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        {user?.country ? (
                          user.country
                        ) : (
                          <div
                            className={[
                              "flex items-center gap-2",
                              isDark ? "text-white/40" : "text-slate-500",
                            ].join(" ")}
                          >
                            <OctagonAlert size={16} className="text-yellow-500" />
                            Not Added
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user?.emailVerified ? (
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                              isDark
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-emerald-50 text-emerald-700",
                            ].join(" ")}
                          >
                            <BadgeCheck size={16} />
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
                            <OctagonX size={16} />
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user?.kycVerified ? (
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                              isDark
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-emerald-50 text-emerald-700",
                            ].join(" ")}
                          >
                            <BadgeCheck size={16} />
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
                            <OctagonX size={16} />
                            Unverified
                          </span>
                        )}
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
                          {user?.accounts?.length || 0}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={[
                            "font-medium",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {CFformatDate(user?.createdAt)}
                        </p>
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          {CFcalculateTimeSinceJoined(user?.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/user-detail/${user?._id}`}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                              : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                          ].join(" ")}
                        >
                          <FaUserEdit size={16} />
                          Details
                        </Link>
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
                <span>Loading users...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
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
                No users found
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
            users.map((user) => (
              <div
                key={user?._id}
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
                      {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                        "N/A"}
                    </h3>
                    <Link
                      to={`/admin/user-detail/${user?._id}`}
                      className={[
                        "block truncate text-sm hover:underline",
                        isDark ? "text-blue-300" : "text-primary-600",
                      ].join(" ")}
                    >
                      {user?.email}
                    </Link>
                  </div>

                  <button
                    onClick={() => userRedirectHandler(user)}
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
                      Country
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {user?.country || "Not Added"}
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
                      Accounts
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {user?.accounts?.length || 0}
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
                      {user?.emailVerified ? (
                        <span
                          className={[
                            "inline-flex items-center gap-1 text-sm font-medium",
                            isDark ? "text-emerald-300" : "text-emerald-700",
                          ].join(" ")}
                        >
                          <BadgeCheck size={15} />
                          Verified
                        </span>
                      ) : (
                        <span
                          className={[
                            "inline-flex items-center gap-1 text-sm font-medium",
                            isDark ? "text-red-300" : "text-red-700",
                          ].join(" ")}
                        >
                          <OctagonX size={15} />
                          Unverified
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
                      {user?.kycVerified ? (
                        <span
                          className={[
                            "inline-flex items-center gap-1 text-sm font-medium",
                            isDark ? "text-emerald-300" : "text-emerald-700",
                          ].join(" ")}
                        >
                          <BadgeCheck size={15} />
                          Verified
                        </span>
                      ) : (
                        <span
                          className={[
                            "inline-flex items-center gap-1 text-sm font-medium",
                            isDark ? "text-red-300" : "text-red-700",
                          ].join(" ")}
                        >
                          <OctagonX size={15} />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "mt-4 flex items-center justify-between gap-3 border-t pt-4",
                    isDark ? "border-white/10" : "border-orange-100/80",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p
                      className={[
                        "text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {CFformatDate(user?.createdAt)}
                    </p>
                    <p
                      className={[
                        "text-xs",
                        isDark ? "text-white/40" : "text-slate-500",
                      ].join(" ")}
                    >
                      {CFcalculateTimeSinceJoined(user?.createdAt)}
                    </p>
                  </div>

                  <Link
                    to={`/admin/user-detail/${user?._id}`}
                    className={[
                      "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                        : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                    ].join(" ")}
                  >
                    <FaUserEdit size={15} />
                    Details
                  </Link>
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
    </div>
  );
};

export default ManageUsers;