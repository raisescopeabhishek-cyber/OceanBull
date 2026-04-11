import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CircleDollarSign,
  Gauge,
  LineChart,
  RefreshCw,
  Server,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { userApi } from "@/utils/apiClients";

type TradeSide = "BUY" | "SELL";
type TradeStatus = "open" | "closed";
type Timeframe = "M5" | "M15" | "H1" | "H4";
type ChartMode = "candles" | "line" | "area";

type AccountOption = {
  id: string;
  label: string;
  server?: string;
  currency: string;
  raw?: any;
};

type TradeRecord = {
  id: string;
  accountId: string;
  symbol: string;
  side: TradeSide;
  lots: number;
  openPrice: number;
  closePrice?: number;
  currentPrice?: number;
  profit: number;
  openTime: string;
  closeTime?: string;
  status: TradeStatus;
  raw?: any;
};

type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type TickPrice = {
  symbol: string;
  bid?: number;
  ask?: number;
  price?: number;
  time?: string;
};

type SvgPoint = {
  x: number;
  y: number;
};

type StatItem = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive?: boolean;
  trend: number[];
};

type SummaryItem = {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: "primary" | "warning" | "success";
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const extractPayload = (payload: any) =>
  payload?.data ?? payload?.result ?? payload?.items ?? payload;

const extractArray = (payload: any): any[] => {
  const source = extractPayload(payload);

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.data)) return source.data;
  if (Array.isArray(source?.items)) return source.items;
  if (Array.isArray(source?.result)) return source.result;
  if (Array.isArray(source?.trades)) return source.trades;
  if (Array.isArray(source?.positions)) return source.positions;
  return [];
};

const normalizeDateString = (value: any) => {
  if (!value) return new Date().toISOString();

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  const text = String(value);
  if (text.includes("T")) return text;
  if (text.includes(" ")) return text.replace(" ", "T");

  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) return date.toISOString();

  return new Date().toISOString();
};

const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const formatPrice = (value?: number, digits = 5) => {
  if (!Number.isFinite(value)) return "--";
  return toNumber(value).toFixed(digits);
};

const formatLots = (value?: number) => {
  if (!Number.isFinite(value)) return "--";
  return `${toNumber(value).toFixed(2)} lot`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString();
};

const buildLinePath = (points: SvgPoint[]) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

