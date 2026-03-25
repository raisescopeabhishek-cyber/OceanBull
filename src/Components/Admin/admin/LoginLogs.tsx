import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import { Search, ArrowLeft, RefreshCw } from "lucide-react";

// ✨ ambient visuals (same as other themed pages)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
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

const LoginLogs = () => {
  // Theme from Redux
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const [challengesData, setChallengesData] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchChallengesData = async () => {
    setLoader(true);
    try {
      const res = await adminApi.get(`/logs`);
      setChallengesData((res.data.data || []).reverse());
    } catch (error) {
      console.log("error in fetch user challenges", error);
      toast.error("Data fetching failed!");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchChallengesData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredData = challengesData?.filter((item: any) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase().trim();
    const searchableFields = [
      item?.userId?.firstName,
      item?.userId?.email,
      item?.ip,
      item?.browser,
      item?.os,
      item?.userId?.phone,
      item?.country,
    ];

    return searchableFields.some((field) => field?.toLowerCase?.()?.includes(searchLower));
  });

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData?.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push("...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, "...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1, "...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push("...", totalPages);
      }
    }
    return pageNumbers;
  };

  const handleSearchChange = (e: any) => setSearchQuery(e.target.value);

  // format date ---------------------
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

  // since joined ---------------
  function calculateTimeSinceJoined(isoDateString?: string) {
    if (!isoDateString) return "--";
    const joinDate = new Date(isoDateString);
    const today = new Date();

    const timeDifference = today.getTime() - joinDate.getTime();
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    return parts.length ? `${parts.join(", ")} ago` : "less than a minute ago";
  }

  // --- theme-driven card styles ---
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(theme?.glow || theme?.accent, 0.16)}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(theme?.gradientTo || theme?.accent, 0.12)}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(
      theme?.bg || "0 0 0"
    )})`,
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  const stickyHeaderStyle = {
    background: `linear-gradient(to bottom, ${rgba(theme?.bg || "0 0 0", 0.78)}, transparent)`,
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
  } as React.CSSProperties;

  const tableCardStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg, ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.75)}, ${rgba(
      theme?.surface1 || theme?.bg || "0 0 0",
      0.85
    )}, ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.75)})`,
    boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`,
  } as React.CSSProperties;

  const thStyle = {
    color: rgba(theme?.fg || "255 255 255", 0.82),
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: rgba(theme?.headerRow || theme?.surface3 || "30 30 30", 0.55),
  } as React.CSSProperties;

  const inputStyle = {
    borderRadius: radius,
    background: rgba(theme?.input || theme?.surface2 || "18 18 18", 0.35),
    border: `1px solid ${rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18)}`,
    color: rgb(theme?.fg || "255 255 255"),
    boxShadow: `0 0 0 0px ${rgba(theme?.ring || theme?.accent || "59 130 246", 0)}`,
  } as React.CSSProperties;

  const buttonBaseStyle = {
    borderRadius: "999px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
    color: rgba(theme?.fg || "255 255 255", 0.9),
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.25),
  } as React.CSSProperties;

  const buttonHoverShadow = {
    boxShadow: `0 0 22px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`,
  } as React.CSSProperties;

  const pill = (kind: "info" | "warning" | "success" | "danger") => {
    const map: any = {
      info: theme?.info || theme?.accent || "59 130 246",
      warning: theme?.warning || "234 179 8",
      success: theme?.success || theme?.primary || "34 197 94",
      danger: theme?.danger || "244 63 94",
    };
    const c = map[kind];
    return {
      borderRadius: "999px",
      background: rgba(c, 0.12),
      border: `1px solid ${rgba(c, 0.28)}`,
      color: rgba(c, 0.92),
    } as React.CSSProperties;
  };

  return (
    <div className="relative" style={pageBgStyle}>
      {/* ambient theme */}
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky controls */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 backdrop-blur-md"
          style={stickyHeaderStyle}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 transition-all"
                style={buttonBaseStyle}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, buttonHoverShadow)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "none")}
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <h2
                className="text-2xl md:text-3xl font-bold drop-shadow"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
                    theme?.gradientTo || "147 51 234"
                  )})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Login Logs
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by any field"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-9 py-2.5 focus:outline-none backdrop-blur"
                  style={inputStyle}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.25)}`;
                    (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.ring || theme?.accent || "59 130 246", 0.45);
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18);
                  }}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.6) }} />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.6) }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.fg || "255 255 255", 0.9))}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.6))}
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={fetchChallengesData}
                disabled={loader}
                className="px-4 py-2.5 transition-all flex items-center gap-2"
                style={{
                  borderRadius: radius,
                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
                  color: rgba(theme?.fg || "255 255 255", loader ? 0.45 : 0.9),
                  background: loader ? rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18) : rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28),
                  cursor: loader ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!loader) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`;
                }}
                onMouseLeave={(e) => (((e.currentTarget as HTMLButtonElement).style.boxShadow = "none"))}
              >
                <RefreshCw className={`w-4 h-4 ${loader ? "animate-spin" : ""}`} />
                {loader ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="mt-6 overflow-hidden" style={tableCardStyle}>
          <div className="overflow-x-auto relative max-h-[70vh] overflow-y-auto custom-scrollbar">
            <table className="w-full min-w-[880px] whitespace-nowrap">
              {/* sticky header w/ glass effect */}
              <thead className="sticky top-0 z-10">
                <tr style={thStyle}>
                  <th className="p-3 text-left font-medium">Name / Email</th>
                  <th className="p-3 text-center font-medium">Phone</th>
                  <th className="p-3 text-center font-medium">IP</th>
                  <th className="p-3 text-center font-medium">Browser</th>
                  <th className="p-3 text-center font-medium">OS</th>
                  <th className="p-3 text-center font-medium">Country</th>
                  <th className="p-3 text-center font-medium">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {loader ? (
                  <tr>
                    <td colSpan={7} className="py-10">
                      <div className="flex justify-center items-center gap-3" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.75) }}>
                        <span>Loading...</span>
                        <div
                          className="animate-spin rounded-full h-6 w-6 border-b-2"
                          style={{ borderBottomColor: rgba(theme?.accent || "59 130 246", 0.9) }}
                        />
                      </div>
                    </td>
                  </tr>
                ) : paginatedData?.length ? (
                  paginatedData.map((value: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b transition-colors"
                      style={{
                        borderBottomColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12),
                        background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18),
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.rowHover || theme?.surface3 || "30 30 30", 0.28))}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18))}
                    >
                      <td className="p-3 align-top">
                        <div style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>{value?.userId?.firstName || "--"}</div>
                        <div className="text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                          {value?.userId?.email || "--"}
                        </div>
                      </td>

                      <td className="p-3 text-center" style={{ color: rgba(theme?.fg || "255 255 255", 0.8) }}>
                        {value?.userId?.phone || "--"}
                      </td>
                      <td className="p-3 text-center" style={{ color: rgba(theme?.fg || "255 255 255", 0.8) }}>
                        {value?.ip || "--"}
                      </td>

                      <td className="p-3 text-center">
                        {value?.browser ? (
                          <span className="inline-flex px-3 py-1 text-sm" style={pill("info")}>
                            {value?.browser}
                          </span>
                        ) : (
                          <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>--</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        {value?.os ? (
                          <span className="inline-flex px-3 py-1 text-sm" style={pill("warning")}>
                            {value?.os}
                          </span>
                        ) : (
                          <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>--</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        {value?.country ? (
                          <span className="inline-flex px-3 py-1 text-sm" style={pill("success")}>
                            {value?.country}
                          </span>
                        ) : (
                          <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>--</span>
                        )}
                      </td>

                      <td className="py-3 text-center whitespace-nowrap px-4">
                        <div style={{ color: rgba(theme?.fg || "255 255 255", 0.82) }}>{formatDate(value?.updatedAt)}</div>
                        <div className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>
                          {calculateTimeSinceJoined(value?.updatedAt)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <div className="text-center" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                        No results found for “{searchQuery}”
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* footer hint */}
          {!loader && filteredData?.length > 0 && (
            <div
              className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-t"
              style={{
                borderTopColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12),
                background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
              }}
            >
              <div className="text-xs sm:text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="text-xs sm:text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                Total: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.85) }}>{filteredData.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loader && filteredData?.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 transition-all border"
              style={{
                borderRadius: radius,
                borderColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14),
                background: currentPage === 1 ? rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18) : rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28),
                color: currentPage === 1 ? rgba(theme?.mutedFg || theme?.fg, 0.45) : rgba(theme?.fg || "255 255 255", 0.9),
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>

            {getPageNumbers().map((pageNum, idx) => (
              <button
                key={idx}
                onClick={() => pageNum !== "..." && setCurrentPage(pageNum as number)}
                className="px-3 py-2 transition-all border"
                style={{
                  borderRadius: radius,
                  borderColor:
                    pageNum === "..."
                      ? "transparent"
                      : rgba(
                          pageNum === currentPage ? theme?.ring || theme?.accent || "59 130 246" : theme?.border || theme?.inputBorder || "255 255 255",
                          pageNum === currentPage ? 0.35 : 0.14
                        ),
                  background:
                    pageNum === currentPage
                      ? rgba(theme?.accent || "59 130 246", 0.18)
                      : pageNum === "..."
                      ? "transparent"
                      : rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28),
                  color:
                    pageNum === currentPage
                      ? rgba(theme?.accent || "59 130 246", 0.95)
                      : pageNum === "..."
                      ? rgba(theme?.mutedFg || theme?.fg, 0.5)
                      : rgba(theme?.fg || "255 255 255", 0.9),
                  cursor: pageNum === "..." ? "default" : "pointer",
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 transition-all border"
              style={{
                borderRadius: radius,
                borderColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14),
                background: currentPage === totalPages ? rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18) : rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28),
                color: currentPage === totalPages ? rgba(theme?.mutedFg || theme?.fg, 0.45) : rgba(theme?.fg || "255 255 255", 0.9),
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                boxShadow: currentPage === totalPages ? "none" : `0 0 0 ${rgba(theme?.glow || theme?.accent || "59 130 246", 0)}`,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(theme?.glow || theme?.gradientTo || "147 51 234", 0.18)}`;
              }}
              onMouseLeave={(e) => (((e.currentTarget as HTMLButtonElement).style.boxShadow = "none"))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginLogs;
