import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import {
  Search,
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LoaderIcon,
} from "lucide-react";
import { useSelector } from "react-redux";

const PAGE_LIMIT = 10;

const LoginLogs = () => {
  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [logsData, setLogsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const fetchLogsData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/logs`);
      setLogsData((res.data?.data || []).reverse());
    } catch (error) {
      console.log("error in fetch login logs", error);
      toast.error("Data fetching failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const filteredData = logsData?.filter((item: any) => {
    if (!debouncedSearch.trim()) return true;

    const searchLower = debouncedSearch.toLowerCase().trim();
    const searchableFields = [
      item?.userId?.firstName,
      item?.userId?.lastName,
      item?.userId?.email,
      item?.userId?.phone,
      item?.ip,
      item?.browser,
      item?.os,
      item?.country,
    ];

    return searchableFields.some((field) =>
      field?.toLowerCase?.()?.includes(searchLower)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil((filteredData?.length || 0) / PAGE_LIMIT)
  );

  const startIndex = (currentPage - 1) * PAGE_LIMIT;
  const paginatedData = filteredData?.slice(startIndex, startIndex + PAGE_LIMIT);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  function formatDate(isoDateString?: string) {
    if (!isoDateString) return "--";
    const date = new Date(isoDateString);

    const formattedDate = date.toLocaleDateString("en-GB", {
      year: "numeric",
      day: "2-digit",
      month: "2-digit",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return `${formattedDate}, ${formattedTime}`;
  }

  function calculateTimeSinceJoined(isoDateString?: string) {
    if (!isoDateString) return "--";
    const joinDate = new Date(isoDateString);
    const today = new Date();

    const timeDifference = today.getTime() - joinDate.getTime();
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    return parts.length ? `${parts.join(", ")} ago` : "less than a minute ago";
  }

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
                    Login Logs
                  </h1>
                  <p
                    className={[
                      "mt-1 text-sm leading-6",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Search and review all login logs from one place.
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
                    placeholder="Search by any field"
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
                  onClick={fetchLogsData}
                  disabled={loading}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                      : "border-orange-200 bg-orange-500 text-white hover:bg-orange-600",
                  ].join(" ")}
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  {loading ? "Refreshing..." : "Refresh"}
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

          {/* Expand / Collapse Row */}
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
                  {filteredData?.length || 0}
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
            <table className="w-full min-w-[1000px]">
              <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
                <tr
                  className={[
                    "border-b",
                    isDark ? "border-white/10" : "border-orange-200",
                  ].join(" ")}
                >
                  {[
                    "Name / Email",
                    "Phone",
                    "IP",
                    "Browser",
                    "OS",
                    "Country",
                    "Timestamp",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={[
                        "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                        heading !== "Name / Email" && heading !== "Timestamp"
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
                        <span>Loading logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData?.length ? (
                  paginatedData.map((value: any, index: number) => (
                    <tr
                      key={index}
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
                            {value?.userId?.firstName || "--"}
                          </p>
                          <p
                            className={[
                              "text-sm",
                              isDark ? "text-blue-300" : "text-primary-600",
                            ].join(" ")}
                          >
                            {value?.userId?.email || "--"}
                          </p>
                        </div>
                      </td>

                      <td
                        className={[
                          "px-5 py-4 text-center",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        {value?.userId?.phone || "--"}
                      </td>

                      <td
                        className={[
                          "px-5 py-4 text-center",
                          isDark ? "text-white/80" : "text-slate-700",
                        ].join(" ")}
                      >
                        {value?.ip || "--"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {value?.browser ? (
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                              isDark
                                ? "bg-sky-500/10 text-sky-300"
                                : "bg-sky-50 text-sky-700",
                            ].join(" ")}
                          >
                            {value?.browser}
                          </span>
                        ) : (
                          <span className={isDark ? "text-white/45" : "text-slate-500"}>
                            --
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {value?.os ? (
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                              isDark
                                ? "bg-yellow-500/10 text-yellow-300"
                                : "bg-yellow-50 text-yellow-700",
                            ].join(" ")}
                          >
                            {value?.os}
                          </span>
                        ) : (
                          <span className={isDark ? "text-white/45" : "text-slate-500"}>
                            --
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {value?.country ? (
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                              isDark
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-emerald-50 text-emerald-700",
                            ].join(" ")}
                          >
                            {value?.country}
                          </span>
                        ) : (
                          <span className={isDark ? "text-white/45" : "text-slate-500"}>
                            --
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <p
                          className={[
                            "font-medium",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {formatDate(value?.updatedAt)}
                        </p>
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          {calculateTimeSinceJoined(value?.updatedAt)}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p
                        className={[
                          "text-lg font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        No results found
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        No logs found for “{debouncedSearch}”
                      </p>
                    </td>
                  </tr>
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
                <span>Loading logs...</span>
              </div>
            </div>
          ) : paginatedData?.length ? (
            paginatedData.map((value: any, index: number) => (
              <div
                key={index}
                className={[
                  "rounded-[24px] border p-4 backdrop-blur-xl",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-100/80 bg-white/65",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <h3
                    className={[
                      "truncate text-base font-semibold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {value?.userId?.firstName || "--"}
                  </h3>
                  <p
                    className={[
                      "block truncate text-sm",
                      isDark ? "text-blue-300" : "text-primary-600",
                    ].join(" ")}
                  >
                    {value?.userId?.email || "--"}
                  </p>
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
                      Phone
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {value?.userId?.phone || "--"}
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
                      IP
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {value?.ip || "--"}
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
                      Browser
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {value?.browser || "--"}
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
                      OS
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {value?.os || "--"}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl p-3">
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
                      {value?.country || "--"}
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
                    {formatDate(value?.updatedAt)}
                  </p>
                  <p
                    className={[
                      "text-xs",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    {calculateTimeSinceJoined(value?.updatedAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
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
                No results found
              </p>
              <p
                className={[
                  "mt-1 text-sm",
                  isDark ? "text-white/40" : "text-slate-500",
                ].join(" ")}
              >
                No logs found for “{debouncedSearch}”
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredData?.length > 0 && (
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
                Showing{" "}
                <span
                  className={[
                    "font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span
                  className={[
                    "font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {Math.min(startIndex + PAGE_LIMIT, filteredData.length)}
                </span>{" "}
                of{" "}
                <span
                  className={[
                    "font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {filteredData.length}
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
        )}
      </div>
    </div>
  );
};

export default LoginLogs;