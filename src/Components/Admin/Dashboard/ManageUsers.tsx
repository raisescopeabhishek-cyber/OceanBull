// ManageUsers.tsx
import { useState, useEffect, useMemo } from "react";
import {
  BadgeCheck,
  LoaderIcon,
  OctagonAlert,
  OctagonX,
  Search,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedUser } from "../../../redux/user/userSlice";
import UseUserHook from "../../../hooks/user/UseUserHook";
import toast from "react-hot-toast";
import { RiUserSharedFill } from "react-icons/ri";
import { FaUserEdit } from "react-icons/fa";
import { adminApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";

// ✨ ambient visuals (same as other themed pages)
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

const ManageUsers = () => {
  const PAGE_SIZE = 10;
  const { subList } = useParams();
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  // ✅ THEME FROM REDUX
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const loggedUser = useSelector((s: any) => s.user.loggedUser);

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
      muted: t.muted ?? "163 177 198",
      border: t.border ?? t.inputBorder ?? "123 135 154",
      card: t.card ?? t.surface2 ?? "15 24 41",
      surface1: t.surface1 ?? t.bg ?? "0 0 0",
      surface2: t.surface2 ?? t.card ?? "15 24 41",
      accent: t.accent ?? "79 125 246",
      ring: t.ring ?? t.accent ?? "79 125 246",
      glow: t.glow ?? t.accent ?? "79 125 246",
      gradientFrom: t.gradientFrom ?? t.accent ?? "79 125 246",
      gradientTo: t.gradientTo ?? "23 157 166",
      headerRow: t.headerRow ?? "19 32 52",
      rowHover: t.rowHover ?? "15 24 41",
      input: t.input ?? t.surface2 ?? "15 24 41",
      inputBorder: t.inputBorder ?? t.border ?? "123 135 154",
      success: t.success ?? "15 159 110",
      danger: t.danger ?? "220 58 58",
      info: t.info ?? "79 125 246",
      shadowColor: t.shadowColor ?? "0 0 0",
    };
  }, [theme]);

  const capitalizeFirstLetter = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const totalPages = Math.max(
    1,
    Math.ceil((pagination?.totalUsers || 0) / PAGE_SIZE)
  );


  // clamp current page if total pages shrink (e.g., search)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

