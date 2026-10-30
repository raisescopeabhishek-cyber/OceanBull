// TicketsDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Switch } from "@headlessui/react";

import RaiseTicket from "./RaiseTicket";
import TicketChat from "./TicketChat";
import { adminApi } from "../../../utils/apiClients";
import {
  BlotterPage,
  Button,
  Card,
  EmptyState,
  Modal,
  StatusBadge,
} from "@/Components/ui";

/**
 * Support tickets.
 *
 * The queue is a blotter and the conversation stays what it was: a full
 * surface of its own, opened from a row. The page previously carried a local
 * `getTheme` map plus its own `Card`, `IconBox`, `StatusBadge` and
 * `EmptyState`; those are all the shared design system now.
 */

const TicketsDashboard = () => {
  const [autoReplyStatus, setAutoReplyStatus] = useState<
    Record<string, boolean>
  >({});
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
        const ticketToOpen = ticketsData.find(
          (t: any) => t._id === routeTicketId
        );

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

      const subject = `${t?.subject || ""} ${
        t?.description || ""
      }`.toLowerCase();

      return (
        who.includes(debounced) ||
        subject.includes(debounced) ||
        String(t?._id || "")
          .toLowerCase()
          .includes(debounced)
      );
    });
  }, [tickets, filterStatus, debounced]);

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "open").length;
    const progress = tickets.filter(
      (ticket) => ticket.status === "in-progress"
    ).length;
    const resolved = tickets.filter(
      (ticket) => ticket.status === "resolved"
    ).length;

    return {
      total: tickets.length,
      open,
      progress,
      resolved,
    };
  }, [tickets]);

  /* The conversation takes the whole surface: nothing else on the page is
     actionable while a ticket is being answered. */
  if (activeTicket) {
    return (
      <TicketChat
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
      />
    );
  }

  const columns = [
    {
      key: "subject",
      header: "Subject",
      primary: true,
      cell: (ticket: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {ticket?.subject || "No subject"}
          </div>
          {ticket?.description ? (
            <div className="truncate text-xs text-subtle">
              {ticket.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      secondary: true,
      cell: (ticket: any) => (
        <div className="min-w-0">
          <div className="truncate text-xs text-text">
            {[ticket?.user?.firstName, ticket?.user?.lastName]
              .filter(Boolean)
              .join(" ") || "Unknown"}
          </div>
          <div className="numeric truncate text-[11px] text-subtle">
            {ticket?.user?.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "id",
      header: "Ticket",
      numeric: true,
      cell: (ticket: any) => (
        <span className="text-xs">
          {String(ticket?._id || "").slice(-8) || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (ticket: any) => <StatusBadge status={ticket?.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (ticket: any) => (
        <span className="numeric text-xs text-subtle">
          {formatDate(ticket?.createdAt)}
        </span>
      ),
    },
    {
      key: "autoReply",
      header: "Auto reply",
      cell: (ticket: any) => (
        <Switch
          checked={!!autoReplyStatus[ticket._id]}
          onChange={() => handleToggleAutoReply(ticket._id)}
          onClick={(e: any) => e.stopPropagation()}
          className={[
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-line transition-colors",
            autoReplyStatus[ticket._id] ? "bg-primary" : "bg-surface-3",
          ].join(" ")}
        >
          <span className="sr-only">Toggle auto reply</span>
          <span
            className={[
              "inline-block h-3.5 w-3.5 rounded-full bg-surface shadow-card transition-transform",
              autoReplyStatus[ticket._id] ? "translate-x-[18px]" : "translate-x-1",
            ].join(" ")}
          />
        </Switch>
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (ticket: any) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="soft"
            onClick={(e: any) => {
              e.stopPropagation();
              setActiveTicket(ticket);
            }}
          >
            Open chat
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <BlotterPage
        breadcrumb="Support / Tickets"
        title="Support tickets"
        description="The support queue, with the conversation one click from each row."
        actions={
          <>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Raise ticket
            </Button>
            <Button variant="secondary" onClick={fetchTickets} loading={loading}>
              Refresh
            </Button>
          </>
        }
        readouts={[
          {
            key: "total",
            label: "All tickets",
            value: stats.total,
            tone: "brand",
          },
          {
            key: "open",
            label: "Open",
            value: stats.open,
            tone: stats.open ? "warn" : "ok",
            helper: stats.open ? "Waiting on us" : "Nothing waiting",
          },
          {
            key: "progress",
            label: "In progress",
            value: stats.progress,
          },
          {
            key: "resolved",
            label: "Resolved",
            value: stats.resolved,
            tone: "ok",
          },
        ]}
        filter={{
          search,
          onSearchChange: setSearch,
          searchPlaceholder: "subject, customer, ticket id",
          activeChip: filterStatus,
          onChipChange: setFilterStatus,
          chips: [
            { key: "All", label: "All", tone: "primary" },
            {
              key: "open",
              label: "Open",
              tone: "warning",
              count: stats.open,
            },
            {
              key: "in-progress",
              label: "In progress",
              tone: "primary",
              count: stats.progress,
            },
            {
              key: "resolved",
              label: "Resolved",
              tone: "success",
              count: stats.resolved,
            },
          ],
          summary: `${filteredTickets.length} shown`,
        }}
        columns={columns}
        rows={filteredTickets}
        loading={loading}
        onRowClick={(ticket: any) => setActiveTicket(ticket)}
        rowEdge={(ticket: any) => {
          if (ticket?._id === highlightedTicketId) return "primary";
          return ticket?.status === "open" ? "warning" : null;
        }}
        empty={
          <EmptyState
            title={error ? "Could not load tickets" : "No tickets found"}
            description={
              error ||
              "Nothing matches that search in the selected status."
            }
            action={
              <Button variant="soft" onClick={fetchTickets}>
                Try again
              </Button>
            }
          />
        }
      >
        {error && tickets.length ? (
          <Card className="mb-2 border-danger bg-danger-soft px-3 py-2">
            <p className="text-xs font-medium text-danger">{error}</p>
          </Card>
        ) : null}
      </BlotterPage>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Raise a ticket"
        size="lg"
      >
        <RaiseTicket
          onSubmit={handleNewTicket}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </>
  );
};

export default TicketsDashboard;
