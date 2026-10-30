import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Activity,
  CandlestickChart,
  MoveHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Wallet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { userApi } from "@/utils/apiClients";

type Timeframe = "M5" | "M15" | "H1" | "H4";
type ChartMode = "candles" | "line" | "area";

type TradeRecord = {
  id: string;
  accountId: string;
  symbol: string;
  side: "BUY" | "SELL";
  lots: number;
  openPrice: number;
  currentPrice?: number;
  profit: number;
  openTime: string;
  raw?: any;
};

type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
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

type ViewRange = {
  start: number;
  end: number;
};

const MIN_VISIBLE_CANDLES = 12;
const DEFAULT_VISIBLE_CANDLES = 40;

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const positivePrice = (value: unknown): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
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

const buildLinePath = (points: SvgPoint[]) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

const buildAreaPath = (points: SvgPoint[], baseline: number) => {
  if (!points.length) return "";
  return `${buildLinePath(points)} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
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

const formatXAxisLabel = (
  timestamp: number,
  timeframe: Timeframe,
  totalSpanMs: number
) => {
  const date = new Date(timestamp);

  if (timeframe === "H4" || totalSpanMs >= 24 * 60 * 60 * 1000) {
    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (timeframe === "H1" || totalSpanMs >= 4 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeTick = (payload: any): TickPrice | null => {
  const item = extractPayload(payload);
  if (!item) return null;

  return {
    symbol: String(item?.symbol ?? ""),
    bid: positivePrice(item?.bid),
    ask: positivePrice(item?.ask),
    price: positivePrice(item?.price ?? item?.last ?? item?.current),
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
    currentPrice: positivePrice(item?.Current_Price ?? item?.currentPrice),
    profit: toNumber(item?.Profit, 0),
    openTime: normalizeDateString(item?.Open_Time ?? item?.openTime),
    raw: item,
  }));

const requestData = async (
  path: string,
  params?: Record<string, any>,
  signal?: AbortSignal
) => {
  const response = await userApi.get(path, { params, signal });
  return response?.data;
};

const buildFallbackCandles = (
  trades: TradeRecord[],
  currentPrice?: number
): CandlePoint[] => {
  if (!trades.length) return [];

  return [...trades]
    .sort((a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime())
    .map((trade, index) => {
      const close = positivePrice(trade.currentPrice) ?? currentPrice ?? trade.openPrice;

      return {
        time:
          trade.openTime ||
          new Date(Date.now() + index * 60000).toISOString(),
        open: trade.openPrice,
        high: Math.max(trade.openPrice, close),
        low: Math.min(trade.openPrice, close),
        close,
      };
    });
};

export default function AccountOpenTradesMarketSection() {
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const userSiteconfig = useSelector((store: any) => store.user?.siteConfig);

  const isDark = mode === "dark";
  const chartRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef<{
    startClientX: number;
    startRange: ViewRange;
  } | null>(null);

  const accountOptions = useMemo(() => {
    const accounts = loggedUser?.accounts || [];

    return accounts
      .map((acc: any) => ({
        id: String(acc?.accountNumber ?? acc?.MT5Account ?? ""),
        label:
          acc?.accountName ||
          acc?.name ||
          acc?.label ||
          `MT5 ${acc?.accountNumber ?? acc?.MT5Account ?? ""}`,
        server: acc?.serverName || acc?.server || userSiteconfig?.serverName || "N/A",
        currency: acc?.currency || "USD",
      }))
      .filter((item: any) => item.id);
  }, [loggedUser, userSiteconfig?.serverName]);

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("M15");
  const [chartMode, setChartMode] = useState<ChartMode>("candles");

  const [openTrades, setOpenTrades] = useState<TradeRecord[]>([]);
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [tick, setTick] = useState<TickPrice | null>(null);

  const [initialTradesLoading, setInitialTradesLoading] = useState(false);
  const [initialChartLoading, setInitialChartLoading] = useState(false);
  const [refreshingTrades, setRefreshingTrades] = useState(false);
  const [refreshingChart, setRefreshingChart] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [viewRange, setViewRange] = useState<ViewRange>({ start: 0, end: -1 });
  const [hasInteractedView, setHasInteractedView] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    setSelectedAccountId((prev) => {
      if (prev && accountOptions.some((item: any) => item.id === prev)) return prev;
      return accountOptions[0]?.id ?? "";
    });
  }, [accountOptions]);

  const selectedAccount = useMemo(
    () => accountOptions.find((item: any) => item.id === selectedAccountId),
    [accountOptions, selectedAccountId]
  );

  const loadAccountOpenTrades = useCallback(
    async (accountId: string, signal?: AbortSignal, silent = false) => {
      if (!accountId) {
        setOpenTrades([]);
        return;
      }

      if (silent) setRefreshingTrades(true);
      else setInitialTradesLoading(true);

      try {
        const payload = await requestData(
          "/server-fetch-open-trade",
          {
            Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
            MT5Accont: accountId,
          },
          signal
        );

        const records = normalizeOpenTrades(payload, accountId);
        setOpenTrades(records);
        setErrorText("");
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.message === "canceled") return;
        console.error("Failed to load open trades:", error);
        setErrorText("Unable to load open trades.");
      } finally {
        if (silent) setRefreshingTrades(false);
        else setInitialTradesLoading(false);
      }
    },
    []
  );

  const loadMarketData = useCallback(
    async (symbol: string, nextTimeframe: Timeframe, signal?: AbortSignal, silent = false) => {
      if (!symbol) return;

      if (silent) setRefreshingChart(true);
      else setInitialChartLoading(true);

      try {
        const [pricePayload, candlePayload] = await Promise.all([
          requestData("/mymeta/price", { symbol }, signal),
          requestData(
            "/mymeta/candles",
            {
              symbol,
              timeframe: nextTimeframe,
              count: 120,
            },
            signal
          ),
        ]);

        const nextTick = normalizeTick(pricePayload);
        const nextCandles = normalizeCandles(candlePayload);

        if (nextTick) setTick(nextTick);
        if (nextCandles.length) setCandles(nextCandles);
        setErrorText("");
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.message === "canceled") return;
        console.error("Failed to load market data:", error);
        setErrorText("Unable to load chart data.");
      } finally {
        if (silent) setRefreshingChart(false);
        else setInitialChartLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedAccountId) return;

    const controller = new AbortController();
    loadAccountOpenTrades(selectedAccountId, controller.signal, false);

    const interval = window.setInterval(() => {
      loadAccountOpenTrades(selectedAccountId, undefined, true);
    }, 15000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [loadAccountOpenTrades, selectedAccountId]);

  const symbols = useMemo(() => {
    const map = new Map<
      string,
      {
        symbol: string;
        count: number;
        buyCount: number;
        sellCount: number;
        pnl: number;
      }
    >();

    openTrades.forEach((trade) => {
      const current = map.get(trade.symbol) ?? {
        symbol: trade.symbol,
        count: 0,
        buyCount: 0,
        sellCount: 0,
        pnl: 0,
      };

      current.count += 1;
      current.pnl += toNumber(trade.profit, 0);

      if (trade.side === "BUY") current.buyCount += 1;
      else current.sellCount += 1;

      map.set(trade.symbol, current);
    });

    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [openTrades]);

  useEffect(() => {
    setSelectedSymbol((prev) => {
      if (prev && symbols.some((item) => item.symbol === prev)) return prev;
      return symbols[0]?.symbol ?? "";
    });
  }, [symbols]);

  const selectedSymbolTrades = useMemo(
    () => openTrades.filter((trade) => trade.symbol === selectedSymbol),
    [openTrades, selectedSymbol]
  );

  useEffect(() => {
    if (!selectedSymbol) return;

    const controller = new AbortController();
    loadMarketData(selectedSymbol, timeframe, controller.signal, false);

    const interval = window.setInterval(() => {
      loadMarketData(selectedSymbol, timeframe, undefined, true);
    }, 10000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [loadMarketData, selectedSymbol, timeframe]);

  const livePrice = useMemo(() => {
    const direct = positivePrice(tick?.price);
    if (direct) return direct;

    const bid = positivePrice(tick?.bid);
    const ask = positivePrice(tick?.ask);

    if (bid && ask) return (bid + ask) / 2;
    if (ask) return ask;
    if (bid) return bid;

    const openCurrent = selectedSymbolTrades.find((trade) =>
      positivePrice(trade.currentPrice)
    )?.currentPrice;

    return positivePrice(openCurrent);
  }, [tick, selectedSymbolTrades]);

  const avgEntry = useMemo(() => {
    if (!selectedSymbolTrades.length) return 0;

    const totalLots = selectedSymbolTrades.reduce(
      (sum, trade) => sum + Math.max(toNumber(trade.lots, 0), 0.00001),
      0
    );

    const weighted = selectedSymbolTrades.reduce(
      (sum, trade) =>
        sum +
        toNumber(trade.openPrice, 0) *
          Math.max(toNumber(trade.lots, 0), 0.00001),
      0
    );

    return totalLots ? weighted / totalLots : 0;
  }, [selectedSymbolTrades]);

  const chartCandles = useMemo(() => {
    if (candles.length) return candles;
    return buildFallbackCandles(selectedSymbolTrades, livePrice);
  }, [candles, selectedSymbolTrades, livePrice]);

  const clampViewRange = useCallback(
    (start: number, count: number, total: number): ViewRange => {
      if (!total) return { start: 0, end: -1 };

      const safeCount = clamp(
        Math.round(count),
        Math.min(MIN_VISIBLE_CANDLES, total),
        total
      );

      const maxStart = Math.max(0, total - safeCount);
      const safeStart = clamp(Math.round(start), 0, maxStart);

      return {
        start: safeStart,
        end: safeStart + safeCount - 1,
      };
    },
    []
  );

  useEffect(() => {
    setHasInteractedView(false);
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    if (!chartCandles.length) {
      setViewRange({ start: 0, end: -1 });
      return;
    }

    setViewRange((prev) => {
      const total = chartCandles.length;

      if (!hasInteractedView || prev.end < prev.start) {
        const count = Math.min(DEFAULT_VISIBLE_CANDLES, total);
        return clampViewRange(total - count, count, total);
      }

      const currentCount = clamp(
        prev.end - prev.start + 1,
        Math.min(MIN_VISIBLE_CANDLES, total),
        total
      );

      const nearRightEdge = prev.end >= total - 3;
      if (nearRightEdge) {
        return clampViewRange(total - currentCount, currentCount, total);
      }

      return clampViewRange(prev.start, currentCount, total);
    });
  }, [chartCandles.length, hasInteractedView, clampViewRange, chartCandles]);

  const effectiveViewRange = useMemo(() => {
    if (!chartCandles.length) return { start: 0, end: -1 };

    const fallbackCount = Math.min(DEFAULT_VISIBLE_CANDLES, chartCandles.length);
    const currentCount =
      viewRange.end >= viewRange.start
        ? viewRange.end - viewRange.start + 1
        : fallbackCount;

    const fallbackStart =
      viewRange.end >= viewRange.start
        ? viewRange.start
        : chartCandles.length - fallbackCount;

    return clampViewRange(fallbackStart, currentCount, chartCandles.length);
  }, [chartCandles.length, chartCandles, viewRange, clampViewRange]);

  const visibleCandles = useMemo(() => {
    if (effectiveViewRange.end < effectiveViewRange.start) return [];
    return chartCandles.slice(effectiveViewRange.start, effectiveViewRange.end + 1);
  }, [chartCandles, effectiveViewRange]);

  const totalOpenPnl = useMemo(
    () => openTrades.reduce((sum, trade) => sum + toNumber(trade.profit, 0), 0),
    [openTrades]
  );

  const totalLots = useMemo(
    () => selectedSymbolTrades.reduce((sum, trade) => sum + toNumber(trade.lots, 0), 0),
    [selectedSymbolTrades]
  );

  const chartWidth = 980;
  const chartHeight = 380;
  const chartPaddingLeft = 24;
  const chartPaddingRight = 100;
  const chartPaddingTop = 22;
  const chartPaddingBottom = 40;

  const candleTimes = visibleCandles.map((item) => new Date(item.time).getTime());
  const minTime = candleTimes.length ? Math.min(...candleTimes) : Date.now();
const maxTime =
  candleTimes.length && Math.max(...candleTimes) > minTime
    ? Math.max(...candleTimes)
    : minTime + 60000;

  const visibleMarkerTrades = useMemo(() => {
    return selectedSymbolTrades.filter((trade) => {
      const tradeTime = new Date(trade.openTime).getTime();
      return tradeTime >= minTime && tradeTime <= maxTime;
    });
  }, [selectedSymbolTrades, minTime, maxTime]);

  const pricePool = [
    ...visibleCandles.flatMap((item) => [item.low, item.high]),
    ...visibleMarkerTrades.map((trade) => trade.openPrice),
    ...visibleMarkerTrades
      .map((trade) => positivePrice(trade.currentPrice))
      .filter((value): value is number => Number.isFinite(value)),
    ...(positivePrice(livePrice) ? [Number(livePrice)] : []),
    ...(avgEntry > 0 ? [avgEntry] : []),
  ].filter((value): value is number => Number.isFinite(value));

  const rawMinPrice = pricePool.length ? Math.min(...pricePool) : 0;
  const rawMaxPrice = pricePool.length ? Math.max(...pricePool) : 1;
  const pricePadding = (rawMaxPrice - rawMinPrice || rawMaxPrice || 1) * 0.08;
  const minPrice = rawMinPrice - pricePadding;
  const maxPrice = rawMaxPrice + pricePadding;

  const plotWidth = chartWidth - chartPaddingLeft - chartPaddingRight;
  const plotHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  const xForTime = (time: number) =>
    chartPaddingLeft + ((time - minTime) / Math.max(maxTime - minTime, 1)) * plotWidth;

  const yForPrice = (price: number) =>
    chartPaddingTop +
    ((maxPrice - price) / Math.max(maxPrice - minPrice, 0.0000001)) * plotHeight;

  const closePoints: SvgPoint[] = visibleCandles.map((item) => ({
    x: xForTime(new Date(item.time).getTime()),
    y: yForPrice(item.close),
  }));

  const closePath = buildLinePath(closePoints);
  const closeAreaPath = buildAreaPath(closePoints, chartHeight - chartPaddingBottom);
  const priceTicks = makeTicks(minPrice, maxPrice, 5);

  const timeTicks = useMemo(() => {
    if (!visibleCandles.length) return [];

    const span = Math.max(maxTime - minTime, 1);
    const count = 6;

    return Array.from({ length: count }, (_, index) => {
      const ts = minTime + (span * index) / (count - 1);

      return {
        x: xForTime(ts),
        label: formatXAxisLabel(ts, timeframe, span),
      };
    });
  }, [visibleCandles, minTime, maxTime, timeframe]);

  const zoomAtRatio = useCallback(
    (factor: number, anchorRatio = 0.5) => {
      if (!chartCandles.length) return;

      setViewRange((prev) => {
        const total = chartCandles.length;
        const currentCount =
          prev.end >= prev.start
            ? prev.end - prev.start + 1
            : Math.min(DEFAULT_VISIBLE_CANDLES, total);

        const nextCount = clamp(
          Math.round(currentCount * factor),
          Math.min(MIN_VISIBLE_CANDLES, total),
          total
        );

        const safeRatio = clamp(anchorRatio, 0, 1);
        const anchorIndex = prev.start + currentCount * safeRatio;
        const nextStart = anchorIndex - nextCount * safeRatio;

        return clampViewRange(nextStart, nextCount, total);
      });

      setHasInteractedView(true);
    },
    [chartCandles.length, clampViewRange]
  );

  const resetZoom = useCallback(() => {
    if (!chartCandles.length) return;

    const count = Math.min(DEFAULT_VISIBLE_CANDLES, chartCandles.length);
    setViewRange({
      start: chartCandles.length - count,
      end: chartCandles.length - 1,
    });
    setHasInteractedView(false);
  }, [chartCandles.length]);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!chartRef.current || !chartCandles.length) return;

      event.preventDefault();

      const rect = chartRef.current.getBoundingClientRect();
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);

      if (event.deltaY < 0) zoomAtRatio(0.82, ratio);
      else zoomAtRatio(1.22, ratio);
    },
    [chartCandles.length, zoomAtRatio]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!chartRef.current || !visibleCandles.length) return;
      if (event.button !== 0) return;

      panStateRef.current = {
        startClientX: event.clientX,
        startRange: effectiveViewRange,
      };
      setIsPanning(true);
      setHasInteractedView(true);
    },
    [visibleCandles.length, effectiveViewRange]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!chartRef.current || !panStateRef.current || !chartCandles.length) return;

      const rect = chartRef.current.getBoundingClientRect();
      const currentCount = panStateRef.current.startRange.end - panStateRef.current.startRange.start + 1;
      const candlesPerPixel = currentCount / Math.max(rect.width, 1);
      const deltaX = event.clientX - panStateRef.current.startClientX;
      const shiftCandles = Math.round(-deltaX * candlesPerPixel);

      setViewRange(
        clampViewRange(
          panStateRef.current.startRange.start + shiftCandles,
          currentCount,
          chartCandles.length
        )
      );
    },
    [chartCandles.length, clampViewRange]
  );

  const stopPanning = useCallback(() => {
    panStateRef.current = null;
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const onWindowUp = () => stopPanning();
    window.addEventListener("mouseup", onWindowUp);
    return () => window.removeEventListener("mouseup", onWindowUp);
  }, [stopPanning]);

  const sectionShell = cx(
    "rounded-card border backdrop-blur-xl","border-line bg-surface-2"
  );

  const softCard = cx(
    "rounded-card border","border-line bg-surface-2"
  );

  const mutedText ="text-subtle";
  const strongText ="text-text";

  const handleManualRefresh = useCallback(async () => {
    if (!selectedAccountId) return;

    setRefreshing(true);
    try {
      await Promise.all([
        loadAccountOpenTrades(selectedAccountId, undefined, true),
        selectedSymbol
          ? loadMarketData(selectedSymbol, timeframe, undefined, true)
          : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    loadAccountOpenTrades,
    loadMarketData,
    selectedAccountId,
    selectedSymbol,
    timeframe,
  ]);

  const canRenderChart =
    Boolean(selectedAccountId) &&
    Boolean(selectedSymbol) &&
    visibleCandles.length > 0;

  const showBlockingLoader =
    ((initialTradesLoading && !openTrades.length) ||
      (initialChartLoading && !candles.length && !selectedSymbolTrades.length)) &&
    !canRenderChart;

  const showSoftUpdating =
    refreshing ||
    refreshingTrades ||
    refreshingChart ||
    (initialChartLoading && canRenderChart);

  return (
    <section className={cx(sectionShell, "p-5 sm:p-6")}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={cx(
              "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary"
            )}
          >
            <CandlestickChart size={14} />
            Open Trades Live Market
          </div>

        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          className={cx(
            "inline-flex items-center gap-2 rounded-card border px-4 py-2.5 text-sm font-medium transition","border-line bg-surface-2 text-muted hover:bg-surface-2"
          )}
        >
          <RefreshCw size={16} className={cx(refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr]">
        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("mb-2 text-[11px] uppercase tracking-[0.16em]", mutedText)}>
            MT5 Account
          </p>

          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className={cx(
              "w-full rounded-card border px-3 py-2 text-sm outline-none","border-line bg-surface-2 text-text"
            )}
            disabled={!accountOptions.length}
          >
            {!accountOptions.length ? (
              <option value="">No accounts found</option>
            ) : (
              accountOptions.map((account: any) => (
                <option key={account.id} value={account.id}>
                  #{account.id} · {account.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className={cx(softCard, "px-4 py-3")}>
            <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
              Open Trades
            </p>
            <p className={cx("mt-1 text-xl font-bold", strongText)}>{openTrades.length}</p>
          </div>

          <div className={cx(softCard, "px-4 py-3")}>
            <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
              Symbols
            </p>
            <p className={cx("mt-1 text-xl font-bold", strongText)}>{symbols.length}</p>
          </div>

          <div className={cx(softCard, "px-4 py-3")}>
            <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
              Selected Exposure
            </p>
            <p className={cx("mt-1 text-xl font-bold", strongText)}>{formatLots(totalLots)}</p>
          </div>

          <div className={cx(softCard, "px-4 py-3")}>
            <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
              Open P/L
            </p>
            <p className={cx("mt-1 text-xl font-bold", strongText)}>
              {toNumber(totalOpenPnl).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("mb-2 text-[11px] uppercase tracking-[0.16em]", mutedText)}>
            Symbols in selected account
          </p>

          <div className="flex flex-wrap gap-2">
            {symbols.length ? (
              symbols.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => setSelectedSymbol(item.symbol)}
                  className={cx(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    selectedSymbol === item.symbol
                      ?"bg-primary-soft text-primary"
                      :"bg-surface-2 text-muted hover:bg-surface-2"
                  )}
                >
                  <span className="mr-1">{getSymbolBadge(item.symbol)}</span>
                  {item.symbol} · {item.count}
                </button>
              ))
            ) : (
              <span className={cx("text-sm", mutedText)}>
                No open-trade symbols found for this account.
              </span>
            )}
          </div>
        </div>

        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("mb-2 text-[11px] uppercase tracking-[0.16em]", mutedText)}>
            Timeframe
          </p>

          <div className="flex flex-wrap gap-2">
            {(["M5", "M15", "H1", "H4"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={cx(
                  "rounded-card px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                  timeframe === tf
                    ?"bg-success-soft text-success"
                    :"bg-surface-2 text-subtle hover:bg-surface-2"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("mb-2 text-[11px] uppercase tracking-[0.16em]", mutedText)}>
            Chart Type
          </p>

          <div className="flex flex-wrap gap-2">
            {(["candles", "line", "area"] as ChartMode[]).map((modeItem) => (
              <button
                key={modeItem}
                type="button"
                onClick={() => setChartMode(modeItem)}
                className={cx(
                  "rounded-card px-3 py-2 text-xs font-semibold transition",
                  chartMode === modeItem
                    ?"bg-primary-soft text-primary"
                    :"bg-surface-2 text-subtle hover:bg-surface-2"
                )}
              >
                {modeItem}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>Server</p>
          <p className={cx("mt-1 text-base font-bold", strongText)}>
            {selectedAccount?.server || "N/A"}
          </p>
        </div>

        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>Live Price</p>
          <p className={cx("mt-1 text-base font-bold", strongText)}>
            {formatPrice(livePrice)}
          </p>
        </div>

        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>Avg Entry</p>
          <p className={cx("mt-1 text-base font-bold", strongText)}>
            {avgEntry ? formatPrice(avgEntry) : "--"}
          </p>
        </div>

        <div className={cx(softCard, "px-4 py-3")}>
          <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
            Selected Symbol Trades
          </p>
          <p className={cx("mt-1 text-base font-bold", strongText)}>
            {selectedSymbolTrades.length}
          </p>
        </div>
      </div>

      <div className={cx(softCard, "p-4 sm:p-5")}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={cx("text-lg font-semibold", strongText)}>
              {selectedSymbol ? `${selectedSymbol} Live Chart` : "Live Chart"}
            </h3>
            <p className={cx("mt-1 text-sm", mutedText)}>
              Wheel = zoom, drag = pan, double click = reset
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => zoomAtRatio(0.82, 0.5)}
              className={cx(
                "inline-flex items-center gap-2 rounded-card border px-3 py-2 text-xs font-semibold transition","border-line bg-surface-2 text-muted hover:bg-surface-2"
              )}
            >
              <ZoomIn size={14} />
              Zoom In
            </button>

            <button
              type="button"
              onClick={() => zoomAtRatio(1.22, 0.5)}
              className={cx(
                "inline-flex items-center gap-2 rounded-card border px-3 py-2 text-xs font-semibold transition","border-line bg-surface-2 text-muted hover:bg-surface-2"
              )}
            >
              <ZoomOut size={14} />
              Zoom Out
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className={cx(
                "inline-flex items-center gap-2 rounded-card border px-3 py-2 text-xs font-semibold transition","border-line bg-surface-2 text-muted hover:bg-surface-2"
              )}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        <div
          ref={chartRef}
          className={cx(
            "relative h-[380px] w-full overflow-hidden rounded-card",
            isPanning ? "cursor-grabbing" : "cursor-grab"
          )}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopPanning}
          onMouseLeave={stopPanning}
          onDoubleClick={resetZoom}
        >
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-2 py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={cx(
                  "border-t border-dashed","border-line"
                )}
              />
            ))}
          </div>

          {showSoftUpdating ? (
            <div
              className={cx(
                "absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold","border-line bg-surface text-primary"
              )}
            >
              <RefreshCw size={12} className="animate-spin" />
              Updating...
            </div>
          ) : null}

          {errorText && canRenderChart ? (
            <div
              className={cx(
                "absolute left-3 top-3 z-20 rounded-full border px-3 py-1.5 text-[11px] font-semibold","border-danger bg-surface text-danger"
              )}
            >
              {errorText}
            </div>
          ) : null}

          <div
            className={cx(
              "pointer-events-none absolute bottom-3 left-3 z-20 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold","border-line bg-surface text-muted"
            )}
          >
            <MoveHorizontal size={12} />
            Drag to pan
            <Search size={12} className="ml-2" />
            Wheel to zoom
          </div>

          {showBlockingLoader ? (
            <div className="flex h-full items-center justify-center">
              <div className={cx("inline-flex items-center gap-2 text-sm", mutedText)}>
                <RefreshCw size={16} className="animate-spin" />
                Loading market view...
              </div>
            </div>
          ) : !selectedAccountId ? (
            <div className="flex h-full items-center justify-center">
              <div className={cx("text-center text-sm", mutedText)}>
                Select an MT5 account first.
              </div>
            </div>
          ) : !selectedSymbol ? (
            <div className="flex h-full items-center justify-center">
              <div className={cx("text-center text-sm", mutedText)}>
                No open trade symbols found on this account.
              </div>
            </div>
          ) : !canRenderChart ? (
            <div className="flex h-full items-center justify-center">
              <div className={cx("text-center text-sm", mutedText)}>
                Market candles not available for this symbol right now.
              </div>
            </div>
          ) : (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full">
              <defs>
                <linearGradient id="selectedSymbolAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isDark ? "rgba(34,211,238,0.24)" : "rgba(79, 125, 246,0.20)"}
                  />
                  <stop
                    offset="100%"
                    stopColor={isDark ? "rgba(34,211,238,0.02)" : "rgba(79, 125, 246,0.03)"}
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
                      stroke={isDark ? "rgba(255,255,255,0.08)" : "#e3e8f0"}
                      strokeDasharray="5 6"
                    />
                    <text
                      x={chartWidth - chartPaddingRight + 10}
                      y={y + 4}
                      fontSize="11"
                      fill={isDark ? "rgba(255,255,255,0.45)" : "#7b879a"}
                    >
                      {formatPrice(value)}
                    </text>
                  </g>
                );
              })}

              {visibleCandles.map((candle, index) => {
                const time = new Date(candle.time).getTime();
                const x = xForTime(time);
                const yOpen = yForPrice(candle.open);
                const yClose = yForPrice(candle.close);
                const yHigh = yForPrice(candle.high);
                const yLow = yForPrice(candle.low);
                const candleWidth = Math.max(
                  Math.min((plotWidth / Math.max(visibleCandles.length, 1)) * 0.58, 18),
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
                      stroke={isBull ? "#0f9f6e" : "#dc3a3a"}
                      strokeWidth="1.8"
                    />
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      rx="2"
                      fill={isBull ? "#0f9f6e" : "#dc3a3a"}
                      opacity={0.92}
                    />
                  </g>
                );
              })}

              {(chartMode === "line" || chartMode === "area") && closePoints.length > 1 ? (
                <>
                  {chartMode === "area" ? (
                    <path d={closeAreaPath} fill="url(#selectedSymbolAreaFill)" />
                  ) : null}
                  <path
                    d={closePath}
                    fill="none"
                    stroke={isDark ? "#22d3ee" : "#2245b4"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : null}

              {avgEntry > 0 ? (
                <g>
                  <line
                    x1={chartPaddingLeft}
                    y1={yForPrice(avgEntry)}
                    x2={chartWidth - chartPaddingRight}
                    y2={yForPrice(avgEntry)}
                    stroke={isDark ? "rgba(250,204,21,0.7)" : "rgba(42, 86, 220,0.9)"}
                    strokeDasharray="6 6"
                  />
                  <text
                    x={chartWidth - chartPaddingRight + 10}
                    y={yForPrice(avgEntry) - 6}
                    fontSize="11"
                    fill={isDark ? "rgba(250,204,21,0.85)" : "#b45309"}
                  >
                    Avg {formatPrice(avgEntry)}
                  </text>
                </g>
              ) : null}

              {positivePrice(livePrice) ? (
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
              ) : null}

              {visibleMarkerTrades.map((trade, index) => {
                const tradeTime = new Date(trade.openTime).getTime();
                const x = xForTime(tradeTime);
                const y = yForPrice(trade.openPrice);
                const fill = trade.side === "BUY" ? "#0f9f6e" : "#dc3a3a";

                return (
                  <g key={`${trade.id}-${index}`}>
                    {trade.side === "BUY" ? (
                      <path
                        d={`M ${x} ${y - 10} L ${x - 8} ${y + 6} L ${x + 8} ${y + 6} Z`}
                        fill={fill}
                      />
                    ) : (
                      <path
                        d={`M ${x} ${y + 10} L ${x - 8} ${y - 6} L ${x + 8} ${y - 6} Z`}
                        fill={fill}
                      />
                    )}

                    <circle cx={x} cy={y} r="3" fill={isDark ? "#ffffff" : "#0f1829"} />

                    <title>
                      {`${trade.symbol} | ${trade.side} | Open ${formatPrice(
                        trade.openPrice
                      )} | ${formatLots(trade.lots)} | P/L ${toNumber(trade.profit).toFixed(2)}`}
                    </title>
                  </g>
                );
              })}

              {timeTicks.map((tickItem, index) => (
                <text
                  key={`${tickItem.label}-${index}`}
                  x={tickItem.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isDark ? "rgba(255,255,255,0.45)" : "#7b879a"}
                >
                  {tickItem.label}
                </text>
              ))}
            </svg>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <Activity size={16} className={"text-primary"} />
          <h3 className={cx("text-base font-semibold", strongText)}>
            Open Trades for {selectedSymbol || "selected symbol"}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {selectedSymbolTrades.length ? (
            selectedSymbolTrades.map((trade) => {
              const pnlPositive = toNumber(trade.profit, 0) >= 0;

              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cx(
                    "rounded-card border px-4 py-3","border-line bg-surface-2"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className={cx("text-sm font-semibold", strongText)}>
                        <span className="mr-1">{getSymbolBadge(trade.symbol)}</span>
                        {trade.symbol}
                      </p>
                      <p className={cx("mt-1 text-xs", mutedText)}>
                        #{trade.accountId} · {formatLots(trade.lots)}
                      </p>
                    </div>

                    <span
                      className={cx(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        trade.side === "BUY"
                          ?"bg-success-soft text-success"
                          :"bg-danger-soft text-danger"
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
                      <p className={mutedText}>Current Price</p>
                      <p className={cx("mt-1 font-semibold", strongText)}>
                        {formatPrice(trade.currentPrice ?? livePrice)}
                      </p>
                    </div>

                    <div>
                      <p className={mutedText}>Open Time</p>
                      <p className={cx("mt-1 font-semibold", strongText)}>
                        {formatDateTime(trade.openTime)}
                      </p>
                    </div>

                    <div>
                      <p className={mutedText}>P/L</p>
                      <p
                        className={cx(
                          "mt-1 font-semibold",
                          pnlPositive
                            ?"text-success"
                            :"text-danger"
                        )}
                      >
                        {toNumber(trade.profit).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className={cx("rounded-card border px-4 py-6 text-sm", mutedText, softCard)}>
              No open trades found for selected symbol.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}