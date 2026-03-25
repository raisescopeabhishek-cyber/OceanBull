// TicketChat.tsx
import { useEffect, useRef, useState } from "react";
import { adminApi } from "../../../utils/apiClients";
import { Send, X, User, AlertCircle } from "lucide-react";
import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_API_BASE_URL);

type Props = {
  ticket: any;
  onClose: () => void;
};

export default function TicketChat({ ticket, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<any[]>(ticket?.chats || []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [shouldScrollSmooth, setShouldScrollSmooth] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Colors
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Low: "text-emerald-400",
      Medium: "text-amber-300",
      High: "text-orange-400",
      Critical: "text-rose-400",
    };
    return colors[priority] || "text-slate-300";
    };

  const getStatusPill = (status: string) => {
    const map: Record<string, string> = {
      open: "bg-blue-600",
      "in-progress": "bg-amber-500",
      resolved: "bg-emerald-600",
      closed: "bg-slate-600",
    };
    return map[status] || "bg-blue-600";
  };

  // Join room + listen for socket messages
  // useEffect(() => {
  //   if (!ticket?._id) return;
  //   socket.emit("joinTicket", ticket._id);

  //   const onNew = (msg: any) => {
  //     if (msg.ticket === ticket._id) {
  //       setChats((prev) => [...prev, msg]);
  //       setShouldScrollSmooth(true);
  //     }
  //   };

  //   socket.on("newMessage", onNew);
  //   return () => socket.off("newMessage", onNew);
  // }, [ticket?._id]);

  // Scroll behavior
  // useEffect(() => {
  //   if (!chatEndRef.current) return;
  //   if (shouldScrollSmooth) {
  //     chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  //     setShouldScrollSmooth(false);
  //   } else {
  //     chatEndRef.current.scrollIntoView({ behavior: "instant" as ScrollBehavior });
  //   }
  // }, [chats, shouldScrollSmooth]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await adminApi.get(`/ticket/admin/getchat/${ticket._id}`);
      if (res.data?.success) {
        setChats(res.data.data.chats || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  // useEffect(() => {
  //   if (ticket?._id) loadChats();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [ticket?._id]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const msgText = message.trim();

    try {
      const res = await adminApi.post("/ticket/admin/chat/postMessage", {
        ticketId: ticket._id,
        senderType: "Admin",
        sender: ticket.assignedAdmin,
        message: msgText,
      });

      if (res.data?.success) {
        setMessage("");
        setShouldScrollSmooth(true);
      }
    } catch (err) {
      console.error("Error sending:", err);
      const newChat = {
        _id: Date.now().toString(),
        senderType: "Admin",
        senderName: "You (Admin)",
        message: msgText,
        createdAt: new Date().toISOString(),
        temp: true,
      };
      setChats((prev) => [...prev, newChat]);
      setMessage("");
      setShouldScrollSmooth(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addSystemMessage = (text: string) => {
    const sysChat = {
      _id: Date.now().toString(),
      senderType: "System",
      message: text,
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, sysChat]);
    setShouldScrollSmooth(true);
  };

  const handleEndChat = async (status: "resolved" | "closed") => {
    try {
      await adminApi.post("/ticket/admin/closechat", {
        ticketId: ticket._id,
        status,
      });
      addSystemMessage(
        status === "resolved"
          ? "✅ Ticket marked as resolved by Admin"
          : "❌ Ticket closed by Admin"
      );
      onClose();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 border border-slate-700/60 rounded-2xl w-full max-w-3xl h-[85vh] relative flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          {(ticket.status === "open" || ticket.status === "in-progress") && (
            <button
              onClick={() => setShowEndOptions(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all"
            >
              End Chat
            </button>
          )}

          <div className="flex-1 text-center">
            <h2 className="text-lg md:text-xl font-semibold text-slate-100">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-3 text-xs justify-center mt-1">
              {ticket.priority && (
                <span className={`flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                  <AlertCircle size={14} /> {ticket.priority}
                </span>
              )}
              {ticket.status && (
                <span
                  className={`px-2 py-0.5 text-[10px] text-white rounded-full ${getStatusPill(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-400">
                <User size={14} />
                {ticket?.user?.name || ticket?.user?.email || "Customer"}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Close chat">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5">
          {loadingChats ? (
            <div className="flex items-center justify-center h-full text-slate-300">
              Loading chats...
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat, i) => {
                if (chat.senderType === "System") {
                  return (
                    <div key={chat._id || i} className="flex justify-center">
                      <div className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full">
                        {chat.message}
                      </div>
                    </div>
                  );
                }

                const mine = chat.senderType === "Admin";
                return (
                  <div
                    key={chat._id || i}
                    className={`p-3 rounded-xl max-w-[75%] ${
                      mine
                        ? "bg-emerald-600/90 text-white ml-auto"
                        : "bg-slate-800/80 text-slate-100"
                    }`}
                  >
                    <p className="text-[11px] opacity-75 mb-1">
                      {chat.senderName || (mine ? "You (Admin)" : "User")}
                    </p>
                    <p className="text-sm leading-relaxed">{chat.message}</p>
                    {chat.createdAt && (
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(chat.createdAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input / Status Banner */}
        {ticket.status === "open" || ticket.status === "in-progress" ? (
          <div className="p-4 border-t border-slate-700/60 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900/60 text-slate-100 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Reply to user…"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-60"
            >
              <div className="flex items-center gap-2">
                <Send size={18} />
                {isLoading ? "Sending..." : "Send"}
              </div>
            </button>
          </div>
        ) : ticket.status === "closed" ? (
          <div className="bg-rose-600 w-full px-4 py-3 flex items-center justify-center text-white font-semibold">
            ❌ Ticket is closed
          </div>
        ) : ticket.status === "resolved" ? (
          <div className="bg-emerald-600 w-full px-4 py-3 flex items-center justify-center text-white font-semibold">
            ✅ Ticket resolved
          </div>
        ) : null}

        {/* End Chat Options Modal */}
        {showEndOptions && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900/90 border border-slate-700/60 text-slate-100 p-6 rounded-2xl w-80 space-y-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-center">End Chat</h3>
              <p className="text-slate-300 text-sm text-center">
                Do you want to mark this ticket as{" "}
                <span className="text-emerald-400 font-semibold">Resolved</span> or{" "}
                <span className="text-rose-400 font-semibold">Closed</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEndChat("resolved")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl transition"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleEndChat("closed")}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 py-2 rounded-xl transition"
                >
                  Mark Closed
                </button>
              </div>
              <button
                onClick={() => setShowEndOptions(false)}
                className="w-full bg-slate-700/80 hover:bg-slate-600 py-2 rounded-xl mt-2 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
