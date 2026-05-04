import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  RadioTower,
  Users,
} from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  cx,
  formatDateTime,
  formatMoney,
  getNestedUser,
  getTradeClosePrice,
  getTradeOpenPrice,
  getTradeProfit,
  getTradeSymbol,
  getTradeTicket,
  getTradeTime,
  getTradeType,
  getTradeVolume,
  normalizeTradeRows,
  pickAccountNumber,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import CopyTradingTable from "../shared/CopyTradingTable";

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

  const accountArrays = [
    user?.accounts,
    user?.mt5Accounts,
    user?.tradingAccounts,
    user?.challenges,
    user?.liveAccounts,
  ];

  accountArrays.forEach((list) => {
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
      push(item?.account);
      push(item?.login);
      push(item?.Login);
    });
  });

  return output;
};

const getCopierAccount = (row) => {
  return String(
    row?.copierAccount ||
      row?.login ||
      row?.Login ||
      row?.clientAccount ||
      row?.MT5Account ||
      row?.mt5Account ||
      row?.account ||
      ""
  );
};

const getMasterValue = (master, key, fallback = "-") => {
  return (
    master?.details?.[key] ??
    master?.raw?.masterAccount?.[key] ??
    master?.raw?.MasterAccount?.[key] ??
    fallback
  );
};

const TradeRows = ({ isDark, rows }) => {
  if (!rows.length) {
    return (
      <CopyTradingEmptyState
        isDark={isDark}
        title="No trades found"
        subtitle="No open or closed trades found for this account."
      />
    );
  }

  return (
    <CopyTradingTable
      isDark={isDark}
      minWidth="980px"
      columns={[
        "Ticket",
        "Symbol",
        "Type",
        "Volume",
        "Open Price",
        "Close Price",
        "Profit",
        "Time",
      ]}
      rows={rows}
      renderRow={(row, index) => (
        <tr
          key={`${getTradeTicket(row)}-${index}`}
          className={cx(
            "border-t transition-colors",
            isDark
              ? "border-white/10 hover:bg-white/[0.035]"
              : "border-emerald-100 hover:bg-emerald-50/40"
          )}
        >
          <td className="whitespace-nowrap px-4 py-4 font-bold">
            {getTradeTicket(row)}
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            {getTradeSymbol(row)}
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            {getTradeType(row)}
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            {getTradeVolume(row)}
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            {getTradeOpenPrice(row)}
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            {getTradeClosePrice(row)}
          </td>

          <td className="whitespace-nowrap px-4 py-4 font-bold">
            {formatMoney(getTradeProfit(row))}
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            {formatDateTime(getTradeTime(row))}
          </td>
        </tr>
      )}
    />
  );
};

const AccountTradePanel = ({ isDark, userId, account, mode = "master" }) => {
  const [status, setStatus] = useState("open");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTrades = async (nextStatus = status) => {
    if (!account) return;

    try {
      setLoading(true);

      const res = await copyTradingApi.userAccountTrades({
        userId,
        account,
        status: nextStatus,
        page: 1,
        page_size: 50,
      });

      const normalized = normalizeTradeRows({
        input: res?.data?.rows || res?.data || res,
        account,
        mode,
      });

      setRows(normalized);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load trades");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {["open", "closed"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setStatus(item);
              loadTrades(item);
            }}
            className={cx(
              "rounded-xl border px-4 py-2 text-xs font-bold capitalize",
              status === item
                ? "border-emerald-400 bg-emerald-500 text-white"
                : isDark
                ? "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                : "border-emerald-100 bg-white text-slate-600 hover:bg-emerald-50"
            )}
          >
            {item} Trades
          </button>
        ))}

        <button
          type="button"
          onClick={() => loadTrades(status)}
          disabled={loading}
          className={cx(
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-60",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white"
              : "border-emerald-100 bg-white text-emerald-700"
          )}
        >
          <RefreshCw className={cx("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div
          className={cx(
            "text-sm",
            isDark ? "text-white/60" : "text-slate-500"
          )}
        >
          Loading trades...
        </div>
      ) : (
        <TradeRows isDark={isDark} rows={rows} />
      )}
    </div>
  );
};

const UserMyMasterAccounts = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [userId, setUserId] = useState("");
  const [masters, setMasters] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  const loadMasters = async () => {
    try {
      setLoading(true);

      const userRes = await copyTradingApi.getMeUser();
      const user = getNestedUser(userRes);

      const resolvedUserId = user?._id || user?.id || user?.userId || "";
      const accounts = getUserMt5Accounts(user);

      setUserId(resolvedUserId);

      if (!accounts.length) {
        setMasters([]);
        return;
      }

      const res = await copyTradingApi.userMyCopyAccounts({
        accounts,
      });

      const masterAccounts = Array.isArray(res?.data?.masterAccounts)
        ? res.data.masterAccounts
        : [];

      setMasters(masterAccounts);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load master accounts");
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const totalCopiers = useMemo(() => {
    return masters.reduce((sum, master) => {
      const copiers = Array.isArray(master?.copiers) ? master.copiers : [];
      return sum + copiers.length;
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
            isDark ? "border-white/10" : "border-emerald-100"
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
            isDark ? "border-white/10" : "border-emerald-100"
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
          onClick={loadMasters}
          disabled={loading}
          className={cx(
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-60",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white"
              : "border-emerald-100 bg-white text-emerald-700"
          )}
        >
          <RefreshCw className={cx("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh Accounts
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
                  Commission: {getMasterValue(master, "commission", 0)}% ·
                  Min Invest: ${getMasterValue(master, "min_invest", 0)} ·
                  Copiers: {copiers.length}
                </p>
              </div>

              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {isOpen && (
              <div
                className={cx(
                  "space-y-5 border-t p-5",
                  isDark ? "border-white/10" : "border-emerald-100"
                )}
              >
                <div>
                  <h4 className="mb-3 text-sm font-black">Master Trades</h4>

                  <AccountTradePanel
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
                      subtitle="This master account does not have copier details in the current API response."
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
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                                  Copier Account
                                </p>

                                <h5 className="mt-1 text-base font-black">
                                  #{copierAccount || "-"}
                                </h5>
                              </div>

                              <div
                                className={cx(
                                  "rounded-xl border px-3 py-2 text-xs font-bold",
                                  isDark
                                    ? "border-white/10 bg-white/[0.04] text-white/70"
                                    : "border-emerald-100 bg-white text-slate-600"
                                )}
                              >
                                Master #{masterAccount}
                              </div>
                            </div>

                            {copierAccount ? (
                              <AccountTradePanel
                                isDark={isDark}
                                userId={userId}
                                account={copierAccount}
                                mode="copier"
                              />
                            ) : (
                              <CopyTradingEmptyState
                                isDark={isDark}
                                title="Copier account missing"
                                subtitle="This copier row does not contain an MT5 account number."
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