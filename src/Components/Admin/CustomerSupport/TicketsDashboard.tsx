// TicketsDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  MessageSquare,
  Clock,
  MessageCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import RaiseTicket from "./RaiseTicket";
import TicketChat from "./TicketChat";
import { adminApi } from "../../../utils/apiClients";
import { useSelector } from "react-redux";
import { Switch } from "@headlessui/react";
import { useLocation, useParams } from "react-router-dom";

// ✨ ambient visuals (shared theme)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0")
    .trim()
    .replace(/,/g, " ");
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

export default function TicketsDashboard() {
  // Theme from Redux
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const [autoReplyStatus, setAutoReplyStatus] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const AdminId = useSelector((store: any) => store?.admin?.adminUser?._id);

  const location = useLocation();
  const { id: routeTicketId, chatId: routeChatId } = useParams();

  // Optional query params
  const queryParams = new URLSearchParams(location.search);
  const highlightedTicketId = queryParams.get("id");
  const queryChatId = queryParams.get("chatId");

  const fetchTickets = async () => {
    if (!AdminId) return;
    try {
      setLoading(true);
      setError(null);

      const res = await adminApi.get(`/ticket/admin/all-tickets/${AdminId}`);
      const ticketsData = res.data || [];

      // Auto-reply status
      const initialAutoReply: Record<string, boolean> = {};
      ticketsData.forEach((ticket: any) => {
        initialAutoReply[ticket._id] = !!ticket.autoReply;
      });

      setTickets(ticketsData);
      setAutoReplyStatus(initialAutoReply);

      // ✅ Handle route params (open chat via URL)
      if (routeTicketId) {
        const ticketToOpen = ticketsData.find((t: any) => t._id === routeTicketId);
        if (ticketToOpen && (routeChatId || queryChatId)) {
          setActiveTicket(ticketToOpen);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load");
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AdminId, routeTicketId, routeChatId, queryChatId]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleToggleAutoReply = async (ticketId: string) => {
    const newStatus = !autoReplyStatus[ticketId];
    setAutoReplyStatus((prev) => ({ ...prev, [ticketId]: newStatus }));

    try {
      await adminApi.post(`/ticket/admin/${ticketId}/auto-reply`, { enabled: newStatus });
    } catch (err) {
      console.error("Error updating auto-reply status:", err);
      setAutoReplyStatus((prev) => ({ ...prev, [ticketId]: !newStatus }));
    }
  };

  const handleNewTicket = async () => {
    await fetchTickets();
  };

  const statusColors: Record<string, React.CSSProperties> = {
    open: {
      background: rgba(theme?.danger || "244 63 94", 0.14),
      border: `1px solid ${rgba(theme?.danger || "244 63 94", 0.26)}`,
      color: rgba(theme?.danger || "244 63 94", 0.92),
    },
    "in-progress": {
      background: rgba(theme?.warning || "234 179 8", 0.14),
      border: `1px solid ${rgba(theme?.warning || "234 179 8", 0.26)}`,
      color: rgba(theme?.warning || "234 179 8", 0.92),
    },
    resolved: {
      background: rgba(theme?.success || "34 197 94", 0.14),
      border: `1px solid ${rgba(theme?.success || "34 197 94", 0.26)}`,
      color: rgba(theme?.success || "34 197 94", 0.92),
    },
    closed: {
      background: rgba(theme?.muted || "148 163 184", 0.12),
      border: `1px solid ${rgba(theme?.muted || "148 163 184", 0.22)}`,
      color: rgba(theme?.mutedFg || theme?.fg || "203 213 225", 0.82),
    },
  };

  const filteredTickets = useMemo(() => {
    const byStatus =
      filterStatus === "All" ? tickets : tickets.filter((t) => t.status === filterStatus);
    if (!debounced) return byStatus;
    return byStatus.filter((t) => {
      const who =
        `${t?.user?.firstName || ""} ${t?.user?.lastName || ""} ${t?.user?.email || ""}`.toLowerCase();
      const subj = `${t?.subject || ""} ${t?.description || ""}`.toLowerCase();
      return who.includes(debounced) || subj.includes(debounced) || String(t?._id).includes(debounced);
    });
  }, [tickets, filterStatus, debounced]);

  /* ------------------------------- styles -------------------------------- */
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(
      theme?.glow || theme?.accent,
      0.16
    )}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(
                   theme?.gradientTo || theme?.accent,
                   0.12
                 )}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(
      theme?.surface1 || theme?.bg || "0 0 0"
    )}, ${rgb(theme?.bg || "0 0 0")})`,
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
      0.88
    )})`,
    boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`,
    overflow: "hidden",
  } as React.CSSProperties;

  const thStyle = {
    color: rgba(theme?.fg || "255 255 255", 0.82),
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: rgba(theme?.headerRow || theme?.surface3 || "30 30 30", 0.55),
  } as React.CSSProperties;

  const inputStyle = {
    borderRadius: "18px",
    background: rgba(theme?.input || theme?.surface2 || "18 18 18", 0.35),
    border: `1px solid ${rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18)}`,
    color: rgba(theme?.fg || "255 255 255", 0.92),
  } as React.CSSProperties;

  const selectStyle = {
    borderRadius: "18px",
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28),
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
    color: rgba(theme?.fg || "255 255 255", 0.92),
  } as React.CSSProperties;

  const btnPrimaryStyle = {
    borderRadius: "18px",
    border: `1px solid ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.28)}`,
    background: `linear-gradient(90deg, ${rgba(theme?.gradientFrom || theme?.accent || "59 130 246", 0.98)}, ${rgba(
      theme?.gradientTo || "147 51 234",
      0.98
    )})`,
    color: rgba(theme?.accentFg || "255 255 255", 0.98),
    boxShadow: `0 14px 40px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`,
  } as React.CSSProperties;

  const btnGhostStyle = {
    borderRadius: "18px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
    color: rgba(theme?.fg || "255 255 255", 0.9),
  } as React.CSSProperties;

  const titleGradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
      theme?.gradientTo || "147 51 234"
    )})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  } as React.CSSProperties;

  // Loading / Error states
  if (loading)
    return (
      <div className="relative text-white" style={pageBgStyle}>
        <AnimatedGrid />
        <FloatingParticles />
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }} className="text-lg">
              Loading tickets...
            </p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="relative text-white" style={pageBgStyle}>
        <AnimatedGrid />
        <FloatingParticles />
        <div className="h-screen flex items-center justify-center px-4">
          <div className="text-center p-6" style={tableCardStyle}>
            <AlertCircle className="w-8 h-8 mx-auto mb-4" style={{ color: rgba(theme?.danger || "244 63 94", 0.9) }} />
            <p className="text-lg mb-4" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
              Error loading tickets: {error}
            </p>
            <button
              onClick={fetchTickets}
              className="px-4 py-2 transition-all"
              style={btnPrimaryStyle}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="relative text-white" style={pageBgStyle}>
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky controls */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 backdrop-blur-md"
          style={stickyHeaderStyle}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow flex items-center gap-2" style={titleGradientStyle}>
              <MessageSquare className="w-7 h-7" />
              Customer Support Dashboard
            </h1>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* search */}
              <div className="relative w-full md:w-80">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search id / subject / user"
                  className="w-full pl-10 pr-3 py-2.5 focus:outline-none backdrop-blur"
                  style={inputStyle}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${rgba(
                      theme?.ring || theme?.accent || "59 130 246",
                      0.25
                    )}`;
                    (e.currentTarget as HTMLInputElement).style.borderColor = rgba(
                      theme?.ring || theme?.accent || "59 130 246",
                      0.45
                    );
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLInputElement).style.borderColor = rgba(
                      theme?.inputBorder || theme?.border || "255 255 255",
                      0.18
                    );
                  }}
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.6) }}
                />
              </div>

              {/* filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 focus:outline-none"
                style={selectStyle}
                onFocus={(e) => {
                  (e.currentTarget as HTMLSelectElement).style.boxShadow = `0 0 0 3px ${rgba(
                    theme?.ring || theme?.accent || "59 130 246",
                    0.22
                  )}`;
                  (e.currentTarget as HTMLSelectElement).style.borderColor = rgba(
                    theme?.ring || theme?.accent || "59 130 246",
                    0.4
                  );
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLSelectElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLSelectElement).style.borderColor = rgba(
                    theme?.border || theme?.inputBorder || "255 255 255",
                    0.18
                  );
                }}
              >
                <option value="All">All</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 transition-transform hover:scale-[1.02] font-medium"
                style={btnPrimaryStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(
                    theme?.glow || theme?.accent || "59 130 246",
                    0.22
                  )}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 14px 40px ${rgba(
                    theme?.glow || theme?.accent || "59 130 246",
                    0.18
                  )}`;
                }}
              >
                <PlusCircle className="w-5 h-5" />
                New Ticket
              </button>

              <button
                onClick={fetchTickets}
                className="px-4 py-2.5 transition-all flex items-center gap-2"
                style={btnGhostStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(
                    theme?.glow || theme?.accent || "59 130 246",
                    0.18
                  )}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="mt-6" style={tableCardStyle}>
          <div className="overflow-x-auto relative">
            <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
              <table className="w-full min-w-[980px] whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr style={thStyle}>
                    <th className="p-3 px-4 text-left font-medium">ID</th>
                    <th className="p-3 px-4 text-left font-medium">Subject</th>
                    <th className="p-3 px-4 text-left font-medium">Customer</th>
                    <th className="p-3 px-4 text-left font-medium">Status</th>
                    <th className="p-3 px-4 text-left font-medium">Auto Reply</th>
                    <th className="p-3 px-4 text-left font-medium">Created</th>
                    <th className="p-3 px-4 text-left font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket: any) => {
                    const isHighlighted =
                      ticket._id === highlightedTicketId || ticket._id === routeTicketId;

                    return (
                      <tr
                        key={ticket._id}
                        className="border-b transition-colors"
                        style={{
                          borderBottomColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12),
                          background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.16),
                          boxShadow: isHighlighted ? `inset 0 0 0 1px ${rgba(theme?.ring || theme?.accent, 0.28)}` : "none",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = rgba(
                            theme?.rowHover || theme?.surface3 || "30 30 30",
                            0.26
                          );
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = rgba(
                            theme?.surface2 || theme?.card || "18 18 18",
                            0.16
                          );
                        }}
                      >
                        <td className="p-3 px-4 font-mono" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.7) }}>
                          #{ticket._id}
                        </td>

                        <td className="p-3 px-4">
                          <div className="max-w-[320px]">
                            <p className="font-medium truncate" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                              {ticket.subject}
                            </p>
                            {ticket.description && (
                              <p className="text-xs truncate mt-1" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>
                                {ticket.description}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="p-3 px-4" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.75) }}>
                          {ticket?.user?.firstName} {ticket?.user?.lastName}
                          {ticket?.user?.email ? (
                            <span className="block text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>
                              {ticket.user.email}
                            </span>
                          ) : null}
                        </td>

                        <td className="p-3 px-4">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold capitalize"
                            style={statusColors[ticket.status] || {
                              background: rgba(theme?.muted || "148 163 184", 0.12),
                              border: `1px solid ${rgba(theme?.muted || "148 163 184", 0.22)}`,
                              color: rgba(theme?.mutedFg || theme?.fg, 0.78),
                            }}
                          >
                            {ticket.status}
                          </span>
                        </td>

                        <td className="p-3 px-4">
                          <Switch
                            checked={!!autoReplyStatus[ticket._id]}
                            onChange={() => handleToggleAutoReply(ticket._id)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            style={{
                              background: autoReplyStatus[ticket._id]
                                ? rgba(theme?.accent || "59 130 246", 0.95)
                                : rgba(theme?.surface3 || theme?.rowHover || "30 30 30", 0.8),
                              boxShadow: `inset 0 0 0 1px ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
                            }}
                          >
                            <span
                              className={`${
                                autoReplyStatus[ticket._id] ? "translate-x-6" : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full transition-transform`}
                              style={{
                                background: rgba(theme?.accentFg || "255 255 255", 1),
                              }}
                            />
                          </Switch>
                        </td>

                        <td className="p-3 px-4">
                          <div className="flex items-center gap-2" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{formatDate(ticket.createdAt)}</span>
                          </div>
                        </td>

                        <td className="p-3 px-4">
                          <button
                            onClick={() => setActiveTicket(ticket)}
                            className="flex items-center gap-2 px-3 py-1.5 transition-all"
                            style={{
                              borderRadius: radius,
                              border: `1px solid ${rgba(theme?.success || "34 197 94", 0.28)}`,
                              background: rgba(theme?.success || "34 197 94", 0.08),
                              color: rgba(theme?.success || "34 197 94", 0.92),
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(
                                theme?.success || "34 197 94",
                                0.16
                              )}`;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                            }}
                          >
                            <MessageCircle className="w-4 h-4" />
                            View Chat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!filteredTickets.length && (
                <div className="py-16 text-center" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-60" />
                  <p>No tickets match your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raise Ticket Modal */}
        {showForm && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: rgba(theme?.bg || "0 0 0", 0.72), backdropFilter: "blur(6px)" }}
          >
            <div className="w-full max-w-lg p-6 relative" style={tableCardStyle}>
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3"
                style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}
                aria-label="Close"
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.fg || "255 255 255", 0.9))}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.mutedFg || theme?.fg, 0.65))}
              >
                ✕
              </button>
              <RaiseTicket onCancel={() => setShowForm(false)} onSubmit={handleNewTicket} />
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {activeTicket && <TicketChat ticket={activeTicket} onClose={() => setActiveTicket(null)} />}
      </div>
    </div>
  );
}
