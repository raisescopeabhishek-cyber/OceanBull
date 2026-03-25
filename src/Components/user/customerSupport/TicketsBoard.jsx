import { AlertCircle, Clock, Plus, User } from "lucide-react";
import RaiseTicket from "./RaiseTicket";
import TicketChat from "./TicketChat";
import { backendApi } from "../../../utils/apiClients";
import { useEffect } from "react";
import { useState } from "react";

export default function TicketsBoard() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tickets on component mount
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await backendApi.get("/tickets");

      if (res.success) {
        setTickets(res.data);
      } else {
        throw new Error("Failed to load tickets");
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
      setError("Failed to load tickets. Using demo data.");

      // Fallback to mock data
      setTickets([
        {
          id: 1,
          _id: "demo1",
          subject: "Login Issue",
          description: "Cannot access account",
          status: "Open",
          priority: "High",
          userName: "Customer",
          createdAt: new Date().toISOString(),
          chatCount: 2,
          chats: [
            {
              sender: "Support",
              senderName: "Support",
              senderType: "Support",
              message: "Hello, how can I help you?",
              text: "Hello, how can I help you?",
              createdAt: new Date().toISOString(),
            },
            {
              sender: "Customer",
              senderName: "Customer",
              senderType: "Customer",
              message: "I can't login to my account.",
              text: "I can't login to my account.",
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 2,
          _id: "demo2",
          subject: "Payment Failed",
          description: "Payment processing issue",
          status: "In Progress",
          priority: "Medium",
          userName: "Customer",
          createdAt: new Date().toISOString(),
          chatCount: 1,
          chats: [
            {
              sender: "Customer",
              senderName: "Customer",
              senderType: "Customer",
              message: "My payment didn't go through.",
              text: "My payment didn't go through.",
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setShowRaiseTicket(false);
  };

  const handleOpenTicket = async (ticket) => {
    try {
      // Try to get full ticket details with chats
      const res = await backendApi.get(`/tickets/${ticket._id}`);

      if (res.success) {
        setActiveTicket(res.data);
      } else {
        setActiveTicket(ticket);
      }
    } catch (error) {
      console.error("Error loading ticket details:", error);
      setActiveTicket(ticket);
    }
  };

  const handleSendMessage = (ticketId, message) => {
    // Update local ticket state
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId || t._id === ticketId
          ? {
              ...t,
              chats: [
                ...(t.chats || []),
                {
                  sender: "Customer",
                  senderName: "Customer",
                  senderType: "Customer",
                  message,
                  text: message,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "text-green-400",
      Medium: "text-yellow-400",
      High: "text-orange-400",
      Critical: "text-red-400",
    };
    return colors[priority] || "text-gray-400";
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-blue-500",
      "In Progress": "bg-yellow-500",
      Resolved: "bg-green-500",
      Closed: "bg-gray-500",
    };
    return colors[status] || "bg-blue-500";
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading tickets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <button
          onClick={() => setShowRaiseTicket(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold"
        >
          <Plus size={20} />
          Raise Ticket
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-600/20 border border-red-500 text-red-200 rounded-lg">
          {error}
          <button
            onClick={loadTickets}
            className="ml-4 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No tickets found</div>
            <button
              onClick={() => setShowRaiseTicket(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id || ticket._id}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/10 transition-all border border-white/10"
              onClick={() => handleOpenTicket(ticket)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {ticket.subject}
                  </h3>
                  {ticket.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {ticket.priority && (
                      <span
                        className={`flex items-center gap-1 ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        <AlertCircle size={16} />
                        {ticket.priority}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-400">
                      <User size={16} />
                      {ticket.userName || "Customer"}
                    </span>
                    {ticket.createdAt && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock size={16} />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {ticket.status && (
                    <span
                      className={`px-3 py-1 text-xs text-white rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  )}
                  <span className="text-sm text-gray-400">
                    {ticket.chatCount || ticket.chats?.length || 0} messages
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showRaiseTicket && (
        <RaiseTicket
          onSubmit={handleCreateTicket}
          onCancel={() => setShowRaiseTicket(false)}
        />
      )}

      {/* Chat Modal */}
      {activeTicket && (
        <TicketChat
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
