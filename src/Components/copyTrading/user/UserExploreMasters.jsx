import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Copy,
  DollarSign,
  Percent,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  asArray,
  cx,
  getNestedUser,
  getUserAccountsFromUser,
  getUserIdFromUser,
  pickAccountNumber,
  pickMasterAccount,
  pickName,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";

const InfoBox = ({ isDark, icon, label, value }) => (
  <div
    className={cx(
      "rounded-2xl border p-3",
      isDark
        ? "border-white/10 bg-white/[0.025]"
        : "border-emerald-100 bg-emerald-50/50"
    )}
  >
    <div className="mb-2 text-emerald-600">{icon}</div>
    <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
      {label}
    </p>
    <p className={cx("font-bold", isDark ? "text-white" : "text-slate-900")}>
      {value}
    </p>
  </div>
);

const UserExploreMasters = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [loading, setLoading] = useState(true);
  const [masters, setMasters] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [userRes, mastersRes] = await Promise.all([
          copyTradingApi.getMeUser(),
          copyTradingApi.userGetMasters(),
        ]);

        setUser(getNestedUser(userRes));
        setMasters(asArray(mastersRes));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load master traders");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const accounts = getUserAccountsFromUser(user);
  const userId = getUserIdFromUser(user);

  const filteredMasters = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return masters;

    return masters.filter((master) => {
      return JSON.stringify(master || {}).toLowerCase().includes(q);
    });
  }, [masters, search]);

  const handleCopy = async (master) => {
    const masterAccount = pickMasterAccount(master);
    const minInvest =
      master?.min_invest ||
      master?.minInvest ||
      master?.minimumInvestment ||
      master?.MinimumInvestment ||
      0;

    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    if (!selectedAccount) {
      toast.error("Select your MT5 account first.");
      return;
    }

    if (!masterAccount) {
      toast.error("Master account not found.");
      return;
    }

    try {
      const res = await copyTradingApi.userStartCopy({
        userId,
        mt5Account: selectedAccount,
        masterAccount,
        min_invest: minInvest,
      });

      if (res?.success === false || res?.status === false) {
        toast.error(res?.message || res?.msg || "Unable to start copy trading");
        return;
      }

      toast.success("Copy trading started successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start copying");
    }
  };

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 md:grid-cols-[1fr_260px]",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90"
        )}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search master account, nickname, description..."
            className={cx(
              "w-full rounded-2xl border px-11 py-3 text-sm outline-none",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35"
                : "border-emerald-100 bg-white text-slate-900"
            )}
          />
        </div>

        <select
          value={selectedAccount}
          onChange={(event) => setSelectedAccount(event.target.value)}
          className={cx(
            "rounded-2xl border px-4 py-3 text-sm outline-none",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white"
              : "border-emerald-100 bg-white text-slate-900"
          )}
        >
          <option value="">Select MT5 Account</option>
          {accounts.map((account) => {
            const accountNumber = pickAccountNumber(account);

            if (!accountNumber) return null;

            return (
              <option key={accountNumber} value={accountNumber}>
                {accountNumber}
              </option>
            );
          })}
        </select>
      </div>

      {loading ? (
        <div className="p-5 text-sm">Loading masters...</div>
      ) : filteredMasters.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No master traders found"
          subtitle="Try another search or contact admin."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredMasters.map((master, index) => {
            const masterAccount = pickMasterAccount(master) || `MASTER-${index + 1}`;
            const name = pickName(master);
            const minInvest =
              master?.min_invest ||
              master?.minInvest ||
              master?.minimumInvestment ||
              0;

            return (
              <div
                key={`${masterAccount}-${index}`}
                className={cx(
                  "rounded-[24px] border p-5",
                  isDark
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-emerald-100 bg-white/90 shadow-[0_10px_24px_rgba(16,185,129,0.07)]"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p
                      className={cx(
                        "text-xs font-semibold uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500"
                      )}
                    >
                      Master Account
                    </p>
                    <h3
                      className={cx(
                        "mt-1 text-xl font-bold",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      {name === "-" ? `#${masterAccount}` : name}
                    </h3>
                    <p
                      className={cx(
                        "mt-1 text-sm",
                        isDark ? "text-white/55" : "text-slate-500"
                      )}
                    >
                      #{masterAccount}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(master)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Master
                  </button>
                </div>

                <p
                  className={cx(
                    "mt-4 text-sm leading-6",
                    isDark ? "text-white/60" : "text-slate-600"
                  )}
                >
                  {master?.description ||
                    master?.Description ||
                    "No description added for this master trader."}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <InfoBox
                    isDark={isDark}
                    icon={<Percent className="h-4 w-4" />}
                    label="Commission"
                    value={`${master?.commission || master?.Commission || 0}%`}
                  />

                  <InfoBox
                    isDark={isDark}
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Min Invest"
                    value={`$${minInvest || 0}`}
                  />

                  <InfoBox
                    isDark={isDark}
                    icon={<Users className="h-4 w-4" />}
                    label="Copiers"
                    value={master?.copiers || master?.Copiers || 0}
                  />

                  <InfoBox
                    isDark={isDark}
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Status"
                    value="Active"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserExploreMasters;