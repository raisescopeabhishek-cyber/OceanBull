import { useEffect } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

// ---------------- Notification Dropdown ----------------
const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // ✅ react-router hook

  const notifications = [
    { id: 1, text: "Your account was updated", time: "2 min ago" },
    { id: 2, text: "New trade alert!", time: "10 min ago" },
    { id: 3, text: "Weekly report is ready", time: "1h ago" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = () => {
    navigate("/user/ticketDashborad"); // ✅ navigate to ticket dashboard
    onClose(); // ✅ close dropdown after navigation
  };

  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 right-0 top-10 w-64 bg-indigo-950 text-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-indigo-800">
              <p className="font-semibold">Notifications</p>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((note, index) => (
                  <motion.button
                    key={note.id}
                    onClick={handleNotificationClick}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-900 transition-all"
                  >
                    <p className="text-sm">{note.text}</p>
                    <span className="text-xs text-gray-400">{note.time}</span>
                  </motion.button>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-gray-400">No notifications</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default NotificationDropdown;
