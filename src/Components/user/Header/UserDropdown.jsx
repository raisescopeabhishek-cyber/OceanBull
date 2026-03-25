import { useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, UserCircle, UserRoundCog, KeyRound, Sparkles } from "lucide-react";
import { RiCustomerService2Line } from "react-icons/ri";
import UseUserHook from "../../../hooks/user/UseUserHook";

// ---------------- User Dropdown (crypto/glass vibe) ----------------
const popIn = {
  hidden: { opacity: 0, y: 10, scale: 0.98, rotateX: 8 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { opacity: 0, y: -6, scale: 0.98, rotateX: -4, transition: { duration: 0.14 } }
};

const item = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.05 * i, type: "spring", stiffness: 280, damping: 22 }
  })
};

export const UserDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const { getReset } = UseUserHook();
  const navigate = useNavigate();
  const loggedUser = useSelector((s) => s.user.loggedUser);

  const displayName = useMemo(() => {
    const f = loggedUser?.firstName || "";
    const l = loggedUser?.lastName || "";
    return (f + " " + l).trim() || "You";
  }, [loggedUser]);

  const initials = useMemo(() => {
    const f = (loggedUser?.firstName || "U")[0];
    const l = (loggedUser?.lastName || "D")[0];
    return (f + (l || "")).toUpperCase();
  }, [loggedUser]);

  const menuItems = [
    { to: "/user/profile",          icon: <UserCircle className="w-4 h-4" />,         label: "Profile" },
    { to: "/user/account-details",  icon: <UserRoundCog className="w-4 h-4" />,       label: "Account Details" },
    { to: "/user/change-password",  icon: <KeyRound className="w-4 h-4" />,           label: "Change Password" },
    // { to: "/user/customer-support", icon: <RiCustomerService2Line className="w-4 h-4" />, label: "Customer Support" },
  ];

  const logoutHandler = () => {
    getReset();
    navigate("/user/login");
  };

  // close on click outside
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

  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 right-0 top-12 w-64"
          >
            {/* Glass card with neon rim */}
            <div className="relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-950/90 via-slate-900/40 to-slate-950/90 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.12)] overflow-hidden">
              {/* Neon sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 60% at 10% 0%, rgba(16,185,129,0.18), transparent 40%)"
                }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Header */}
              <div className="relative px-4 py-4 border-b border-white/10 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/70 to-cyan-500/70 grid place-items-center text-black font-bold">
                      {initials}
                    </div>
                    <motion.span
                      className="absolute -inset-0.5 rounded-xl ring-2 ring-emerald-400/20"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs text-emerald-300/90 uppercase tracking-widest">
                      <Sparkles size={14} />
                      <span>account</span>
                    </div>
                    <p className="text-white font-semibold truncate">{displayName}</p>
                    {loggedUser?.email && (
                      <p className="text-[11px] text-white/60 truncate">{loggedUser.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="relative py-2">
                {menuItems.map((item, idx) => (
                  <motion.div
                    key={item.to}
                    custom={idx}
                    variants={item}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      to={item.to}
                      className="group flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:text-white transition-all"
                    >
                      <span className="text-emerald-300/90">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-emerald-300/70">
                        →
                      </span>
                    </Link>
                  </motion.div>
                ))}

                <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <motion.button
                  whileHover={{ x: 2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logoutHandler}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-300 hover:text-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
