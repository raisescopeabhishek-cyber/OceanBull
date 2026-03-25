import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, User, Wallet, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import ModernHeading from "../lib/ModernHeading";
import UserBankDetails from "./accountDetails/UserBankDetails";
import UserKycDetails from "./accountDetails/UserKycDetails";
import UserWalletDetails from "./accountDetails/UserWalletDetails";
import { FloatingParticles } from "../../utils/FloatingParticles";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};
const rgb = (v) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};
const rgba = (v, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/* ============================== DECOR (DYNAMIC) =============================== */

const AnimatedGrid = ({ theme }) => {
  const grid = theme?.accent || theme?.ring || "34 197 94";
  const stripe = theme?.info || theme?.gradientFrom || "59 130 246";
  const effects = theme?.effectsEnabled !== false;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.1,
          backgroundImage: `linear-gradient(${rgba(grid, 0.2)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(grid, 0.2)} 1px, transparent 1px)`,
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
        }}
      />
      {effects && (
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: 0.2,
            background: `repeating-linear-gradient(90deg, ${rgba(stripe, 0.1)} 0 2px, transparent 2px 8px)`,
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
};

const FloatingOrbs = ({ theme }) => {
  const a = theme?.accent || "16 185 129";
  const b = theme?.info || theme?.gradientFrom || "34 211 238";
  const c = theme?.gradientTo || theme?.primary || "99 102 241";
  const effects = theme?.effectsEnabled !== false;

  if (!effects) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => {
        const color = i % 3 === 0 ? a : i % 3 === 1 ? b : c;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: 150,
              height: 150,
              left: `${(i * 97) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: `radial-gradient(circle at center, ${rgba(color, 0.25)}, transparent 60%)`,
            }}
            animate={{
              y: [0, i % 2 ? -22 : 22, 0],
              x: [0, i % 2 ? 12 : -12, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        );
      })}
    </div>
  );
};

const GlassCard = ({ theme, className = "", children }) => {
  const cardBg = theme?.card || theme?.surface2 || "18 18 18";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const a = theme?.accent || theme?.gradientFrom || "16 185 129";
  const b = theme?.gradientTo || theme?.info || "34 211 238";
  const glow = theme?.glow || a;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`relative rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        border: `1px solid ${rgba(border, 0.14)}`,
        background: `linear-gradient(135deg, ${rgba(cardBg, 0.7)}, ${rgba(cardBg, 0.32)}, ${rgba(cardBg, 0.7)})`,
        boxShadow: `0 0 80px ${rgba(glow, 0.08)}`,
      }}
    >
      <div
        className="absolute inset-px rounded-[calc(1rem-1px)] pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${rgba(a, 0.06)}, ${rgba(b, 0.06)}, ${rgba(a, 0.06)})`,
        }}
      />
      {children}
    </motion.div>
  );
};

/* ========================== TAB / CONTENT =========================== */

