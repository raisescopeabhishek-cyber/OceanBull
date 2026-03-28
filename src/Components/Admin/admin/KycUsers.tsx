import React, { useEffect, useState } from "react";
import {
  Ban,
  CheckCircle,
  Image as ImageIcon,
  LoaderIcon,
  Search,
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
import { useSelector } from "react-redux";

const PAGE_LIMIT = 10;

const KycUsers = () => {
  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [kycUsers, setKycUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState<any>({});
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState<"" | "approve" | "reject">(
    ""
  );

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
        `/kyc-users?page=${currentPage}&limit=${PAGE_LIMIT}&search=${encodeURIComponent(
          debouncedSearch
        )}`
      );
      setPagination(res.data?.pagination || {});
      setKycUsers(res.data?.data || []);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching KYC users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (
    user: any,
    action: "approve" | "reject"
  ) => {
    setActionLoading(action);
    const toastId = toast.loading("Please wait...");
    try {
      const actionMessage =
        action === "approve"
          ? `<p>Your KYC has been successfully verified. Thank you for completing the verification process.</p>`
          : `<p>Unfortunately, your KYC verification was not successful. Please check your details and submit again.</p>`;

      const rejectionReason =
        action === "reject"
          ? `<div class="withdrawal-details">
              <p>Reason: <span class="highlight">${
                comment || "Contact Admin"
              }</span></p>
            </div>`
          : "";

      const customContent = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>KYC Verification Status</title>
<style>
body,html{margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f4f4f4}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:#19422df2;color:#fff;padding:20px 15px;text-align:center;border-radius:10px 10px 0 0}
.header h1{margin:0;font-size:22px;letter-spacing:1px}
.content{padding:10px 20px}
.withdrawal-details{background:#f8f8f8;border-left:4px solid #2d6a4f;padding:15px;margin:20px 0}
.highlight{font-weight:700;color:#0a2342}
.risk-warning{color:#C70039;padding:5px;font-size:12px;line-height:1.4}
.footer{background:#19422df2;color:#fff;text-align:center;padding:5px 10px;font-size:12px;border-radius:0 0 10px 10px}
.footer-info{margin-top:6px}
.footer-info a{color:#B6D0E2;text-decoration:none}
</style></head>
<body><div class="container">
<div class="header"><h1>${
        action === "approve" ? "KYC Approved" : "KYC Rejected"
      }</h1></div>
<div class="content">
<p>Dear ${user?.firstName || ""} ${user?.lastName || ""},</p>
${actionMessage}
${rejectionReason}
<p>Thank you for choosing us.</p>
<p>Happy trading!</p>
<p>Best regards,<br>The ${
        import.meta.env.VITE_WEBSITE_NAME || "Forex"
      } Team</p>
<hr>
<div class="risk-warning"><strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.<br><br>Our services are not for U.S. citizens or in jurisdictions where they violate local laws.</div>
</div>
<div class="footer">
  <div class="footer-info">
    <p>Website: <a href="https://${
      import.meta.env.VITE_EMAIL_WEBSITE || ""
    }">${import.meta.env.VITE_EMAIL_WEBSITE || ""}</a> |
    E-mail: <a href="mailto:${
      import.meta.env.VITE_EMAIL_EMAIL || ""
    }">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
    <p>© 2025 ${
      import.meta.env.VITE_WEBSITE_NAME || ""
    }. All Rights Reserved</p>
  </div>
</div>
</div></body></html>`;

      if (action === "approve") {
        await adminApi.put(`/update-user`, { id: user._id, kycVerified: true });
        await adminApi.put(`/user/${user?._id}/kyc-status`, {
          status: "approved",
        });

        toast.success("KYC Approved", { id: toastId });

        try {
          await adminApi.post(`/custom-mail`, {
            email: user?.email,
            content: customContent,
            subject: "KYC Approved",
          });
        } catch (err) {
          console.log("error sending mail", err);
        }
      } else {
        await adminApi.put(`/update-user`, { id: user._id, kycVerified: false });
        await adminApi.put(`/user/${user?._id}/kyc-status`, {
          status: "rejected",
        });

        toast.success("KYC Rejected", { id: toastId });

        try {
          await adminApi.post(`/custom-mail`, {
            email: user?.email,
            content: customContent,
            subject: "KYC Rejected",
          });
        } catch (err) {
          console.log("error sending mail", err);
        }
      }

      setComment("");
      setIsDialogOpen(false);
      await fetchUsersData();
    } catch (error: any) {
      console.error("Error updating KYC status:", error);
      toast.error(`${error?.response?.data?.message || "Something went wrong"}`, {
        id: toastId,
      });
    } finally {
      setActionLoading("");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const togglePreview = (item: any) => {
    setSelectedUser(item);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(handler);
  }, [filters.search]);

  useEffect(() => {
    fetchUsersData();
  }, [currentPage, debouncedSearch]);

  const imgUrl = (path?: string) =>
    path ? `${import.meta.env.VITE_API_BASE_URL}/${path}` : "";

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
                    Updated KYC Users
                  </h1>
                  <p
                    className={[
                      "mt-1 text-sm leading-6",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Search and manage all updated KYC requests from one place.
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
                  onClick={fetchUsersData}
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
            <table className="w-full min-w-[980px]">
              <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
                <tr
                  className={[
                    "border-b",
                    isDark ? "border-white/10" : "border-orange-200",
                  ].join(" ")}
                >
                  {[
                    "User",
                    "Total AC",
                    "Email Verified",
                    "Country",
                    "Updated At",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={[
                        "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                        heading === "Total AC" ||
                        heading === "Email Verified" ||
                        heading === "Country"
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
                    <td colSpan={6} className="px-5 py-12">
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
                ) : kycUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <p
                        className={[
                          "text-lg font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        No KYC users found
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
                  kycUsers.map((item: any) => (
                    <tr
                      key={item._id}
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
                            {item?.firstName || "Not found"} {item?.lastName || ""}
                          </p>
                          <p
                            className={[
                              "text-sm",
                              isDark ? "text-blue-300" : "text-primary-600",
                            ].join(" ")}
                          >
                            {item?.email || "Not found"}
                          </p>
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
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {item?.country ? (
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                              isDark
                                ? "bg-blue-500/10 text-blue-300"
                                : "bg-orange-50 text-orange-700",
                            ].join(" ")}
                          >
                            {item.country}
                          </span>
                        ) : (
                          <span className={isDark ? "text-white/45" : "text-slate-500"}>
                            N/A
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={[
                            "font-medium",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {CFformatDate(item?.updatedAt)}
                        </p>
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          {CFcalculateTimeSinceJoined(item?.updatedAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => togglePreview(item)}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                            isDark
                              ? "border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                              : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                          ].join(" ")}
                        >
                          <ImageIcon size={16} />
                          View
                        </button>
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
          ) : kycUsers.length === 0 ? (
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
                No KYC users found
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
            kycUsers.map((item: any) => (
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
                      {item?.firstName || "Not found"} {item?.lastName || ""}
                    </h3>
                    <p
                      className={[
                        "block truncate text-sm",
                        isDark ? "text-blue-300" : "text-primary-600",
                      ].join(" ")}
                    >
                      {item?.email || "Not found"}
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
                    <ImageIcon size={18} />
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
                      Total AC
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
                      Country
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {item?.country || "N/A"}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl p-3">
                    <p
                      className={[
                        "text-[11px] font-semibold uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      Email Verified
                    </p>
                    <div className="mt-1">
                      {item?.emailVerified ? (
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                            isDark
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700",
                          ].join(" ")}
                        >
                          <CheckCircle size={15} />
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
                          <Ban size={15} />
                          Unverified
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
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {CFformatDate(item?.updatedAt)}
                  </p>
                  <p
                    className={[
                      "text-xs",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    {CFcalculateTimeSinceJoined(item?.updatedAt)}
                  </p>
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

      {/* Dialog */}
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setComment("");
            setActionLoading("");
          }
        }}
      >
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
              Account Details
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className={isDark ? "text-white/70" : "text-slate-600"}>
                <div className="mt-4 space-y-6">
                  <div>
                    <h2
                      className={[
                        "mb-4 border-b pb-2 text-lg font-semibold",
                        isDark ? "border-white/10 text-white" : "border-orange-100 text-slate-900",
                      ].join(" ")}
                    >
                      KYC Details
                    </h2>

                    <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      <p>
                        Purpose:{" "}
                        <span className={isDark ? "font-semibold text-white" : "font-semibold text-slate-900"}>
                          {selectedUser?.kycDetails?.purpose || "--"}
                        </span>
                      </p>
                      <p>
                        Occupation:{" "}
                        <span className={isDark ? "font-semibold text-white" : "font-semibold text-slate-900"}>
                          {selectedUser?.kycDetails?.occupation || "--"}
                        </span>
                      </p>
                      <p>
                        Country of issue:{" "}
                        <span className={isDark ? "font-semibold text-white" : "font-semibold text-slate-900"}>
                          {selectedUser?.kycDetails?.countryOfIssue || "--"}
                        </span>
                      </p>
                      <p>
                        Document Type:{" "}
                        <span className={isDark ? "font-semibold text-white" : "font-semibold text-slate-900"}>
                          {selectedUser?.kycDetails?.documentType || "--"}
                        </span>
                      </p>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                      <KycImageCard
                        title="Front Side of Document"
                        src={selectedUser?.kycDetails?.frontSideOfDocument}
                        imgUrl={imgUrl}
                        isDark={isDark}
                      />
                      <KycImageCard
                        title="Back Side of Document"
                        src={selectedUser?.kycDetails?.backSideOfDocument}
                        imgUrl={imgUrl}
                        isDark={isDark}
                      />
                      <KycImageCard
                        title="Selfie With Document"
                        src={selectedUser?.kycDetails?.selfieWithDocument}
                        imgUrl={imgUrl}
                        isDark={isDark}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6">
            <div className="w-full">
              <h3
                className={[
                  "mb-4 border-b pb-2 text-lg font-semibold",
                  isDark ? "border-white/10 text-white" : "border-orange-100 text-slate-900",
                ].join(" ")}
              >
                Action
              </h3>

              <div className="flex flex-col gap-4">
                <textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={[
                    "min-h-24 w-full rounded-xl border px-3 py-2 outline-none transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40"
                      : "border-orange-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300",
                  ].join(" ")}
                />

                <div className="flex flex-wrap gap-3">
                  <AlertDialogCancel
                    onClick={() => setIsDialogOpen(false)}
                    className={[
                      "rounded-xl border px-4 py-2",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                        : "border-orange-200 bg-white text-slate-700 hover:bg-orange-50",
                    ].join(" ")}
                  >
                    Close
                  </AlertDialogCancel>

                  <button
                    className={[
                      "rounded-xl border px-4 py-2 text-white transition disabled:opacity-60",
                      "border-emerald-500 bg-emerald-600 hover:bg-emerald-700",
                    ].join(" ")}
                    onClick={() =>
                      selectedUser && handleConfirmAction(selectedUser, "approve")
                    }
                    disabled={actionLoading === "approve"}
                  >
                    {actionLoading === "approve" ? "Approving..." : "Approve"}
                  </button>

                  <button
                    className={[
                      "rounded-xl border px-4 py-2 text-white transition disabled:opacity-60",
                      "border-red-500 bg-red-600 hover:bg-red-700",
                    ].join(" ")}
                    onClick={() =>
                      selectedUser && handleConfirmAction(selectedUser, "reject")
                    }
                    disabled={actionLoading === "reject"}
                  >
                    {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KycUsers;

const KycImageCard = ({
  title,
  src,
  imgUrl,
  isDark,
}: {
  title: string;
  src?: string;
  imgUrl: (p?: string) => string;
  isDark: boolean;
}) => {
  return (
    <div
      className={[
        "rounded-xl border p-3",
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-orange-100 bg-orange-50/40",
      ].join(" ")}
    >
      <p
        className={[
          "mb-2 text-sm",
          isDark ? "text-white/70" : "text-slate-600",
        ].join(" ")}
      >
        {title}
      </p>

      {src ? (
        <>
          <img
            className="mx-auto max-h-56 w-auto rounded-lg"
            src={imgUrl(src)}
            alt={title}
          />
          <a
            target="_blank"
            rel="noreferrer"
            className={[
              "mt-2 block text-right text-sm",
              isDark ? "text-blue-300" : "text-blue-600",
            ].join(" ")}
            href={imgUrl(src)}
          >
            View Full Image
          </a>
        </>
      ) : (
        <div
          className={[
            "text-sm",
            isDark ? "text-white/45" : "text-slate-500",
          ].join(" ")}
        >
          Not uploaded
        </div>
      )}
    </div>
  );
};