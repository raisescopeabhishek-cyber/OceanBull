import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  PlusCircle,
  MessageSquare,
  Clock,
  MessageCircle,
  Search,
  Sparkles,
  Filter,
  X,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";

import { backendApi } from "../../../utils/apiClients";
import RaiseTicket from "./RaiseTicket";
import TicketChat from "./TicketChat";
import { FloatingParticles } from "../../../utils/FloatingParticles";

/* ============================== DECOR =============================== */

const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.2) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
        maskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
      }}
    />
    <motion.div
      className="absolute inset-0 opacity-20"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(59,130,246,0.08) 0 2px, transparent 2px 8px)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 11 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 150,
          height: 150,
          left: `${(i * 97) % 100}%`,
          top: `${(i * 53) % 100}%`,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(16,185,129,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.25), transparent 60%)",
        }}
        animate={{
          y: [0, i % 2 ? -22 : 22, 0],
          x: [0, i % 2 ? 12 : -12, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
      />
    ))}
  </div>
);

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 250, damping: 20 }}
    className={`relative rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-slate-900/70 backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.08)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/5 via-cyan-300/5 to-indigo-300/5 pointer-events-none" />
    {children}
  </motion.div>
);

const NeonDivider = () => (
  <div className="relative w-full my-4">
    <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
    <motion.div
      className="absolute -top-[3px] left-0 h-[7px] w-16 rounded-full bg-emerald-400/60 blur-md"
      animate={{ left: ["0%", "100%"] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/* =========================== SMALL UI BITS =========================== */

const statusChip = (s: string) => {
  const m: Record<string, string> = {
    open: "bg-red-500/20 text-red-300 border-red-400/30",
    "in-progress": "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
    resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  };
  return m[s] || "bg-white/10 text-white/80 border-white/20";
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${statusChip(
      String(status || "").toLowerCase()
    )}`}
  >
    {String(status || "")
      .replace("-", " ")
      .replace(/^\w/, (c) => c.toUpperCase())}
  </span>
);

const SkeletonRow: React.FC<{ i: number }> = ({ i }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: i * 0.05 }}
    className="border-t border-white/10"
  >
    {Array.from({ length: 5 }).map((_, idx) => (
      <td key={idx} className="p-3">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
      </td>
    ))}
  </motion.tr>
);

/* ============================== PAGE ================================= */

