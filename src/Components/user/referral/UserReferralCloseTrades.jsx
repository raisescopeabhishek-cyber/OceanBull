import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeDollarSign,
  CalendarClock,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Info,
  Layers3,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { GrDocumentPdf } from "react-icons/gr";
import { PiFileCsvDuotone } from "react-icons/pi";
import { RiFileExcel2Line } from "react-icons/ri";

import { userApi } from "../../../utils/apiClients";
import DynamicLoder from "../../Loader/DynamicLoder";
import { cx } from "./components/ReferralPrimitives";

const safeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const format4 = (value) => safeNumber(value).toFixed(4);

const normalizeAccountNumber = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const normalizeDateText = (value) => {
  if (!value) return "-";
  return String(value);
};

const dateToTime = (value) => {
  if (!value) return 0;

  const normalized = String(value).replace(
    /^(\d{4})\.(\d{2})\.(\d{2})/,
    "$1-$2-$3"
  );

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const tradeSideLabel = (buySell) => {
  const value = Number(buySell);

  if (value === 0) return "Buy";
  if (value === 1) return "Sell";

  return "-";
};

const getTradeSideClass = (buySell, isDark) => {
  const value = Number(buySell);

  if (value === 0) {
    return isDark
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === 1) {
    return isDark
      ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
      : "border-rose-200 bg-rose-50 text-rose-700";
  }

  return isDark
    ? "border-white/10 bg-white/[0.04] text-white/60"
    : "border-slate-200 bg-slate-50 text-slate-600";
};

const getStatusText = (row) => {
  return row?.commission?.isCalculated === true ? "completed" : "pending";
};

const parseAccountPairs = (rawValue) => {
  const raw = rawValue || "";
  if (!raw) return [];

  return raw
    .split(",")
    .map((pair) => {
      const [accountNumber, level] = pair.split(":");

      return {
        accountNumber: normalizeAccountNumber(accountNumber),
        level: level === undefined || level === "" ? null : Number(level),
      };
    })
    .filter((item) => item.accountNumber);
};

const uniqueTargets = (targets = []) => {
  const map = new Map();

  targets.forEach((target) => {
    const accountNumber = normalizeAccountNumber(target?.accountNumber);
    if (!accountNumber) return;

    const key = `${accountNumber}:${target?.level ?? ""}`;

    if (!map.has(key)) {
      map.set(key, {
        ...target,
        accountNumber,
        level:
          target?.level === undefined || target?.level === null || target?.level === ""
            ? null
            : Number(target.level),
      });
    }
  });

  return Array.from(map.values());
};

const UserReferralCloseTrades = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};

  const themeMode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = outletContext?.isDark ?? themeMode === "dark";

  const explicitLevelParam = searchParams.get("level");
  const explicitLevel = useMemo(() => {
    const parsed = Number(explicitLevelParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [explicitLevelParam]);

  const userGroupFromState = location?.state?.userGroup || null;

  const accountTargets = useMemo(() => {
    const fromQuery = parseAccountPairs(searchParams.get("accounts"));
    const fromState = Array.isArray(userGroupFromState?.accounts)
      ? userGroupFromState.accounts.map((row) => ({
          accountNumber: row?.accountNumber,
          level: row?.level,
          name: row?.name,
          email: row?.email,
          country: row?.country,
          totalLot: row?.totalLot,
          totalCommission: row?.totalCommission,
        }))
      : [];

    const fallbackId = normalizeAccountNumber(id);

    if (fromQuery.length) {
      const merged = fromQuery.map((target) => {
        const stateMatch = fromState.find(
          (row) =>
            normalizeAccountNumber(row.accountNumber) ===
            normalizeAccountNumber(target.accountNumber)
        );

        return {
          ...stateMatch,
          ...target,
        };
      });

      return uniqueTargets(merged);
    }

    if (fromState.length) {
      return uniqueTargets(fromState);
    }

    if (fallbackId && fallbackId !== "unknown") {
      return uniqueTargets([
        {
          accountNumber: fallbackId,
          level: explicitLevel,
        },
      ]);
    }

    return [];
  }, [explicitLevel, id, searchParams, userGroupFromState]);

  const [tradeRows, setTradeRows] = useState([]);
  const [accountErrors, setAccountErrors] = useState([]);
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("closeTime");
  const [sortDirection, setSortDirection] = useState("desc");

  const pageUserName = userGroupFromState?.name || "IB User";
  const pageUserEmail = userGroupFromState?.email || decodeURIComponent(id || "");
  const pageUserCountry = userGroupFromState?.country || "";

  const fetchCommissions = useCallback(async () => {
    setIsLoading(true);
    setErrorText("");
    setAccountErrors([]);

    try {
      if (!accountTargets.length) {
        setTradeRows([]);
        setErrorText("No account found for this user.");
        return;
      }

      const results = await Promise.allSettled(
        accountTargets.map(async (target) => {
          const res = await userApi.get(`/user-ib-close-trade/${target.accountNumber}`);

          return {
            target,
            rows: Array.isArray(res?.data?.data) ? res.data.data : [],
          };
        })
      );

      const nextRows = [];
      const nextErrors = [];

      results.forEach((result, resultIndex) => {
        const target = accountTargets[resultIndex];

        if (result.status !== "fulfilled") {
          nextErrors.push({
            accountNumber: target?.accountNumber,
            message:
              result?.reason?.response?.data?.message ||
              result?.reason?.message ||
              "Unable to load this account trades.",
          });
          return;
        }

        const rows = result.value.rows;
        const currentTarget = result.value.target;

        rows.forEach((trade) => {
          const commissions = Array.isArray(trade?.commissions)
            ? trade.commissions
            : [];

          const levelToUse = explicitLevel || currentTarget?.level || null;

          const matchedCommissions = levelToUse
            ? commissions.filter(
                (commission) => Number(commission?.level) === Number(levelToUse)
              )
            : commissions;

          matchedCommissions.forEach((commission, index) => {
            nextRows.push({
              ...trade,
              commission,
              accountTarget: currentTarget,
              _accountNumber: normalizeAccountNumber(
                trade?.mt5Account || currentTarget?.accountNumber
              ),
              _rowKey: `${trade?._id || trade?.positionId || "trade"}-${
                currentTarget?.accountNumber
              }-${commission?.level || "level"}-${
                commission?.ibAccountNumber || "ib"
              }-${index}`,
            });
          });
        });
      });

      setTradeRows(nextRows);
      setAccountErrors(nextErrors);
      setLastUpdatedAt(new Date());

      const nextExpanded = {};
      accountTargets.forEach((target, index) => {
        nextExpanded[target.accountNumber] = accountTargets.length <= 3 || index === 0;
      });
      setExpandedAccounts(nextExpanded);
    } catch (error) {
      console.error(error);
      setErrorText(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load close trades right now."
      );
    } finally {
      setIsLoading(false);
    }
  }, [accountTargets, explicitLevel]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const searched = tradeRows.filter((row) => {
      const status = getStatusText(row);
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      const searchableText = [
        row?._accountNumber,
        row?.mt5Account,
        row?.ticket,
        row?.symbol,
        row?.openTime,
        row?.closeTime,
        row?.positionId,
        row?.commission?.level,
        row?.commission?.ibAccountNumber,
        row?.commission?.commissionAmount,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || searchableText.includes(q);

      return matchesStatus && matchesSearch;
    });

    return [...searched].sort((a, b) => {
      let aValue;
      let bValue;

      if (sortBy === "account") {
        aValue = String(a?._accountNumber || "");
        bValue = String(b?._accountNumber || "");
      } else if (sortBy === "symbol") {
        aValue = String(a?.symbol || "");
        bValue = String(b?.symbol || "");
      } else if (sortBy === "profit") {
        aValue = safeNumber(a?.profit);
        bValue = safeNumber(b?.profit);
      } else if (sortBy === "lotSize") {
        aValue = safeNumber(a?.lotSize);
        bValue = safeNumber(b?.lotSize);
      } else if (sortBy === "rebate") {
        aValue = safeNumber(a?.commission?.commissionAmount);
        bValue = safeNumber(b?.commission?.commissionAmount);
      } else {
        aValue = dateToTime(a?.closeTimeDate || a?.closeTime);
        bValue = dateToTime(b?.closeTimeDate || b?.closeTime);
      }

      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      return 0;
    });
  }, [searchTerm, sortBy, sortDirection, statusFilter, tradeRows]);

  const accountGroups = useMemo(() => {
    const map = new Map();

    accountTargets.forEach((target) => {
      if (!target?.accountNumber) return;

      map.set(target.accountNumber, {
        accountNumber: target.accountNumber,
        level: target.level,
        name: target.name || pageUserName,
        email: target.email || pageUserEmail,
        country: target.country || pageUserCountry,
        expectedLot: safeNumber(target.totalLot),
        expectedCommission: safeNumber(target.totalCommission),
        rows: [],
      });
    });

    filteredRows.forEach((row) => {
      const accountNumber = normalizeAccountNumber(row?._accountNumber || row?.mt5Account);

      if (!map.has(accountNumber)) {
        map.set(accountNumber, {
          accountNumber,
          level: row?.commission?.level || null,
          name: pageUserName,
          email: pageUserEmail,
          country: pageUserCountry,
          expectedLot: 0,
          expectedCommission: 0,
          rows: [],
        });
      }

      map.get(accountNumber).rows.push(row);
    });

    return Array.from(map.values()).map((group) => {
      const totalProfit = group.rows.reduce(
        (sum, row) => sum + safeNumber(row?.profit),
        0
      );

      const totalLot = group.rows.reduce(
        (sum, row) => sum + safeNumber(row?.lotSize),
        0
      );

      const totalRebate = group.rows.reduce(
        (sum, row) => sum + safeNumber(row?.commission?.commissionAmount),
        0
      );

      const completed = group.rows.filter(
        (row) => row?.commission?.isCalculated === true
      ).length;

      return {
        ...group,
        totalProfit,
        totalLot,
        totalRebate,
        completed,
        pending: group.rows.length - completed,
      };
    });
  }, [accountTargets, filteredRows, pageUserCountry, pageUserEmail, pageUserName]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.profit += safeNumber(row?.profit);
        acc.lotSize += safeNumber(row?.lotSize);
        acc.rebate += safeNumber(row?.commission?.commissionAmount);

        if (row?.commission?.isCalculated === true) acc.completed += 1;
        else acc.pending += 1;

        if (row?._accountNumber) acc.accounts.add(String(row._accountNumber));
        if (row?.symbol) acc.symbols.add(String(row.symbol));

        return acc;
      },
      {
        profit: 0,
        lotSize: 0,
        rebate: 0,
        completed: 0,
        pending: 0,
        accounts: new Set(),
        symbols: new Set(),
      }
    );
  }, [filteredRows]);

  const exportRows = useCallback(() => {
    const data = filteredRows.map((row) => ({
      "Account No": row?._accountNumber || row?.mt5Account || "-",
      Ticket: row?.ticket || "-",
      "Position ID": row?.positionId || "-",
      Level: row?.commission?.level || "-",
      "IB Account": row?.commission?.ibAccountNumber || "-",
      Symbol: row?.symbol || "-",
      Side: tradeSideLabel(row?.buySell),
      "Open Time": normalizeDateText(row?.openTime),
      "Close Time": normalizeDateText(row?.closeTime),
      "Open Price": format4(row?.openPrice),
      "Close Price": format4(row?.closePrice),
      Profit: format4(row?.profit),
      Volume: format4(row?.lotSize),
      Rebate: format4(row?.commission?.commissionAmount),
      Status: row?.commission?.isCalculated === true ? "Completed" : "Pending",
    }));

    data.push({
      "Account No": "TOTAL",
      Ticket: "",
      "Position ID": "",
      Level: explicitLevel ? `Level ${explicitLevel}` : "All",
      "IB Account": "",
      Symbol: "",
      Side: "",
      "Open Time": "",
      "Close Time": "",
      "Open Price": "",
      "Close Price": "",
      Profit: format4(totals.profit),
      Volume: format4(totals.lotSize),
      Rebate: format4(totals.rebate),
      Status: "",
    });

    return data;
  }, [explicitLevel, filteredRows, totals.lotSize, totals.profit, totals.rebate]);

  const exportToExcel = () => {
    const data = exportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Close Trades");

    const headers = Object.keys(data[0] || {});
    ws["!cols"] = headers.map((key) => ({
      wch: Math.max(
        12,
        key.length,
        ...data.map((row) => String(row?.[key] ?? "").length)
      ),
    }));

    XLSX.writeFile(wb, "referral_user_close_trades.xlsx");
  };

  const exportToCSV = () => {
    const data = exportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "referral_user_close_trades.csv";
    link.click();

    URL.revokeObjectURL(link.href);
  };

  const exportToPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    const data = exportRows();

    const headers = Object.keys(data[0] || {});
    const rows = data.map((row) => headers.map((header) => row[header]));

    doc.setFontSize(16);
    doc.text("Referral User Close Trades Report", 40, 36);

    doc.setFontSize(9);
    doc.text(
      `User: ${pageUserName} | Accounts: ${accountGroups.length} | Records: ${filteredRows.length} | Rebate: ${format4(
        totals.rebate
      )}`,
      40,
      54
    );

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 70,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontSize: 7,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: {
        left: 24,
        right: 24,
      },
    });

    doc.save("referral_user_close_trades.pdf");
  };

  const toggleAccount = (accountNumber) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [accountNumber]: !prev[accountNumber],
    }));
  };

  const expandAllAccounts = () => {
    const next = {};
    accountGroups.forEach((group) => {
      next[group.accountNumber] = true;
    });
    setExpandedAccounts(next);
  };

  const collapseAllAccounts = () => {
    const next = {};
    accountGroups.forEach((group) => {
      next[group.accountNumber] = false;
    });
    setExpandedAccounts(next);
  };

  const canExport = !isLoading && filteredRows.length > 0;

  const statCards = [
    {
      label: "Total Rebate",
      value: `$${format4(totals.rebate)}`,
      sub: `${filteredRows.length} visible trade rows`,
      icon: BadgeDollarSign,
      tone: "emerald",
    },
    {
      label: "Accounts",
      value: accountGroups.length,
      sub: `${totals.accounts.size} with visible trades`,
      icon: Wallet,
      tone: "cyan",
    },
    {
      label: "Total Volume",
      value: format4(totals.lotSize),
      sub: "Combined lot size",
      icon: Layers3,
      tone: "violet",
    },
    {
      label: "Total Profit",
      value: `$${format4(totals.profit)}`,
      sub: `${totals.symbols.size} symbol(s)`,
      icon: TrendingUp,
      tone: totals.profit >= 0 ? "emerald" : "rose",
    },
  ];

  const toneClasses = {
    emerald: isDark
      ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-200"
      : "border-emerald-100 bg-emerald-50 text-emerald-700",
    cyan: isDark
      ? "border-cyan-400/15 bg-cyan-400/10 text-cyan-200"
      : "border-cyan-100 bg-cyan-50 text-cyan-700",
    violet: isDark
      ? "border-violet-400/15 bg-violet-400/10 text-violet-200"
      : "border-violet-100 bg-violet-50 text-violet-700",
    rose: isDark
      ? "border-rose-400/15 bg-rose-400/10 text-rose-200"
      : "border-rose-100 bg-rose-50 text-rose-700",
  };

  return (
    <div className="space-y-5">
      <section
        className={cx(
          "relative overflow-hidden rounded-[28px] border p-4 sm:p-5 lg:p-6",
          isDark
            ? "border-white/10 bg-slate-950/50"
            : "border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-white"
        )}
      >
        <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all hover:-translate-x-0.5",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  : "border-sky-100 bg-white text-slate-700 shadow-sm hover:bg-sky-50"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div>
              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                  isDark
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                    : "border-cyan-100 bg-cyan-50 text-cyan-700"
                )}
              >
                <Activity className="h-3.5 w-3.5" />
                Expandable Close Trades
              </div>

              <h2
                className={cx(
                  "mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl",
                  isDark ? "text-white" : "text-slate-950"
                )}
              >
                {pageUserName || "IB User"} Trade Ledger
              </h2>

              <p className={cx("mt-2 max-w-3xl text-sm leading-6", isDark ? "text-white/60" : "text-slate-600")}>
                Multiple accounts are grouped below. Expand each account to inspect
                close trades, commission level, rebate, volume, price, and status.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white/75"
                  : "border-sky-100 bg-white text-slate-700 shadow-sm"
              )}
            >
              <UserRound className="h-4 w-4" />
              {pageUserEmail || "User"}
            </div>

            <div
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white/75"
                  : "border-sky-100 bg-white text-slate-700 shadow-sm"
              )}
            >
              <Clock3 className="h-4 w-4" />
              {lastUpdatedAt ? `Updated ${lastUpdatedAt.toLocaleTimeString()}` : "Not refreshed yet"}
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={cx(
                  "rounded-3xl border p-4 shadow-sm backdrop-blur",
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-white/70 bg-white/80"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cx("text-xs font-bold uppercase tracking-[0.16em]", isDark ? "text-white/45" : "text-slate-500")}>
                      {card.label}
                    </p>
                    <p className={cx("mt-2 text-2xl font-black", isDark ? "text-white" : "text-slate-950")}>
                      {card.value}
                    </p>
                    <p className={cx("mt-1 text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                      {card.sub}
                    </p>
                  </div>

                  <div className={cx("grid h-11 w-11 place-items-center rounded-2xl border", toneClasses[card.tone])}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className={cx(
          "rounded-[28px] border p-4 sm:p-5",
          isDark ? "border-white/10 bg-slate-950/50" : "border-sky-100 bg-white shadow-sm"
        )}
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_150px] xl:min-w-[720px]">
            <div
              className={cx(
                "flex items-center gap-2 rounded-2xl border px-4 py-3",
                isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50"
              )}
            >
              <Search className={cx("h-4 w-4", isDark ? "text-white/45" : "text-slate-400")} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search account, ticket, symbol, position..."
                className={cx(
                  "w-full bg-transparent text-sm outline-none placeholder:text-slate-400",
                  isDark ? "text-white" : "text-slate-900"
                )}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={cx(
                "rounded-2xl border px-4 py-3 text-sm font-semibold outline-none",
                isDark
                  ? "border-white/10 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              )}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={cx(
                "rounded-2xl border px-4 py-3 text-sm font-semibold outline-none",
                isDark
                  ? "border-white/10 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              )}
            >
              <option value="closeTime">Sort: Close Time</option>
              <option value="account">Sort: Account</option>
              <option value="rebate">Sort: Rebate</option>
              <option value="profit">Sort: Profit</option>
              <option value="lotSize">Sort: Volume</option>
              <option value="symbol">Sort: Symbol</option>
            </select>

            <button
              type="button"
              onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
              className={cx(
                "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {sortDirection === "asc" ? "ASC" : "DESC"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={expandAllAccounts}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              )}
            >
              Expand all
            </button>

            <button
              type="button"
              onClick={collapseAllAccounts}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              )}
            >
              Collapse all
            </button>

            <button
              type="button"
              onClick={exportToExcel}
              disabled={!canExport}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45",
                isDark
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              )}
            >
              <RiFileExcel2Line className="h-4 w-4" />
              Excel
            </button>

            <button
              type="button"
              onClick={exportToCSV}
              disabled={!canExport}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45",
                isDark
                  ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                  : "border-cyan-100 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
              )}
            >
              <PiFileCsvDuotone className="h-4 w-4" />
              CSV
            </button>

            <button
              type="button"
              onClick={exportToPDF}
              disabled={!canExport}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45",
                isDark
                  ? "border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15"
                  : "border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100"
              )}
            >
              <GrDocumentPdf className="h-4 w-4" />
              PDF
            </button>

            <button
              type="button"
              onClick={fetchCommissions}
              disabled={isLoading}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  : "border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100"
              )}
            >
              <RefreshCw className={cx("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {errorText && (
        <div
          className={cx(
            "rounded-3xl border p-4 text-sm font-semibold",
            isDark
              ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
              : "border-rose-100 bg-rose-50 text-rose-700"
          )}
        >
          {errorText}
        </div>
      )}

      {accountErrors.length > 0 && (
        <div
          className={cx(
            "rounded-3xl border p-4 text-sm",
            isDark
              ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
              : "border-amber-100 bg-amber-50 text-amber-700"
          )}
        >
          <p className="font-bold">Some accounts could not be loaded:</p>
          <div className="mt-2 space-y-1">
            {accountErrors.map((err) => (
              <p key={err.accountNumber}>
                {err.accountNumber}: {err.message}
              </p>
            ))}
          </div>
        </div>
      )}

      <section
        className={cx(
          "overflow-hidden rounded-[28px] border",
          isDark ? "border-white/10 bg-slate-950/50" : "border-sky-100 bg-white shadow-sm"
        )}
      >
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <DynamicLoder />
          </div>
        ) : accountGroups.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div
              className={cx(
                "grid h-14 w-14 place-items-center rounded-3xl border",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white/60"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              )}
            >
              <Info className="h-6 w-6" />
            </div>

            <div>
              <h3 className={cx("text-lg font-black", isDark ? "text-white" : "text-slate-950")}>
                No accounts found
              </h3>
              <p className={cx("mt-1 text-sm", isDark ? "text-white/50" : "text-slate-500")}>
                Open this page from the IB users list or pass accounts in the URL.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-white/10">
            {accountGroups.map((group) => {
              const expanded = !!expandedAccounts[group.accountNumber];

              return (
                <div key={group.accountNumber}>
                  <button
                    type="button"
                    onClick={() => toggleAccount(group.accountNumber)}
                    className={cx(
                      "flex w-full flex-col gap-4 p-4 text-left transition-all sm:p-5 lg:flex-row lg:items-center lg:justify-between",
                      isDark ? "hover:bg-white/[0.04]" : "hover:bg-sky-50/60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cx(
                          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border",
                          isDark
                            ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                            : "border-sky-100 bg-sky-50 text-sky-700"
                        )}
                      >
                        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={cx("text-lg font-black", isDark ? "text-white" : "text-slate-950")}>
                            Account {group.accountNumber}
                          </h3>

                          <span
                            className={cx(
                              "rounded-full border px-2.5 py-1 text-xs font-black",
                              isDark
                                ? "border-violet-400/20 bg-violet-400/10 text-violet-200"
                                : "border-violet-100 bg-violet-50 text-violet-700"
                            )}
                          >
                            Level {group.level || explicitLevel || "-"}
                          </span>
                        </div>

                        <p className={cx("mt-1 text-sm", isDark ? "text-white/50" : "text-slate-500")}>
                          {group.email || pageUserEmail || "-"} · {group.country || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[560px]">
                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-100 bg-white"
                        )}
                      >
                        <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                          Trades
                        </p>
                        <p className={cx("mt-1 font-black", isDark ? "text-white" : "text-slate-950")}>
                          {group.rows.length}
                        </p>
                      </div>

                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-100 bg-white"
                        )}
                      >
                        <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                          Volume
                        </p>
                        <p className={cx("mt-1 font-black", isDark ? "text-white" : "text-slate-950")}>
                          {format4(group.totalLot)}
                        </p>
                      </div>

                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-100 bg-white"
                        )}
                      >
                        <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                          Rebate
                        </p>
                        <p className={cx("mt-1 font-black", isDark ? "text-cyan-200" : "text-cyan-700")}>
                          ${format4(group.totalRebate)}
                        </p>
                      </div>

                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-100 bg-white"
                        )}
                      >
                        <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                          Profit
                        </p>
                        <p
                          className={cx(
                            "mt-1 font-black",
                            group.totalProfit >= 0
                              ? isDark
                                ? "text-emerald-300"
                                : "text-emerald-700"
                              : isDark
                                ? "text-rose-300"
                                : "text-rose-700"
                          )}
                        >
                          {format4(group.totalProfit)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-3 pb-4 sm:px-5">
                      {group.rows.length === 0 ? (
                        <div
                          className={cx(
                            "rounded-3xl border p-8 text-center text-sm",
                            isDark
                              ? "border-white/10 bg-white/[0.03] text-white/55"
                              : "border-slate-100 bg-slate-50 text-slate-500"
                          )}
                        >
                          No close trades found for this account with current filters.
                        </div>
                      ) : (
                        <>
                          <div className="hidden overflow-x-auto rounded-3xl border lg:block">
                            <table className="w-full min-w-[1120px] border-collapse">
                              <thead
                                className={cx(
                                  "border-b text-left text-xs font-black uppercase tracking-[0.14em]",
                                  isDark
                                    ? "border-white/10 bg-white/[0.04] text-white/45"
                                    : "border-slate-100 bg-slate-50 text-slate-500"
                                )}
                              >
                                <tr>
                                  <th className="px-5 py-4">Trade</th>
                                  <th className="px-5 py-4">Timing</th>
                                  <th className="px-5 py-4 text-right">Prices</th>
                                  <th className="px-5 py-4 text-right">Profit</th>
                                  <th className="px-5 py-4 text-right">Volume</th>
                                  <th className="px-5 py-4 text-right">Rebate</th>
                                  <th className="px-5 py-4 text-center">Status</th>
                                </tr>
                              </thead>

                              <tbody className={cx("divide-y", isDark ? "divide-white/10" : "divide-slate-100")}>
                                {group.rows.map((row) => {
                                  const isCompleted = row?.commission?.isCalculated === true;
                                  const profit = safeNumber(row?.profit);

                                  return (
                                    <tr
                                      key={row._rowKey}
                                      className={cx(
                                        "transition-all",
                                        isDark ? "hover:bg-white/[0.04]" : "hover:bg-sky-50/60"
                                      )}
                                    >
                                      <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                          <span className={cx("rounded-full border px-2.5 py-1 text-xs font-black", getTradeSideClass(row?.buySell, isDark))}>
                                            {tradeSideLabel(row?.buySell)}
                                          </span>

                                          <span className={cx("font-bold", isDark ? "text-white" : "text-slate-900")}>
                                            {row?.symbol || "-"}
                                          </span>
                                        </div>

                                        <div className={cx("mt-1 text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                          Ticket: {row?.ticket || "-"} · Position: {row?.positionId || "-"} · Level{" "}
                                          {row?.commission?.level || "-"}
                                        </div>
                                      </td>

                                      <td className="px-5 py-4">
                                        <div className={cx("flex items-center gap-2 text-xs", isDark ? "text-white/75" : "text-slate-700")}>
                                          <CalendarClock className="h-3.5 w-3.5" />
                                          Open: {normalizeDateText(row?.openTime)}
                                        </div>

                                        <div className={cx("mt-1 flex items-center gap-2 text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                          <Clock3 className="h-3.5 w-3.5" />
                                          Close: {normalizeDateText(row?.closeTime)}
                                        </div>
                                      </td>

                                      <td className="px-5 py-4 text-right">
                                        <div className={cx("font-bold", isDark ? "text-white" : "text-slate-900")}>
                                          {format4(row?.closePrice)}
                                        </div>

                                        <div className={cx("mt-1 text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                          Open {format4(row?.openPrice)}
                                        </div>
                                      </td>

                                      <td className="px-5 py-4 text-right">
                                        <span
                                          className={cx(
                                            "font-black",
                                            profit >= 0
                                              ? isDark
                                                ? "text-emerald-300"
                                                : "text-emerald-700"
                                              : isDark
                                                ? "text-rose-300"
                                                : "text-rose-700"
                                          )}
                                        >
                                          {format4(row?.profit)}
                                        </span>
                                      </td>

                                      <td className={cx("px-5 py-4 text-right font-bold", isDark ? "text-white" : "text-slate-900")}>
                                        {format4(row?.lotSize)}
                                      </td>

                                      <td className="px-5 py-4 text-right">
                                        <div className={cx("text-lg font-black", isDark ? "text-cyan-200" : "text-cyan-700")}>
                                          ${format4(row?.commission?.commissionAmount)}
                                        </div>

                                        <div className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                          IB: {row?.commission?.ibAccountNumber || "-"}
                                        </div>
                                      </td>

                                      <td className="px-5 py-4 text-center">
                                        <span
                                          className={cx(
                                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black",
                                            isCompleted
                                              ? isDark
                                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                                                : "border-emerald-100 bg-emerald-50 text-emerald-700"
                                              : isDark
                                                ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                                                : "border-rose-100 bg-rose-50 text-rose-700"
                                          )}
                                        >
                                          {isCompleted ? <CheckCheck className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                          {isCompleted ? "Completed" : "Pending"}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="space-y-3 lg:hidden">
                            {group.rows.map((row) => {
                              const isCompleted = row?.commission?.isCalculated === true;
                              const profit = safeNumber(row?.profit);

                              return (
                                <div
                                  key={row._rowKey}
                                  className={cx(
                                    "rounded-3xl border p-4",
                                    isDark
                                      ? "border-white/10 bg-white/[0.04]"
                                      : "border-slate-100 bg-slate-50"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className={cx("text-xs font-bold uppercase tracking-[0.14em]", isDark ? "text-white/45" : "text-slate-500")}>
                                        {row?.symbol || "-"} · Level {row?.commission?.level || "-"}
                                      </p>

                                      <h3 className={cx("mt-1 text-lg font-black", isDark ? "text-white" : "text-slate-950")}>
                                        {row?.ticket || row?.positionId || "-"}
                                      </h3>

                                      <p className={cx("mt-1 text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                        Position: {row?.positionId || "-"}
                                      </p>
                                    </div>

                                    <span className={cx("rounded-full border px-2.5 py-1 text-xs font-black", getTradeSideClass(row?.buySell, isDark))}>
                                      {tradeSideLabel(row?.buySell)}
                                    </span>
                                  </div>

                                  <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className={cx("rounded-2xl border p-3", isDark ? "border-white/10 bg-slate-950/40" : "border-white bg-white")}>
                                      <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                        Rebate
                                      </p>
                                      <p className={cx("mt-1 font-black", isDark ? "text-cyan-200" : "text-cyan-700")}>
                                        ${format4(row?.commission?.commissionAmount)}
                                      </p>
                                    </div>

                                    <div className={cx("rounded-2xl border p-3", isDark ? "border-white/10 bg-slate-950/40" : "border-white bg-white")}>
                                      <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                        Profit
                                      </p>
                                      <p
                                        className={cx(
                                          "mt-1 font-black",
                                          profit >= 0
                                            ? isDark
                                              ? "text-emerald-300"
                                              : "text-emerald-700"
                                            : isDark
                                              ? "text-rose-300"
                                              : "text-rose-700"
                                        )}
                                      >
                                        {format4(row?.profit)}
                                      </p>
                                    </div>

                                    <div className={cx("rounded-2xl border p-3", isDark ? "border-white/10 bg-slate-950/40" : "border-white bg-white")}>
                                      <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                        Volume
                                      </p>
                                      <p className={cx("mt-1 font-black", isDark ? "text-white" : "text-slate-950")}>
                                        {format4(row?.lotSize)}
                                      </p>
                                    </div>

                                    <div className={cx("rounded-2xl border p-3", isDark ? "border-white/10 bg-slate-950/40" : "border-white bg-white")}>
                                      <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
                                        Status
                                      </p>

                                      <p
                                        className={cx(
                                          "mt-1 inline-flex items-center gap-1.5 font-black",
                                          isCompleted
                                            ? isDark
                                              ? "text-emerald-300"
                                              : "text-emerald-700"
                                            : isDark
                                              ? "text-rose-300"
                                              : "text-rose-700"
                                        )}
                                      >
                                        {isCompleted ? <CheckCheck className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                        {isCompleted ? "Done" : "Pending"}
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    className={cx(
                                      "mt-4 rounded-2xl border p-3 text-xs leading-6",
                                      isDark
                                        ? "border-white/10 bg-slate-950/40 text-white/60"
                                        : "border-white bg-white text-slate-600"
                                    )}
                                  >
                                    <div>Open: {normalizeDateText(row?.openTime)}</div>
                                    <div>Close: {normalizeDateText(row?.closeTime)}</div>
                                    <div>
                                      Price: {format4(row?.openPrice)} → {format4(row?.closePrice)}
                                    </div>
                                    <div>IB Account: {row?.commission?.ibAccountNumber || "-"}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserReferralCloseTrades;