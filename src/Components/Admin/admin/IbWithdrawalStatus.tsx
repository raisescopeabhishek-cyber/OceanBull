import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  CircleCheckBig,
  CircleX,
  Loader,
  Search,
  WalletCardsIcon,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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

// ✨ ambient visuals (shared theme)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

// ✅ theme redux
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
  return v || "14px";
};
const safeNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ==================== Motion variants =================== */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

type StatCardProps = {
  icon: JSX.Element;
  amount: string;
  label: string;
  link: string;
  allLoading: boolean;

  // theme
  C: any;
  radius: string;
  effectsEnabled: boolean;
};

// ✅ theme-based stat card
const StatCard = ({
  icon,
  amount,
  label,
  link,
  allLoading,
  C,
  radius,
  effectsEnabled,
}: StatCardProps) => (
  <Link to={link} className="block">
    <motion.div
      variants={cardVariants}
      className="relative p-4 border overflow-hidden transition-all"
      style={{
        borderRadius: `calc(${radius} + 10px)`,
        border: `1px solid ${rgba(C.border, 0.2)}`,
        background: `linear-gradient(135deg, ${rgba(
          C.card,
          0.82
        )}, ${rgba(C.surface2, 0.55)}, ${rgba(C.card, 0.82)})`,
        boxShadow: effectsEnabled ? `0 18px 55px ${rgba(C.bg, 0.55)}` : undefined,
      }}
    >
      <div
        className="absolute -inset-px blur-md"
        style={{
          opacity: effectsEnabled ? 0.2 : 0,
          borderRadius: `calc(${radius} + 10px)`,
          background: `linear-gradient(90deg, ${rgba(
            C.gradientFrom,
            0.9
          )}, ${rgba(C.accent, 0.9)}, ${rgba(C.gradientTo, 0.9)})`,
        }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{
            borderRadius: `calc(${radius} + 6px)`,
            background: `linear-gradient(90deg, ${rgba(
              C.gradientFrom,
              0.95
            )}, ${rgba(C.gradientTo, 0.95)})`,
            boxShadow: effectsEnabled
              ? `0 0 22px ${rgba(C.glow, 0.2)}`
              : undefined,
          }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs" style={{ color: rgba(C.mutedFg, 0.75) }}>
            {label}
          </p>
          <p className="text-xl font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
            {allLoading ? "Loading…" : amount}
          </p>
        </div>
      </div>
    </motion.div>
  </Link>
);

// map raw method keys to nice labels
const displayMethod = (m?: string) => {
  switch ((m || "").toLowerCase()) {
    case "usdttrc20":
    case "usdt(trc20)":
    case "usdt_trc20":
    case "usdt-trc20":
      return "USDT (TRC20)";
    case "usdtbep20":
    case "usdt(bep20)":
    case "usdt_bep20":
    case "usdt-bep20":
      return "USDT (BEP20)";
    case "binanceid":
    case "binance id":
      return "Binance ID";
    case "btcaddress":
    case "btc address":
      return "BTC Address";
    case "bank transfer":
    case "bank":
      return "Bank Transfer";
    default:
      return m || "—";
  }
};

const IbWithdrawalStatus = () => {
  const { status } = useParams();
  const PAGE_SIZE = 10;

  // ✅ theme
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
      border: t.border ?? t.inputBorder ?? "100 116 139",
      card: t.card ?? t.surface2 ?? "18 18 18",
      surface1: t.surface1 ?? t.bg ?? "0 0 0",
      surface2: t.surface2 ?? t.card ?? "18 18 18",
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
      warning: t.warning ?? "234 179 8",
      danger: t.danger ?? "244 63 94",
      info: t.info ?? "56 189 248",
    };
  }, [theme]);

  // ✅ theme styles
  const pageStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${rgba(C.bg, 1)}, ${rgba(
      C.surface1,
      1
    )}, ${rgba(C.bg, 1)})`,
    color: rgb(C.fg),
  };

  const gridOverlayStyle: React.CSSProperties =
    pattern === "grid"
      ? {
          opacity: effectsEnabled ? 0.1 : 0,
          backgroundImage: `linear-gradient(${rgba(
            C.accent,
            0.22
          )} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(
                              C.accent,
                              0.22
                            )} 1px, transparent 1px)`,
          backgroundSize: "46px 46px",
          maskImage:
            "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
        }
      : { opacity: 0 };

  const topBarStyle: React.CSSProperties = {
    background: `linear-gradient(180deg, ${rgba(C.bg, 0.82)}, transparent)`,
    borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
  };

  const titleStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${rgb(C.gradientFrom)}, ${rgb(
      C.gradientTo
    )})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    textShadow: effectsEnabled ? `0 0 24px ${rgba(C.glow, 0.12)}` : undefined,
  };

  const outlineBtn: React.CSSProperties = {
    borderRadius: `calc(${radius} + 999px)`,
    border: `1px solid ${rgba(C.border, 0.2)}`,
    background: rgba(C.surface2, 0.22),
    color: rgba(C.fg, 0.9),
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: `calc(${radius} + 10px)`,
    background: rgba(C.input, 0.22),
    border: `1px solid ${rgba(C.inputBorder, 0.35)}`,
    color: rgb(C.fg),
    boxShadow: effectsEnabled ? `0 0 0 1px ${rgba(C.ring, 0.08)} inset` : undefined,
  };

  const tableCardStyle: React.CSSProperties = {
    borderRadius: `calc(${radius} + 14px)`,
    border: `1px solid ${rgba(C.border, 0.2)}`,
    background: `linear-gradient(135deg, ${rgba(
      C.card,
      0.8
    )}, ${rgba(C.surface2, 0.55)}, ${rgba(C.card, 0.8)})`,
    boxShadow: effectsEnabled ? `0 18px 55px ${rgba(C.bg, 0.55)}` : undefined,
  };

  const headerRowStyle: React.CSSProperties = {
    background: `linear-gradient(180deg, ${rgba(
      C.headerRow,
      0.75
    )}, ${rgba(C.headerRow, 0.45)})`,
    borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
  };

  const pillStyle = (tone: "pending" | "approved" | "rejected" | "neutral") => {
    const base =
      tone === "pending"
        ? C.warning
        : tone === "approved"
        ? C.success
        : tone === "rejected"
        ? C.danger
        : C.mutedFg;

    return {
      borderRadius: "999px",
      border: `1px solid ${rgba(base, 0.35)}`,
      background: rgba(base, 0.1),
      color: rgba(base, 0.95),
      fontWeight: 700,
    } as React.CSSProperties;
  };

  const statusTone = (s?: string) => {
    if (s === "pending") return "pending";
    if (s === "approved") return "approved";
    if (s === "rejected") return "rejected";
    return "neutral";
  };

  const [depositData, setDepositData] = useState<any[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"" | "approve" | "reject">("");
  const [loading, setLoading] = useState(false);
  const isAll = status === "all";
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [allDepositData, setAllDepositData] = useState<any[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [pagination, setPagination] = useState<any>({});
  const [isActionLoading, setIsActionLoading] = useState(false);

  // ===== Numbered pagination helpers =====
  const DOTS = "...";
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const computedTotal = safeNum(
    pagination?.totalWithdrawals ?? pagination?.total ?? pagination?.totalRecords ?? 0
  );

  const totalPages =
    Math.max(
      1,
      safeNum(pagination?.totalPages) || Math.ceil((computedTotal || 0) / PAGE_SIZE)
    ) || 1;

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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) setCurrentPage(page);
  };

  // fetch data
  const fetchApiData = async () => {
    setLoading(true);
    try {
      let finalRes: any;
      const base = `/referral-withdrawals?page=${currentPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(
        debouncedSearch
      )}`;

      if (status === "all") finalRes = (await adminApi.get(`${base}&status=`)).data;
      else if (status === "pending")
        finalRes = (await adminApi.get(`${base}&status=pending`)).data;
      else if (status === "approved")
        finalRes = (await adminApi.get(`${base}&status=approved`)).data;
      else if (status === "rejected")
        finalRes = (await adminApi.get(`${base}&status=rejected`)).data;
      else finalRes = (await adminApi.get(base)).data;

      setDepositData(finalRes.data || []);
      setPagination(finalRes.pagination || {});
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching IB withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch all data (stats)
  const fetchAllData = async () => {
    try {
      const allRes = await adminApi.get(`/referral-withdrawals`);
      setAllDepositData(allRes.data?.data || []);
    } catch {
      console.log("failed to fetch all data");
    } finally {
      setAllLoading(false);
    }
  };

  const handleSearchChange = (e: any) => setSearchQuery(e.target.value);

  const handleActionClick = (dep: any, action: "approve" | "reject") => {
    setSelectedDeposit(dep);
    setActionType(action);
    setIsDialogOpen(true);
  };

  // confirm action
  const handleConfirmAction = async (dep: any) => {
    if (isActionLoading || !dep) return;

    const toastId = toast.loading("Please wait..");
    setIsActionLoading(true);

    try {
      if (actionType === "approve") {
        await adminApi.post(`/withdraw-ib-balance`, {
          referralAccount: dep.referralId,
          amount: dep.amount,
        });

        // email content
        const now = new Date();
        const formattedDateTime =
          now.toLocaleDateString("en-GB") +
          ", " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });

        const startBalance = safeNum(dep?.userData?.ibBalance ?? dep?.totalBalance ?? 0);
        const amount = safeNum(dep?.amount ?? 0);
        const remaining = Math.max(0, startBalance - amount);

        const customContent = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>IB Withdrawal Success</title>
<style>
body,html{margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f4f4f4}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:#19422df2;color:#fff;padding:20px 15px;text-align:center;border-radius:10px 10px 0 0}
.header h1{margin:0;font-size:22px;letter-spacing:1px}
.content{padding:10px 20px}
.withdrawal-details{background:#f8f8f8;border-left:4px solid #2d6a4f;padding:15px;margin:20px 0}
.highlight{font-weight:700;color:#0a2342}
.footer{background:#19422df2;color:#fff;text-align:center;padding:5px 10px;font-size:12px;border-radius:0 0 10px 10px}
.footer-info{margin-top:6px}
.footer-info a{color:#B6D0E2;text-decoration:none}
</style></head>
<body><div class="container">
<div class="header"><h1>IB Withdrawal Success</h1></div>
<div class="content">
<p>Dear ${dep?.userData?.firstName || ""} ${dep?.userData?.lastName || ""},</p>
<p>Your withdrawal request has been successfully processed.</p>
<div class="withdrawal-details">
  <p>IB ID: <span class="highlight">${dep?.referralId || ""}</span></p>
  <p>Withdrawal Amount: <span class="highlight">$${amount.toFixed(2)}</span></p>
  <p>Available Balance: <span class="highlight">$${remaining.toFixed(2)}</span></p>
  <p>Time Stamp: <span class="highlight">${formattedDateTime}</span></p>
</div>
<p>Thank you for choosing us.</p>
<p>Happy trading!</p>
<p>Best regards,<br>The ${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
<hr>
</div>
<div class="footer">
  <div class="footer-info">
    <p>Website: <a href="https://${import.meta.env.VITE_EMAIL_WEBSITE}">${import.meta.env.VITE_EMAIL_WEBSITE}</a> | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
    <p>© 2025 ${import.meta.env.VITE_WEBSITE_NAME || ""}. All Rights Reserved</p>
  </div>
</div>
</div></body></html>`;

        await adminApi.put(`/update-referral-withdrawal`, {
          id: dep._id,
          status: "approved",
        });

        try {
          await adminApi.post(`/custom-mail`, {
            email: dep?.userData?.email,
            content: customContent,
            subject: "IB Withdrawal Success",
          });
        } catch (err) {
          console.error("error sending mail", err);
        }

        setDepositData((prev) =>
          prev.map((d) => (d._id === dep._id ? { ...d, status: "approved" } : d))
        );
        toast.success("IB Withdrawal Approved", { id: toastId });
      } else if (actionType === "reject") {
        await adminApi.put(`/update-referral-withdrawal`, {
          id: dep._id,
          status: "rejected",
        });

        setDepositData((prev) =>
          prev.map((d) => (d._id === dep._id ? { ...d, status: "rejected" } : d))
        );
        toast.success("IB Withdrawal Rejected", { id: toastId });
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(`${error?.response?.data?.msg || "Please try again later"}`, {
        id: toastId,
      });
      console.error(
        "Error updating IB withdrawal:",
        error?.response?.data?.msg || error?.message || ""
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // totals for stats
  const TotalDeposits = allDepositData
    .reduce((t, i: any) => t + safeNum(i.amount), 0)
    .toFixed(2);
  const TotalPendingDeposits = allDepositData
    .filter((i: any) => i.status === "pending")
    .reduce((t: number, i: any) => t + safeNum(i.amount), 0)
    .toFixed(2);
  const TotalSuccessfullDeposits = allDepositData
    .filter((i: any) => i.status === "approved")
    .reduce((t: number, i: any) => t + safeNum(i.amount), 0)
    .toFixed(2);
  const TotalRejectedDeposits = allDepositData
    .filter((i: any) => i.status === "rejected")
    .reduce((t: number, i: any) => t + safeNum(i.amount), 0)
    .toFixed(2);

  const stats = [
    {
      icon: <ArrowLeftRight className="text-white" size={20} />,
      amount: TotalDeposits,
      label: "Total IB Withdrawals",
      link: "/admin/ib-withdrawal/all",
      allLoading,
    },
    {
      icon: <ArrowLeftRight className="text-white" size={20} />,
      amount: TotalSuccessfullDeposits,
      label: "Successful IB Withdrawals",
      link: "/admin/ib-withdrawal/approved",
      allLoading,
    },
    {
      icon: <ArrowLeftRight className="text-white" size={20} />,
      amount: TotalPendingDeposits,
      label: "Pending IB Withdrawals",
      link: "/admin/ib-withdrawal/pending",
      allLoading,
    },
    {
      icon: <ArrowLeftRight className="text-white" size={20} />,
      amount: TotalRejectedDeposits,
      label: "Rejected IB Withdrawals",
      link: "/admin/ib-withdrawal/rejected",
      allLoading,
    },
  ];

  // pagination
  const handleNextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  // keep page valid if totals shrink
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // effects
  useEffect(() => setCurrentPage(1), [debouncedSearch, status]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);
  useEffect(() => {
    fetchApiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentPage, debouncedSearch]);
  useEffect(() => {
    if (isAll) fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="relative min-h-screen" style={pageStyle}>
      {/* ambient */}
      <AnimatedGrid />
      <FloatingParticles />
      <div className="pointer-events-none absolute inset-0" style={gridOverlayStyle} />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky top controls */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 backdrop-blur-md"
          style={topBarStyle}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 transition-all"
                style={outlineBtn}
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <h1 className="text-2xl md:text-3xl font-bold" style={titleStyle}>
                {status} IB Withdrawals
              </h1>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Name / Email / IB ID"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-90"
                    style={{ color: rgba(C.mutedFg, 0.8) }}
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={fetchApiData}
                disabled={loading}
                className="px-4 py-2.5 transition-all flex items-center gap-2"
                style={{
                  ...outlineBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats (only on "all") */}
        {isAll && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-8"
          >
            {stats.map((s, i) => (
              <StatCard key={i} {...s} C={C} radius={radius} effectsEnabled={effectsEnabled} />
            ))}
          </motion.div>
        )}

        {/* Table Card */}
        <div className="overflow-hidden" style={tableCardStyle}>
          <div className="overflow-x-auto relative">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="w-full min-w-[980px] whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr style={headerRowStyle}>
                    {[
                      "User | Email",
                      "IB ID",
                      "Balance",
                      "Requested",
                      "Method",
                      status === "rejected" || status === "approved"
                        ? "Updated At"
                        : "Requested At",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-left font-medium"
                        style={{ color: rgba(C.fg, 0.9) }}
                      >
                        {h}
                      </th>
                    ))}
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
                  ) : depositData?.length ? (
                    depositData.map((item: any) => (
                      <tr
                        key={item._id}
                        className="transition-colors"
                        style={{
                          borderBottom: `1px solid ${rgba(C.border, 0.14)}`,
                          background: rgba(C.surface2, 0.1),
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = rgba(
                            C.rowHover,
                            0.22
                          );
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = rgba(
                            C.surface2,
                            0.1
                          );
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
                            {item?.userData?.firstName || "Not found"}{" "}
                            {item?.userData?.lastName || ""}
                          </div>
                          <div className="text-sm" style={{ color: rgba(C.mutedFg, 0.75) }}>
                            {item?.userData?.email || "Not found"}
                          </div>
                        </td>

                        <td className="py-3 px-4" style={{ color: rgba(C.fg, 0.9) }}>
                          {item?.referralId || "—"}
                        </td>

                        <td className="py-3 px-4" style={{ color: rgba(C.fg, 0.9) }}>
                          ${safeNum(item?.userData?.ibBalance).toFixed(4)}
                        </td>

                        <td className="py-3 px-4" style={{ color: rgba(C.fg, 0.9) }}>
                          ${safeNum(item?.amount).toFixed(2)}
                        </td>

                        <td className="py-3 px-4" style={{ color: rgba(C.fg, 0.88) }}>
                          {displayMethod(item?.method)}
                        </td>

                        <td className="py-3 whitespace-nowrap px-4">
                          {status === "rejected" || status === "approved" ? (
                            <>
                              <div style={{ color: rgba(C.fg, 0.9) }}>
                                {CFformatDate(item?.updatedAt)}
                              </div>
                              <div className="text-xs" style={{ color: rgba(C.mutedFg, 0.75) }}>
                                {CFcalculateTimeSinceJoined(item?.updatedAt)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ color: rgba(C.fg, 0.9) }}>
                                {CFformatDate(item?.createdAt)}
                              </div>
                              <div className="text-xs" style={{ color: rgba(C.mutedFg, 0.75) }}>
                                {CFcalculateTimeSinceJoined(item?.createdAt)}
                              </div>
                            </>
                          )}
                        </td>

                        <td className="py-2 px-4">
                          {item.status === "pending" ? (
                            isActionLoading ? (
                              <span style={{ color: rgba(C.mutedFg, 0.75) }}>Please wait…</span>
                            ) : (
                              <div className="flex items-center gap-5">
                                <button
                                  className="transition-all hover:scale-110"
                                  style={{ color: rgba(C.success, 0.95) }}
                                  onClick={() => handleActionClick(item, "approve")}
                                  title="Approve"
                                >
                                  <CircleCheckBig />
                                </button>
                                <button
                                  className="transition-all hover:scale-110"
                                  style={{ color: rgba(C.danger, 0.95) }}
                                  onClick={() => handleActionClick(item, "reject")}
                                  title="Reject"
                                >
                                  <CircleX />
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="inline-flex px-3 py-1 text-sm" style={pillStyle(statusTone(item.status))}>
                              {item.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <div className="text-center" style={{ color: rgba(C.mutedFg, 0.8) }}>
                          No IB withdrawals found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* footer */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3"
            style={{
              borderTop: `1px solid ${rgba(C.border, 0.14)}`,
              background: rgba(C.surface2, 0.18),
            }}
          >
            <div className="text-xs sm:text-sm" style={{ color: rgba(C.mutedFg, 0.85) }}>
              Total records:{" "}
              <span style={{ color: rgba(C.fg, 0.95) }}>
                {safeNum(pagination?.totalWithdrawals ?? pagination?.total ?? 0)}
              </span>
            </div>
            <div className="text-xs sm:text-sm" style={{ color: rgba(C.mutedFg, 0.85) }}>
              Page <span style={{ color: rgba(C.fg, 0.95) }}>{currentPage}</span> of{" "}
              <span style={{ color: rgba(C.fg, 0.95) }}>{totalPages}</span>
            </div>
          </div>
        </div>

        {/* Numbered Pagination */}
        <div className="mt-6 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 transition-all"
              style={{
                ...outlineBtn,
                opacity: currentPage === 1 ? 0.55 : 1,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {paginationRange.map((p, idx) =>
                p === DOTS ? (
                  <span
                    key={`dots-${idx}`}
                    className="px-3 py-2 select-none"
                    style={{ color: rgba(C.mutedFg, 0.6) }}
                  >
                    {DOTS}
                  </span>
                ) : (
                  <button
                    key={`page-${p}`}
                    onClick={() => goToPage(p as number)}
                    className="min-w-[40px] px-3 py-2 transition-all border"
                    style={{
                      borderRadius: `calc(${radius} + 6px)`,
                      borderColor:
                        currentPage === p ? rgba(C.accent, 0.35) : rgba(C.border, 0.18),
                      background:
                        currentPage === p
                          ? `linear-gradient(90deg, ${rgba(
                              C.gradientFrom,
                              0.26
                            )}, ${rgba(C.gradientTo, 0.26)})`
                          : rgba(C.surface2, 0.22),
                      color: currentPage === p ? rgba(C.fg, 0.96) : rgba(C.fg, 0.88),
                    }}
                    aria-current={currentPage === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 transition-all"
              style={{
                ...outlineBtn,
                opacity: currentPage === totalPages ? 0.55 : 1,
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

      {/* Approve/Reject Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent
          className="max-w-xl rounded-2xl backdrop-blur-xl"
          style={{
            background: rgba(C.bg, 0.88),
            color: rgb(C.fg),
            border: `1px solid ${rgba(C.border, 0.25)}`,
            borderRadius: `calc(${radius} + 10px)`,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
              {actionType === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              {selectedDeposit && (
                <div className="space-y-4" style={{ color: rgba(C.mutedFg, 0.9) }}>
                  <div
                    className="p-4"
                    style={{
                      borderRadius: `calc(${radius} + 10px)`,
                      border: `1px solid ${rgba(C.border, 0.18)}`,
                      background: rgba(C.surface2, 0.22),
                    }}
                  >
                    <p className="text-lg font-semibold mb-1" style={{ color: rgba(C.fg, 0.95) }}>
                      Request Info
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>User:</span>{" "}
                      {selectedDeposit.userData?.firstName} {selectedDeposit.userData?.lastName}
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>Email:</span>{" "}
                      {selectedDeposit.userData?.email}
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>Withdrawal Amount:</span>{" "}
                      <span style={{ color: rgba(C.success, 0.95), fontWeight: 800 }}>
                        ${safeNum(selectedDeposit?.amount).toFixed(2)}
                      </span>
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>Referral Account:</span>{" "}
                      {selectedDeposit?.referralId}
                    </p>
                    <p>
                      <span style={{ color: rgba(C.mutedFg, 0.75) }}>Date:</span>{" "}
                      {CFformatDate(selectedDeposit?.updatedAt)}
                    </p>
                  </div>

                  <div
                    className="p-4"
                    style={{
                      borderRadius: `calc(${radius} + 10px)`,
                      border: `1px solid ${rgba(C.border, 0.18)}`,
                      background: rgba(C.surface2, 0.22),
                    }}
                  >
                    <p className="text-lg font-semibold mb-1" style={{ color: rgba(C.fg, 0.95) }}>
                      Payment Info
                    </p>

                    {displayMethod(selectedDeposit.method) === "Bank Transfer" ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 my-2">
                          <WalletCardsIcon size={20} />
                          <h1 className="font-bold">Bank Transfer</h1>
                        </div>

                        <p>
                          <span style={{ color: rgba(C.mutedFg, 0.75) }}>Bank Name:</span>{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.bankDetails?.bankName}
                          </span>
                        </p>
                        <p>
                          <span style={{ color: rgba(C.mutedFg, 0.75) }}>Holder Name:</span>{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.bankDetails?.holderName}
                          </span>
                        </p>
                        <p>
                          <span style={{ color: rgba(C.mutedFg, 0.75) }}>Account Number:</span>{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.bankDetails?.accountNumber}
                          </span>
                        </p>
                        <p>
                          <span style={{ color: rgba(C.mutedFg, 0.75) }}>IFSC Code:</span>{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.bankDetails?.ifscCode}
                          </span>
                        </p>
                        <p>
                          <span style={{ color: rgba(C.mutedFg, 0.75) }}>Swift Code:</span>{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.bankDetails?.swiftCode}
                          </span>
                        </p>
                        <p>
                          <span style={{ color: rgba(C.mutedFg, 0.75) }}>UPI ID:</span>{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.bankDetails?.upiId}
                          </span>
                        </p>
                      </div>
                    ) : displayMethod(selectedDeposit.method) === "USDT (TRC20)" ? (
                      <div className="flex gap-2 items-center">
                        <WalletCardsIcon size={20} />
                        <p>
                          USDT TRC20 —{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.walletDetails?.tetherAddress}
                          </span>
                        </p>
                      </div>
                    ) : displayMethod(selectedDeposit.method) === "USDT (BEP20)" ? (
                      <div className="flex gap-2 items-center">
                        <WalletCardsIcon size={20} />
                        <p>
                          USDT BEP20 —{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.walletDetails?.ethAddress}
                          </span>
                        </p>
                      </div>
                    ) : displayMethod(selectedDeposit.method) === "Binance ID" ? (
                      <div className="flex gap-2 items-center">
                        <WalletCardsIcon size={20} />
                        <p>
                          Binance ID —{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.walletDetails?.accountNumber}
                          </span>
                        </p>
                      </div>
                    ) : displayMethod(selectedDeposit.method) === "BTC Address" ? (
                      <div className="flex gap-2 items-center">
                        <WalletCardsIcon size={20} />
                        <p>
                          BTC Address —{" "}
                          <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
                            {selectedDeposit?.userData?.walletDetails?.trxAddress}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div style={{ color: rgba(C.mutedFg, 0.75) }}>—</div>
                    )}
                  </div>

                  <p className="mt-2 text-sm">
                    Are you sure you want to{" "}
                    <span
                      style={{
                        color:
                          actionType === "approve"
                            ? rgba(C.success, 0.95)
                            : rgba(C.danger, 0.95),
                        fontWeight: 800,
                      }}
                    >
                      {actionType === "approve" ? "approve" : "reject"}
                    </span>{" "}
                    this withdrawal?
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="px-4 py-2 transition-all"
              style={{
                borderRadius: `calc(${radius} + 6px)`,
                border: `1px solid ${rgba(C.border, 0.2)}`,
                background: rgba(C.surface2, 0.18),
                color: rgba(C.fg, 0.9),
              }}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => selectedDeposit && handleConfirmAction(selectedDeposit)}
              disabled={isActionLoading}
              className="px-4 py-2 transition-all disabled:opacity-60"
              style={{
                borderRadius: `calc(${radius} + 6px)`,
                border: `1px solid ${rgba(C.accent, 0.28)}`,
                background: `linear-gradient(90deg, ${rgba(
                  C.gradientFrom,
                  0.9
                )}, ${rgba(C.gradientTo, 0.9)})`,
                color: "white",
                boxShadow: effectsEnabled ? `0 0 24px ${rgba(C.glow, 0.18)}` : undefined,
              }}
            >
              {isActionLoading
                ? "Processing..."
                : `Confirm ${actionType === "approve" ? "Approval" : "Rejection"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IbWithdrawalStatus;
