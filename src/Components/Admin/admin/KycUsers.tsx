import React, { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle,
  Image as ImageIcon,
  Loader,
  Search,
  ArrowLeft,
  RefreshCw,
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

// ✨ ambient visuals
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";
import { useSelector } from "react-redux";

/* ==================== Theme helpers (RGB strings -> CSS) =================== */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};
const rgb = (v: any) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};
const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const clampRadius = (r: any) => {
  const v = String(r ?? "14px").trim();
  if (v === "0" || v === "0px") return "0px";
  return v || "14px";
};

const KycUsers = () => {
  const PAGE_SIZE = 10;

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [kycUsers, setKycUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "">("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const [pagination, setPagination] = useState<any>({});
  const [comment, setComment] = useState("");

  // ✅ THEME FROM REDUX (user slice)
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const radius = clampRadius(theme?.radius);
  const effectsEnabled = theme?.effectsEnabled !== false;
  const pattern = theme?.pattern;

  const C = useMemo(() => {
    const t = theme || {};
    return {
      bg: t.bg ?? "0 0 0",
      fg: t.fg ?? "255 255 255",
      mutedFg: t.mutedFg ?? "203 213 225",
      muted: t.muted ?? "148 163 184",
      border: t.border ?? t.inputBorder ?? "100 116 139",
      card: t.card ?? t.surface2 ?? "18 18 18",
      surface1: t.surface1 ?? t.bg ?? "0 0 0",
      surface2: t.surface2 ?? t.card ?? "18 18 18",
      surface3: t.surface3 ?? "30 30 30",
      accent: t.accent ?? "59 130 246",
      ring: t.ring ?? t.accent ?? "59 130 246",
      glow: t.glow ?? t.accent ?? "59 130 246",
      gradientFrom: t.gradientFrom ?? t.accent ?? "59 130 246",
      gradientTo: t.gradientTo ?? "147 51 234",
      headerRow: t.headerRow ?? "30 41 59",
      rowHover: t.rowHover ?? "15 23 42",
      input: t.input ?? t.surface2 ?? "18 18 18",
      inputBorder: t.inputBorder ?? t.border ?? "100 116 139",
      success: t.success ?? "34 197 94",
      danger: t.danger ?? "244 63 94",
      warning: t.warning ?? "234 179 8",
      info: t.info ?? "56 189 248",
    };
  }, [theme]);

  /* ==================== Pagination helpers ==================== */
  const DOTS = "...";
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((pagination?.totalUsers || 0) / PAGE_SIZE)
  );

  const getPaginationRange = (
    total: number,
    current: number,
    siblingCount = 1
  ): Array<number | string> => {
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPageNumbers >= total) return range(1, total);

    const leftSiblingIndex = Math.max(current - siblingCount, 1);
    const rightSiblingIndex = Math.min(current + siblingCount, total);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < total - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + siblingCount * 2;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, total];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + siblingCount * 2;
      const rightRange = range(total - rightItemCount + 1, total);
      return [1, DOTS, ...rightRange];
    }

    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [1, DOTS, ...middleRange, DOTS, total];
  };

  const paginationRange = getPaginationRange(totalPages, currentPage, 1);

  /* ==================== API ==================== */
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        `/kyc-users?page=${currentPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(
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

  const handleSearchChange = (e: any) => setSearchQuery(e.target.value);

  const handleConfirmAction = async (
    user: any,
    action: "approve" | "reject"
  ) => {
    setActionType(action);
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
          setComment("");
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
          setComment("");
        } catch (err) {
          console.log("error sending mail", err);
        }
      }

      fetchUsersData();
    } catch (error: any) {
      console.error("Error updating KYC status:", error);
      toast.error(`${error?.response?.data?.message || "Something went wrong"}`, {
        id: toastId,
      });
    } finally {
      setIsDialogOpen(false);
      setActionType("");
    }
  };

  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage((p) => p - 1);
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const togglePreview = (item: any) => {
    setSelectedUser(item);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  const imgUrl = (path?: string) =>
    path ? `${import.meta.env.VITE_API_BASE_URL}/${path}` : "";

  /* ==================== Theme-driven styles ==================== */
  const pageStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${rgba(C.bg, 1)}, ${rgba(
      C.surface1,
      1
    )}, ${rgba(C.bg, 1)})`,
    color: rgb(C.fg),
  };

  const topBarStyle: React.CSSProperties = {
    background: `linear-gradient(180deg, ${rgba(C.bg, 0.82)}, transparent)`,
    borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
    boxShadow: effectsEnabled ? `0 10px 30px ${rgba(C.shadowColor ?? C.bg, 0.18)}` : undefined,
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: `calc(${radius} + 10px)`,
    border: `1px solid ${rgba(C.border, 0.20)}`,
    background: `linear-gradient(135deg, ${rgba(C.card, 0.80)}, ${rgba(
      C.surface2,
      0.55
    )}, ${rgba(C.card, 0.80)})`,
    boxShadow: effectsEnabled ? `0 18px 55px ${rgba(C.bg, 0.50)}` : undefined,
  };

  const headerRowStyle: React.CSSProperties = {
    background: `linear-gradient(180deg, ${rgba(C.headerRow, 0.75)}, ${rgba(
      C.headerRow,
      0.45
    )})`,
    borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
  };

  const pill = (tone: "accent" | "info" | "success" | "danger") => {
    const base =
      tone === "accent"
        ? C.accent
        : tone === "info"
        ? C.info
        : tone === "success"
        ? C.success
        : C.danger;

    return {
      borderRadius: "999px",
      border: `1px solid ${rgba(base, 0.35)}`,
      background: rgba(base, 0.10),
      color: rgba(base, 0.95),
    } as React.CSSProperties;
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    background: rgba(C.input, 0.22),
    border: `1px solid ${rgba(C.inputBorder, 0.35)}`,
    color: rgb(C.fg),
    boxShadow: effectsEnabled ? `0 0 0 1px ${rgba(C.ring, 0.08)} inset` : undefined,
  };

  const buttonBase: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.border, 0.20)}`,
    background: rgba(C.surface2, 0.30),
    color: rgba(C.fg, 0.90),
  };

  const primaryBtn: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.accent, 0.30)}`,
    background: `linear-gradient(90deg, ${rgba(C.gradientFrom, 0.32)}, ${rgba(
      C.gradientTo,
      0.32
    )})`,
    color: rgb(C.fg),
    boxShadow: effectsEnabled ? `0 0 26px ${rgba(C.glow, 0.18)}` : undefined,
  };

  const approveBtn: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.success, 0.35)}`,
    background: `linear-gradient(90deg, ${rgba(C.success, 0.75)}, ${rgba(
      C.success,
      0.55
    )})`,
    color: "white",
  };

  const rejectBtn: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.danger, 0.35)}`,
    background: `linear-gradient(90deg, ${rgba(C.danger, 0.75)}, ${rgba(
      C.danger,
      0.55
    )})`,
    color: "white",
  };

  const rowStyle = (hovered: boolean) =>
    ({
      background: hovered ? rgba(C.rowHover, 0.22) : rgba(C.surface2, 0.10),
      borderBottom: `1px solid ${rgba(C.border, 0.14)}`,
      transition: "background 180ms ease",
    } as React.CSSProperties);

  const gridOverlayStyle =
    pattern === "grid"
      ? ({
          opacity: effectsEnabled ? 0.10 : 0,
          backgroundImage: `linear-gradient(${rgba(C.accent, 0.22)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(C.accent, 0.22)} 1px, transparent 1px)`,
          backgroundSize: "46px 46px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
        } as React.CSSProperties)
      : ({ opacity: 0 } as React.CSSProperties);

  return (
    <div className="relative min-h-screen" style={pageStyle}>
      {/* ambient (your existing utilities) */}
      <AnimatedGrid />
      <FloatingParticles />

      {/* theme overlay grid (so theme always reflects) */}
      <div className="pointer-events-none absolute inset-0" style={gridOverlayStyle} />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky controls */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 backdrop-blur-md"
          style={topBarStyle}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 transition-all"
                style={buttonBase}
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <h1
                className="text-2xl md:text-3xl font-bold drop-shadow"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${rgb(C.gradientFrom)}, ${rgb(
                    C.gradientTo
                  )})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Updated KYC Users
              </h1>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Name / Email"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-9 py-2.5 outline-none"
                  style={inputStyle}
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: rgba(C.mutedFg, 0.75) }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: rgba(C.mutedFg, 0.9) }}
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={fetchUsersData}
                disabled={loading}
                className="px-4 py-2.5 transition-all flex items-center gap-2"
                style={primaryBtn}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="mt-6 overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto relative">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="w-full min-w-[880px] whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr style={headerRowStyle}>
                    <th className="py-3 px-4 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      User | Email
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      Total AC
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      Email Verified
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      Country
                    </th>
                    <th className="py-3 px-4 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      Updated At
                    </th>
                    <th className="py-3 px-4 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-10">
                        <div
                          className="flex justify-center items-center gap-3"
                          style={{ color: rgba(C.mutedFg, 0.9) }}
                        >
                          <span>Loading...</span>
                          <Loader className="animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : kycUsers?.length ? (
                    kycUsers.map((item: any) => (
                      <KycRow
                        key={item._id}
                        item={item}
                        C={C}
                        pill={pill}
                        onView={() => togglePreview(item)}
                        rowStyle={rowStyle}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <div className="text-center" style={{ color: rgba(C.mutedFg, 0.8) }}>
                          No KYC users found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* footer hint */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3"
            style={{
              borderTop: `1px solid ${rgba(C.border, 0.14)}`,
              background: rgba(C.surface2, 0.18),
            }}
          >
            <div className="text-xs sm:text-sm" style={{ color: rgba(C.mutedFg, 0.85) }}>
              Total records:{" "}
              <span style={{ color: rgba(C.fg, 0.95) }}>{pagination?.totalUsers || 0}</span>
            </div>
            <div className="text-xs sm:text-sm" style={{ color: rgba(C.mutedFg, 0.85) }}>
              Page <span style={{ color: rgba(C.fg, 0.95) }}>{currentPage}</span> of{" "}
              <span style={{ color: rgba(C.fg, 0.95) }}>{totalPages}</span>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 transition-all border"
              style={{
                borderRadius: `calc(${radius} + 6px)`,
                borderColor: rgba(C.border, currentPage === 1 ? 0.12 : 0.20),
                background: currentPage === 1 ? rgba(C.surface2, 0.18) : rgba(C.surface2, 0.28),
                color: currentPage === 1 ? rgba(C.mutedFg, 0.45) : rgba(C.fg, 0.90),
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {paginationRange.map((item, idx) =>
                item === DOTS ? (
                  <span
                    key={`dots-${idx}`}
                    className="px-3 py-2 select-none"
                    style={{ color: rgba(C.mutedFg, 0.6) }}
                  >
                    {DOTS}
                  </span>
                ) : (
                  <button
                    key={`page-${item}`}
                    onClick={() => goToPage(item as number)}
                    className="min-w-[40px] px-3 py-2 border transition-all"
                    style={{
                      borderRadius: `calc(${radius} + 6px)`,
                      borderColor:
                        currentPage === item ? rgba(C.accent, 0.35) : rgba(C.border, 0.18),
                      background:
                        currentPage === item
                          ? `linear-gradient(90deg, ${rgba(C.gradientFrom, 0.26)}, ${rgba(
                              C.gradientTo,
                              0.26
                            )})`
                          : rgba(C.surface2, 0.28),
                      color: currentPage === item ? rgba(C.fg, 0.96) : rgba(C.fg, 0.88),
                      boxShadow:
                        currentPage === item && effectsEnabled
                          ? `0 0 22px ${rgba(C.glow, 0.18)}`
                          : "none",
                    }}
                    aria-current={currentPage === item ? "page" : undefined}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 transition-all border"
              style={{
                borderRadius: `calc(${radius} + 6px)`,
                borderColor: rgba(C.border, currentPage === totalPages ? 0.12 : 0.20),
                background:
                  currentPage === totalPages ? rgba(C.surface2, 0.18) : rgba(C.surface2, 0.28),
                color:
                  currentPage === totalPages ? rgba(C.mutedFg, 0.45) : rgba(C.fg, 0.90),
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>

          <span className="text-xs" style={{ color: rgba(C.mutedFg, 0.75) }}>
            Page <span style={{ color: rgba(C.fg, 0.95) }}>{currentPage}</span> of{" "}
            <span style={{ color: rgba(C.fg, 0.95) }}>{totalPages}</span>
          </span>
        </div>
      </div>

      {/* Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent
          className="max-w-3xl backdrop-blur-xl"
          style={{
            borderRadius: `calc(${radius} + 10px)`,
            background: `linear-gradient(135deg, ${rgba(C.card, 0.92)}, ${rgba(
              C.surface2,
              0.75
            )})`,
            border: `1px solid ${rgba(C.border, 0.22)}`,
            color: rgb(C.fg),
            boxShadow: effectsEnabled ? `0 30px 90px ${rgba(C.bg, 0.65)}` : undefined,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Account Details
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-4 space-y-6">
                <div>
                  <h2
                    className="text-lg font-semibold pb-2 mb-4"
                    style={{
                      borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
                    }}
                  >
                    KYC Details
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>Purpose:</span>{" "}
                      <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                        {selectedUser?.kycDetails?.purpose || "--"}
                      </span>
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>Occupation:</span>{" "}
                      <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                        {selectedUser?.kycDetails?.occupation || "--"}
                      </span>
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>
                        Country of issue:
                      </span>{" "}
                      <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                        {selectedUser?.kycDetails?.countryOfIssue || "--"}
                      </span>
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>
                        Document Type:
                      </span>{" "}
                      <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                        {selectedUser?.kycDetails?.documentType || "--"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <KycImageCard
                      title="Front Side of Document"
                      src={selectedUser?.kycDetails?.frontSideOfDocument}
                      imgUrl={imgUrl}
                      C={C}
                      radius={radius}
                    />
                    <KycImageCard
                      title="Back Side of Document"
                      src={selectedUser?.kycDetails?.backSideOfDocument}
                      imgUrl={imgUrl}
                      C={C}
                      radius={radius}
                    />
                    <KycImageCard
                      title="Selfie With Document"
                      src={selectedUser?.kycDetails?.selfieWithDocument}
                      imgUrl={imgUrl}
                      C={C}
                      radius={radius}
                    />
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6">
            <div className="w-full">
              <h3
                className="text-lg font-semibold pb-2 mb-4"
                style={{ borderBottom: `1px solid ${rgba(C.border, 0.18)}` }}
              >
                Action
              </h3>

              <div className="flex flex-col gap-4">
                <textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-24 px-3 py-2 w-full outline-none"
                  style={{
                    borderRadius: `calc(${radius} + 6px)`,
                    background: rgba(C.surface2, 0.22),
                    border: `1px solid ${rgba(C.inputBorder, 0.35)}`,
                    color: rgb(C.fg),
                    boxShadow: `0 0 0 1px ${rgba(C.ring, 0.08)} inset`,
                  }}
                />

                <div className="flex flex-wrap gap-3">
                  <AlertDialogCancel
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 transition-all"
                    style={buttonBase}
                  >
                    Close
                  </AlertDialogCancel>

                  <button
                    className="px-4 py-2 transition-all"
                    style={approveBtn}
                    onClick={() =>
                      selectedUser && handleConfirmAction(selectedUser, "approve")
                    }
                    disabled={actionType === "approve"}
                  >
                    {actionType === "approve" ? "Approving..." : "Approve"}
                  </button>

                  <button
                    className="px-4 py-2 transition-all"
                    style={rejectBtn}
                    onClick={() =>
                      selectedUser && handleConfirmAction(selectedUser, "reject")
                    }
                    disabled={actionType === "reject"}
                  >
                    {actionType === "reject" ? "Rejecting..." : "Reject"}
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

/* ==================== Small components ==================== */
const KycRow = ({
  item,
  C,
  pill,
  onView,
  rowStyle,
}: {
  item: any;
  C: any;
  pill: (tone: "accent" | "info" | "success" | "danger") => React.CSSProperties;
  onView: () => void;
  rowStyle: (hovered: boolean) => React.CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      style={rowStyle(hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="py-3 px-4">
        <div className="font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
          {item?.firstName || "Not found"} {item?.lastName || ""}
        </div>
        <div className="text-sm" style={{ color: rgba(C.mutedFg, 0.75) }}>
          {item?.email || "Not found"}
        </div>
      </td>

      <td className="py-3 px-4 text-center">
        <span className="inline-flex px-3 py-1 text-sm" style={pill("info")}>
          {item?.accounts?.length || 0}
        </span>
      </td>

      <td className="py-3 px-4 text-center">
        {item?.emailVerified ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm" style={pill("success")}>
            <CheckCircle className="w-4 h-4" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm" style={pill("danger")}>
            <Ban className="w-4 h-4" /> Unverified
          </span>
        )}
      </td>

      <td className="py-3 px-4 text-center">
        {item?.country ? (
          <span className="inline-flex px-3 py-1 text-sm" style={pill("accent")}>
            {item.country}
          </span>
        ) : (
          <span style={{ color: rgba(C.mutedFg, 0.7) }}>N/A</span>
        )}
      </td>

      <td className="py-3 whitespace-nowrap px-4">
        <div style={{ color: rgba(C.fg, 0.92) }}>{CFformatDate(item?.updatedAt)}</div>
        <div className="text-xs" style={{ color: rgba(C.mutedFg, 0.70) }}>
          {CFcalculateTimeSinceJoined(item?.updatedAt)}
        </div>
      </td>

      <td className="py-3 px-4">
        <button
          className="inline-flex items-center gap-2 hover:scale-105 transition-all"
          onClick={onView}
          style={{ color: rgba(C.accent, 0.95) }}
        >
          <ImageIcon className="w-4 h-4" /> View
        </button>
      </td>
    </tr>
  );
};

const KycImageCard = ({
  title,
  src,
  imgUrl,
  C,
  radius,
}: {
  title: string;
  src?: string;
  imgUrl: (p?: string) => string;
  C: any;
  radius: string;
}) => {
  return (
    <div
      className="p-3"
      style={{
        borderRadius: `calc(${radius} + 6px)`,
        border: `1px solid ${rgba(C.border, 0.18)}`,
        background: rgba(C.surface2, 0.18),
      }}
    >
      <p className="text-sm mb-2" style={{ color: rgba(C.mutedFg, 0.85) }}>
        {title}
      </p>

      {src ? (
        <>
          <img
            className="mx-auto max-h-56 w-auto"
            style={{ borderRadius: `calc(${radius} + 2px)` }}
            src={imgUrl(src)}
            alt={title}
          />
          <a
            target="_blank"
            rel="noreferrer"
            className="block text-right mt-2"
            style={{ color: rgba(C.accent, 0.95) }}
            href={imgUrl(src)}
          >
            View Full Image
          </a>
        </>
      ) : (
        <div className="text-sm" style={{ color: rgba(C.mutedFg, 0.65) }}>
          Not uploaded
        </div>
      )}
    </div>
  );
};
