import { useRef, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { X, Bell, Sparkles } from "lucide-react";
import { fetchUserNotifications, markNotificationRead } from "../../utils/authService";
import { setNotification } from "../../../redux/user/userSlice";

/* --------------------------- Animations --------------------------- */
const popIn = {
  hidden: { opacity: 0, y: -10, scale: 0.96, rotateX: 6 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { opacity: 0, y: -10, scale: 0.96, rotateX: -4, transition: { duration: 0.14 } }
};

const item = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.05 * i, type: "spring", stiffness: 280, damping: 22 }
  })
};

const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({ opacity: 1, transition: { delay: 0.05 * i } })
};

/* --------------------------- Component --------------------------- */
const NotificationDropdown = ({ isOpen, onClose, userId }) => {
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const notifications = useSelector((state) => state.user.notification) || [];
  const [isLoading, setIsLoading] = useState(false);

  // Derived counts
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Fetch on open / user change / route change
  useEffect(() => {
    if (!userId || !isOpen) return;
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserNotifications(userId);
        if (mounted) dispatch(setNotification(Array.isArray(data) ? data : []));
      } catch (e) {
        // silent fail to keep dropdown snappy
        console.error("Notifications fetch error:", e);
      } finally {
        mounted && setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [userId, isOpen, location.pathname, dispatch]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    const onEsc = (e) => e.key === "Escape" && onClose();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const handleNotificationClick = async (note) => {
    try {
      await markNotificationRead(note._id);
    } catch {
      // ignore backend hiccup; still optimistically update
    }

    // Optimistic update
    dispatch(
      setNotification(
        notifications.map((n) =>
          n._id === note._id ? { ...n, isRead: true } : n
        )
      )
    );

    if (note.userLink) navigate(note.userLink);
    onClose();
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    try {
      await Promise.all(unread.map((n) => markNotificationRead(n._id)));
    } catch {
      // ignore; still optimistically update
    }
    dispatch(setNotification(notifications.map((n) => ({ ...n, isRead: true }))));
  };

  /* --------------------------- Render --------------------------- */
  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 right-0 top-10 w-80"
          >
            {/* Glass card with neon rim + subtle glow sweep */}
            <div className="relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-950/90 via-slate-900/40 to-slate-950/90 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.12)] overflow-hidden text-white">
              {/* Neon gradient sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 60% at 10% 0%, rgba(16,185,129,0.18), transparent 40%)"
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Header */}
              <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-300" />
                  <p className="font-semibold tracking-wide">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-emerald-300/90 hover:text-emerald-200 text-xs font-semibold px-2 py-1 rounded-md hover:bg-emerald-400/10 transition"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition"
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="relative max-h-72 overflow-y-auto">
                {/* grid overlay lines for subtle “crypto” vibe */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.2) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />

                {isLoading ? (
                  <div className="p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={skeletonVariants}
                        initial="hidden"
                        animate="visible"
                        className="px-4 py-3 border-b border-white/10"
                      >
                        <div className="h-3 w-1/2 bg-white/10 rounded mb-2 animate-pulse" />
                        <div className="h-3 w-3/4 bg-white/10 rounded mb-1.5 animate-pulse" />
                        <div className="h-2.5 w-24 bg-white/10 rounded animate-pulse" />
                      </motion.div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {notifications.map((note, index) => (
                      <motion.button
                        key={note._id}
                        custom={index}
                        variants={item}
                        initial="hidden"
                        animate="visible"
                        onClick={() => handleNotificationClick(note)}
                        className={`w-full text-left px-4 py-3 relative group transition-all ${
                          !note.isRead ? "bg-white/[0.03]" : ""
                        } hover:bg-white/[0.06]`}
                      >
                        {/* Unread neon bar */}
                        {!note.isRead && (
                          <span className="absolute left-0 top-0 h-full w-0.5 bg-emerald-400/70 rounded-r-md shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                        )}

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                note.isRead ? "bg-white/25" : "bg-emerald-400"
                              }`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-white/90 truncate">
                                {note.title}
                              </p>
                              <span className="text-[10px] text-white/50 shrink-0">
                                {new Date(note.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-white/70 leading-snug line-clamp-2">
                              {note.message}
                            </p>
                          </div>

                          <motion.span
                            className="opacity-0 group-hover:opacity-100 text-emerald-300/80"
                            initial={false}
                            animate={{ x: 0 }}
                          >
                            →
                          </motion.span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-10 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-2">
                      <Sparkles className="w-6 h-6 text-emerald-300" />
                    </div>
                    <p className="text-sm text-white/70">No notifications</p>
                    <p className="text-xs text-white/50 mt-1">You’re all caught up ✨</p>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="relative px-4 py-2 text-[11px] text-white/50 border-t border-white/10">
                Tip: Click a notification to jump to the relevant page.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
