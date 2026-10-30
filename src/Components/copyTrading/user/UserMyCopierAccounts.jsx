import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  Link2,
  Loader2,
  RadioTower,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  Users,
  Wallet,
  X,
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
  getUserIdFromUser,
  normalizeTradeRows,
  pickAccountNumber,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";

const getPortalRoot = () => {
  if (typeof document === "undefined") return null;

  let portalRoot = document.getElementById("copy-trading-modal-root");

  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "copy-trading-modal-root";
    document.body.appendChild(portalRoot);
  }

  return portalRoot;
};

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
      push(item?.account);
      push(item?.login);
      push(item?.Login);
    });
  });

  return output;
};

const getCopierAccount = (copier) => {
  return String(
    copier?.account ||
      copier?.copierAccount ||
      copier?.details?.copierAccount ||
      copier?.details?.login ||
      copier?.details?.Login ||
      copier?.details?.MT5Account ||
      copier?.details?.mt5Account ||
      copier?.details?.account ||
      ""
  );
};

const getMasterAccount = (copier) => {
  return String(
    copier?.masterAccount ||
      copier?.masterDetails?.login ||
      copier?.masterDetails?.Login ||
      copier?.masterDetails?.MT5Account ||
      copier?.masterDetails?.mt5Account ||
      copier?.masterDetails?.account ||
      ""
  );
};

const getCopierValue = (copier, key, fallback = "-") => {
  return copier?.details?.[key] ?? copier?.[key] ?? fallback;
};

const getMasterValue = (copier, key, fallback = "-") => {
  return (
    copier?.masterDetails?.[key] ??
    copier?.rawMaster?.masterAccount?.[key] ??
    copier?.rawMaster?.MasterAccount?.[key] ??
    fallback
  );
};

const getTradeRowsFromResponse = ({ res, account, mode }) => {
  const input =
    res?.data?.rows ||
    res?.data?.data?.rows ||
    res?.data?.trades ||
    res?.data?.data?.trades ||
    res?.data ||
    res;

  return normalizeTradeRows({
    input,
    account,
    mode,
  });
};