const buildAreaPath = (points: SvgPoint[], baseline: number) => {
  if (!points.length) return "";
  return `${buildLinePath(points)} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
};

const buildSparklinePoints = (
  values: number[],
  width: number,
  height: number,
  padding = 8
): SvgPoint[] => {
  if (!values.length) return [];

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = Math.max(maxValue - minValue, 1);

  return values.map((value, index) => ({
    x:
      padding +
      (index * (width - padding * 2)) / Math.max(values.length - 1, 1),
    y:
      height -
      padding -
      ((value - minValue) / range) * (height - padding * 2),
  }));
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const makeTicks = (min: number, max: number, count = 5) => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) {
    const offset = min === 0 ? 1 : Math.abs(min * 0.01);
    return [min - offset, min, min + offset];
  }

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    return max - (max - min) * ratio;
  });
};

const normalizeTick = (payload: any): TickPrice | null => {
  const item = extractPayload(payload);
  if (!item) return null;

  return {
    symbol: String(item?.symbol ?? ""),
    bid: Number.isFinite(Number(item?.bid)) ? Number(item.bid) : undefined,
    ask: Number.isFinite(Number(item?.ask)) ? Number(item.ask) : undefined,
    price: Number.isFinite(Number(item?.price ?? item?.last ?? item?.current))
      ? Number(item?.price ?? item?.last ?? item?.current)
      : undefined,
    time: item?.time ?? item?.timestamp ?? item?.updatedAt,
  };
};

const normalizeCandles = (payload: any): CandlePoint[] =>
  extractArray(payload)
    .map((item) => {
      const rawTime = item?.time ?? item?.timestamp ?? item?.date;
      const normalizedTime =
        typeof rawTime === "number" && Number.isFinite(rawTime)
          ? new Date(rawTime * 1000).toISOString()
          : normalizeDateString(rawTime);

      return {
        time: normalizedTime,
        open: toNumber(item?.open, NaN),
        high: toNumber(item?.high, NaN),
        low: toNumber(item?.low, NaN),
        close: toNumber(item?.close, NaN),
        volume: Number.isFinite(Number(item?.volume ?? item?.tick_volume))
          ? Number(item?.volume ?? item?.tick_volume)
          : undefined,
      };
    })
    .filter(
      (item) =>
        Number.isFinite(item.open) &&
        Number.isFinite(item.high) &&
        Number.isFinite(item.low) &&
        Number.isFinite(item.close)
    );

const normalizeOpenTrades = (payload: any, accountId: string): TradeRecord[] =>
  extractArray(payload).map((item, index) => ({
    id: String(
      item?.Ticket ??
        item?.ticket ??
        item?.PositionID ??
        item?.OrderID ??
        `${accountId}-open-${index + 1}`
    ),
    accountId: String(item?.MT5Account ?? item?.accountId ?? accountId),
    symbol: String(item?.Symbol ?? item?.symbol ?? "UNKNOWN"),
    side: Number(item?.BUY_SELL) === 0 ? "BUY" : "SELL",
    lots: Number.isFinite(Number(item?.Lot))
      ? Number(item?.Lot)
      : toNumber(item?.Volume, 0) / 10000,
    openPrice: toNumber(item?.Open_Price ?? item?.openPrice, 0),
    currentPrice: Number.isFinite(Number(item?.Current_Price ?? item?.currentPrice))
      ? Number(item?.Current_Price ?? item?.currentPrice)
      : undefined,
    profit: toNumber(item?.Profit, 0),
    openTime: normalizeDateString(item?.Open_Time ?? item?.openTime),
    status: "open",
    raw: item,
  }));

const normalizeClosedTrades = (payload: any, accountId: string): TradeRecord[] =>
  extractArray(payload).map((item, index) => ({
    id: String(
      item?.Ticket ??
        item?.ticket ??
        item?.PositionID ??
        item?.OrderID ??
        `${accountId}-closed-${index + 1}`
    ),
    accountId: String(item?.MT5Account ?? item?.accountId ?? accountId),
    symbol: String(item?.Symbol ?? item?.symbol ?? "UNKNOWN"),
    side: Number(item?.OrderType) === 1 ? "BUY" : "SELL",
    lots: Number.isFinite(Number(item?.Lot))
      ? Number(item?.Lot)
      : toNumber(item?.Volume, 0) / 10000,
    openPrice: toNumber(item?.Open_Price ?? item?.openPrice, 0),
    closePrice: Number.isFinite(Number(item?.Close_Price ?? item?.closePrice))
      ? Number(item?.Close_Price ?? item?.closePrice)
      : undefined,
    profit: toNumber(item?.Profit, 0),
    openTime: normalizeDateString(item?.Open_Time ?? item?.openTime),
    closeTime: normalizeDateString(item?.Close_Time ?? item?.closeTime),
    status: "closed",
    raw: item,
  }));

const buildFallbackCandles = (
  trades: TradeRecord[],
  currentPrice?: number
): CandlePoint[] => {
  if (!trades.length) return [];

  return [...trades]
    .sort(
      (a, b) =>
        new Date(a.openTime).getTime() - new Date(b.openTime).getTime()
    )
    .map((trade, index) => {
      const close =
        trade.currentPrice ?? trade.closePrice ?? currentPrice ?? trade.openPrice;

      return {
        time:
          trade.openTime ||
          new Date(Date.now() + index * 60_000).toISOString(),
        open: trade.openPrice,
        high: Math.max(trade.openPrice, close),
        low: Math.min(trade.openPrice, close),
        close,
      };
    });
};

const getSymbolBadge = (symbol: string) => {
  const upper = String(symbol || "").toUpperCase();

  if (upper.includes("XAU") || upper.includes("GOLD")) return "🥇";
  if (upper.includes("BTC") || upper.includes("ETH")) return "₿";
  if (upper.includes("OIL")) return "🛢️";
  if (
    upper.includes("USD") ||
    upper.includes("EUR") ||
    upper.includes("GBP") ||
    upper.includes("JPY")
  ) {
    return "💱";
  }

  return "📈";
};

const requestData = async (
  path: string,
  params?: Record<string, any>,
  signal?: AbortSignal
) => {
  const response = await userApi.get(path, {
    params,
    signal,
  });

  return response?.data;
};

export default function UserDashboard() {
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const userSiteconfig = useSelector((store: any) => store.user?.siteConfig);
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);

  const isDark = mode === "dark";
  const currentDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [greeting, setGreeting] = useState("Welcome back");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("M15");
  const [chartMode, setChartMode] = useState<ChartMode>("candles");

  const [bridgeOk, setBridgeOk] = useState<boolean | null>(null);
  const [openTrades, setOpenTrades] = useState<TradeRecord[]>([]);
  const [closedTrades, setClosedTrades] = useState<TradeRecord[]>([]);
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [tick, setTick] = useState<TickPrice | null>(null);

  const [tradesLoading, setTradesLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const accountIds =
    loggedUser?.accounts?.map((acc: any) => +acc.accountNumber).filter(Boolean) || [];

  const accountOptions: AccountOption[] = useMemo(() => {
    return accountIds.map((accountNumber: number) => {
      const rawAccount = loggedUser?.accounts?.find(
        (acc: any) => +acc?.accountNumber === accountNumber
      );

      return {
        id: String(accountNumber),
        label:
          rawAccount?.accountName ||
          rawAccount?.name ||
          rawAccount?.label ||
          `MT5 ${accountNumber}`,
        server: rawAccount?.serverName || rawAccount?.server,
        currency: rawAccount?.currency || "USD",
        raw: rawAccount,
      };
    });
  }, [accountIds, loggedUser]);

  useEffect(() => {
    setSelectedAccountId((previous) => {
      if (previous && accountOptions.some((item) => item.id === previous)) {
        return previous;
      }

      return accountOptions[0]?.id ?? "";
    });
  }, [accountOptions]);

  const selectedAccount = useMemo(
    () => accountOptions.find((item) => item.id === selectedAccountId),
    [accountOptions, selectedAccountId]
  );

  const loadBridgeHealth = useCallback(async (signal?: AbortSignal) => {
    try {
      const payload = await requestData("/mymeta/health", undefined, signal);
      const ok =
        payload?.success === false
          ? false
          : Boolean(extractPayload(payload)?.ok ?? payload?.ok ?? true);

      setBridgeOk(ok);
    } catch (error) {
      setBridgeOk(false);
    }
  }, []);

  const loadAccountTrades = useCallback(
    async (accountId: string, signal?: AbortSignal) => {
      if (!accountId) {
        setOpenTrades([]);
        setClosedTrades([]);
        return;
      }

      setTradesLoading(true);
      setErrorText("");

      try {
        const [openPayload, closedPayload] = await Promise.all([
          requestData(
            "/server-fetch-open-trade",
            {
              Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
              MT5Accont: accountId,
            },
            signal
          ),
          requestData(
            "/server-fetch-close-trade",
            {
              MT5Accont: accountId,
              EndTime: currentDate,
            },
            signal
          ),
        ]);

        setOpenTrades(normalizeOpenTrades(openPayload, accountId));
        setClosedTrades(normalizeClosedTrades(closedPayload, accountId));
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.message === "canceled") {
          return;
        }

        console.error("Failed to load trade data:", error);
        setOpenTrades([]);
        setClosedTrades([]);
        setErrorText("Unable to load account trade data.");
      } finally {
        setTradesLoading(false);
      }
    },
    [currentDate]
  );

  const loadMarketData = useCallback(
    async (symbol: string, nextTimeframe: Timeframe, signal?: AbortSignal) => {
      if (!symbol) {
        setCandles([]);
        setTick(null);
        return;
      }

      setChartLoading(true);
      setErrorText("");

      try {
        const [pricePayload, candlePayload] = await Promise.all([
          requestData("/mymeta/price", { symbol }, signal),
          requestData(
            "/mymeta/candles",
            {
              symbol,
              timeframe: nextTimeframe,
              count: 48,
            },
            signal
          ),
        ]);

        setTick(normalizeTick(pricePayload));
        setCandles(normalizeCandles(candlePayload));
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.message === "canceled") {
          return;
        }

        console.error("Failed to load market data:", error);
        setTick(null);
        setCandles([]);
        setErrorText("Unable to load market data.");
      } finally {
        setChartLoading(false);
      }
    },
    []
  );

  const handleManualRefresh = useCallback(async () => {
    if (!selectedAccountId) return;

    setRefreshing(true);

    try {
      await Promise.all([
        loadBridgeHealth(),
        loadAccountTrades(selectedAccountId),
        selectedSymbol ? loadMarketData(selectedSymbol, timeframe) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    loadAccountTrades,
    loadBridgeHealth,
    loadMarketData,
    selectedAccountId,
    selectedSymbol,
    timeframe,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    loadBridgeHealth(controller.signal);

    return () => controller.abort();
  }, [loadBridgeHealth]);

  useEffect(() => {
    if (!selectedAccountId) return;

    const controller = new AbortController();
    loadAccountTrades(selectedAccountId, controller.signal);

    const interval = window.setInterval(() => {
      loadAccountTrades(selectedAccountId);
    }, 15000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [loadAccountTrades, selectedAccountId]);

  const allTrades = useMemo(
    () =>
      [...openTrades, ...closedTrades].sort(
        (a, b) =>
          new Date(b.closeTime || b.openTime).getTime() -
          new Date(a.closeTime || a.openTime).getTime()
      ),
    [closedTrades, openTrades]
  );

  const symbolStats = useMemo(() => {
    const map = new Map<
      string,
      {
        symbol: string;
        count: number;
        openCount: number;
        closedCount: number;
        buyCount: number;
        sellCount: number;
        netProfit: number;
        lastTradeAt: number;
      }
    >();

    allTrades.forEach((trade) => {
      const current = map.get(trade.symbol) ?? {
        symbol: trade.symbol,
        count: 0,
        openCount: 0,
        closedCount: 0,
        buyCount: 0,
        sellCount: 0,
        netProfit: 0,
        lastTradeAt: 0,
      };

      current.count += 1;
      current.netProfit += toNumber(trade.profit, 0);
      current.lastTradeAt = Math.max(
        current.lastTradeAt,
        new Date(trade.closeTime || trade.openTime).getTime()
      );

      if (trade.status === "open") current.openCount += 1;
      else current.closedCount += 1;

      if (trade.side === "BUY") current.buyCount += 1;
      else current.sellCount += 1;

      map.set(trade.symbol, current);
    });

    return [...map.values()].sort((a, b) => {
      if (b.openCount !== a.openCount) return b.openCount - a.openCount;
      if (b.count !== a.count) return b.count - a.count;
      return b.lastTradeAt - a.lastTradeAt;
    });
  }, [allTrades]);

  useEffect(() => {
    setSelectedSymbol((previous) => {
      if (previous && symbolStats.some((item) => item.symbol === previous)) {
        return previous;
      }

      return symbolStats[0]?.symbol ?? "";
    });
  }, [symbolStats]);

  const visibleOpenTrades = useMemo(
    () => openTrades.filter((trade) => trade.symbol === selectedSymbol),
    [openTrades, selectedSymbol]
  );

  const visibleClosedTrades = useMemo(
    () => closedTrades.filter((trade) => trade.symbol === selectedSymbol),
    [closedTrades, selectedSymbol]
  );

  useEffect(() => {
    if (!selectedSymbol) return;

    const controller = new AbortController();
    loadMarketData(selectedSymbol, timeframe, controller.signal);

    const interval = window.setInterval(() => {
      loadMarketData(selectedSymbol, timeframe);
    }, 10000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [loadMarketData, selectedSymbol, timeframe]);

  const livePrice = useMemo(() => {
    if (Number.isFinite(tick?.price)) return Number(tick?.price);
    if (Number.isFinite(tick?.bid) && Number.isFinite(tick?.ask)) {
      return (Number(tick?.bid) + Number(tick?.ask)) / 2;
    }
    if (Number.isFinite(tick?.ask)) return Number(tick?.ask);
    if (Number.isFinite(tick?.bid)) return Number(tick?.bid);

    const openCurrent = visibleOpenTrades.find((trade) =>
      Number.isFinite(trade.currentPrice)
    )?.currentPrice;

    return openCurrent;
  }, [tick, visibleOpenTrades]);

  const markerTrades = useMemo(() => {
    if (visibleOpenTrades.length) return visibleOpenTrades;
    return visibleClosedTrades.slice(0, 8);
  }, [visibleClosedTrades, visibleOpenTrades]);

  const chartCandles = useMemo(() => {
    if (candles.length) return candles;
    return buildFallbackCandles(markerTrades, livePrice);
  }, [candles, livePrice, markerTrades]);

  const floatingPnl = useMemo(
    () => openTrades.reduce((sum, trade) => sum + toNumber(trade.profit, 0), 0),
    [openTrades]
  );

  const closedPnl = useMemo(
    () => closedTrades.reduce((sum, trade) => sum + toNumber(trade.profit, 0), 0),
    [closedTrades]
  );

  const winningClosedTrades = useMemo(
    () => closedTrades.filter((trade) => trade.profit > 0).length,
    [closedTrades]
  );

  const losingClosedTrades = useMemo(
    () => closedTrades.filter((trade) => trade.profit < 0).length,
    [closedTrades]
  );

  const profitableOpenTrades = useMemo(
    () => openTrades.filter((trade) => trade.profit > 0).length,
    [openTrades]
  );

  const performanceValue = useMemo(() => {
    if (closedTrades.length) {
      return Number(((winningClosedTrades / closedTrades.length) * 100).toFixed(2));
    }

    if (openTrades.length) {
      return Number(((profitableOpenTrades / openTrades.length) * 100).toFixed(2));
    }

    return 0;
  }, [closedTrades.length, openTrades.length, profitableOpenTrades, winningClosedTrades]);

  const selectedSymbolAverageEntry = useMemo(() => {
    const baseTrades = visibleOpenTrades.length ? visibleOpenTrades : markerTrades;
    if (!baseTrades.length) return 0;

    const totalVolume = baseTrades.reduce(
      (sum, trade) => sum + Math.max(toNumber(trade.lots, 0), 0.00001),
      0
    );

    if (!totalVolume) return 0;

    const weighted = baseTrades.reduce(
      (sum, trade) => sum + toNumber(trade.openPrice, 0) * Math.max(trade.lots, 0.00001),
      0
    );

    return weighted / totalVolume;
  }, [markerTrades, visibleOpenTrades]);

  const selectedSymbolLots = useMemo(
    () => visibleOpenTrades.reduce((sum, trade) => sum + toNumber(trade.lots, 0), 0),
    [visibleOpenTrades]
  );

  const selectedSymbolStats = useMemo(
    () => symbolStats.find((item) => item.symbol === selectedSymbol),
    [selectedSymbol, symbolStats]
  );

  const stats: StatItem[] = [
    {
      title: "Linked Accounts",
      value: String(accountOptions.length),
      change: selectedAccount ? `Active #${selectedAccount.id}` : "No MT5 account",
      icon: <Wallet size={20} />,
      positive: accountOptions.length > 0,
      trend: [12, 14, 16, 18, 19, 21, 22, 24],
    },
    {
      title: "Open Trades",
      value: String(openTrades.length),
      change: `${openTrades.filter((t) => t.side === "BUY").length} BUY / ${
        openTrades.filter((t) => t.side === "SELL").length
      } SELL`,
      icon: <Activity size={20} />,
      positive: openTrades.length > 0,
      trend: [8, 10, 11, 14, 13, 16, 17, 18],
    },
    {
      title: "Traded Symbols",
      value: String(symbolStats.length),
      change: selectedSymbolStats
        ? `${selectedSymbolStats.openCount} live · ${selectedSymbolStats.closedCount} history`
        : "No symbol activity",
      icon: <BarChart3 size={20} />,
      positive: symbolStats.length > 0,
      trend: [5, 6, 7, 9, 11, 12, 14, 15],
    },
    {
      title: "Closed P/L",
      value: formatCurrency(closedPnl, selectedAccount?.currency || "USD"),
      change: `${winningClosedTrades} wins / ${losingClosedTrades} losses`,
      icon: <CircleDollarSign size={20} />,
      positive: closedPnl >= 0,
      trend:
        closedPnl >= 0
          ? [10, 13, 16, 14, 19, 22, 24, 27]
          : [27, 24, 21, 19, 17, 15, 13, 10],
    },
  ];

  const miniSummary: SummaryItem[] = [
    {
      title: "Server Name",
      value:
        selectedAccount?.server ||
        userSiteconfig?.serverName ||
        "N/A",
      icon: <Server size={18} />,
      tone: "primary",
    },
    {
      title: "Selected Account",
      value: selectedAccount ? `#${selectedAccount.id}` : "No account selected",
      icon: <ShieldCheck size={18} />,
      tone: "success",
    },
    {
      title: "Bridge Status",
      value:
        bridgeOk === null ? "Checking..." : bridgeOk ? "Connected" : "Disconnected",
      icon: <Gauge size={18} />,
      tone: bridgeOk ? "success" : "warning",
    },
  ];

  const chartWidth = 920;
  const chartHeight = 360;
  const chartPaddingLeft = 24;
  const chartPaddingRight = 90;
  const chartPaddingTop = 22;
  const chartPaddingBottom = 36;

  const candleTimes = chartCandles.map((item) => new Date(item.time).getTime());
  const minTime = candleTimes.length ? Math.min(...candleTimes) : Date.now();
  const maxTime =
    candleTimes.length && Math.max(...candleTimes) > minTime
      ? Math.max(...candleTimes)
      : minTime + 60_000;

  const pricePool = [
    ...chartCandles.flatMap((item) => [item.low, item.high]),
    ...markerTrades.map((trade) => trade.openPrice),
    ...markerTrades
      .map((trade) => trade.currentPrice ?? trade.closePrice)
      .filter((value): value is number => Number.isFinite(value)),
    ...(Number.isFinite(livePrice) ? [Number(livePrice)] : []),
    ...(selectedSymbolAverageEntry ? [selectedSymbolAverageEntry] : []),
  ].filter((value): value is number => Number.isFinite(value));

  const rawMinPrice = pricePool.length ? Math.min(...pricePool) : 0;
  const rawMaxPrice = pricePool.length ? Math.max(...pricePool) : 1;
  const pricePadding = (rawMaxPrice - rawMinPrice || rawMaxPrice || 1) * 0.08;
  const minPrice = rawMinPrice - pricePadding;
  const maxPrice = rawMaxPrice + pricePadding;

  const plotWidth = chartWidth - chartPaddingLeft - chartPaddingRight;
  const plotHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  const xForTime = (time: number) =>
    chartPaddingLeft + ((time - minTime) / (maxTime - minTime)) * plotWidth;

  const yForPrice = (price: number) =>
    chartPaddingTop +
    ((maxPrice - price) / Math.max(maxPrice - minPrice, 0.0000001)) * plotHeight;

  const closePoints: SvgPoint[] = chartCandles.map((item) => ({
    x: xForTime(new Date(item.time).getTime()),
    y: yForPrice(item.close),
  }));

  const closePath = buildLinePath(closePoints);
  const closeAreaPath = buildAreaPath(closePoints, chartHeight - chartPaddingBottom);
  const priceTicks = makeTicks(minPrice, maxPrice, 5);

  const gaugeCenterX = 120;
  const gaugeCenterY = 128;
  const gaugeRadius = 82;
  const gaugeStartAngle = -120;
  const gaugeEndAngle = 120;
  const gaugeCurrentAngle =
    gaugeStartAngle + (performanceValue / 100) * (gaugeEndAngle - gaugeStartAngle);

  const needlePoint = polarToCartesian(
    gaugeCenterX,
    gaugeCenterY,
    gaugeRadius - 24,
    gaugeCurrentAngle
  );

  const sectionShell = cx(
    "h-full rounded-[30px] border backdrop-blur-xl",
    isDark
      ? "border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      : "border-orange-100/80 bg-white/75 shadow-[0_20px_60px_rgba(251,146,60,0.10)]"
  );

  const metricShell = cx(
    "relative h-full overflow-hidden rounded-[24px] border p-5 backdrop-blur-xl transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.055]"
      : "border-orange-100/80 bg-white/80 hover:bg-white"
  );

  const softCard = cx(
    "rounded-[22px] border",
    isDark ? "border-white/10 bg-white/[0.03]" : "border-orange-100 bg-white/85"
  );

  const mutedText = isDark ? "text-white/55" : "text-slate-500";
  const strongText = isDark ? "text-white" : "text-slate-900";

  const getSummaryTone = (tone: SummaryItem["tone"]) => {
    if (tone === "primary") {
      return isDark
        ? "bg-blue-500/10 text-blue-300"
        : "bg-orange-50 text-orange-700";
    }

    if (tone === "warning") {
      return isDark
        ? "bg-amber-500/10 text-amber-300"
        : "bg-amber-50 text-amber-700";
    }

    return isDark
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-emerald-50 text-emerald-700";
  };

  const listTrades = visibleOpenTrades.length
    ? visibleOpenTrades
    : visibleClosedTrades.slice(0, 8);

  return (
    <motion.div
      className="relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        aria-hidden
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 12% 18%, rgba(59,130,246,0.10), transparent 24%),
              radial-gradient(circle at 88% 0%, rgba(34,211,238,0.08), transparent 22%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.03), transparent 32%)
            `
            : `
              radial-gradient(circle at 14% 20%, rgba(251,146,60,0.12), transparent 24%),
              radial-gradient(circle at 86% 0%, rgba(255,255,255,0.78), transparent 30%),
              linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))
            `,
        }}
      />

      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-6">
        <section className={cx("overflow-hidden", sectionShell)}>
          <div
            className={cx(
              "relative px-5 py-6 sm:px-6 sm:py-7",
              isDark
                ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
                : "bg-[linear-gradient(135deg,rgba(255,255,255,0.90),rgba(255,247,240,0.82))]"
            )}
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div className="min-w-0">
                <div
                  className={cx(
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                      : "border-orange-200 bg-orange-50 text-orange-700"
                  )}
                >
                  <TrendingUp size={14} />
                  MT5 Live Dashboard
                </div>

                <h1
                  className={cx(
                    "text-2xl font-bold leading-tight sm:text-3xl xl:text-4xl",
                    strongText
                  )}
                >
                  {greeting}, account market overview
                </h1>

                <p className={cx("mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]", mutedText)}>
                  Accounts come from logged user MT5 accounts. Symbols are derived
                  from open + closed trade history, and live market data comes from
                  your mymeta bridge.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {miniSummary.map((item) => (
                  <div key={item.title} className={cx(softCard, "h-full px-4 py-3")}>
                    <div className="flex h-full items-center gap-3">
                      <div
                        className={cx(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                          getSummaryTone(item.tone)
                        )}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <p className={cx("text-xs", mutedText)}>{item.title}</p>
                        <p className={cx("mt-1 truncate text-sm font-semibold", strongText)}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={cx(
                "pointer-events-none absolute inset-x-0 top-0 h-px",
                isDark
                  ? "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
                  : "bg-gradient-to-r from-transparent via-orange-300/70 to-transparent"
              )}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {stats.map((item, index) => {
            const sparklineWidth = 220;
            const sparklineHeight = 90;
            const sparklinePoints = buildSparklinePoints(
              item.trend,
              sparklineWidth,
              sparklineHeight,
              10
            );
            const sparklinePath = buildLinePath(sparklinePoints);
            const sparklineAreaPath = buildAreaPath(
              sparklinePoints,
              sparklineHeight - 10
            );
            const areaId = `cardSparkArea-${index}`;
            const lineId = `cardSparkLine-${index}`;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={metricShell}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className={cx(
                      "absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl",
                      item.positive
                        ? isDark
                          ? "bg-emerald-400/10"
                          : "bg-orange-200/35"
                        : isDark
                        ? "bg-rose-400/10"
                        : "bg-rose-200/35"
                    )}
                  />

                  <div className="absolute inset-x-2 bottom-2 h-24 opacity-80">
                    <svg viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`} className="h-full w-full">
                      <defs>
                        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={
                              item.positive
                                ? isDark
                                  ? "rgba(74,222,128,0.22)"
                                  : "rgba(34,197,94,0.16)"
                                : isDark
                                ? "rgba(251,146,60,0.18)"
                                : "rgba(244,63,94,0.14)"
                            }
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              item.positive
                                ? "rgba(34,197,94,0.01)"
                                : "rgba(244,63,94,0.01)"
                            }
                          />
                        </linearGradient>

                        <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
                          <stop
                            offset="0%"
                            stopColor={
                              item.positive
                                ? isDark
                                  ? "rgba(74,222,128,0.45)"
                                  : "rgba(34,197,94,0.55)"
                                : isDark
                                ? "rgba(251,146,60,0.45)"
                                : "rgba(244,63,94,0.55)"
                            }
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              item.positive
                                ? isDark
                                  ? "rgba(34,211,238,0.85)"
                                  : "rgba(245,158,11,0.80)"
                                : isDark
                                ? "rgba(251,113,133,0.85)"
                                : "rgba(239,68,68,0.85)"
                            }
                          />
                        </linearGradient>
                      </defs>

                      <path d={sparklineAreaPath} fill={`url(#${areaId})`} />
                      <path
                        d={sparklinePath}
                        fill="none"
                        stroke={`url(#${lineId})`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={cx("text-sm", mutedText)}>{item.title}</p>
                      <h3 className={cx("mt-2 text-3xl font-bold leading-none", strongText)}>
                        {item.value}
                      </h3>
                    </div>

                    <div
                      className={cx(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl backdrop-blur-md",
                        isDark
                          ? "bg-white/5 text-white/80"
                          : "bg-white/75 text-orange-700 shadow-[0_8px_20px_rgba(251,146,60,0.08)]"
                      )}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <span
                      className={cx(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md",
                        item.positive
                          ? isDark
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-emerald-50/90 text-emerald-700"
                          : isDark
                          ? "bg-rose-500/10 text-rose-300"
                          : "bg-rose-50/90 text-rose-700"
                      )}
                    >
                      {item.change}
                    </span>

                    <span
                      className={cx(
                        "text-[11px] font-medium uppercase tracking-[0.18em]",
                        mutedText
                      )}
                    >
                      Live
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-stretch">
          <article className={cx(sectionShell, "p-5 sm:p-6")}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className={cx("text-lg font-semibold", strongText)}>
                  Execution Score
                </h2>
                <p className={cx("text-sm", mutedText)}>
                  Based on closed trade win rate, fallback to open trade profitability
                </p>
              </div>

              <div
                className={cx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                )}
              >
                <TrendingUp size={18} />
              </div>
            </div>

            <div className={cx(softCard, "h-full p-4 sm:p-5")}>
              <div className="mx-auto w-full max-w-[320px]">
                <svg viewBox="0 0 240 180" className="w-full">
                  <defs>
                    <linearGradient id="meterArc" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={isDark ? "#4ade80" : "#22c55e"} />
                      <stop offset="100%" stopColor={isDark ? "#22d3ee" : "#0ea5e9"} />
                    </linearGradient>
                  </defs>

                  <path
                    d={describeArc(gaugeCenterX, gaugeCenterY, gaugeRadius, gaugeStartAngle, gaugeEndAngle)}
                    fill="none"
                    stroke={isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb"}
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  <path
                    d={describeArc(gaugeCenterX, gaugeCenterY, gaugeRadius, gaugeStartAngle, gaugeCurrentAngle)}
                    fill="none"
                    stroke="url(#meterArc)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {[0, 20, 40, 60, 80, 100].map((tickValue) => {
                    const angle =
                      gaugeStartAngle +
                      (tickValue / 100) * (gaugeEndAngle - gaugeStartAngle);
                    const outer = polarToCartesian(gaugeCenterX, gaugeCenterY, gaugeRadius + 4, angle);
                    const inner = polarToCartesian(gaugeCenterX, gaugeCenterY, gaugeRadius - 10, angle);
                    const label = polarToCartesian(gaugeCenterX, gaugeCenterY, gaugeRadius - 28, angle);

                    return (
                      <g key={tickValue}>
                        <line
                          x1={outer.x}
                          y1={outer.y}
                          x2={inner.x}
                          y2={inner.y}
                          stroke={isDark ? "rgba(255,255,255,0.35)" : "#94a3b8"}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <text
                          x={label.x}
                          y={label.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="9"
                          fill={isDark ? "rgba(255,255,255,0.50)" : "#64748b"}
                        >
                          {tickValue}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={gaugeCenterX}
                    y1={gaugeCenterY}
                    x2={needlePoint.x}
                    y2={needlePoint.y}
                    stroke={isDark ? "#f8fafc" : "#0f172a"}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <circle
                    cx={gaugeCenterX}
                    cy={gaugeCenterY}
                    r="7"
                    fill={isDark ? "#f8fafc" : "#0f172a"}
                  />

                  <text
                    x={gaugeCenterX}
                    y="150"
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="700"
                    fill={isDark ? "#ffffff" : "#0f172a"}
                  >
                    {performanceValue}%
                  </text>

                  <text
                    x={gaugeCenterX}
                    y="167"
                    textAnchor="middle"
                    fontSize="10"
                    fill={isDark ? "rgba(255,255,255,0.58)" : "#64748b"}
                  >
                    strategy quality
                  </text>
                </svg>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className={cx(softCard, "px-3 py-3")}>
                  <p className={cx("text-[11px] uppercase tracking-[0.16em]", mutedText)}>
                    Open P/L
                  </p>
                  <p className={cx("mt-1 text-sm font-semibold", strongText)}>
                    {formatCurrency(floatingPnl, selectedAccount?.currency || "USD")}
                  </p>
                </div>

                <div className={cx(softCard, "px-3 py-3")}>
                  <p className={cx("text-[11px] uppercase tracking-[0.16em]", mutedText)}>
                    Closed Wins
                  </p>
                  <p className={cx("mt-1 text-sm font-semibold", strongText)}>
                    {winningClosedTrades} / {closedTrades.length}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className={cx("overflow-hidden", sectionShell)}>
            <div className="flex h-full flex-col p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className={cx("text-lg font-semibold", strongText)}>
                    Open Trades Market View
                  </h2>
                  <p className={cx("text-sm", mutedText)}>
                    Account → traded symbols from history → live price → entry markers
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.07]"
                      : "border-orange-100 bg-white text-slate-700 hover:bg-orange-50"
                  )}
                >
                  <RefreshCw
                    size={16}
                    className={cx(refreshing && "animate-spin")}
                  />
                  Refresh
                </button>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[220px_220px_minmax(0,1fr)]">
                <div className={cx(softCard, "px-3 py-3")}>
                  <p className={cx("mb-2 text-[11px] uppercase tracking-[0.16em]", mutedText)}>
                    MT5 Account
                  </p>

                  <select
                    value={selectedAccountId}
                    onChange={(event) => setSelectedAccountId(event.target.value)}
                    className={cx(
                      "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white"
                        : "border-orange-100 bg-white text-slate-900"
                    )}
                    disabled={!accountOptions.length}
                  >
                    {!accountOptions.length ? (
                      <option value="">No accounts found</option>
                    ) : (
                      accountOptions.map((account) => (
                        <option key={account.id} value={account.id}>
                          #{account.id} · {account.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className={cx(softCard, "px-3 py-3")}>
                  <p className={cx("mb-2 text-[11px] uppercase tracking-[0.16em]", mutedText)}>
                    Traded Symbol
                  </p>

                  <select
                    value={selectedSymbol}
                    onChange={(event) => setSelectedSymbol(event.target.value)}
                    className={cx(
                      "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white"
                        : "border-orange-100 bg-white text-slate-900"
                    )}
                    disabled={!symbolStats.length}
                  >
                    {!symbolStats.length ? (
                      <option value="">No symbols found</option>
                    ) : (
                      symbolStats.map((item) => (
                        <option key={item.symbol} value={item.symbol}>
                          {item.symbol} ({item.count})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className={cx(softCard, "px-3 py-3")}>
                  <p className={cx("mb-2 text-[11px] uppercase tracking-[0.16em]", mutedText)}>
                    View Controls
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {(["candles", "line", "area"] as ChartMode[]).map((modeItem) => (
                      <button
                        key={modeItem}
                        type="button"
                        onClick={() => setChartMode(modeItem)}
                        className={cx(
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                          chartMode === modeItem
                            ? isDark
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "bg-orange-100 text-orange-700"
                            : isDark
                            ? "bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {modeItem === "candles" ? <BarChart3 size={15} /> : <LineChart size={15} />}
                        {modeItem}
                      </button>
                    ))}

                    {(["M5", "M15", "H1", "H4"] as Timeframe[]).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        className={cx(
                          "rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                          timeframe === tf
                            ? isDark
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700"
                            : isDark
                            ? "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className={cx(softCard, "px-4 py-3")}>
                  <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
                    Current Price
                  </p>
                  <p className={cx("mt-1 text-xl font-bold", strongText)}>
                    {formatPrice(livePrice)}
                  </p>
                </div>

                <div className={cx(softCard, "px-4 py-3")}>
                  <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
                    Avg Entry
                  </p>
                  <p className={cx("mt-1 text-xl font-bold", strongText)}>
                    {selectedSymbolAverageEntry
                      ? formatPrice(selectedSymbolAverageEntry)
                      : "--"}
                  </p>
                </div>

                <div className={cx(softCard, "px-4 py-3")}>
                  <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
                    Live Open Trades
                  </p>
                  <p className={cx("mt-1 text-xl font-bold", strongText)}>
                    {visibleOpenTrades.length}
                  </p>
                </div>

                <div className={cx(softCard, "px-4 py-3")}>
                  <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
                    Exposure
                  </p>
                  <p className={cx("mt-1 text-xl font-bold", strongText)}>
                    {formatLots(selectedSymbolLots)}
                  </p>
                </div>
              </div>

              <div className={cx(softCard, "relative flex-1 p-4 sm:p-5")}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={cx("text-xs uppercase tracking-[0.18em]", mutedText)}>
                      Symbols from user trade history
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {symbolStats.length ? (
                        symbolStats.map((item) => (
                          <button
                            key={item.symbol}
                            type="button"
                            onClick={() => setSelectedSymbol(item.symbol)}
                            className={cx(
                              "rounded-full px-3 py-1 text-xs font-semibold transition",
                              selectedSymbol === item.symbol
                                ? isDark
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : "bg-orange-100 text-orange-700"
                                : isDark
                                ? "bg-white/[0.05] text-white/65 hover:bg-white/[0.08]"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            <span className="mr-1">{getSymbolBadge(item.symbol)}</span>
                            {item.symbol} · {item.count}
                          </button>
                        ))
                      ) : (
                        <span className={cx("text-sm", mutedText)}>
                          No trade symbols found for this account.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className={cx("inline-flex items-center gap-2", mutedText)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      BUY entry
                    </span>
                    <span className={cx("inline-flex items-center gap-2", mutedText)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      SELL entry
                    </span>
                    <span className={cx("inline-flex items-center gap-2", mutedText)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                      Current price
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className={cx("text-xs", mutedText)}>
                    {visibleOpenTrades.length
                      ? "Showing live open-trade entry points for selected account and symbol."
                      : "No live open trades on selected symbol. Showing recent trade-history markers instead."}
                  </p>
                </div>

                <div className="relative h-[360px] w-full overflow-hidden rounded-[20px]">
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-2 py-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className={cx(
                          "border-t border-dashed",
                          isDark ? "border-white/10" : "border-slate-200"
                        )}
                      />
                    ))}
                  </div>

                  {errorText ? (
                    <div className="flex h-full items-center justify-center">
                      <div className={cx("text-center text-sm", mutedText)}>{errorText}</div>
                    </div>
                  ) : tradesLoading || chartLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className={cx("inline-flex items-center gap-2 text-sm", mutedText)}>
                        <RefreshCw size={16} className="animate-spin" />
                        Loading market view...
                      </div>
                    </div>
                  ) : !selectedAccountId ? (
                    <div className="flex h-full items-center justify-center">
                      <div className={cx("text-center text-sm", mutedText)}>
                        Select an MT5 account to load trade data.
                      </div>
                    </div>
                  ) : !selectedSymbol ? (
                    <div className="flex h-full items-center justify-center">
                      <div className={cx("text-center text-sm", mutedText)}>
                        No traded symbols found on this account yet.
                      </div>
                    </div>
                  ) : !chartCandles.length ? (
                    <div className="flex h-full items-center justify-center">
                      <div className={cx("text-center text-sm", mutedText)}>
                        Market candles are not available for this symbol right now.
                      </div>
                    </div>
                  ) : (
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="relative h-full w-full">
                      <defs>
                        <linearGradient id="closeAreaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={isDark ? "rgba(34,211,238,0.24)" : "rgba(59,130,246,0.20)"}
                          />
                          <stop
                            offset="100%"
                            stopColor={isDark ? "rgba(34,211,238,0.02)" : "rgba(59,130,246,0.03)"}
                          />
                        </linearGradient>
                      </defs>

                      {priceTicks.map((value, index) => {
                        const y = yForPrice(value);

                        return (
                          <g key={`${value}-${index}`}>
                            <line
                              x1={chartPaddingLeft}
                              y1={y}
                              x2={chartWidth - chartPaddingRight}
                              y2={y}
                              stroke={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
                              strokeDasharray="5 6"
                            />
                            <text
                              x={chartWidth - chartPaddingRight + 10}
                              y={y + 4}
                              fontSize="11"
                              fill={isDark ? "rgba(255,255,255,0.45)" : "#64748b"}
                            >
                              {formatPrice(value)}
                            </text>
                          </g>
                        );
                      })}

                      {chartCandles.length > 1 &&
                        chartCandles.map((candle, index) => {
                          const time = new Date(candle.time).getTime();
                          const x = xForTime(time);
                          const yOpen = yForPrice(candle.open);
                          const yClose = yForPrice(candle.close);
                          const yHigh = yForPrice(candle.high);
                          const yLow = yForPrice(candle.low);
                          const candleWidth = Math.max(
                            Math.min((plotWidth / Math.max(chartCandles.length, 1)) * 0.58, 14),
                            4
                          );
                          const isBull = candle.close >= candle.open;
                          const bodyTop = Math.min(yOpen, yClose);
                          const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.8);

                          if (chartMode === "line" || chartMode === "area") {
                            return null;
                          }

                          return (
                            <g key={`${candle.time}-${index}`}>
                              <line
                                x1={x}
                                y1={yHigh}
                                x2={x}
                                y2={yLow}
                                stroke={isBull ? "#22c55e" : "#ef4444"}
                                strokeWidth="1.8"
                              />
                              <rect
                                x={x - candleWidth / 2}
                                y={bodyTop}
                                width={candleWidth}
                                height={bodyHeight}
                                rx="2"
                                fill={isBull ? "#22c55e" : "#ef4444"}
                                opacity={0.92}
                              />
                            </g>
                          );
                        })}

                      {(chartMode === "line" || chartMode === "area") && closePoints.length > 1 && (
                        <>
                          {chartMode === "area" && (
                            <path d={closeAreaPath} fill="url(#closeAreaFill)" />
                          )}
                          <path
                            d={closePath}
                            fill="none"
                            stroke={isDark ? "#22d3ee" : "#2563eb"}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </>
                      )}

                      {selectedSymbolAverageEntry > 0 && (
                        <g>
                          <line
                            x1={chartPaddingLeft}
                            y1={yForPrice(selectedSymbolAverageEntry)}
                            x2={chartWidth - chartPaddingRight}
                            y2={yForPrice(selectedSymbolAverageEntry)}
                            stroke={isDark ? "rgba(250,204,21,0.7)" : "rgba(245,158,11,0.9)"}
                            strokeDasharray="6 6"
                          />
                          <text
                            x={chartWidth - chartPaddingRight + 10}
                            y={yForPrice(selectedSymbolAverageEntry) - 6}
                            fontSize="11"
                            fill={isDark ? "rgba(250,204,21,0.85)" : "#b45309"}
                          >
                            Avg {formatPrice(selectedSymbolAverageEntry)}
                          </text>
                        </g>
                      )}

                      {Number.isFinite(livePrice) && (
                        <g>
                          <line
                            x1={chartPaddingLeft}
                            y1={yForPrice(Number(livePrice))}
                            x2={chartWidth - chartPaddingRight}
                            y2={yForPrice(Number(livePrice))}
                            stroke={isDark ? "#22d3ee" : "#0284c7"}
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={chartWidth - chartPaddingRight + 10}
                            y={yForPrice(Number(livePrice)) - 6}
                            fontSize="11"
                            fill={isDark ? "#67e8f9" : "#0369a1"}
                          >
                            Live {formatPrice(Number(livePrice))}
                          </text>
                        </g>
                      )}

                      {markerTrades.map((trade, index) => {
                        const tradeTime = new Date(trade.openTime).getTime();
                        const clampedTime = Math.min(Math.max(tradeTime, minTime), maxTime);
                        const x = xForTime(clampedTime);
                        const y = yForPrice(trade.openPrice);
                        const fill = trade.side === "BUY" ? "#22c55e" : "#ef4444";

                        return (
                          <g key={`${trade.id}-${index}`}>
                            {trade.side === "BUY" ? (
                              <path
                                d={`M ${x} ${y - 10} L ${x - 8} ${y + 6} L ${x + 8} ${y + 6} Z`}
                                fill={fill}
                                opacity={trade.status === "open" ? 1 : 0.7}
                              />
                            ) : (
                              <path
                                d={`M ${x} ${y + 10} L ${x - 8} ${y - 6} L ${x + 8} ${y - 6} Z`}
                                fill={fill}
                                opacity={trade.status === "open" ? 1 : 0.7}
                              />
                            )}

                            <circle
                              cx={x}
                              cy={y}
                              r="3"
                              fill={isDark ? "#ffffff" : "#0f172a"}
                            />

                            <title>
                              {`${trade.symbol} | ${trade.status.toUpperCase()} | ${trade.side} | Open ${formatPrice(
                                trade.openPrice
                              )} | ${
                                trade.status === "open"
                                  ? `P/L ${formatCurrency(
                                      trade.profit,
                                      selectedAccount?.currency || "USD"
                                    )}`
                                  : `Close ${formatPrice(trade.closePrice)}`
                              }`}
                            </title>
                          </g>
                        );
                      })}

                      {chartCandles
                        .filter(
                          (_, index) =>
                            index % Math.max(Math.floor(chartCandles.length / 6), 1) === 0
                        )
                        .map((candle, index) => {
                          const x = xForTime(new Date(candle.time).getTime());
                          const label = new Date(candle.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <text
                              key={`${candle.time}-${index}`}
                              x={x}
                              y={chartHeight - 8}
                              textAnchor="middle"
                              fontSize="11"
                              fill={isDark ? "rgba(255,255,255,0.45)" : "#64748b"}
                            >
                              {label}
                            </text>
                          );
                        })}
                    </svg>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {listTrades.length ? (
                    listTrades.map((trade) => {
                      const pnlPositive = toNumber(trade.profit, 0) >= 0;

                      return (
                        <div
                          key={trade.id}
                          className={cx(
                            "rounded-2xl border px-4 py-3",
                            isDark
                              ? "border-white/10 bg-white/[0.03]"
                              : "border-orange-100 bg-white"
                          )}
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <p className={cx("text-sm font-semibold", strongText)}>
                                <span className="mr-1">{getSymbolBadge(trade.symbol)}</span>
                                {trade.symbol}
                              </p>
                              <p className={cx("mt-1 text-xs", mutedText)}>
                                {trade.status.toUpperCase()} · {trade.side} · {formatLots(trade.lots)}
                              </p>
                            </div>

                            <span
                              className={cx(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                trade.side === "BUY"
                                  ? isDark
                                    ? "bg-emerald-500/12 text-emerald-300"
                                    : "bg-emerald-50 text-emerald-700"
                                  : isDark
                                  ? "bg-rose-500/12 text-rose-300"
                                  : "bg-rose-50 text-rose-700"
                              )}
                            >
                              {trade.side}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className={mutedText}>Open Price</p>
                              <p className={cx("mt-1 font-semibold", strongText)}>
                                {formatPrice(trade.openPrice)}
                              </p>
                            </div>

                            <div>
                              <p className={mutedText}>
                                {trade.status === "open" ? "Current Price" : "Close Price"}
                              </p>
                              <p className={cx("mt-1 font-semibold", strongText)}>
                                {formatPrice(
                                  trade.status === "open"
                                    ? trade.currentPrice ?? livePrice
                                    : trade.closePrice
                                )}
                              </p>
                            </div>

                            <div>
                              <p className={mutedText}>
                                {trade.status === "open" ? "Open Time" : "Close Time"}
                              </p>
                              <p className={cx("mt-1 font-semibold", strongText)}>
                                {formatDateTime(
                                  trade.status === "open" ? trade.openTime : trade.closeTime
                                )}
                              </p>
                            </div>

                            <div>
                              <p className={mutedText}>P/L</p>
                              <p
                                className={cx(
                                  "mt-1 font-semibold",
                                  pnlPositive
                                    ? isDark
                                      ? "text-emerald-300"
                                      : "text-emerald-700"
                                    : isDark
                                    ? "text-rose-300"
                                    : "text-rose-700"
                                )}
                              >
                                {formatCurrency(trade.profit, selectedAccount?.currency || "USD")}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={cx("col-span-full rounded-2xl border px-4 py-6 text-sm", mutedText, softCard)}>
                      No open trades or recent trade history found for selected symbol.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </motion.div>
  );
}