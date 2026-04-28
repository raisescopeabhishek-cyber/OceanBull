// TicketsDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import RaiseTicket from "./RaiseTicket";
import TicketChat from "./TicketChat";
import { adminApi } from "../../../utils/apiClients";
import { useSelector } from "react-redux";
import { Switch } from "@headlessui/react";
import { useLocation, useParams } from "react-router-dom";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getTheme = (isDark: boolean) => ({
  pageText: isDark ? "text-white" : "text-slate-900",
  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/55" : "text-slate-500",
  softText: isDark ? "text-white/70" : "text-slate-600",

  pageBg: isDark ? "bg-[#0b1120]" : "bg-orange-50",

  header: isDark
    ? "border-white/10 bg-[linear-gradient(135deg,rgba(30,41,59,1),rgba(15,23,42,1))] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-orange-300/40 bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_18px_45px_rgba(249,115,22,0.22)]",

  headerText: "text-white",
  headerMuted: isDark ? "text-white/65" : "text-white/80",
  headerBadge: "border-white/20 bg-white/10 text-white",
  headerIcon: "border-white/20 bg-white/10 text-white",
  headerStat: "border-white/20 bg-white/10 text-white backdrop-blur-xl",
  headerStatMuted: "text-white/75",

  card: isDark
    ? "border-white/10 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-orange-100/90 bg-white/80 shadow-[0_18px_45px_rgba(251,146,60,0.12)]",

  cardSoft: isDark
    ? "border-white/10 bg-white/[0.035]"
    : "border-orange-100/80 bg-white/70",

  tableHead: isDark
    ? "border-white/10 bg-white/[0.035]"
    : "border-orange-100 bg-orange-50/80",

  tableRow: isDark
    ? "border-white/10 hover:bg-white/[0.04]"
    : "border-orange-100 hover:bg-orange-50/60",

  input: isDark
    ? "border-white/10 bg-white/[0.055] text-white placeholder:text-white/35 focus:border-blue-400/50 focus:ring-blue-400/20"
    : "border-orange-300 bg-orange-50/80 text-slate-900 placeholder:text-orange-400 shadow-[0_0_0_3px_rgba(251,146,60,0.08)] focus:border-orange-500 focus:bg-white focus:ring-orange-300/70",

  option: isDark ? "bg-slate-900 text-white" : "bg-orange-50 text-slate-900",

  iconBox: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-orange-200 bg-orange-50 text-orange-600",

  badge: isDark
    ? "border-white/10 bg-white/[0.05] text-white/60"
    : "border-orange-100 bg-white/80 text-orange-600",

  activeBadge: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-orange-300 bg-orange-50 text-orange-700 shadow-[0_0_0_3px_rgba(251,146,60,0.08)]",

  successBadge: isDark
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700",

  warningBadge: isDark
    ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
    : "border-amber-200 bg-amber-50 text-amber-700",

  dangerBadge: isDark
    ? "border-red-400/20 bg-red-500/10 text-red-300"
    : "border-red-200 bg-red-50 text-red-700",

  closedBadge: isDark
    ? "border-white/10 bg-white/[0.04] text-white/55"
    : "border-slate-200 bg-slate-50 text-slate-600",

  button: isDark
    ? "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400/30"
    : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-300",

  outlineButton: isDark
    ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
    : "border-orange-200 bg-white/80 text-orange-700 hover:bg-orange-50",

  modalOverlay: isDark ? "bg-black/70" : "bg-slate-900/45",
});

const HeaderCard = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
}) => (
  <div
    className={cx(
      "relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 sm:p-6",
      theme.header
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.20), transparent 30%), radial-gradient(circle at bottom right, rgba(255,237,213,0.22), transparent 36%)",
      }}
    />
    <div className="relative z-[1]">{children}</div>
  </div>
);

const Card = ({
  children,
  theme,
  className = "",
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  className?: string;
}) => (
  <div
    className={cx(
      "rounded-[26px] border p-4 transition-all duration-300 sm:p-5",
      theme.card,
      className
    )}
  >
    {children}
  </div>
);

