import { useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { backendApi } from "../../utils/apiClients";
import UserCopyRequestHistory from "./UserCopyRequestHistory";
import ModernHeading from "../lib/ModernHeading";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
import { PageHeader } from "@/Components/ui";

/** ========= Small inline SVG icons for the theme (no extra deps) ========= */
const BadgeCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M15 11a4 4 0 10-8 0 4 4 0 008 0z" />
  </svg>
);
const SparkleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.77 4.23L18 8l-4.23 1.77L12 14l-1.77-4.23L6 8l4.23-1.77L12 2zm8 8l1.06 2.53L24 14l-2.94 1.47L20 18l-1.06-2.53L16 14l2.94-1.47L20 10zM4 16l.88 2.12L7 19l-2.12.88L4 22l-.88-2.12L1 19l2.12-.88L4 16z"/>
  </svg>
);

/** ========= Background FX ========= */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-primary-soft rounded-full"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -120, opacity: [0, 1, 0] }}
        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
      />
    ))}
  </div>
);

export default function UserCopyRequest() {
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [role, setRole] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || selectedAccounts.length === 0) {
      toast.error("Select a role and at least one account");
      return;
    }
    const toastId = toast.loading("Submitting your request...");
    setIsSubmitting(true);
    try {
      await backendApi.post(`/create-copy-request`, {
        userId: loggedUser?._id,
        role,
        accounts: selectedAccounts,
      });
      toast.success("Request submitted", { id: toastId });
      setActiveTab("history");
      setRole("");
      setSelectedAccounts([]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Please try again later";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountChange = (accountNumber: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountNumber)
        ? prev.filter((acc) => acc !== accountNumber)
        : [...prev, accountNumber]
    );
  };

  const handleSelectAll = () => {
    const total = loggedUser?.accounts?.length || 0;
    setSelectedAccounts((prev) =>
      prev.length === total ? [] : (loggedUser?.accounts || []).map((acc: any) => String(acc.accountNumber))
    );
  };

  return (
    <div className="relative w-full">
      <AnimatedGrid />
      <FloatingParticles />

      <PageHeader
        breadcrumb="Trading / Copy trading"
        title="Copy trading access"
        description="Request a role, or review your past requests."
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          className="mt-6 p-6 backdrop-blur-xl rounded-card border border-line"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all border ${
                  activeTab === "request"
                    ? "text-text border-transparent shadow-cyan-500/25"
                    : "text-muted bg-surface border-line hover:border-line"
                }`}
                onClick={() => setActiveTab("request")}
              >
                Request Role
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all border ${
                  activeTab === "history"
                    ? "text-text border-transparent shadow-cyan-500/25"
                    : "text-muted bg-surface border-line hover:border-line"
                }`}
                onClick={() => setActiveTab("history")}
              >
                Request History
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: activeTab === "request" ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: activeTab === "request" ? 100 : -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === "request" ? (
                <div>
                  <div className="mb-4">
                    <ModernHeading text="Request Copy Trading Role" />
                  </div>
                  <p className="text-subtle mb-6">
                    Use the form below to request approval as a <span className="text-primary">Master</span> or <span className="text-primary">Copier</span> for copy trading.
                    Your request will be reviewed by the admin.
                  </p>

                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Role Selection */}
                      <div className="p-5 bg-surface rounded-card border border-line">
                        <div className="flex items-center gap-3 mb-3 text-text">
                          <BadgeCheckIcon />
                          <h3 className="text-lg font-semibold">Select Role</h3>
                        </div>
                        <select
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-surface text-text px-4 py-3 rounded-card border border-line focus:border-line focus:ring-2 focus:ring-primary transition-all"
                        >
                          <option className="bg-surface" value="" disabled>
                            Choose a role
                          </option>
                          <option className="bg-surface" value="master">Master</option>
                          <option className="bg-surface" value="copier">Copier</option>
                        </select>
                      </div>

                      {/* Account Selection */}
                      <div className="p-5 bg-surface rounded-card border border-line">
                        <div className="flex items-center gap-3 mb-3 text-text">
                          <UsersIcon />
                          <h3 className="text-lg font-semibold">Select Accounts</h3>
                          <span className="ml-auto text-xs text-muted">Selected: <span className="px-2 py-0.5 rounded-full bg-success-soft text-success border border-success">{selectedAccounts.length}</span></span>
                        </div>

                        {/* Select All Toggle */}
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-card bg-surface border border-line">
                          <input type="checkbox" id="select-all" checked={selectedAccounts.length === (loggedUser?.accounts?.length || 0)} onChange={handleSelectAll} className="hidden" />
                          <label htmlFor="select-all" className="flex items-center cursor-pointer w-full select-none">
                            <span className="relative inline-flex items-center h-6 w-11 rounded-full bg-surface-3 transition-colors duration-200 ease-in-out">
                              <span
                                className={`absolute h-5 w-5 rounded-full bg-surface transform transition-transform duration-200 ease-in-out ${selectedAccounts.length === (loggedUser?.accounts?.length || 0) ? "translate-x-5 bg-primary" : "translate-x-0.5"}`}
                              />
                            </span>
                            <span className="ml-3 text-muted">
                              {selectedAccounts.length === (loggedUser?.accounts?.length || 0) ? "Deselect All" : "Select All"}
                            </span>
                          </label>
                        </div>

                        {/* Accounts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(loggedUser?.accounts || []).map((value: any, index: number) => {
                            const checked = selectedAccounts.includes(String(value.accountNumber));
                            return (
                              <div key={index} className={`p-3 rounded-xl border transition-all cursor-pointer ${checked ? "border-line shadow-cyan-500/20" : "bg-surface border-line hover:border-line"}`}
                                   onClick={() => handleAccountChange(String(value.accountNumber))}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex h-5 w-5 rounded-full border ${checked ? "border-line bg-primary-soft" : "border-line"}`} />
                                  <span className="text-muted text-sm">{value.accountNumber}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Selected Accounts Chips */}
                    {selectedAccounts.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted">Selected Accounts</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedAccounts.map((acc) => (
                            <span key={acc} className="px-3 py-1 rounded-full bg-primary-soft text-primary border border-line text-sm">
                              {acc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting || !role || selectedAccounts.length === 0}
                        className={`flex items-center justify-center py-4 px-12 rounded-full text-text font-semibold text-lg transition-all ${
                          !isSubmitting && role && selectedAccounts.length > 0
                            ? "hover:scale-105 shadow-cyan-500/25"
                            : "bg-surface-3 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {isSubmitting && (
                          <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {isSubmitting ? "Processing..." : "Submit Request"}
                      </button>
                    </div>
                  </motion.form>
                </div>
              ) : (
                <UserCopyRequestHistory />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Keyframes for animations */}
      <style jsx>{`
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-50px);} to { opacity: 1; transform: translateX(0);} }
        @keyframes spin-slow { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </div>
  );
}
