// IbUsers.tsx
import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle, Copy, Loader, Search } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import { RiUserSharedFill } from "react-icons/ri";
import { setLoggedUser } from "../../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import UseUserHook from "../../../hooks/user/UseUserHook";
import { Link } from "react-router-dom";

// ✨ ambient visuals (shared theme)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

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

const IbUsers = () => {
  const PAGE_SIZE = 10;
  const [ibUsers, setIbUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [pagination, setPagination] = useState<any>({
    totalPages: 1,
    totalUsers: 0,
  });

  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  // ✅ THEME FROM REDUX
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
      info: t.info ?? "56 189 248",
      shadowColor: t.shadowColor ?? "0 0 0",
    };
  }, [theme]);

  const extractedUrl = useMemo(() => {
    try {
      return new URL(window.location.href).origin;
    } catch {
      return "";
    }
  }, []);

  /* -------- Numbered pagination helpers -------- */
  const DOTS = "...";
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((Number(pagination?.totalUsers) || 0) / PAGE_SIZE)
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

  // fetch data------------------
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        `/get-users?page=${currentPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(
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

  // copy link handler
  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };

  // search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // login as user
  const handleLoginAsUser = (user: any) => {
    console.log(user)
    
    // getReset();
    // dispatch(setLoggedUser(user));
    // window.open("/user/dashboard", "_blank");
  };

  // clamp if total pages shrink
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // page reset on new search
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // debounced search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // fetch on page / search
  useEffect(() => {
    fetchUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

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
  };

  const gridOverlayStyle: React.CSSProperties =
    pattern === "grid"
      ? {
          opacity: effectsEnabled ? 0.1 : 0,
          backgroundImage: `linear-gradient(${rgba(C.accent, 0.22)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(C.accent, 0.22)} 1px, transparent 1px)`,
          backgroundSize: "46px 46px",
          maskImage:
            "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
        }
      : { opacity: 0 };

  const cardStyle: React.CSSProperties = {
    borderRadius: `calc(${radius} + 10px)`,
    border: `1px solid ${rgba(C.border, 0.2)}`,
    background: `linear-gradient(135deg, ${rgba(C.card, 0.8)}, ${rgba(
      C.surface2,
      0.55
    )}, ${rgba(C.card, 0.8)})`,
    boxShadow: effectsEnabled ? `0 18px 55px ${rgba(C.bg, 0.5)}` : undefined,
  };

  const headerRowStyle: React.CSSProperties = {
    background: `linear-gradient(180deg, ${rgba(C.headerRow, 0.75)}, ${rgba(
      C.headerRow,
      0.45
    )})`,
    borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    background: rgba(C.input, 0.22),
    border: `1px solid ${rgba(C.inputBorder, 0.35)}`,
    color: rgb(C.fg),
    boxShadow: effectsEnabled ? `0 0 0 1px ${rgba(C.ring, 0.08)} inset` : undefined,
  };

  const pageTitleStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${rgb(C.gradientFrom)}, ${rgb(
      C.gradientTo
    )})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    textShadow: effectsEnabled ? `0 0 24px ${rgba(C.glow, 0.12)}` : undefined,
  };

  const pill = (tone: "info" | "success" | "danger" | "accent") => {
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
      background: rgba(base, 0.1),
      color: rgba(base, 0.95),
    } as React.CSSProperties;
  };

  const btnOutline: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.border, 0.18)}`,
    background: rgba(C.surface2, 0.22),
    color: rgba(C.fg, 0.9),
    boxShadow: effectsEnabled ? `0 0 20px ${rgba(C.glow, 0.08)}` : undefined,
  };

  const btnAccent: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.accent, 0.3)}`,
    background: `linear-gradient(90deg, ${rgba(C.gradientFrom, 0.26)}, ${rgba(
      C.gradientTo,
      0.26
    )})`,
    color: rgb(C.fg),
    boxShadow: effectsEnabled ? `0 0 24px ${rgba(C.glow, 0.16)}` : undefined,
  };

  const rowBase = (hovered: boolean): React.CSSProperties => ({
    background: hovered ? rgba(C.rowHover, 0.22) : rgba(C.surface2, 0.1),
    borderBottom: `1px solid ${rgba(C.border, 0.14)}`,
    transition: "background 160ms ease",
  });

  return (
    <div className="relative min-h-screen" style={pageStyle}>
      <AnimatedGrid />
      <FloatingParticles />
      <div className="pointer-events-none absolute inset-0" style={gridOverlayStyle} />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-4 backdrop-blur-md"
          style={topBarStyle}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl md:text-3xl font-bold" style={pageTitleStyle}>
              IB Users
            </h1>

            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Name / Email"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 outline-none"
                style={inputStyle}
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: rgba(C.mutedFg, 0.75) }}
                size={18}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: rgba(C.mutedFg, 0.9) }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="mt-6 overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto relative">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="w-full min-w-[980px] whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr style={headerRowStyle}>
                    <th className="py-3 px-4 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      User | Email
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      MT5 Accounts
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      Email
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      KYC
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      IB ID
                    </th>
                    <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      IB Balance
                    </th>
                    <th className="py-3 px-4 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                      Referral Link
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
                  ) : ibUsers?.length ? (
                    ibUsers.map((item: any) => (
                      <IbRow
                        key={item?._id}
                        item={item}
                        extractedUrl={extractedUrl}
                        onLoginAsUser={() => handleLoginAsUser(item)}
                        onCopy={copyToClipboard}
                        C={C}
                        radius={radius}
                        pill={pill}
                        rowBase={rowBase}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <div className="text-center" style={{ color: rgba(C.mutedFg, 0.8) }}>
                          No IB users found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* footer info */}
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

        {/* Pagination (numbered) */}
        <div className="mt-6 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border transition-all"
              style={{
                ...btnOutline,
                opacity: currentPage === 1 ? 0.55 : 1,
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
                          : rgba(C.surface2, 0.22),
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
              className="px-4 py-2 border transition-all"
              style={{
                ...btnOutline,
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
    </div>
  );
};

export default IbUsers;

/* ==================== Row component ==================== */
const IbRow = ({
  item,
  extractedUrl,
  onLoginAsUser,
  onCopy,
  C,
  radius,
  pill,
  rowBase,
}: {
  item: any;
  extractedUrl: string;
  onLoginAsUser: () => void;
  onCopy: (link: string) => void;
  C: any;
  radius: string;
  pill: (tone: "info" | "success" | "danger" | "accent") => React.CSSProperties;
  rowBase: (hovered: boolean) => React.CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);
  const link = `${extractedUrl}/user/signup/${item?.referralAccount}`;

  return (
    <tr
      style={rowBase(hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="py-3 px-4">
        <div className="flex gap-3 items-start">
          <button
            onClick={onLoginAsUser}
            className="hover:scale-110 transition-transform"
            style={{ color: rgba(C.accent, 0.95) }}
            title="Login as user (opens new tab)"
          >
            <RiUserSharedFill size={22} />
          </button>

          <div>
            <div className="font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
              {item?.firstName ? item?.firstName : "Not found!!"}
            </div>

            <Link to={`/admin/user-detail/${item?._id}`}>
              <div
                className="transition-colors text-sm"
                style={{ color: rgba(C.mutedFg, 0.75) }}
              >
                <span className="hover:font-semibold" style={{ color: rgba(C.accent, 0.85) }}>
                  {item?.email ? item?.email : "Not found!!"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </td>

      <td className="py-3 px-4 text-center">
        <span className="inline-flex px-3 py-1 text-sm" style={pill("info")}>
          {item?.accounts?.length || 0}
        </span>
      </td>

      <td className="py-3 px-4 text-center">
        {item?.emailVerified ? (
          <span className="inline-flex items-center gap-1" style={pill("success")}>
            <CheckCircle className="w-4 h-4" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1" style={pill("danger")}>
            <Ban className="w-4 h-4" /> Not verified
          </span>
        )}
      </td>

      <td className="py-3 px-4 text-center">
        {item?.kycVerified ? (
          <span className="inline-flex items-center gap-1" style={pill("success")}>
            <CheckCircle className="w-4 h-4" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1" style={pill("danger")}>
            <Ban className="w-4 h-4" /> Not verified
          </span>
        )}
      </td>

      <td className="py-3 px-4 text-center" style={{ color: rgba(C.fg, 0.9) }}>
        {item?.referralAccount || "N/A"}
      </td>

      <td className="py-3 px-4 text-center" style={{ color: rgba(C.success, 0.95), fontWeight: 700 }}>
        {Number(item?.ibBalance || 0).toFixed(4)}
      </td>

      <td className="py-3 px-4">
        <div className="flex gap-2 items-center">
          <input
            readOnly
            value={link}
            className="outline-none py-1.5 px-3 w-[360px]"
            style={{
              borderRadius: `calc(${radius} + 6px)`,
              background: rgba(C.surface2, 0.18),
              border: `1px solid ${rgba(C.border, 0.20)}`,
              color: rgba(C.fg, 0.88),
            }}
          />
          <button
            onClick={() => onCopy(link)}
            className="p-2 border transition-all"
            style={{
              borderRadius: `calc(${radius} + 6px)`,
              border: `1px solid ${rgba(C.border, 0.18)}`,
              background: rgba(C.surface2, 0.22),
              color: rgba(C.accent, 0.95),
              boxShadow: `0 0 18px ${rgba(C.glow, 0.10)}`,
            }}
            title="Copy referral link"
          >
            <Copy size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};