const HeaderIconBox = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
}) => (
  <div
    className={cx(
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
      theme.headerIcon
    )}
  >
    {children}
  </div>
);

const HeaderStatBox = ({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  theme: ReturnType<typeof getTheme>;
}) => (
  <div className={cx("rounded-2xl border px-4 py-3", theme.headerStat)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
        {icon}
      </div>

      <div className="min-w-0">
        <p className={cx("text-xs", theme.headerStatMuted)}>{label}</p>
        <p className="mt-1 truncate text-base font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const IconBox = ({
  children,
  theme,
  className = "",
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  className?: string;
}) => (
  <div
    className={cx(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
      theme.iconBox,
      className
    )}
  >
    {children}
  </div>
);

const StatusBadge = ({
  status,
  theme,
}: {
  status: string;
  theme: ReturnType<typeof getTheme>;
}) => {
  const normalized = String(status || "").toLowerCase();

  const className =
    normalized === "open"
      ? theme.dangerBadge
      : normalized === "in-progress"
      ? theme.warningBadge
      : normalized === "resolved"
      ? theme.successBadge
      : normalized === "closed"
      ? theme.closedBadge
      : theme.badge;

  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold capitalize",
        className
      )}
    >
      {status || "unknown"}
    </span>
  );
};

const EmptyState = ({
  theme,
  title,
  subtitle,
}: {
  theme: ReturnType<typeof getTheme>;
  title: string;
  subtitle: string;
}) => (
  <div className="flex min-h-[300px] items-center justify-center p-8 text-center">
    <div>
      <div
        className={cx(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border",
          theme.iconBox
        )}
      >
        <MessageSquare className="h-8 w-8" />
      </div>

      <h3 className={cx("mt-4 text-lg font-semibold", theme.text)}>{title}</h3>
      <p className={cx("mt-2 max-w-md text-sm leading-6", theme.muted)}>
        {subtitle}
      </p>
    </div>
  </div>
);