export default function TicketsDashboard() {
  const { ticketId, chatId } = useParams();

  // Prefer Redux; fall back to localStorage
  const reduxUser = useSelector((s: any) => s?.user?.loggedUser);
  const stored = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("loggedUser") || "null") || null;
    } catch {
      return null;
    }
  }, []);
  const userId: string | undefined = reduxUser?._id ?? stored?._id;

  const [showForm, setShowForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [highlightTicketId, setHighlightTicketId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in-progress" | "resolved">("all");

  const socketRef = useRef<Socket | null>(null);

  /* --------------------------- SOCKET: SAFE INIT --------------------------- */
  // useEffect(() => {
  //   if (!userId) return;

  //   const url = import.meta.env.VITE_API_BASE_URL;
  //   const s = io(url, {
  //     withCredentials: true,
  //     transports: ["websocket"], // faster, avoids long-polling noise
  //   });
  //   socketRef.current = s;

  //   s.emit("joinUserTicket", userId);

  //   const onNewTicket = (ticket: any) => {
  //     setTickets((prev) => {
  //       const exists = prev.some((t) => t._id === ticket._id);
  //       if (exists) return prev.map((t) => (t._id === ticket._id ? ticket : t));
  //       return [ticket, ...prev];
  //     });
  //   };

  //   s.on("newTicket", onNewTicket);

  //   return () => {
  //     s.off("newTicket", onNewTicket);
  //     s.disconnect();
  //     socketRef.current = null;
  //   };
  // }, [userId]);

  /* ------------------------------ FETCH TICKETS ------------------------------ */
  const fetchTickets = useCallback(
    async (uid: string, opts?: { signal?: AbortSignal }) => {
      setLoading(true);
      try {
        const res = await backendApi.get(`/ticket/user/${uid}`, { signal: opts?.signal });
        const arr = Array.isArray(res.data) ? res.data : [];
        setTickets(arr);

        if (ticketId) {
          const found = arr.find((t: any) => t._id === ticketId);
          if (found) setHighlightTicketId(found._id);
          if (chatId) setActiveTicket(found ?? null);
        }
      } catch (err: any) {
        // Surface a small hint in console but don’t crash UI
        console.error("[TicketsDashboard] Fetch error:", err?.message || err);
      } finally {
        setLoading(false);
      }
    },
    [ticketId, chatId]
  );

  // useEffect(() => {
  //   const ac = new AbortController();

  //   // Always clear loading if userId is not available to avoid infinite spinner
  //   if (!userId) {
  //     setLoading(false);
  //     setTickets([]);
  //     return () => ac.abort();
  //   }

  //   fetchTickets(userId, { signal: ac.signal });
  //   return () => ac.abort();
  // }, [userId, fetchTickets]);

  const handleNewTicket = async () => {
    if (!userId) return;
    await fetchTickets(userId);
  };

  const handleSendMessage = async (_ticketId: string, _message: string) => {
    // handled in TicketChat; kept here for symmetry
  };

  /* --------------------------------- DERIVED --------------------------------------- */
  const filtered = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return tickets
      .filter((t) => (statusFilter === "all" ? true : String(t.status).toLowerCase() === statusFilter))
      .filter((t) => {
        const idMatch = String(t._id || "").toLowerCase().includes(term);
        const subjectMatch = String(t.subject || "").toLowerCase().includes(term);
        return idMatch || subjectMatch;
      });
  }, [tickets, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const prog = tickets.filter((t) => t.status === "in-progress").length;
    const res = tickets.filter((t) => t.status === "resolved").length;
    return { total, open, prog, res };
  }, [tickets]);

  /* --------------------------------- ANIM VARS ------------------------------------- */
  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98, rotateX: 6 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.8, when: "beforeChildren", staggerChildren: 0.06 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -26, rotateY: -6, scale: 0.98 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 180, damping: 20, duration: 0.5 },
    },
  };

  /* ---------------------------------- RENDER --------------------------------------- */
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
    >
      <AnimatedGrid />
      <FloatingOrbs />
 <FloatingParticles/>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="uppercase tracking-[0.25em] text-xs text-emerald-300/80 font-semibold">
              help · tickets · support
            </span>
          </div>
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold"
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            ⚡ My Support Tickets
          </motion.h1>
          <p className="text-white/70 mt-1">
            Track issues, chat with support, and raise new tickets—fast and secure.
          </p>
        </div>

        {/* Layout: Sidebar + Main */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <GlassCard className="p-5 lg:col-span-4 xl:col-span-3">
            {/* New ticket */}
            <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-black
                bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
            >
              <PlusCircle className="w-5 h-5" />
              New Ticket
              <motion.span
                className="absolute inset-0 rounded-full opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  background:
                    "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,0.35), transparent 40%)",
                }}
              />
            </motion.button>

            <NeonDivider />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total", value: stats.total, tone: "from-white/10 to-white/5", text: "text-white/90" },
                { label: "Open", value: stats.open, tone: "from-red-500/20 to-red-500/10", text: "text-red-300" },
                { label: "In Progress", value: stats.prog, tone: "from-yellow-500/20 to-yellow-500/10", text: "text-yellow-300" },
                { label: "Resolved", value: stats.res, tone: "from-emerald-500/20 to-emerald-500/10", text: "text-emerald-300" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl border border-white/10 bg-gradient-to-br ${s.tone} p-3 text-center`}
                >
                  <div className={`text-lg font-bold ${s.text}`}>{s.value}</div>
                  <div className="text-xs text-white/70">{s.label}</div>
                </div>
              ))}
            </div>

            <NeonDivider />

            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300/80" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID / subject"
                  className="w-full pl-9 pr-3 py-2 rounded-xl outline-none text-white/90
                    bg-gradient-to-br from-slate-900/70 to-slate-900/30 border border-emerald-400/20
                    focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition"
                />
              </div>

              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Filter size={16} />
                <span>Status</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["all", "open", "in-progress", "resolved"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl border text-sm ${
                      statusFilter === s
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {s.replace("-", " ").replace(/^\w/, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Main Table */}
          <GlassCard className="p-0 lg:col-span-8 xl:col-span-9 overflow-hidden">
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-300" />
                <h2 className="text-lg font-semibold">Tickets</h2>
                <span className="text-white/60 text-sm">({filtered.length})</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Subject</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Created</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading &&
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} i={i} />)}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-white/60">
                        {userId
                          ? "No tickets found. Try adjusting your filters."
                          : "Sign in to view your tickets."}
                      </td>
                    </tr>
                  )}

                  <AnimatePresence initial={false}>
                    {!loading &&
                      filtered.map((ticket, i) => (
                        <motion.tr
                          key={ticket._id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.02 }}
                          className={`border-t border-white/10 hover:bg-white/5 ${
                            highlightTicketId === ticket._id ? "bg-emerald-500/10" : ""
                          }`}
                          whileHover={{
                            backgroundColor: "rgba(51,65,85,0.3)",
                            transition: { duration: 0.18 },
                          }}
                        >
                          <td className="p-3">
                            <span className="font-mono text-white/80">#{String(ticket._id).slice(0, 8)}</span>
                          </td>
                          <td className="p-3 font-medium text-white/90">{ticket.subject}</td>
                          <td className="p-3">
                            <StatusChip status={ticket.status} />
                          </td>
                          <td className="p-3 text-white/70">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")}
                            </div>
                          </td>
                          <td className="p-3">
                            <motion.button
                              onClick={() => setActiveTicket(ticket)}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.98 }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                                bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border border-emerald-400/30 text-emerald-200"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Chat
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center text-white/50 mt-8 text-sm">
          We’re here to help—quickly and transparently.
        </div>
      </div>

      {/* Ticket Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="relative w-full max-w-lg"
            >
              <GlassCard className="p-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-3 right-3 text-white/70 hover:text-white"
                  aria-label="Close"
                >
                  <X />
                </button>
                <RaiseTicket onCancel={() => setShowForm(false)} onSubmit={handleNewTicket} />
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {activeTicket && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="relative w-full max-w-4xl"
            >
              <GlassCard className="p-4">
                <button
                  onClick={() => setActiveTicket(null)}
                  className="absolute top-3 right-3 text-white/70 hover:text-white"
                  aria-label="Close"
                >
                  <X />
                </button>
                <TicketChat
                  ticket={activeTicket}
                  setActiveTicket={setActiveTicket}
                  setTickets={setTickets}
                  onClose={() => setActiveTicket(null)}
                  onSendMessage={handleSendMessage}
                />
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