const StatCard = ({ isDark, icon, label, value }) => {
  return (
    <div
      className={cx(
        "rounded-card border p-4","border-line bg-surface-2"
      )}
    >
      <div className="flex items-center gap-2 text-sm font-bold">
        {icon}
        {label}
      </div>

      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
};

const CollapseHeader = ({
  isDark,
  title,
  subtitle,
  icon,
  open,
  onToggle,
  rightContent,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cx(
        "flex w-full items-center justify-between gap-4 rounded-card border p-4 text-left transition-all","border-line bg-surface-2 text-text hover:bg-surface-2"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "flex h-11 w-11 items-center justify-center rounded-card border","border-line bg-surface-2"
          )}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-black">{title}</h3>
          {subtitle ? (
            <p
              className={cx(
                "mt-1 text-xs","text-subtle"
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {rightContent}
        {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </div>
    </button>
  );
};

const FilterInput = ({ isDark, value, onChange }) => {
  return (
    <div
      className={cx(
        "flex items-center gap-2 rounded-card border px-4 py-3","border-line bg-surface-2 text-text"
      )}
    >
      <Search className="h-4 w-4 text-success" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search copier, master, or name..."
        className={cx(
          "w-full bg-transparent text-sm font-semibold outline-none placeholder:text-subtle","text-text"
        )}
      />
    </div>
  );
};

const FilterSelect = ({ isDark, label, value, onChange, children }) => {
  return (
    <label className="space-y-2">
      <span
        className={cx(
          "text-xs font-black uppercase tracking-[0.14em]","text-subtle"
        )}
      >
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cx(
          "w-full rounded-card border px-4 py-3 text-sm font-bold outline-none","border-line bg-surface text-text"
        )}
      >
        {children}
      </select>
    </label>
  );
};

const TradeStatusButton = ({ isDark, active, children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-card border px-4 py-2 text-xs font-black capitalize transition-all",
        active
          ? "border-success bg-success text-text shadow-[0_10px_22px_rgba(16,185,129,0.22)]"
          :"border-line bg-surface-2 text-muted hover:bg-surface-2"
      )}
    >
      {children}
    </button>
  );
};

const MiniTradeTable = ({ isDark, title, account, rows, loading, icon }) => {
  return (
    <div
      className={cx(
        "flex min-h-[520px] flex-col overflow-hidden rounded-card border","border-line bg-surface"
      )}
    >
      <div
        className={cx(
          "flex flex-wrap items-center justify-between gap-3 border-b p-4","border-line"
        )}
      >
        <div>
          <div className="flex items-center gap-2 text-sm font-black">
            {icon}
            {title}
          </div>

          <p
            className={cx(
              "mt-1 text-xs","text-subtle"
            )}
          >
            Account {account || "-"}
          </p>
        </div>

        <div
          className={cx(
            "rounded-card border px-3 py-2 text-xs font-black","border-line bg-surface-2 text-muted"
          )}
        >
          {rows.length} Trades
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm font-bold">
            <Loader2 className="h-5 w-5 animate-spin text-success" />
            Loading trades...
          </div>
        </div>
      ) : !rows.length ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <CopyTradingEmptyState
            isDark={isDark}
            title="No trades found"
            subtitle="No trade records found for this account and selected status."
          />
        </div>
      ) : (
        <div className="max-h-[460px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm table-stack">
            <thead className={"bg-surface"}>
              <tr
                className={cx(
                  "border-b text-xs uppercase tracking-[0.14em]","border-line text-subtle"
                )}
              >
                <th className="whitespace-nowrap px-4 py-3">Ticket</th>
                <th className="whitespace-nowrap px-4 py-3">Symbol</th>
                <th className="whitespace-nowrap px-4 py-3">Type</th>
                <th className="whitespace-nowrap px-4 py-3">Volume</th>
                <th className="whitespace-nowrap px-4 py-3">Open</th>
                <th className="whitespace-nowrap px-4 py-3">Close</th>
                <th className="whitespace-nowrap px-4 py-3">Profit</th>
                <th className="whitespace-nowrap px-4 py-3">Time</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const profit = Number(getTradeProfit(row) || 0);

                return (
                  <tr
                    key={`${getTradeTicket(row)}-${index}`}
                    className={cx(
                      "border-b transition-colors","border-line hover:bg-surface-2"
                    )}
                  >
                    <td data-label="Ticket" className="whitespace-nowrap px-4 py-4 font-black">
                      {getTradeTicket(row)}
                    </td>

                    <td data-label="Symbol" className="whitespace-nowrap px-4 py-4">
                      {getTradeSymbol(row)}
                    </td>

                    <td data-label="Type" className="whitespace-nowrap px-4 py-4">
                      {getTradeType(row)}
                    </td>

                    <td data-label="Volume" className="whitespace-nowrap px-4 py-4">
                      {getTradeVolume(row)}
                    </td>

                    <td data-label="Open" className="whitespace-nowrap px-4 py-4">
                      {getTradeOpenPrice(row)}
                    </td>

                    <td data-label="Close" className="whitespace-nowrap px-4 py-4">
                      {getTradeClosePrice(row)}
                    </td>

                    <td data-label="Profit"
                      className={cx(
                        "whitespace-nowrap px-4 py-4 font-black",
                        profit > 0
                          ? "text-success"
                          : profit < 0
                          ? "text-danger"
                          : ""
                      )}
                    >
                      {formatMoney(profit)}
                    </td>

                    <td data-label="Time" className="whitespace-nowrap px-4 py-4">
                      {formatDateTime(getTradeTime(row))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TradesPopup = ({
  isDark,
  userId,
  copier,
  status,
  setStatus,
  onClose,
}) => {
  const copierAccount = getCopierAccount(copier);
  const masterAccount = getMasterAccount(copier);

  const [loading, setLoading] = useState(false);
  const [copierTrades, setCopierTrades] = useState([]);
  const [masterTrades, setMasterTrades] = useState([]);

  const portalRoot = getPortalRoot();

  const loadTrades = async () => {
    if (!copierAccount || !masterAccount) return;

    try {
      setLoading(true);

      const [copierRes, masterRes] = await Promise.all([
        copyTradingApi.userAccountTrades({
          userId,
          account: copierAccount,
          status,
          page: 1,
          page_size: 100,
        }),
        copyTradingApi.userAccountTrades({
          userId,
          account: masterAccount,
          status,
          page: 1,
          page_size: 100,
        }),
      ]);

      setCopierTrades(
        getTradeRowsFromResponse({
          res: copierRes,
          account: copierAccount,
          mode: "copier",
        })
      );

      setMasterTrades(
        getTradeRowsFromResponse({
          res: masterRes,
          account: masterAccount,
          mode: "master",
        })
      );
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load trades");
      setCopierTrades([]);
      setMasterTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copierAccount, masterAccount, status]);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!portalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Trade comparison"
        onMouseDown={(event) => event.stopPropagation()}
        className={cx(
          "max-h-[92vh] w-full max-w-[1500px] overflow-hidden rounded-[30px] border shadow-[0_30px_90px_rgba(0,0,0,0.35)]","border-line bg-surface text-text"
        )}
      >
        <div
          className={cx(
            "flex flex-wrap items-start justify-between gap-4 border-b p-5","border-line bg-surface-2"
          )}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-success">
              Trade Comparison
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Copier {copierAccount || "-"} vs Master {masterAccount || "-"}
            </h2>

            <p
              className={cx(
                "mt-2 text-sm","text-subtle"
              )}
            >
              Master: {getMasterValue(copier, "name", "-")} · Commission:{" "}
              {getMasterValue(copier, "commission", 0)}% · Copier Balance:{" "}
              {formatMoney(getCopierValue(copier, "balance", 0))} · Equity:{" "}
              {formatMoney(getCopierValue(copier, "equity", 0))}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["all", "open", "closed"].map((item) => (
              <TradeStatusButton
                key={item}
                isDark={isDark}
                active={status === item}
                onClick={() => setStatus(item)}
              >
                {item}
              </TradeStatusButton>
            ))}

            <button
              type="button"
              onClick={loadTrades}
              disabled={loading}
              className={cx(
                "inline-flex items-center gap-2 rounded-card border px-4 py-2 text-xs font-black disabled:opacity-60","border-line bg-surface-2 text-text hover:bg-surface-2"
              )}
            >
              <RefreshCw
                className={cx("h-4 w-4", loading && "animate-spin")}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={onClose}
              className={cx(
                "inline-flex h-10 w-10 items-center justify-center rounded-card border","border-line bg-surface-2 text-text hover:bg-surface-2"
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(92vh-130px)] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <MiniTradeTable
              isDark={isDark}
              title="Copier Trades"
              account={copierAccount}
              rows={copierTrades}
              loading={loading}
              icon={<Link2 className="h-4 w-4 text-success" />}
            />

            <MiniTradeTable
              isDark={isDark}
              title="Master Trades"
              account={masterAccount}
              rows={masterTrades}
              loading={loading}
              icon={<RadioTower className="h-4 w-4 text-success" />}
            />
          </div>
        </div>
      </div>
    </div>,
    portalRoot
  );
};

const UserMyCopierAccounts = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [userId, setUserId] = useState("");
  const [copiers, setCopiers] = useState([]);
  const [accountsChecked, setAccountsChecked] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCopier, setSelectedCopier] = useState(null);
  const [tradeStatus, setTradeStatus] = useState("all");

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [tableOpen, setTableOpen] = useState(true);
  const [cardsOpen, setCardsOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [masterFilter, setMasterFilter] = useState("all");
  const [profitFilter, setProfitFilter] = useState("all");
  const [sortBy, setSortBy] = useState("copierAsc");

  const loadCopierAccounts = async () => {
    try {
      setLoading(true);

      const userRes = await copyTradingApi.getMeUser();
      const user = getNestedUser(userRes);
      const resolvedUserId = getUserIdFromUser(user);

      const accounts = getUserMt5Accounts(user);

      setUserId(resolvedUserId);
      setAccountsChecked(accounts);

      if (!accounts.length) {
        setCopiers([]);
        return;
      }

      const res = await copyTradingApi.userMyCopierAccounts({
        accounts,
      });

      const copierAccounts = Array.isArray(res?.data?.copierAccounts)
        ? res.data.copierAccounts
        : [];

      setCopiers(copierAccounts);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load copier accounts");
      setCopiers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCopierAccounts();
  }, []);

  const openTradePopup = (copier) => {
    setTradeStatus("all");
    setSelectedCopier(copier);
  };

  const closeTradePopup = () => {
    setSelectedCopier(null);
    setTradeStatus("all");
  };

  const resetFilters = () => {
    setSearchText("");
    setMasterFilter("all");
    setProfitFilter("all");
    setSortBy("copierAsc");
  };

  const masterOptions = useMemo(() => {
    const options = new Map();

    copiers.forEach((copier) => {
      const masterAccount = getMasterAccount(copier);
      const masterName = getMasterValue(copier, "name", "-");

      if (masterAccount) {
        options.set(masterAccount, masterName);
      }
    });

    return Array.from(options.entries()).map(([account, name]) => ({
      account,
      name,
    }));
  }, [copiers]);

  const filteredCopiers = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let rows = [...copiers];

    if (search) {
      rows = rows.filter((copier) => {
        const copierAccount = getCopierAccount(copier);
        const masterAccount = getMasterAccount(copier);
        const masterName = getMasterValue(copier, "name", "");
        const copierName = getCopierValue(copier, "name", "");

        const text = [
          copierAccount,
          masterAccount,
          masterName,
          copierName,
          getCopierValue(copier, "balance", ""),
          getCopierValue(copier, "equity", ""),
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(search);
      });
    }

    if (masterFilter !== "all") {
      rows = rows.filter((copier) => getMasterAccount(copier) === masterFilter);
    }

    if (profitFilter !== "all") {
      rows = rows.filter((copier) => {
        const todayProfit = Number(getCopierValue(copier, "todayProfit", 0));
        const weeklyProfit = Number(getCopierValue(copier, "weeklyProfit", 0));
        const monthlyProfit = Number(getCopierValue(copier, "monthlyProfit", 0));
        const equity = Number(getCopierValue(copier, "equity", 0));
        const balance = Number(getCopierValue(copier, "balance", 0));

        if (profitFilter === "todayProfit") return todayProfit > 0;
        if (profitFilter === "todayLoss") return todayProfit < 0;
        if (profitFilter === "weeklyProfit") return weeklyProfit > 0;
        if (profitFilter === "weeklyLoss") return weeklyProfit < 0;
        if (profitFilter === "monthlyProfit") return monthlyProfit > 0;
        if (profitFilter === "monthlyLoss") return monthlyProfit < 0;
        if (profitFilter === "equityAboveBalance") return equity > balance;
        if (profitFilter === "equityBelowBalance") return equity < balance;

        return true;
      });
    }

    rows.sort((a, b) => {
      const copierA = Number(getCopierAccount(a) || 0);
      const copierB = Number(getCopierAccount(b) || 0);
      const masterA = Number(getMasterAccount(a) || 0);
      const masterB = Number(getMasterAccount(b) || 0);
      const balanceA = Number(getCopierValue(a, "balance", 0));
      const balanceB = Number(getCopierValue(b, "balance", 0));
      const equityA = Number(getCopierValue(a, "equity", 0));
      const equityB = Number(getCopierValue(b, "equity", 0));
      const todayA = Number(getCopierValue(a, "todayProfit", 0));
      const todayB = Number(getCopierValue(b, "todayProfit", 0));

      if (sortBy === "copierDesc") return copierB - copierA;
      if (sortBy === "masterAsc") return masterA - masterB;
      if (sortBy === "masterDesc") return masterB - masterA;
      if (sortBy === "balanceHigh") return balanceB - balanceA;
      if (sortBy === "balanceLow") return balanceA - balanceB;
      if (sortBy === "equityHigh") return equityB - equityA;
      if (sortBy === "equityLow") return equityA - equityB;
      if (sortBy === "todayHigh") return todayB - todayA;
      if (sortBy === "todayLow") return todayA - todayB;

      return copierA - copierB;
    });

    return rows;
  }, [copiers, searchText, masterFilter, profitFilter, sortBy]);

  const uniqueMastersCount = useMemo(() => {
    const masterSet = new Set();

    copiers.forEach((copier) => {
      const masterAccount = getMasterAccount(copier);
      if (masterAccount) masterSet.add(masterAccount);
    });

    return masterSet.size;
  }, [copiers]);

  const totalBalance = useMemo(() => {
    return copiers.reduce((sum, copier) => {
      return sum + Number(getCopierValue(copier, "balance", 0) || 0);
    }, 0);
  }, [copiers]);

  const totalEquity = useMemo(() => {
    return copiers.reduce((sum, copier) => {
      return sum + Number(getCopierValue(copier, "equity", 0) || 0);
    }, 0);
  }, [copiers]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (searchText.trim()) count += 1;
    if (masterFilter !== "all") count += 1;
    if (profitFilter !== "all") count += 1;
    if (sortBy !== "copierAsc") count += 1;

    return count;
  }, [searchText, masterFilter, profitFilter, sortBy]);

  if (loading) {
    return (
      <div
        className={cx(
          "p-5 text-sm","text-muted"
        )}
      >
        Loading your copier accounts...
      </div>
    );
  }

  if (!copiers.length) {
    return (
      <CopyTradingEmptyState
        isDark={isDark}
        title="No copier account found"
        subtitle="Your CRM MT5 accounts are not currently linked as copier accounts."
      />
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div
          className={cx(
            "grid grid-cols-1 gap-3 rounded-card border p-4 md:grid-cols-4","border-line bg-surface-2"
          )}
        >
          <StatCard
            isDark={isDark}
            icon={<Link2 className="h-4 w-4" />}
            label="My Copier Accounts"
            value={copiers.length}
          />

          <StatCard
            isDark={isDark}
            icon={<RadioTower className="h-4 w-4" />}
            label="Linked Masters"
            value={uniqueMastersCount}
          />

          <StatCard
            isDark={isDark}
            icon={<Wallet className="h-4 w-4" />}
            label="Total Balance"
            value={formatMoney(totalBalance)}
          />

          <StatCard
            isDark={isDark}
            icon={<TrendingUp className="h-4 w-4" />}
            label="Total Equity"
            value={formatMoney(totalEquity)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={cx(
              "text-sm","text-subtle"
            )}
          >
            Checked CRM Accounts:{" "}
            <span className="font-bold">{accountsChecked.length}</span> ·
            Showing: <span className="font-bold">{filteredCopiers.length}</span>
          </p>

          <button
            type="button"
            onClick={loadCopierAccounts}
            disabled={loading}
            className={cx(
              "inline-flex items-center gap-2 rounded-card border px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60","border-line bg-surface-2 text-text hover:bg-surface-2"
            )}
          >
            <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          <CollapseHeader
            isDark={isDark}
            title="Search & Filters"
            subtitle="Search copier/master accounts, filter by master, P/L, and sort results."
            icon={<Filter className="h-5 w-5" />}
            open={filtersOpen}
            onToggle={() => setFiltersOpen((prev) => !prev)}
            rightContent={
              activeFilterCount ? (
                <span className="rounded-full bg-success px-3 py-1 text-xs font-black text-text">
                  {activeFilterCount} Active
                </span>
              ) : null
            }
          />

          {filtersOpen && (
            <div
              className={cx(
                "rounded-card border p-4","border-line bg-surface-2"
              )}
            >
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
                <FilterInput
                  isDark={isDark}
                  value={searchText}
                  onChange={setSearchText}
                />

                <FilterSelect
                  isDark={isDark}
                  label="Master"
                  value={masterFilter}
                  onChange={setMasterFilter}
                >
                  <option value="all">All Masters</option>
                  {masterOptions.map((master) => (
                    <option key={master.account} value={master.account}>
                      {master.account} - {master.name}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  isDark={isDark}
                  label="P/L Filter"
                  value={profitFilter}
                  onChange={setProfitFilter}
                >
                  <option value="all">All Accounts</option>
                  <option value="todayProfit">Today Profit</option>
                  <option value="todayLoss">Today Loss</option>
                  <option value="weeklyProfit">Weekly Profit</option>
                  <option value="weeklyLoss">Weekly Loss</option>
                  <option value="monthlyProfit">Monthly Profit</option>
                  <option value="monthlyLoss">Monthly Loss</option>
                  <option value="equityAboveBalance">Equity Above Balance</option>
                  <option value="equityBelowBalance">Equity Below Balance</option>
                </FilterSelect>

                <FilterSelect
                  isDark={isDark}
                  label="Sort By"
                  value={sortBy}
                  onChange={setSortBy}
                >
                  <option value="copierAsc">Copier Account ↑</option>
                  <option value="copierDesc">Copier Account ↓</option>
                  <option value="masterAsc">Master Account ↑</option>
                  <option value="masterDesc">Master Account ↓</option>
                  <option value="balanceHigh">Balance High</option>
                  <option value="balanceLow">Balance Low</option>
                  <option value="equityHigh">Equity High</option>
                  <option value="equityLow">Equity Low</option>
                  <option value="todayHigh">Today P/L High</option>
                  <option value="todayLow">Today P/L Low</option>
                </FilterSelect>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={cx(
                      "inline-flex w-full items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-black","border-line bg-surface-2 text-text hover:bg-surface-2"
                    )}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <CollapseHeader
            isDark={isDark}
            title="Table View"
            subtitle="Compact account list with trade popup action."
            icon={<Users className="h-5 w-5" />}
            open={tableOpen}
            onToggle={() => setTableOpen((prev) => !prev)}
            rightContent={
              <span
                className={cx(
                  "rounded-full px-3 py-1 text-xs font-black","bg-surface-2 text-muted"
                )}
              >
                {filteredCopiers.length} Rows
              </span>
            }
          />

          {tableOpen && (
            <div
              className={cx(
                "overflow-hidden rounded-card border","border-line bg-surface-2"
              )}
            >
              {!filteredCopiers.length ? (
                <CopyTradingEmptyState
                  isDark={isDark}
                  title="No matching copier accounts"
                  subtitle="Try changing search text or filters."
                />
              ) : (
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full min-w-[1160px] text-left text-sm table-stack">
                    <thead>
                      <tr
                        className={cx(
                          "border-b text-xs uppercase tracking-[0.16em]","border-line bg-surface-2 text-subtle"
                        )}
                      >
                        <th className="whitespace-nowrap px-4 py-3">
                          Copier Account
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">
                          Master Account
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">
                          Master Name
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">
                          Commission
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">Balance</th>
                        <th className="whitespace-nowrap px-4 py-3">Equity</th>
                        <th className="whitespace-nowrap px-4 py-3">Today P/L</th>
                        <th className="whitespace-nowrap px-4 py-3">Weekly P/L</th>
                        <th className="whitespace-nowrap px-4 py-3">
                          Monthly P/L
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">Trades</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCopiers.map((copier, index) => {
                        const copierAccount = getCopierAccount(copier);
                        const masterAccount = getMasterAccount(copier);

                        return (
                          <tr
                            key={`${copierAccount}-${masterAccount}-${index}`}
                            className={cx(
                              "border-t transition-colors","border-line hover:bg-surface-2"
                            )}
                          >
                            <td data-label="Copier Account" className="whitespace-nowrap px-4 py-4 font-black">
                              {copierAccount || "-"}
                            </td>

                            <td data-label="Master Account" className="whitespace-nowrap px-4 py-4 font-bold">
                              {masterAccount || "-"}
                            </td>

                            <td data-label="Master Name" className="whitespace-nowrap px-4 py-4">
                              {getMasterValue(copier, "name", "-")}
                            </td>

                            <td data-label="Commission" className="whitespace-nowrap px-4 py-4">
                              {getMasterValue(copier, "commission", 0)}%
                            </td>

                            <td data-label="Balance" className="whitespace-nowrap px-4 py-4 font-bold">
                              {formatMoney(getCopierValue(copier, "balance", 0))}
                            </td>

                            <td data-label="Equity" className="whitespace-nowrap px-4 py-4 font-bold">
                              {formatMoney(getCopierValue(copier, "equity", 0))}
                            </td>

                            <td data-label="Today P/L" className="whitespace-nowrap px-4 py-4">
                              {formatMoney(
                                getCopierValue(copier, "todayProfit", 0)
                              )}
                            </td>

                            <td data-label="Weekly P/L" className="whitespace-nowrap px-4 py-4">
                              {formatMoney(
                                getCopierValue(copier, "weeklyProfit", 0)
                              )}
                            </td>

                            <td data-label="Monthly P/L" className="whitespace-nowrap px-4 py-4">
                              {formatMoney(
                                getCopierValue(copier, "monthlyProfit", 0)
                              )}
                            </td>

                            <td data-label="Trades" className="whitespace-nowrap px-4 py-4">
                              <button
                                type="button"
                                onClick={() => openTradePopup(copier)}
                                disabled={!copierAccount || !masterAccount}
                                className={cx(
                                  "inline-flex items-center gap-2 rounded-card border px-4 py-2 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-50","border-success bg-success-soft text-success hover:bg-success-soft"
                                )}
                              >
                                <Eye className="h-4 w-4" />
                                View Trades
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <CollapseHeader
            isDark={isDark}
            title="Card View"
            subtitle="Expandable visual account cards."
            icon={<Link2 className="h-5 w-5" />}
            open={cardsOpen}
            onToggle={() => setCardsOpen((prev) => !prev)}
            rightContent={
              <span
                className={cx(
                  "rounded-full px-3 py-1 text-xs font-black","bg-surface-2 text-muted"
                )}
              >
                {filteredCopiers.length} Cards
              </span>
            }
          />

          {cardsOpen && (
            <div
              className={cx(
                "grid grid-cols-1 gap-4 md:grid-cols-2","text-text"
              )}
            >
              {!filteredCopiers.length ? (
                <div className="md:col-span-2">
                  <CopyTradingEmptyState
                    isDark={isDark}
                    title="No matching copier cards"
                    subtitle="Try changing search text or filters."
                  />
                </div>
              ) : (
                filteredCopiers.map((copier, index) => {
                  const copierAccount = getCopierAccount(copier);
                  const masterAccount = getMasterAccount(copier);

                  return (
                    <div
                      key={`card-${copierAccount}-${masterAccount}-${index}`}
                      className={cx(
                        "rounded-card border p-5","border-line bg-surface-2"
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-success">
                            Copier Account
                          </p>

                          <h3 className="mt-1 text-xl font-black">
                            {copierAccount || "-"}
                          </h3>
                        </div>

                        <div
                          className={cx(
                            "rounded-card border px-3 py-2 text-xs font-bold","border-line bg-surface-2 text-muted"
                          )}
                        >
                          Copying {masterAccount || "-"}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p
                            className={"text-subtle"
                            }
                          >
                            Master Name
                          </p>
                          <p className="font-bold">
                            {getMasterValue(copier, "name", "-")}
                          </p>
                        </div>

                        <div>
                          <p
                            className={"text-subtle"
                            }
                          >
                            Commission
                          </p>
                          <p className="font-bold">
                            {getMasterValue(copier, "commission", 0)}%
                          </p>
                        </div>

                        <div>
                          <p
                            className={"text-subtle"
                            }
                          >
                            Balance
                          </p>
                          <p className="font-bold">
                            {formatMoney(getCopierValue(copier, "balance", 0))}
                          </p>
                        </div>

                        <div>
                          <p
                            className={"text-subtle"
                            }
                          >
                            Equity
                          </p>
                          <p className="font-bold">
                            {formatMoney(getCopierValue(copier, "equity", 0))}
                          </p>
                        </div>

                        <div>
                          <p
                            className={"text-subtle"
                            }
                          >
                            Today P/L
                          </p>
                          <p className="font-bold">
                            {formatMoney(
                              getCopierValue(copier, "todayProfit", 0)
                            )}
                          </p>
                        </div>

                        <div>
                          <p
                            className={"text-subtle"
                            }
                          >
                            Weekly P/L
                          </p>
                          <p className="font-bold">
                            {formatMoney(
                              getCopierValue(copier, "weeklyProfit", 0)
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openTradePopup(copier)}
                        disabled={!copierAccount || !masterAccount}
                        className={cx(
                          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-50","border-success bg-success-soft text-success hover:bg-success-soft"
                        )}
                      >
                        <Eye className="h-4 w-4" />
                        View Copier & Master Trades
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {selectedCopier && (
        <TradesPopup
          isDark={isDark}
          userId={userId}
          copier={selectedCopier}
          status={tradeStatus}
          setStatus={setTradeStatus}
          onClose={closeTradePopup}
        />
      )}
    </>
  );
};

export default UserMyCopierAccounts;