export default function TicketsDashboard() {
  const mode = useSelector(
    (store: any) =>
      store?.adminTheme?.mode || store?.userTheme?.mode || store?.theme?.mode || "light"
  );

  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

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

  const queryParams = new URLSearchParams(location.search);
  const highlightedTicketId = queryParams.get("id");
  const queryChatId = queryParams.get("chatId");

  const fetchTickets = async () => {
    if (!AdminId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await adminApi.get(`/ticket/admin/all-tickets/${AdminId}`);
      const ticketsData = Array.isArray(res?.data) ? res.data : [];

      const initialAutoReply: Record<string, boolean> = {};

      ticketsData.forEach((ticket: any) => {
        initialAutoReply[ticket._id] = !!ticket.autoReply;
      });

      setTickets(ticketsData);
      setAutoReplyStatus(initialAutoReply);

      if (routeTicketId) {
        const ticketToOpen = ticketsData.find((t: any) => t._id === routeTicketId);

        if (ticketToOpen && (routeChatId || queryChatId)) {
          setActiveTicket(ticketToOpen);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load tickets");
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleToggleAutoReply = async (ticketId: string) => {
    const newStatus = !autoReplyStatus[ticketId];

    setAutoReplyStatus((prev) => ({
      ...prev,
      [ticketId]: newStatus,
    }));

    try {
      await adminApi.post(`/ticket/admin/${ticketId}/auto-reply`, {
        enabled: newStatus,
      });
    } catch (err) {
      console.error("Error updating auto-reply status:", err);

      setAutoReplyStatus((prev) => ({
        ...prev,
        [ticketId]: !newStatus,
      }));
    }
  };

  const handleNewTicket = async () => {
    await fetchTickets();
    setShowForm(false);
  };

  const filteredTickets = useMemo(() => {
    const byStatus =
      filterStatus === "All"
        ? tickets
        : tickets.filter((t) => t.status === filterStatus);

    if (!debounced) return byStatus;

    return byStatus.filter((t) => {
      const who =
        `${t?.user?.firstName || ""} ${t?.user?.lastName || ""} ${
          t?.user?.email || ""
        }`.toLowerCase();

      const subject = `${t?.subject || ""} ${t?.description || ""}`.toLowerCase();

      return (
        who.includes(debounced) ||
        subject.includes(debounced) ||
        String(t?._id || "").toLowerCase().includes(debounced)
      );
    });
  }, [tickets, filterStatus, debounced]);

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "open").length;
    const progress = tickets.filter((ticket) => ticket.status === "in-progress").length;
    const resolved = tickets.filter((ticket) => ticket.status === "resolved").length;

    return {
      total: tickets.length,
      open,
      progress,
      resolved,
    };
  }, [tickets]);

  if (loading) {
    return (
      <div
        className={cx(
          "flex min-h-screen w-full items-center justify-center p-4",
          theme.pageBg,
          theme.pageText
        )}
      >
        <Card theme={theme} className="w-full max-w-md text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-orange-500" />
          <p className={cx("mt-4 text-sm font-semibold", theme.muted)}>
            Loading tickets...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cx(
          "flex min-h-screen w-full items-center justify-center p-4",
          theme.pageBg,
          theme.pageText
        )}
      >
        <Card theme={theme} className="w-full max-w-md text-center">
          <div
            className={cx(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border",
              theme.dangerBadge
            )}
          >
            <AlertCircle className="h-7 w-7" />
          </div>

          <h3 className={cx("mt-4 text-lg font-semibold", theme.text)}>
            Error loading tickets
          </h3>

          <p className={cx("mt-2 text-sm", theme.muted)}>{error}</p>

          <button
            type="button"
            onClick={fetchTickets}
            className={cx(
              "mt-5 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition",
              theme.button
            )}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cx("min-h-screen w-full p-4 sm:p-6", theme.pageBg, theme.pageText)}>
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <HeaderCard theme={theme}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <HeaderIconBox theme={theme}>
                <MessageSquare className="h-6 w-6" />
              </HeaderIconBox>

              <div>
                <div
                  className={cx(
                    "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                    theme.headerBadge
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Customer · Support · Tickets
                </div>

                <h1
                  className={cx(
                    "text-2xl font-bold tracking-tight sm:text-3xl",
                    theme.headerText
                  )}
                >
                  Customer Support Dashboard
                </h1>

                <p className={cx("mt-2 max-w-2xl text-sm leading-6", theme.headerMuted)}>
                  Manage support tickets, review user issues, and continue ticket chats from one clean workspace.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 lg:min-w-[620px]">
              <HeaderStatBox
                theme={theme}
                icon={<Ticket className="h-4 w-4" />}
                label="Total"
                value={stats.total}
              />

              <HeaderStatBox
                theme={theme}
                icon={<AlertCircle className="h-4 w-4" />}
                label="Open"
                value={stats.open}
              />

              <HeaderStatBox
                theme={theme}
                icon={<Clock className="h-4 w-4" />}
                label="Progress"
                value={stats.progress}
              />

              <HeaderStatBox
                theme={theme}
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Resolved"
                value={stats.resolved}
              />
            </div>
          </div>
        </HeaderCard>

        {/* Controls */}
        <Card theme={theme}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <IconBox theme={theme}>
                <ShieldCheck className="h-5 w-5" />
              </IconBox>

              <div>
                <h2 className={cx("text-lg font-semibold", theme.text)}>
                  Ticket Controls
                </h2>
                <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                  Search by ticket ID, subject, description, or customer details.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search id / subject / user"
                  className={cx(
                    "w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:ring-4",
                    theme.input
                  )}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={cx(
                  "rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-4",
                  theme.input
                )}
              >
                <option value="All" className={theme.option}>
                  All
                </option>
                <option value="open" className={theme.option}>
                  Open
                </option>
                <option value="in-progress" className={theme.option}>
                  In Progress
                </option>
                <option value="resolved" className={theme.option}>
                  Resolved
                </option>
                <option value="closed" className={theme.option}>
                  Closed
                </option>
              </select>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition focus:ring-4",
                  theme.button
                )}
              >
                <PlusCircle className="h-4 w-4" />
                New Ticket
              </button>

              <button
                type="button"
                onClick={fetchTickets}
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition",
                  theme.outlineButton
                )}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card theme={theme} className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] whitespace-nowrap text-sm">
              <thead>
                <tr className={cx("border-b", theme.tableHead)}>
                  {[
                    "ID",
                    "Subject",
                    "Customer",
                    "Status",
                    "Auto Reply",
                    "Created",
                    "Action",
                  ].map((head) => (
                    <th
                      key={head}
                      className={cx(
                        "px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                        theme.muted
                      )}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket: any) => {
                  const isHighlighted =
                    ticket._id === highlightedTicketId || ticket._id === routeTicketId;

                  return (
                    <tr
                      key={ticket._id}
                      className={cx(
                        "border-b transition-colors duration-200",
                        theme.tableRow,
                        isHighlighted &&
                          (isDark ? "bg-blue-500/10" : "bg-orange-50")
                      )}
                    >
                      <td
                        className={cx(
                          "max-w-[170px] truncate px-4 py-4 font-mono text-xs",
                          theme.muted
                        )}
                      >
                        #{ticket._id}
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[320px]">
                          <p className={cx("truncate font-semibold", theme.text)}>
                            {ticket.subject || "No subject"}
                          </p>

                          {ticket.description ? (
                            <p className={cx("mt-1 truncate text-xs", theme.muted)}>
                              {ticket.description}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[240px]">
                          <p className={cx("truncate font-medium", theme.text)}>
                            {ticket?.user?.firstName || ""}{" "}
                            {ticket?.user?.lastName || ""}
                          </p>

                          {ticket?.user?.email ? (
                            <p className={cx("mt-1 truncate text-xs", theme.muted)}>
                              {ticket.user.email}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={ticket.status} theme={theme} />
                      </td>

                      <td className="px-4 py-4">
                        <Switch
                          checked={!!autoReplyStatus[ticket._id]}
                          onChange={() => handleToggleAutoReply(ticket._id)}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                          style={{
                            background: autoReplyStatus[ticket._id]
                              ? isDark
                                ? "#3b82f6"
                                : "#f97316"
                              : isDark
                              ? "rgba(255,255,255,0.12)"
                              : "#fed7aa",
                          }}
                        >
                          <span
                            className={`${
                              autoReplyStatus[ticket._id]
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </td>

                      <td className="px-4 py-4">
                        <div className={cx("flex items-center gap-2", theme.muted)}>
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setActiveTicket(ticket)}
                          className={cx(
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                            theme.successBadge
                          )}
                        >
                          <MessageCircle className="h-4 w-4" />
                          View Chat
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filteredTickets.length ? (
              <EmptyState
                theme={theme}
                title="No tickets found"
                subtitle="No tickets match your current search or filter. Try changing the filter or refreshing the list."
              />
            ) : null}
          </div>
        </Card>

        {/* Raise Ticket Modal */}
        {showForm ? (
          <div
            className={cx(
              "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm",
              theme.modalOverlay
            )}
          >
            <div className={cx("relative w-full max-w-lg", theme.pageText)}>
              <Card theme={theme}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={cx(
                    "absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition",
                    theme.outlineButton
                  )}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="pr-10">
                  <div className="mb-5 flex items-start gap-3">
                    <IconBox theme={theme}>
                      <PlusCircle className="h-5 w-5" />
                    </IconBox>

                    <div>
                      <h2 className={cx("text-lg font-semibold", theme.text)}>
                        Raise New Ticket
                      </h2>
                      <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                        Create a support ticket for a user issue.
                      </p>
                    </div>
                  </div>

                  <RaiseTicket
                    onCancel={() => setShowForm(false)}
                    onSubmit={handleNewTicket}
                  />
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {/* Chat Modal */}
        {activeTicket ? (
          <TicketChat ticket={activeTicket} onClose={() => setActiveTicket(null)} />
        ) : null}
      </div>
    </div>
  );
}