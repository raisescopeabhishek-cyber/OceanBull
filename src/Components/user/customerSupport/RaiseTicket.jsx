import { useState } from "react";
import { backendApi } from "../../../utils/apiClients";
import { Send, X, Loader2, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "../../../utils/FloatingParticles";

/** Neon grid + floating orbs for crypto vibes */
const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(16,185,129,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.22) 1px, transparent 1px)",
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
          "repeating-linear-gradient(90deg, rgba(59,130,246,0.08) 0 2px, transparent 2px 8px)",
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
              ? "radial-gradient(circle at center, rgba(16,185,129,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.25), transparent 60%)",
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
    className={`relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/80 backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.10)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/7 via-cyan-300/7 to-indigo-300/7 pointer-events-none" />
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

export default function RaiseTicket({ onSubmit, onCancel, asModal = true }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isLoading, setIsLoading] = useState(false);
  const [subjectError, setSubjectError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const loggedUser = useSelector((store) => store.user.loggedUser);

  const SUBJECT_MAX = 80;
  const DESC_MAX = 1000;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSubjectError("");
    setDescriptionError("");

    let ok = true;
    if (!subject.trim()) {
      setSubjectError("Subject cannot be empty.");
      ok = false;
    }
    if (!description.trim()) {
      setDescriptionError("Description cannot be empty.");
      ok = false;
    }
    if (!loggedUser?._id) {
      setSubjectError("Please sign in to raise a ticket.");
      ok = false;
    }
    if (!ok) return;

    setIsLoading(true);
    try {
      const res = await backendApi.post(`/ticket/user/riseTicket`, {
        userId: loggedUser._id,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        createdBy: "Customer",
      });

      if (res?.data?.success) {
        onSubmit?.();
        setSubject("");
        setDescription("");
        setPriority("Medium");
        onCancel?.();
      } else {
        alert(res?.data?.message || "Failed to create ticket. Please try again.");
      }
    } catch (err) {
      console.error("Error creating ticket:", err);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const Body = (
    <GlassCard className="w-full max-w-lg p-6 relative">
      {/* Close */}
      <button
        onClick={onCancel}
        className="absolute top-3 right-3 text-white/70 hover:text-white"
        aria-label="Close"
      >
        <X />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={18} className="text-emerald-400" />
        <span className="uppercase tracking-[0.25em] text-xs text-emerald-300/80 font-semibold">
          support · ticket
        </span>
      </div>
      <h2 className="text-2xl font-extrabold text-white">Raise a New Ticket</h2>
      <p className="text-white/70 text-sm mt-1">
        Describe your issue clearly—our team will get back to you ASAP.
      </p>

      <NeonDivider />

      {/* Form */}
      <form onSubmit={handleSubmit} className="text-white space-y-4">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm mb-1">
            Subject
          </label>
          <div className="relative">
            <input
              id="subject"
              name="subject"
              type="text"
              value={subject}
              onChange={(e) => {
                const v = e.target.value.slice(0, SUBJECT_MAX);
                setSubject(v);
                if (subjectError) setSubjectError("");
              }}
              placeholder="e.g., Issue with withdrawal / account verification…"
              className={`w-full px-4 py-3 rounded-xl bg-gradient-to-br from-slate-900/70 to-slate-900/30 border ${
                subjectError ? "border-red-500/70" : "border-emerald-400/20"
              } outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">
              {subject.length}/{SUBJECT_MAX}
            </span>
          </div>
          <AnimatePresence>
            {subjectError && (
              <motion.p
                className="text-red-400 text-xs mt-1"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {subjectError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm mb-1">
            Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              rows={5}
              value={description}
              onChange={(e) => {
                const v = e.target.value.slice(0, DESC_MAX);
                setDescription(v);
                if (descriptionError) setDescriptionError("");
              }}
              placeholder="Provide details, error messages, steps tried, screenshots context, etc."
              className={`w-full px-4 py-3 rounded-xl bg-gradient-to-br from-slate-900/70 to-slate-900/30 border ${
                descriptionError ? "border-red-500/70" : "border-emerald-400/20"
              } outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition`}
            />
            <span className="absolute right-3 bottom-2 text-white/50 text-xs">
              {description.length}/{DESC_MAX}
            </span>
          </div>
          <AnimatePresence>
            {descriptionError && (
              <motion.p
                className="text-red-400 text-xs mt-1"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {descriptionError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Priority segmented control */}
        <div>
          <span className="block text-sm mb-2">Priority</span>
          <div className="grid grid-cols-4 gap-2">
            {["Low", "Medium", "High", "Critical"].map((p) => {
              const active = priority === p;
              const styles = active
                ? "text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400"
                : "text-white/80 bg-white/5 border border-white/10 hover:bg-white/10";
              return (
                <motion.button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold ${styles}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-pressed={active}
                >
                  {p}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <motion.button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>

          <motion.button
            type="submit"
            disabled={!subject.trim() || !description.trim() || isLoading || !loggedUser?._id}
            className="relative flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-black
                       bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400
                       shadow-[0_10px_30px_rgba(16,185,129,0.35)]
                       disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isLoading ? "Submitting..." : "Submit Ticket"}
            <motion.span
              className="absolute inset-0 rounded-xl opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              style={{
                background:
                  "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,0.35), transparent 40%)",
              }}
            />
          </motion.button>
        </div>
      </form>
    </GlassCard>
  );

  return (
    <AnimatePresence>
             <FloatingParticles/>

      {asModal ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0">
            <AnimatedGrid />
            <FloatingOrbs />
          </div>
          {Body}
        </motion.div>
      ) : (
        Body
      )}
    </AnimatePresence>
  );
}