const userRedirectHandler = async (user: any) => {
  try {
    getReset();

    const res = await adminApi.post("/impersonate", { userId: user._id });

    if (!res.data.impersonated)  window.open(res.data?.redirectTo, "_blank", "noopener,noreferrer");;
    
          toast.success(`Welcome 👋🏽 ${res.data.userName}`);

    window.open("/user/dashboard", "_blank");
  } catch (e) {
    toast.error("Impersonation failed");
    console.error(e);
  }
};



  // 🔍 debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 📥 fetch users
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      let finalRes: any;
      const base = `/get-users?page=${currentPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(
        debouncedSearch
      )}`;

      if (subList === "all-users") {
        finalRes = (await adminApi.get(base)).data;
      } else if (subList === "email-verified") {
        finalRes = (await adminApi.get(`${base}&emailVerified=true`)).data;
      } else if (subList === "email-unverified") {
        finalRes = (await adminApi.get(`${base}&emailVerified=false`)).data;
      } else if (subList === "kyc-verified") {
        finalRes = (await adminApi.get(`${base}&kycVerified=true`)).data;
      } else if (subList === "kyc-unverified") {
        finalRes = (await adminApi.get(`${base}&kycVerified=false`)).data;
      } else {
        finalRes = (await adminApi.get(base)).data;
      }

      setUsers(finalRes.data || []);
      setPagination(finalRes.pagination || {});
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subList, currentPage, debouncedSearch]);

  // reset page when the tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [subList]);

  // ====== Numbered Pagination Helpers (with ellipses) ======
  const DOTS = "...";
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

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

  /* ==================== Theme-driven styles ==================== */
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
          backgroundImage: `linear-gradient(${rgba(C.accent, 0.22)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(C.accent, 0.22)} 1px, transparent 1px)`,
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

  const btnOutline: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.border, 0.18)}`,
    background: rgba(C.surface2, 0.22),
    color: rgba(C.fg, 0.9),
    boxShadow: effectsEnabled ? `0 0 20px ${rgba(C.glow, 0.08)}` : undefined,
  };

  const btnAccent: React.CSSProperties = {
    borderRadius: `calc(${radius} + 6px)`,
    border: `1px solid ${rgba(C.accent, 0.28)}`,
    background: `linear-gradient(90deg, ${rgba(C.gradientFrom, 0.26)}, ${rgba(
      C.gradientTo,
      0.26
    )})`,
    color: rgba(C.fg, 0.95),
    boxShadow: effectsEnabled ? `0 0 22px ${rgba(C.glow, 0.14)}` : undefined,
  };

  const rowBase = (hovered: boolean): React.CSSProperties => ({
    background: hovered ? rgba(C.rowHover, 0.22) : rgba(C.surface2, 0.1),
    borderBottom: `1px solid ${rgba(C.border, 0.14)}`,
    transition: "background 160ms ease",
  });

  return (
    <div className="relative min-h-screen" style={pageStyle}>
      {/* ambient theme */}
      <AnimatedGrid />
      <FloatingParticles />
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
                className="flex items-center gap-2 px-4 py-2 transition-all border"
                style={btnOutline}
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <h1 className="text-2xl md:text-3xl font-bold" style={pageTitleStyle}>
                {capitalizeFirstLetter(subList || "Manage Users")}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  className="w-64 md:w-80 pl-10 pr-4 py-2.5 outline-none"
                  style={inputStyle}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: rgba(C.mutedFg, 0.75) }}
                />
              </div>

              <button
                onClick={fetchUsersData}
                disabled={loading}
                className="px-4 py-2.5 transition-all border flex items-center gap-2"
                style={{
                  ...btnOutline,
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

        {/* Table Card */}
        <div className="mt-6 overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto relative max-h-[70vh] overflow-y-auto custom-scrollbar">
            <table className="table-stack w-full min-w-[960px] whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr style={headerRowStyle}>
                  <th className="py-3 px-4 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                    User / Email
                  </th>
                  <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                    Country
                  </th>
                  <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                    Email
                  </th>
                  <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                    KYC
                  </th>
                  <th className="py-3 px-4 text-center font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                    Total AC
                  </th>
                  <th className="py-3 px-4 pl-10 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                    Joined At
                  </th>
                  <th className="py-3 px-4 text-left font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10">
                      <div
                        className="flex justify-center items-center gap-3"
                        style={{ color: rgba(C.mutedFg, 0.9) }}
                      >
                        <span>Loading...</span>
                        <LoaderIcon className="animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <div className="text-center" style={{ color: rgba(C.mutedFg, 0.8) }}>
                        No users found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <ManageUserRow
                      key={user?._id}
                      user={user}
                      subList={subList}
                      onImpersonate={() => userRedirectHandler(user)}
                      C={C}
                      radius={radius}
                      pill={pill}
                      rowBase={rowBase}
                    />
                  ))
                )}
              </tbody>
            </table>
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
              Showing {users.length} record{users.length === 1 ? "" : "s"}
            </div>
            <div className="text-xs sm:text-sm" style={{ color: rgba(C.mutedFg, 0.85) }}>
              Total: <span style={{ color: rgba(C.fg, 0.95) }}>{pagination?.totalUsers || 0}</span>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col items-center space-y-3">
          <p className="text-sm" style={{ color: rgba(C.mutedFg, 0.85) }}>
            <span style={{ color: rgba(C.fg, 0.95), fontWeight: 700 }}>
              {pagination?.totalUsers || 0}
            </span>{" "}
            total records
          </p>

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

export default ManageUsers;

/* ==================== Row component ==================== */
const ManageUserRow = ({
  user,
  subList,
  onImpersonate,
  C,
  radius,
  pill,
  rowBase,
}: {
  user: any;
  subList: any;
  onImpersonate: () => void;
  C: any;
  radius: string;
  pill: (tone: "info" | "success" | "danger" | "accent") => React.CSSProperties;
  rowBase: (hovered: boolean) => React.CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      style={rowBase(hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td data-label="User / Email" className="py-3 px-4">
        <div className="flex items-center gap-3">
          {subList === "all-users" && (
            <Button
              onClick={onImpersonate}
              className="transition-transform hover:scale-110"
              style={{ color: rgba(C.accent, 0.95) }}
            >
              <RiUserSharedFill size={22} />
            </Button>
          )}
          <div>
            <div className="font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
              {(user?.firstName || "") + " " + (user?.lastName || "")}
            </div>
            <Link
              to={`/admin/user-detail/${user?._id}`}
              className="text-sm transition-colors"
              style={{ color: rgba(C.mutedFg, 0.75) }}
            >
              {user?.email}
            </Link>
          </div>
        </div>
      </td>

      <td data-label="Country" className="py-3 px-4">
        <div className="text-center">
          {user?.country ? (
            <span className="inline-flex px-3 py-1 text-sm" style={pill("info")}>
              {user.country}
            </span>
          ) : (
            <OctagonAlert className="w-5 h-5 mx-auto" style={{ color: rgba(C.warning ?? C.accent, 0.9) }} />
          )}
        </div>
      </td>

      <td data-label="Email" className="py-3 px-4">
        <div className="text-center">
          {user?.emailVerified ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm" style={pill("success")}>
              <BadgeCheck className="w-4 h-4" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm" style={pill("danger")}>
              <OctagonX className="w-4 h-4" />
              Unverified
            </span>
          )}
        </div>
      </td>

      <td data-label="KYC" className="py-3 px-4">
        <div className="text-center">
          {user?.kycVerified ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm" style={pill("success")}>
              <BadgeCheck className="w-4 h-4" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm" style={pill("danger")}>
              <OctagonX className="w-4 h-4" />
              Unverified
            </span>
          )}
        </div>
      </td>

      <td data-label="Total AC" className="py-3 px-4 text-center">
        <span className="inline-flex px-3 py-1 text-sm" style={pill("accent")}>
          {user?.accounts?.length || 0}
        </span>
      </td>

      <td data-label="Joined At" className="py-3 px-4 whitespace-nowrap">
        <div style={{ color: rgba(C.fg, 0.9) }}>{CFformatDate(user?.createdAt)}</div>
        <div className="text-xs" style={{ color: rgba(C.mutedFg, 0.75) }}>
          {CFcalculateTimeSinceJoined(user?.createdAt)}
        </div>
      </td>

      <td data-label="Action" className="py-3 px-4">
        <Link
          to={`/admin/user-detail/${user?._id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 border transition-all"
          style={{
            borderRadius: `calc(${radius} + 6px)`,
            border: `1px solid ${rgba(C.border, 0.18)}`,
            background: rgba(C.surface2, 0.22),
            color: rgba(C.fg, 0.9),
          }}
        >
          <FaUserEdit size={16} style={{ color: rgba(C.accent, 0.95) }} />
          Details
        </Link>
      </td>
    </tr>
  );
};
