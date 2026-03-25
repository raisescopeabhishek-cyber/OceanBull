import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail, Clock, ArrowRight, TicketPlus, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(59,130,246,0.1) 0 2px, transparent 2px 8px)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 10 }).map((_, i) => (
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

/* ============================ ANIM VARS ============================== */

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

const itemVariants = {
  hidden: { opacity: 0, y: 18, rotateX: 6, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 190, damping: 20, duration: 0.5 },
  },
};

/* ============================== PAGE ================================= */

export default function UserCustomerSupport() {
  const navigate = useNavigate();
  const email = useMemo(() => import.meta.env.VITE_EMAIL_EMAIL, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
    >
      <AnimatedGrid />
      <FloatingOrbs />
 <FloatingParticles/>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="uppercase tracking-[0.25em] text-xs text-emerald-300/80 font-semibold">
              help · support · wallet
            </span>
          </div>
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold text-white"
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            ⚡ Customer Support Center
          </motion.h1>
          <p className="text-white/70 mt-2 max-w-2xl">
            Our dedicated team provides timely, transparent assistance for your account, wallet, and banking questions.
          </p>
        </motion.div>

        {/* Layout: Sidebar (left) + Main (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <GlassCard className="p-5 lg:col-span-4 xl:col-span-3">
            <div className="flex flex-col gap-4">
              {/* Quick Actions */}
              <motion.button
                onClick={() => navigate("/user/ticketDashboard")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-black
                  bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
              >
                <TicketPlus className="w-5 h-5" />
                Raise Ticket
                <motion.span
                  className="absolute inset-0 rounded-full opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,0.35), transparent 40%)" }}
                />
              </motion.button>

              <NeonDivider />

              {/* Contact Card */}
              <div className="rounded-xl border border-emerald-400/10 bg-white/5 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-400/15 border border-emerald-400/30">
                    <Mail className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Support Email</div>
                    <div className="text-emerald-300 font-mono text-sm truncate">{email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 py-2 hover:bg-emerald-400/20 transition"
                  >
                    Write Email
                  </a>
                  <button
                    onClick={() => navigator.clipboard?.writeText(email)}
                    className="px-3 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* SLA / Response Times */}
              <div className="rounded-xl border border-emerald-400/10 bg-white/5 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-400/15 border border-cyan-400/30">
                    <Clock className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Response Times</div>
                    <div className="text-cyan-300 text-sm">Mon–Sat: 8:00 AM – 8:00 PM</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #22c55e, #06b6d4)" }}
                      animate={{ width: ["30%", "70%", "50%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="text-xs text-white/60 mt-2">Typical first reply within 2–6 hours</div>
                </div>
              </div>

              {/* Trust */}
              <div className="rounded-xl border border-emerald-400/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-400/15 border border-indigo-400/30">
                    <ShieldCheck className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Secure & Transparent</div>
                    <div className="text-indigo-300 text-xs">We’ll never ask for your password or OTP.</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Main Content */}
          <GlassCard className="p-6 lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Intro / Hero */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30">
                    <Mail className="w-7 h-7 text-emerald-300" />
                  </div>
                  <h3 className="text-white text-xl font-semibold">Email Support</h3>
                </div>
                <p className="text-white/70">
                  Reach us anytime via email. Include a brief summary, screenshots, and steps to reproduce for the fastest resolution.
                </p>
                <a
                  href={`mailto:${email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200"
                >
                  Compose Email <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Ticket CTA */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30">
                    <TicketPlus className="w-7 h-7 text-indigo-300" />
                  </div>
                  <h3 className="text-white text-xl font-semibold">Raise a Ticket</h3>
                </div>
                <p className="text-white/70">
                  Track progress, share attachments, and get structured updates through our ticket desk.
                </p>
                <motion.button
                  onClick={() => navigate("/user/ticketDashboard")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-black
                    bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
                >
                  Open Desk <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
              

              {/* Tips */}
              <motion.div variants={itemVariants} className="md:col-span-2 rounded-2xl border border-emerald-400/10 bg-white/5 p-5">
                <h3 className="text-white text-lg font-semibold mb-3">How to Get Effective Support</h3>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                  {[
                    "Provide a clear, concise issue summary",
                    "Attach screenshots or exact error messages",
                    "List steps you’ve already tried",
                    "Mention device, browser, or platform details",
                    "Share your account/email/ID (no passwords)",
                    "Add timestamps for time-sensitive issues",
                  ].map((tip) => (
                    <li key={tip} className="text-white/70 flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Big CTA */}
              <motion.div
                variants={itemVariants}
                className="md:col-span-2"
              >
                <a
                  href={`mailto:${email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-full py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 text-black font-bold rounded-xl shadow-lg flex items-center justify-center overflow-hidden group"
                >
                  <span className="absolute left-0 w-full h-full bg-white opacity-0 transform -translate-x-full group-hover:translate-x-0 group-hover:opacity-10 transition-all duration-500" />
                  <Send className="w-6 h-6 mr-3 transform transition-transform duration-300 group-hover:-translate-x-1" />
                  Send Support Email
                  <ArrowRight className="w-6 h-6 ml-2 transform transition-transform duration-300 opacity-0 group-hover:translate-x-1 group-hover:opacity-100" />
                </a>
              </motion.div>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center text-white/50 mt-8 mb-10 text-sm">
          We strive to provide the most helpful support possible.
          <div className="text-xs mt-2 text-white/40">Your satisfaction is our top priority.</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