const TabButton = ({ theme, active, onClick, children, icon: Icon }) => {
  const a = theme?.accent || theme?.gradientFrom || "16 185 129";
  const b = theme?.info || theme?.gradientTo || "34 211 238";
  const c = theme?.gradientTo || theme?.primary || "99 102 241";
  const fg = theme?.fg || "255 255 255";
  const ring = theme?.ring || a;

  const activePill = {
    background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || a)}, ${rgb(theme?.accent || a)}, ${rgb(theme?.gradientTo || c)})`,
    boxShadow: `0 10px 30px ${rgba(theme?.glow || a, 0.28)}`,
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="relative px-4 py-2 rounded-full font-semibold transition-colors"
      style={{
        color: active ? rgb(theme?.primaryFg || "0 0 0") : rgba(fg, 0.72),
      }}
    >
      <div className="relative z-10 flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: active ? rgb(theme?.primaryFg || "0 0 0") : rgba(a, 0.75) }} />
        <span className="hidden sm:inline">{children}</span>
        <span className="sm:hidden">{children?.toString().split(" ")[0]}</span>
      </div>

      {active ? (
        <motion.span
          layoutId="tabBubble"
          transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
          className="absolute inset-0 -z-0 rounded-full"
          style={activePill}
        />
      ) : (
        <span
          className="absolute inset-0 -z-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background: rgba(theme?.sidebarHover || theme?.surface2 || "18 18 18", 0.22),
            boxShadow: `inset 0 0 0 1px ${rgba(ring, 0.14)}`,
          }}
        />
      )}
    </motion.button>
  );
};

const contentVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 40 : -40,
    rotateX: 6,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    x: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 20, duration: 0.55 },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir < 0 ? 40 : -40,
    rotateX: -6,
    scale: 0.98,
    transition: { duration: 0.35 },
  }),
};

/* ======================== MAIN COMPONENT ============================ */

const UserAccountDetails = () => {
  // ✅ dynamic theme
  const themeConfig = useSelector((s) => s?.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const tabs = useMemo(
    () => [
      { id: "personal", label: "KYC Details", icon: User },
      { id: "account", label: "Bank Details", icon: CreditCard },
      { id: "wallet", label: "Wallet Details", icon: Wallet },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("personal");
  const prevIndexRef = useRef(0);
  const currentIndex = tabs.findIndex((t) => t.id === activeTab);
  const direction = currentIndex - prevIndexRef.current;

  useEffect(() => {
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  const renderContent = () => {
    if (activeTab === "personal") return <UserKycDetails />;
    if (activeTab === "account") return <UserBankDetails />;
    return <UserWalletDetails />;
  };

  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const accent = theme?.accent || theme?.gradientFrom || "16 185 129";
  const accent2 = theme?.gradientTo || theme?.info || "34 211 238";
  const fg = theme?.fg || "255 255 255";

  const chipsBg = rgba(theme?.surface2 || theme?.card || "18 18 18", 0.32);
  const chipsBorder = rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${rgb(bg)}, ${rgb(surface1)}, ${rgb(bg)})`,
        color: rgba(fg, 0.92),
      }}
    >
      <FloatingParticles />
      <AnimatedGrid theme={theme} />
      <FloatingOrbs theme={theme} />

      {/* soft corner glows */}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.18 }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 70% at 10% 0%, ${rgba(accent, 0.45)}, transparent 60%),
                         radial-gradient(60% 70% at 90% 100%, ${rgba(accent2, 0.35)}, transparent 60%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} style={{ color: rgba(accent, 0.9) }} />
            <span
              className="uppercase tracking-[0.25em] text-xs font-semibold"
              style={{ color: rgba(accent, 0.7) }}
            >
              profile · finance · wallet
            </span>
          </div>

          <motion.div
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <ModernHeading text="⚡ Account Details" />
          </motion.div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <GlassCard theme={theme} className="p-4 lg:col-span-4 xl:col-span-3">
            <div className="flex lg:flex-col items-center lg:items-stretch gap-3">
              <div className="w-full">
                <div
                  className="relative flex lg:flex-col gap-2 rounded-2xl p-2"
                  role="tablist"
                  style={{
                    background: `linear-gradient(135deg, ${chipsBg}, ${rgba(theme?.surface1 || bg, 0.18)})`,
                    border: `1px solid ${chipsBorder}`,
                  }}
                >
                  {tabs.map((t) => (
                    <TabButton
                      key={t.id}
                      theme={theme}
                      active={activeTab === t.id}
                      onClick={() => setActiveTab(t.id)}
                      icon={t.icon}
                    >
                      {t.label}
                    </TabButton>
                  ))}
                </div>
              </div>

              {/* Quick chips */}
              <div className="hidden lg:grid grid-cols-2 gap-2 w-full">
                <Chip theme={theme} text="Verified KYC" />
                <Chip theme={theme} text="Secure Wallet" />
                <Chip theme={theme} text="Bank Linked" />
                <Chip theme={theme} text="Encrypted" />
              </div>
            </div>
          </GlassCard>

          {/* Content */}
          <GlassCard theme={theme} className="p-4 lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="rounded-xl p-4 md:p-6"
                style={{
                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
                  background: `linear-gradient(135deg,
                    ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.55)},
                    ${rgba(theme?.surface1 || bg, 0.22)}
                  )`,
                }}
              >
                <motion.div
                  whileHover={{ rotateX: 1, rotateY: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  {renderContent()}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

/* ============================= SMALL UI ============================== */

const Chip = ({ theme, text }) => {
  const c = theme?.accent || theme?.gradientFrom || "16 185 129";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  return (
    <div
      className="text-xs font-semibold px-3 py-2 rounded-xl"
      style={{
        color: rgba(c, 0.8),
        border: `1px solid ${rgba(border, 0.14)}`,
        background: `linear-gradient(135deg, ${rgba(c, 0.10)}, ${rgba(c, 0.04)})`,
      }}
    >
      {text}
    </div>
  );
};

export default UserAccountDetails;
