import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Wallet,
  CreditCard,
  ArrowLeftRight,
  Users,
  Boxes,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import UserInfoForm from "../user-detail/UserForm";
import UserTradeAccounts from "../user-detail/UserTradeAccounts";
import { adminApi } from "../../../utils/apiClients";
import { CFformatDate } from "../../../utils/CustomFunctions";
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const money = (n: any, d = 2) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;

const initials = (first?: string, last?: string) =>
  `${first?.[0] || ""}${last?.[0] || ""}` || "U";

const StatCard = ({
  icon,
  amount,
  label,
  isDark,
}: {
  icon: React.ReactNode;
  amount: string;
  label: string;
  isDark: boolean;
}) => {
  return (
    <motion.div
      variants={cardVariants}
      className={[
        "group relative overflow-hidden rounded-[24px] border p-4 sm:p-5 transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
          : "border-orange-100/80 bg-white/75 shadow-[0_16px_40px_rgba(251,146,60,0.12)]",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          isDark ? "bg-blue-400/10" : "bg-orange-300/20",
        ].join(" ")}
      />
      <div className="relative flex items-center gap-4">
        <div
          className={[
            "grid h-12 w-12 place-items-center rounded-2xl border",
            isDark
              ? "border-blue-400/20 bg-blue-500/15 text-blue-200"
              : "border-orange-200 bg-orange-50 text-orange-600",
          ].join(" ")}
        >
          {icon}
        </div>

        <div>
          <p
            className={[
              "text-xs uppercase tracking-[0.16em]",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            {label}
          </p>
          <p
            className={[
              "mt-1 text-xl font-semibold",
              isDark ? "text-white/90" : "text-slate-900",
            ].join(" ")}
          >
            {amount}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Panel = ({
  title,
  subtitle,
  right,
  children,
  isDark,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
  className?: string;
}) => {
  return (
    <div
      className={[
        "overflow-hidden rounded-[24px] border backdrop-blur-xl transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
          : "border-orange-100/80 bg-white/72 shadow-[0_16px_42px_rgba(251,146,60,0.10)]",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6",
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-orange-100/80 bg-white/50",
        ].join(" ")}
      >
        <div>
          <h3
            className={[
              "text-base font-semibold",
              isDark ? "text-white/90" : "text-slate-900",
            ].join(" ")}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={[
                "mt-1 text-xs",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>

      <div className="p-4 sm:p-5 md:p-6">{children}</div>
    </div>
  );
};

const UserDetailDashboard = () => {
  const { id } = useParams();
  const mode = useSelector((store: any) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [userData, setUserData] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [equityLoading, setEquityLoading] = useState<boolean>(false);

  const accountsRef = useRef<HTMLDivElement | null>(null);

  const totalTransactions = useMemo(
    () => [...deposits, ...withdrawals],
    [deposits, withdrawals]
  );

  const totalInvestAmount = useMemo(
    () => deposits.reduce((t, v) => t + Number(v?.deposit || 0), 0),
    [deposits]
  );

  const totalWithdrawalAmount = useMemo(
    () => withdrawals.reduce((t, v) => t + Number(v?.amount || 0), 0),
    [withdrawals]
  );

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [res, depRes, wRes] = await Promise.all([
        adminApi.get(`/get-user?id=${id}`),
        adminApi.get(`/deposits`),
        adminApi.get(`/withdrawals`),
      ]);

      const user = res?.data?.data || null;
      setUserData(user);

      const userId = user?._id;

      const userDeposits = (depRes?.data?.data || []).filter(
        (d: any) => d?.userId?._id === userId
      );
      const userWithdrawals = (wRes?.data?.data || []).filter(
        (w: any) => w?.userId?._id === userId
      );

      setDeposits(userDeposits);
      setWithdrawals(userWithdrawals);
    } catch (error) {
      console.error("Failed to load user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsEquity = async (accounts: any[]) => {
    if (!accounts?.length) {
      setTotalBalance(0);
      return;
    }

    setEquityLoading(true);
    try {
      const results = await Promise.allSettled(
        accounts.map(() => adminApi.get(`/server-logger-info`))
      );

      const sum = results.reduce((total, result) => {
        if (result.status === "fulfilled") {
          const equity = Number(result.value?.data?.data?.Equity || 0);
          return total + (Number.isFinite(equity) ? equity : 0);
        }
        return total;
      }, 0);

      setTotalBalance(Number(sum.toFixed(2)));
    } catch (error) {
      console.error("Equity fetch failed:", error);
      toast.error("Could not refresh account balances");
    } finally {
      setEquityLoading(false);
    }
  };

  const goToAccounts = () => {
    if (!accountsRef.current) return;
    const y = accountsRef.current.getBoundingClientRect().top + window.pageYOffset - 108;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (id) fetchUserData();
  }, [id]);

  useEffect(() => {
    if (userData?.accounts?.length) {
      fetchAccountsEquity(userData.accounts);
    } else {
      setTotalBalance(0);
    }
  }, [userData]);

  const fullName = `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim();
  const email = userData?.email || "—";
  const country = userData?.country || "N/A";
  const joined = userData?.createdAt ? CFformatDate(userData.createdAt) : "—";

  return (
    <div className="relative">
      <AnimatedGrid />
      <FloatingParticles />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <div
          className={[
            "sticky top-0 z-20 -mx-4 mb-6 border-b px-4 pb-4 pt-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
            isDark
              ? "border-white/10 bg-[#05070b]/70"
              : "border-orange-100/80 bg-white/70",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={() => window.history.back()}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 w-fit",
                  isDark
                    ? "border-white/10 bg-white/[0.05] text-white/85 hover:bg-white/[0.08]"
                    : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                ].join(" ")}
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <div className="flex items-center gap-3">
                <div
                  className={[
                    "grid h-14 w-14 place-items-center rounded-[20px] border text-lg font-semibold",
                    isDark
                      ? "border-white/10 bg-white/[0.05] text-white/90"
                      : "border-orange-100 bg-white/80 text-slate-800",
                  ].join(" ")}
                >
                  {initials(userData?.firstName, userData?.lastName)}
                </div>

                <div>
                  <h1
                    className={[
                      "text-2xl font-bold md:text-3xl",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {fullName || "User Detail"}
                  </h1>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white/70"
                          : "border-orange-100 bg-white/80 text-slate-600",
                      ].join(" ")}
                    >
                      <Mail className="h-4 w-4" />
                      {email}
                    </span>

                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white/70"
                          : "border-orange-100 bg-white/80 text-slate-600",
                      ].join(" ")}
                    >
                      <MapPin className="h-4 w-4" />
                      {country}
                    </span>

                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white/70"
                          : "border-orange-100 bg-white/80 text-slate-600",
                      ].join(" ")}
                    >
                      <Calendar className="h-4 w-4" />
                      Joined {joined}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToAccounts}
                className={[
                  "rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
                  isDark
                    ? "border-blue-400/20 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15"
                    : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
                ].join(" ")}
              >
                View MT5 Accounts
              </button>

              <button
                onClick={fetchUserData}
                disabled={loading}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
                  loading
                    ? isDark
                      ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/40"
                      : "cursor-not-allowed border-orange-100 bg-white/70 text-slate-400"
                    : isDark
                    ? "border-white/10 bg-white/[0.05] text-white/85 hover:bg-white/[0.08]"
                    : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
                ].join(" ")}
              >
                <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard
            isDark={isDark}
            icon={<Boxes size={20} />}
            amount={`${userData?.accounts?.length || 0}`}
            label="Total MT5 Accounts"
          />
          <StatCard
            isDark={isDark}
            icon={<CreditCard size={20} />}
            amount={equityLoading ? "Updating…" : money(totalBalance)}
            label="Total Available Balance"
          />
          <StatCard
            isDark={isDark}
            icon={<Wallet size={20} />}
            amount={money(totalInvestAmount)}
            label="Total Deposits"
          />
          <StatCard
            isDark={isDark}
            icon={<ArrowLeftRight size={20} />}
            amount={money(totalWithdrawalAmount)}
            label="Total Withdrawals"
          />
          <StatCard
            isDark={isDark}
            icon={<ArrowLeftRight size={20} />}
            amount={`${totalTransactions.length}`}
            label="Transactions"
          />
          <StatCard
            isDark={isDark}
            icon={<Users size={20} />}
            amount={money(0)}
            label="Referral Commission"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel
            isDark={isDark}
            title="User Information"
            subtitle="View and update profile details"
            className="lg:col-span-2"
            right={
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em]",
                  isDark
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                <ShieldCheck className="h-4 w-4" />
                User ID: {userData?._id || "—"}
              </div>
            }
          >
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div
                  className={[
                    "h-12 rounded-2xl",
                    isDark ? "bg-white/[0.05]" : "bg-orange-50",
                  ].join(" ")}
                />
                <div
                  className={[
                    "h-12 rounded-2xl",
                    isDark ? "bg-white/[0.05]" : "bg-orange-50",
                  ].join(" ")}
                />
                <div
                  className={[
                    "h-12 rounded-2xl",
                    isDark ? "bg-white/[0.05]" : "bg-orange-50",
                  ].join(" ")}
                />
                <div
                  className={[
                    "h-40 rounded-2xl",
                    isDark ? "bg-white/[0.05]" : "bg-orange-50",
                  ].join(" ")}
                />
              </div>
            ) : (
              <UserInfoForm userData={userData} />
            )}
          </Panel>

          <Panel
            isDark={isDark}
            title="Recent Activity"
            subtitle="Latest deposit and withdrawal updates"
          >
            <div className="space-y-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className={isDark ? "text-white/90" : "text-slate-900"}>
                    Recent Deposits
                  </h4>
                  <span className={isDark ? "text-xs text-white/45" : "text-xs text-slate-500"}>
                    Total: {deposits.length}
                  </span>
                </div>

                {deposits.length ? (
                  <div className="space-y-2">
                    {deposits.slice(0, 6).map((d) => (
                      <div
                        key={d._id}
                        className={[
                          "flex items-center justify-between rounded-2xl border px-3 py-3",
                          isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-orange-100 bg-orange-50/60",
                        ].join(" ")}
                      >
                        <span className={isDark ? "text-sm text-white/70" : "text-sm text-slate-600"}>
                          {CFformatDate(d?.createdAt)}
                        </span>
                        <span className={isDark ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-emerald-700"}>
                          {money(d?.deposit)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={isDark ? "text-sm text-white/50" : "text-sm text-slate-500"}>
                    No deposits yet.
                  </div>
                )}
              </div>

              <div
                className={[
                  "pt-5",
                  isDark ? "border-t border-white/10" : "border-t border-orange-100",
                ].join(" ")}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className={isDark ? "text-white/90" : "text-slate-900"}>
                    Recent Withdrawals
                  </h4>
                  <span className={isDark ? "text-xs text-white/45" : "text-xs text-slate-500"}>
                    Total: {withdrawals.length}
                  </span>
                </div>

                {withdrawals.length ? (
                  <div className="space-y-2">
                    {withdrawals.slice(0, 6).map((w) => (
                      <div
                        key={w._id}
                        className={[
                          "flex items-center justify-between rounded-2xl border px-3 py-3",
                          isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-orange-100 bg-orange-50/60",
                        ].join(" ")}
                      >
                        <span className={isDark ? "text-sm text-white/70" : "text-sm text-slate-600"}>
                          {CFformatDate(w?.createdAt)}
                        </span>
                        <span className={isDark ? "text-sm font-semibold text-rose-300" : "text-sm font-semibold text-rose-700"}>
                          {money(w?.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={isDark ? "text-sm text-white/50" : "text-sm text-slate-500"}>
                    No withdrawals yet.
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <div ref={accountsRef} className="scroll-mt-28 lg:col-span-3">
            <Panel
              isDark={isDark}
              title="MT5 Accounts"
              subtitle="Manage and inspect user trading accounts"
              right={
                <button
                  onClick={() => userData?.accounts && fetchAccountsEquity(userData.accounts)}
                  disabled={equityLoading}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                    equityLoading
                      ? isDark
                        ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/40"
                        : "cursor-not-allowed border-orange-100 bg-white/70 text-slate-400"
                      : isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15"
                      : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
                  ].join(" ")}
                >
                  <RefreshCw className={["h-4 w-4", equityLoading ? "animate-spin" : ""].join(" ")} />
                  {equityLoading ? "Updating balances…" : "Refresh balances"}
                </button>
              }
            >
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className={["h-12 rounded-2xl", isDark ? "bg-white/[0.05]" : "bg-orange-50"].join(" ")} />
                  <div className={["h-12 rounded-2xl", isDark ? "bg-white/[0.05]" : "bg-orange-50"].join(" ")} />
                  <div className={["h-12 rounded-2xl", isDark ? "bg-white/[0.05]" : "bg-orange-50"].join(" ")} />
                </div>
              ) : (
                <UserTradeAccounts fetchUserData={fetchUserData} userData={userData} />
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailDashboard;