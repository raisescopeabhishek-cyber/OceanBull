export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const unwrapData = (input) => {
  if (input?.data?.data !== undefined) return input.data.data;
  if (input?.data !== undefined) return input.data;
  return input;
};

export const asArray = (input) => {
  const data = unwrapData(input);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.masters)) return data.masters;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.accounts)) return data.accounts;
  if (Array.isArray(data?.copiers)) return data.copiers;
  if (Array.isArray(data?.trades)) return data.trades;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
};

export const getNestedUser = (res) => {
  return (
    res?.user ||
    res?.data?.user ||
    res?.data?.data?.user ||
    res?.data ||
    null
  );
};

export const getUserIdFromUser = (user) => {
  return user?._id || user?.id || user?.userId || user?.sub || "";
};

export const getUserAccountsFromUser = (user) => {
  const accounts = user?.accounts || user?.user?.accounts || [];
  return Array.isArray(accounts) ? accounts : [];
};

export const pickAccountNumber = (account) => {
  return (
    account?.accountNumber ||
    account?.mt5Account ||
    account?.MT5Account ||
    account?.login ||
    account?.Login ||
    ""
  );
};

export const pickMasterAccount = (master) => {
  return (
    master?.masterAccount ||
    master?.MT5Account ||
    master?.mt5Account ||
    master?.account ||
    master?.login ||
    master?.Login ||
    master?.MasterAccount ||
    ""
  );
};

export const pickName = (item) => {
  return (
    item?.nickname ||
    item?.name ||
    item?.Name ||
    item?.title ||
    item?.email ||
    "-"
  );
};

export const formatMoney = (value) => {
  const num = Number(value || 0);

  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("en-US");
};

export const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
};

export const getLocalStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("loggedUser") ||
      localStorage.getItem("authUser") ||
      "";

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return parsed?.user || parsed;
  } catch {
    return null;
  }
};

// ===============================
// COPY TRADING TRADE HELPERS
// ===============================

export const normalizeAccount = (value) => {
  return String(value || "").trim();
};

export const getTradeAccount = (row) => {
  return normalizeAccount(
    row?.MT5Account ||
      row?.mt5Account ||
      row?.account ||
      row?.login ||
      row?.Login ||
      ""
  );
};

export const getTradeTicket = (row) => {
  return row?.Ticket || row?.ticket || row?.Deal || row?.id || "-";
};

export const getTradeSymbol = (row) => {
  return row?.Symbol || row?.symbol || "-";
};

export const getTradeType = (row) => {
  const value =
    row?.Action ??
    row?.type ??
    row?.Type ??
    row?.BUY_SELL ??
    row?.buy_sell ??
    row?.side;

  if (value === 0 || value === "0") return "BUY";
  if (value === 1 || value === "1") return "SELL";

  return value || "-";
};

export const getTradeVolume = (row) => {
  return row?.Lot ?? row?.lot ?? row?.Volume ?? row?.volume ?? "-";
};

export const getTradeOpenPrice = (row) => {
  return (
    row?.Open_Price ??
    row?.OpenPrice ??
    row?.PriceOpen ??
    row?.Price ??
    row?.openPrice ??
    "-"
  );
};

export const getTradeClosePrice = (row) => {
  return (
    row?.Close_Price ??
    row?.ClosePrice ??
    row?.PriceClose ??
    row?.closePrice ??
    "-"
  );
};

export const getTradeProfit = (row) => {
  return row?.Profit ?? row?.profit ?? "0";
};

export const getTradeTime = (row) => {
  return (
    row?.Open_Time ||
    row?.Close_Time ||
    row?.OpenTime ||
    row?.CloseTime ||
    row?.Time ||
    row?.createdAt ||
    ""
  );
};

const uniqTrades = (rows = []) => {
  const map = new Map();

  rows.forEach((row, index) => {
    if (!row) return;

    const key = [
      row?.id,
      row?.Ticket,
      row?.ticket,
      row?.Deal,
      row?.MasterTicket,
      row?.MT5Account,
      index,
    ]
      .filter((item) => item !== undefined && item !== null && item !== "")
      .join("-");

    map.set(key || String(index), row);
  });

  return Array.from(map.values());
};

export const normalizeTradeRows = ({
  input,
  account,
  mode = "normal", // normal | master | copier
}) => {
  const targetAccount = normalizeAccount(account);
  const rawRows = asArray(input);
  const output = [];

  rawRows.forEach((item) => {
    if (!item) return;

    // Nested Python closed-trade format:
    // {
    //   master_trade: {...},
    //   associated_trades: [...]
    // }
    if (item.master_trade || item.associated_trades) {
      if (mode === "master") {
        if (item.master_trade) output.push(item.master_trade);
        return;
      }

      if (mode === "copier") {
        const associatedTrades = Array.isArray(item.associated_trades)
          ? item.associated_trades
          : [];

        const matchedTrades = targetAccount
          ? associatedTrades.filter(
              (trade) => getTradeAccount(trade) === targetAccount
            )
          : associatedTrades;

        // If exact copier account not found, still show associated trades.
        // This helps when Python returns grouped copied trades but not filtered by copier.
        if (matchedTrades.length > 0) {
          output.push(...matchedTrades);
        } else {
          output.push(...associatedTrades);
        }

        return;
      }
    }

    // Flat trade row format.
    if (mode === "copier" && targetAccount) {
      const rowAccount = getTradeAccount(item);

      if (!rowAccount || rowAccount === targetAccount) {
        output.push(item);
      }

      return;
    }

    output.push(item);
  });

  return uniqTrades(output);
};