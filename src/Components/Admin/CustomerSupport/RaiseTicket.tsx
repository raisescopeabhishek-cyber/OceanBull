// RaiseTicket.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../../../utils/apiClients";
import { Send, X, User } from "lucide-react";

type Props = {
  onSubmit: () => void;
  onCancel: () => void;
};

export default function RaiseTicket({ onSubmit, onCancel }: Props) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");

  // ✅ Fetch user list on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.get("/admin/user-list");
        setUsers(res?.data?.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !description.trim() || !selectedUser || isLoading) return;

    setIsLoading(true);
    try {
      const res = await adminApi.post(`/ticket/admin/riseTicket`, {
        userId: selectedUser,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        createdBy: "Admin",
      });

      if (res.data?.success) {
        onSubmit();
        setSubject("");
        setDescription("");
        setPriority("Medium");
        setSelectedUser("");
        onCancel();
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
          Raise a New Ticket
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User */}
      <div>
        <label className="block text-sm mb-1 text-slate-300">Select User</label>
        <div className="relative">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 text-slate-100 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <option value="">Choose a user…</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName || user.lastName ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : user.email || user._id}
              </option>
            ))}
          </select>
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm mb-1 text-slate-300">Subject</label>
        <input
          type="text"
          placeholder="Ticket Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm mb-1 text-slate-300">Description</label>
        <textarea
          placeholder="Describe the issue…"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm mb-1 text-slate-300">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 text-slate-100 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
          <option value="Critical">Critical Priority</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!subject.trim() || !description.trim() || !selectedUser || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold shadow-lg shadow-cyan-600/10 hover:from-cyan-500 hover:to-blue-500 transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
      >
        <Send className="w-5 h-5" />
        {isLoading ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  );
}
