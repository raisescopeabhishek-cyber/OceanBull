import { useEffect, useRef, useState, useMemo } from "react";
import { backendApi } from "../../../utils/apiClients";
import {
  AlertCircle,
  Clock,
  Send,
  Share2,
  User,
  X,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Copy,
} from "lucide-react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { FloatingParticles } from "../../../utils/FloatingParticles";

// const socket = io(import.meta.env.VITE_API_BASE_URL);

/* ============================== DECOR =============================== */
const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 159, 110,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 159, 110,0.22) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
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
          "repeating-linear-gradient(90deg, rgba(79, 125, 246,0.08) 0 2px, transparent 2px 8px)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 9 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 140,
          height: 140,
          left: `${(i * 97) % 100}%`,
          top: `${(i * 53) % 100}%`,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(15, 159, 110,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(23, 157, 166,0.25), transparent 60%)",
        }}
        animate={{ y: [0, i % 2 ? -20 : 20, 0], x: [0, i % 2 ? 10 : -10, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
      />
    ))}
  </div>
);

const GlassCard = ({ className = "", children }) => (
  <motion.div
    initial={{ y: 18, scale: 0.98, opacity: 0 }}
    animate={{ y: 0, scale: 1, opacity: 1 }}
    exit={{ y: 12, scale: 0.98, opacity: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    className={`relative rounded-2xl border border-success bg-gradient-to-br    backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.10)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] pointer-events-none" />
    {children}
  </motion.div>
);

const NeonDivider = () => (
  <div className="relative w-full my-4">
    <div className="h-px w-full" />
    <motion.div
      className="absolute -top-[3px] left-0 h-[7px] w-16 rounded-full bg-success-soft blur-md"
      animate={{ left: ["0%", "100%"] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/* ============================== HELPERS ============================== */
const getPriorityTone = (priority) => {
  const map = {
    Low: "text-success",
    Medium: "text-warning",
    High: "text-primary",
    Critical: "text-danger",
  };
  return map[priority] || "text-muted";
};

const getStatusBadge = (status) => {
  const tone = {
    open: "",
    "in-progress": "bg-warning-soft",
    resolved: "",
    closed: "",
  }[String(status || "").toLowerCase()] || "";
  return `bg-gradient-to-r ${tone} text-text px-3 py-1 text-xs rounded-full`;
};

/* ============================== COMPONENT ============================= */
export default function TicketChat({
  ticket,
  setActiveTicket,
  setTickets,
  onClose,
  onSendMessage,
}) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(ticket.chats || []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [shouldScrollSmooth, setShouldScrollSmooth] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

  /* --------------------------- SOCKET: JOIN & LIVE --------------------------- */
  // useEffect(() => {
  //   if (!ticket?._id) return;
  //   socket.emit("joinTicket", ticket._id);

  //   const onNewMessage = (msg, status) => {
  //     if (msg.ticket === ticket._id) {
  //       setChats((prev) => [...prev, msg]);
  //       setShouldScrollSmooth(true);

  //       setActiveTicket((prev) => ({ ...prev, status }));
  //       setTickets((prev) => prev.map((t) => (t._id === msg.ticket ? { ...t, status } : t)));
  //     }
  //   };

  //   socket.on("newMessage", onNewMessage);
  //   return () => socket.off("newMessage", onNewMessage);
  // }, [ticket?._id, setActiveTicket, setTickets]);

  /* ------------------------------- LOAD CHATS -------------------------------- */
  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await backendApi.get(`/ticket/user/chat/${ticket._id}`);
      if (res?.data?.success) {
        setChats(res.data.data.chats || []);
      } else {
        setChats(ticket.chats || []);
      }
    } catch (err) {
      console.error("Error loading chats:", err);
      setChats(ticket.chats || []);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (ticket && ticket._id) {
      loadChats();
    } else {
      setChats(ticket.chats || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?._id]);

  /* --------------------------- AUTO SCROLL BOTTOM --------------------------- */
  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({
      behavior: shouldScrollSmooth ? "smooth" : "auto", // 'instant' → 'auto' (standards-compliant)
      block: "end",
    });
    if (shouldScrollSmooth) setShouldScrollSmooth(false);
  }, [chats, shouldScrollSmooth]);

  /* --------------------------------- ACTIONS -------------------------------- */
  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await backendApi.post("/ticket/user/chat/postMessage", {
        ticketId: ticket._id,
        message: message.trim(),
        senderType: "User",
        sender: ticket.user,
      });
      if (res?.data?.message === "Message sent successfully") {
        setMessage("");
        setShouldScrollSmooth(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const fallback = {
        _id: Date.now().toString(),
        senderType: "User",
        senderName: "You",
        message: message.trim(),
        createdAt: new Date().toISOString(),
        temp: true,
      };
      setChats((prev) => [...prev, fallback]);
      setShouldScrollSmooth(true);
      onSendMessage?.(ticket._id, message.trim());
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addSystemMessage = (text) => {
    const m = {
      _id: Date.now().toString(),
      senderType: "System",
      message: text,
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, m]);
    setShouldScrollSmooth(true);
  };

  const handleUserFeedback = async (feedback) => {
    try {
      await backendApi.post("/ticket/user/feedback", {
        ticketId: ticket._id,
        feedback, // "resolved" | "not-resolved"
      });
      addSystemMessage(
        feedback === "resolved"
          ? "🙏 Thank you for your feedback. Glad we could help!"
          : "⚠️ Sorry about that. Our support team will follow up."
      );
    } catch (err) {
      console.error("Feedback failed:", err);
    }
  };

  const transcript = useMemo(() => {
    const lines = (chats || []).map((c) => {
      const who =
        c.senderType === "System" ? "[System]" : c.senderType === "User" ? "[You]" : "[Support]";
      const ts = c.createdAt ? dayjs(c.createdAt).format("DD/MM/YYYY HH:mm") : "";
      return `${ts} ${who}: ${c.message}`;
    });
    return `Ticket: ${ticket?.subject || ""}\n\n${lines.join("\n")}`;
  }, [chats, ticket?.subject]);

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  /* ------------------------------- VARIANTS -------------------------------- */
  const bubbleVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 220, damping: 18, duration: 0.45 },
    },
  };

  /* ---------------------------------- UI ----------------------------------- */
  const allowInput = ticket.status === "open" && ticket.userFeedback === "pending";

  return (
    <AnimatePresence>

      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Neon background */}
        <div className="absolute inset-0">
          <AnimatedGrid />
          <FloatingOrbs />
        </div>

        <GlassCard className="w-full max-w-3xl h-[86vh] relative flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-line">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-extrabold text-text break-words pr-8">
                  {ticket.subject}
                </h2>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                  {ticket.priority && (
                    <span className={`flex items-center gap-1 font-semibold ${getPriorityTone(ticket.priority)}`}>
                      <AlertCircle size={16} />
                      {ticket.priority}
                    </span>
                  )}
                  {ticket.status && (
                    <span className={getStatusBadge(ticket.status)}>
                      {String(ticket.status).replace("-", " ").replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-muted font-medium">
                    <User size={16} />
                    {ticket.user?.name || ticket.user?.email || "Customer"}
                  </span>
                  {ticket.createdAt && (
                    <span className="flex items-center gap-1 text-muted font-medium">
                      <Clock size={16} />
                      {dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  onClick={copyTranscript}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-field text-text"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy Transcript"}
                </motion.button>

                <button
                  onClick={onClose}
                  className="text-muted hover:text-text transition-colors p-1.5 rounded-field hover:bg-surface-2"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 bg-black/60">
           <FloatingParticles/>

            {loadingChats ? (
              <div className="h-full w-full flex items-center justify-center text-muted gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading messages…
              </div>
            ) : chats.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center text-muted">
                <MessageSquare size={48} className="mb-3 opacity-80" />
                <p className="text-lg font-semibold">No messages yet</p>
                <p className="text-sm">Start the conversation by sending a message.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {chats.map((chat, i) => {
                    if (chat.senderType === "System") {
                      return (
                        <motion.div
                          key={chat._id || `sys-${i}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="flex justify-center"
                        >
                          <div className="text-xs text-muted bg-surface-2 px-4 py-2 rounded-full shadow">
                            {chat.message}
                          </div>
                        </motion.div>
                      );
                    }

                    const mine = chat.senderType === "User";
                    return (
                      <motion.div
                        key={chat._id || i}
                        variants={bubbleVariants}
                        initial="hidden"
                        animate="visible"
                        className={`max-w-[78%] p-3 rounded-2xl shadow-md ${
                          mine
                            ? "ml-auto border border-success text-success rounded-br-sm"
                            : "mr-auto bg-surface-2 border border-line text-muted rounded-bl-sm"
                        }`}
                      >
                        <div className="text-[11px] opacity-70 mb-1">
                          {chat.senderName || (mine ? "You" : "Support")}
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</div>
                        {chat.createdAt && (
                          <div className="text-[10px] opacity-60 mt-1">
                            {dayjs(chat.createdAt).format("DD/MM/YYYY HH:mm")}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Feedback banners */}
          {ticket.userFeedback === "pending" && (ticket.status === "closed" || ticket.status === "resolved") && (
            <div className="px-5 pb-3">
              <div className="bg-surface border border-line rounded-card p-4 text-center">
                <p className="text-text font-semibold">Was your issue resolved?</p>
                <p className="text-muted text-sm">
                  Help us improve by letting us know if this ticket was successfully handled.
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <motion.button
                    onClick={() => handleUserFeedback("resolved")}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 rounded-card bg-success hover:bg-success text-text font-semibold"
                  >
                    ✅ Yes, resolved
                  </motion.button>
                  <motion.button
                    onClick={() => handleUserFeedback("not-resolved")}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 rounded-card bg-danger hover:bg-danger text-text font-semibold"
                  >
                    ❌ Not resolved
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {ticket.userFeedback === "resolved" && (
            <div className="px-5 mb-2">
              <div className="bg-success-soft border border-success rounded-card p-4 text-center">
                <p className="text-text text-sm font-semibold">🎉 Thank you! Glad we could help.</p>
              </div>
            </div>
          )}

          {ticket.userFeedback === "not-resolved" && (
            <div className="px-5 mb-2">
              <div className="bg-danger-soft border border-danger rounded-card p-4 text-center">
                <p className="text-text text-sm font-semibold">😔 We’ll follow up shortly.</p>
              </div>
            </div>
          )}

          {/* Input / Status bar */}
          {allowInput ? (
            <div className="p-5 border-t border-line">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    rows={1}
                    placeholder="Type your message…"
                    className="w-full resize-none px-4 py-3 rounded-card bg-surface-2 border border-line text-text outline-none focus:ring-2 focus:ring-success focus:border-success transition"
                  />
                  <div className="pointer-events-none absolute inset-px rounded-[calc(.75rem-1px)] to-transparent" />
                </div>

                <motion.button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative inline-flex items-center gap-2 px-4 py-3 rounded-card font-semibold text-text disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isLoading ? "Sending…" : "Send"}
                  <motion.span
                    className="absolute inset-0 rounded-card opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      background:
                        "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,0.35), transparent 40%)",
                    }}
                  />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="border-t border-line">
              <div className="w-full px-4 py-3 text-center text-muted">
                {ticket.status === "in-progress" && "🤔 We’re working on it… Please wait a moment."}
                {ticket.status === "closed" && "😔 This ticket is closed."}
                {ticket.status === "resolved" && "😍 Great! Issue resolved successfully."}
                {ticket.status === "Not Resolved" && "😡 Marked as not resolved."}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
