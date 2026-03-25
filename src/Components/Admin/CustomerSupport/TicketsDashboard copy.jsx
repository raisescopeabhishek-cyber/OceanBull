import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  MessageSquare,
  Clock,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import RaiseTicket from "./RaiseTicket";
import TicketChat from "./TicketChat";
import { backendApi } from "../../../utils/apiClients";

// API configuration - replace with your actual API endpoints
const API_BASE_URL = "https://jsonplaceholder.typicode.com"; // Demo API
const API_ENDPOINTS = {
  tickets: `${API_BASE_URL}/posts`, // Using posts as demo tickets
  users: `${API_BASE_URL}/users`,
  comments: `${API_BASE_URL}/comments`, // Using comments as demo chats
};

export default function TicketsDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [filterStatus, setFilterStatus] = useState("All"); // ✅ new state

  // ... your fetchTickets etc remain unchanged

  // ✅ Apply filter
  const filteredTickets =
    filterStatus === "All"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Support Tickets Dashboard
          </h1>

          <div className="flex items-center gap-4">
            {/* ✅ Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* New Ticket Button */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/10 text-gray-200">
                <tr>
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Created</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-mono text-gray-300">
                      #{ticket.id}
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{ticket.subject}</p>
                        {ticket.description && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {ticket.description.substring(0, 80)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{ticket.userName}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === "Open"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : ticket.status === "In Progress"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : ticket.status === "Resolved"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewChat(ticket)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        View Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No tickets found</p>
              <p className="text-sm">
                Try changing the filter or create a new ticket
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

