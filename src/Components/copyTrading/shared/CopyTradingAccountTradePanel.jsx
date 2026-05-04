import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  RadioTower,
  RefreshCw,
  Users,
} from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  cx,
  getNestedUser,
  getUserIdFromUser,
  pickAccountNumber,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import CopyTradingAccountTradePanel from "../shared/CopyTradingAccountTradePanel";

const getUserMt5Accounts = (user) => {
  const output = [];

  const push = (value) => {
    if (!value) return;

    const account = String(value).trim();

    if (account && account !== "000" && !output.includes(account)) {
      output.push(account);
    }
  };

  push(user?.mt5Account);
  push(user?.MT5Account);
  push(user?.accountNumber);
  push(user?.account);
  push(user?.login);
  push(user?.Login);

  const accountLists = [
    user?.accounts,
    user?.mt5Accounts,
    user?.tradingAccounts,
    user?.challenges,
    user?.liveAccounts,
  ];

  accountLists.forEach((list) => {
    if (!Array.isArray(list)) return;

    list.forEach((item) => {
      if (typeof item === "string" || typeof item === "number") {
        push(item);
        return;
      }

      push(pickAccountNumber(item));
      push(item?.mt5Account);
      push(item?.MT5Account);
      push(item?.accountNumber);
      push(item?.login);
      push(item?.Login);
    });
  });

  return output;
};

const getCopierAccount = (row) => {
  return String(
    row?.copierAccount ||
      row?.clientAccount ||
      row?.MT5Account ||
      row?.mt5Account ||
      row?.account ||
      row?.login ||
      row?.Login ||
      ""
  );
};

const getMasterField = (master, key, fallback = "-") => {
  return (
    master?.details?.[key] ??
    master?.raw?.masterAccount?.[key] ??
    master?.raw?.MasterAccount?.[key] ??
    master?.details?.data?.[key] ??
    fallback
  );
};

const UserMyMasterAccounts = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [userId, setUserId] = useState("");
  const [masters, setMasters] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  const loadMasterAccounts = async () => {
    try {
      setLoading(true);

      const userRes = await copyTradingApi.getMeUser();
      const user = getNestedUser(userRes);
      const resolvedUserId = getUserIdFromUser(user);
      const accounts = getUserMt5Accounts(user);

      setUserId(resolvedUserId);

      if (!accounts.length) {
        setMasters([]);
        return;
      }

      const res = await copyTradingApi.userMyCopyAccounts({
        accounts,
      });

      setMasters(Array.isArray(res?.data?.masterAccounts) ? res.data.masterAccounts : []);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load master accounts");
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterAccounts();
  }, []);

  const totalCopiers = useMemo(() => {
    return masters.reduce((sum, master) => {
      return sum + (Array.isArray(master?.copiers) ? master.copiers.length : 0);
    }, 0);
  }, [masters]);

  if (loading) {
    return (
      <div
        className={cx(
          "p-5 text-sm",
          isDark ? "text-white/70" : "text-slate-600"
        )}
      >
        Loading your master accounts...
      </div>
    );
  }

  if (!masters.length) {
    return (
      <CopyTradingEmptyState
        isDark={isDark}
        title="No master account found"
        subtitle="Your CRM MT5 accounts are not currently registered as master accounts."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 md:grid-cols-2",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90 shadow-[0_10px_24px_rgba(16,185,129,0.06)]"
        )}
      >
        <div
          className={cx(
            "rounded-2xl border p-4",
            isDark ? "border-white/10 bg-white/[0.025]" : "border-emerald-100 bg-emerald-50/60"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <RadioTower className="h-4 w-4" />
            My Master Accounts
          </div>
          <div className="mt-2 text-2xl font-black">{masters.length}</div>
        </div>

        <div
          className={cx(
            "rounded-2xl border p-4",
            isDark ? "border-white/10 bg-white/[0.025]" : "border-emerald-100 bg-emerald-50/60"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Users className="h-4 w-4" />
            Total Linked Copiers
          </div>
          <div className="mt-2 text-2xl font-black">{totalCopiers}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={loadMasterAccounts}
          disabled={loading}
          className={cx(
            "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
          )}
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {masters.map((master, index) => {
        const masterAccount = String(master?.account || "");
        const copiers = Array.isArray(master?.copiers) ? master.copiers : [];
        const isOpen = Boolean(expanded[masterAccount]);

        return (
          <div
            key={`${masterAccount}-${index}`}
            className={cx(
              "overflow-hidden rounded-[24px] border",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-emerald-100 bg-white/95 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
            )}
          >
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [masterAccount]: !prev[masterAccount],
                }))
              }
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Master Account
                </p>

                <h3 className="mt-1 text-xl font-black">#{masterAccount}</h3>

                <p
                  className={cx(
                    "mt-2 text-sm",
                    isDark ? "text-white/55" : "text-slate-500"
                  )}
                >
                  Commission: {getMasterField(master, "commission", 0)}% · Min
                  Invest: ${getMasterField(master, "min_invest", 0)} · Copiers:{" "}
                  {copiers.length}
                </p>
              </div>

              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {isOpen && (
              <div
                className={cx(
                  "space-y-6 border-t p-5",
                  isDark ? "border-white/10" : "border-emerald-100"
                )}
              >
                <div>
                  <h4 className="mb-3 text-sm font-black">
                    Master Open / Closed Trades
                  </h4>

                  <CopyTradingAccountTradePanel
                    isDark={isDark}
                    userId={userId}
                    account={masterAccount}
                    mode="master"
                  />
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-black">
                    Linked Copiers ({copiers.length})
                  </h4>

                  {!copiers.length ? (
                    <CopyTradingEmptyState
                      isDark={isDark}
                      title="No linked copiers found"
                      subtitle="This master account does not have linked copier details in the current API response."
                    />
                  ) : (
                    <div className="space-y-4">
                      {copiers.map((copier, copierIndex) => {
                        const copierAccount = getCopierAccount(copier);

                        return (
                          <div
                            key={`${copierAccount}-${copierIndex}`}
                            className={cx(
                              "rounded-[20px] border p-4",
                              isDark
                                ? "border-white/10 bg-slate-950/40"
                                : "border-emerald-100 bg-emerald-50/40"
                            )}
                          >
                            <div className="mb-4">
                              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                                Copier Account
                              </p>

                              <h5 className="mt-1 text-base font-black">
                                #{copierAccount || "-"}
                              </h5>
                            </div>

                            {copierAccount ? (
                              <CopyTradingAccountTradePanel
                                isDark={isDark}
                                userId={userId}
                                account={copierAccount}
                                mode="copier"
                              />
                            ) : (
                              <CopyTradingEmptyState
                                isDark={isDark}
                                title="Copier account missing"
                                subtitle="This copier row does not contain MT5 account/login."
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserMyMasterAccounts;