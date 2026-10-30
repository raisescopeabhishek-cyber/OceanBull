export const MT5_SOCKET_URL = "wss://socket.infoapi.biz/ws/mt5";
export const ACCOUNT_FIELDS = ["Balance", "Equity", "Credit"];

export function accountLogin(account) {
  const value = account && typeof account === "object"
    ? account.Login ?? account.login ?? account.MT5Account ?? account.accountNumber ?? account.account_number ?? account.account
    : account;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const login = text.replace(/^0+(?=\d)/, "");
  return login === "0" ? null : login;
}

export function normalizeAccountIds(accounts = []) {
  return [...new Set(accounts.map(accountLogin).filter(Boolean))].sort();
}

const numericFields = {
  Balance: ["Balance", "balance"],
  Equity: ["Equity", "equity"],
  Credit: ["Credit", "credit"],
  Profit: ["Profit", "profit"],
  Margin: ["Margin", "margin"],
  MarginFree: ["MarginFree", "marginFree", "margin_free", "free_margin"],
  MarginLevel: ["MarginLevel", "marginLevel", "margin_level"],
  Leverage: ["Leverage", "leverage"],
};

// Both snapshots and incremental messages may contain an array, one account,
// or a map keyed by login. Never associate a response by its array position.
export function readAccountUpdates(message) {
  const updates = [];
  const visit = (value, inheritedLogin = null) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((row) => visit(row));
      return;
    }
    const login = accountLogin(value) ?? inheritedLogin;
    const row = {};
    for (const [field, aliases] of Object.entries(numericFields)) {
      const raw = aliases.map((alias) => value[alias]).find((v) => v !== undefined && v !== null);
      if ((typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "")) && Number.isFinite(Number(raw))) {
        row[field] = Number(raw);
      }
    }
    if (login && Object.keys(row).length) {
      updates.push({ ...row, Login: login, MT5Account: login, accountNumber: login });
    }
    for (const key of ["data", "accounts", "users", "account", "updates"]) {
      if (value[key] && typeof value[key] === "object") visit(value[key], login);
    }
    for (const [key, child] of Object.entries(value)) {
      if (/^\d+$/.test(key)) visit(child, accountLogin(key));
    }
  };
  visit(message);
  return updates;
}

export function createMt5AccountsStore({
  managerIndex,
  createSocket = (url) => new WebSocket(url),
  schedule = setTimeout,
  cancel = clearTimeout,
} = {}) {
  const listeners = new Set();
  const owners = new Map();
  let snapshot = { byLogin: {}, connected: false, status: "idle" };
  let socket = null;
  let activeKey = "";
  let reconnectTimer = null;
  let connectTimer = null;
  let retry = 0;
  let queued = false;

  const publish = (next) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  const desiredIds = () => normalizeAccountIds([...owners.values()].flat());
  const closeSocket = () => {
    cancel(reconnectTimer);
    cancel(connectTimer);
    reconnectTimer = connectTimer = null;
    const previous = socket;
    socket = null;
    if (previous) {
      previous.onopen = previous.onmessage = previous.onerror = previous.onclose = null;
      previous.close();
    }
  };
  const connect = () => {
    const ids = desiredIds();
    if (!ids.length) return;
    if (!Number.isInteger(managerIndex) || managerIndex < 0) {
      publish({ byLogin: {}, connected: false, status: "configuration-error" });
      return;
    }
    publish({ byLogin: {}, connected: false, status: "connecting" });
    let connection;
    const disconnected = () => {
      if (connection && socket !== connection) return;
      closeSocket();
      publish({ byLogin: {}, connected: false, status: "reconnecting" });
      reconnectTimer = schedule(connect, Math.min(1000 * 2 ** retry++, 30000));
    };
    try {
      connection = createSocket(MT5_SOCKET_URL);
      socket = connection;
    } catch {
      disconnected();
      return;
    }
    connectTimer = schedule(disconnected, 15000);
    connection.onopen = () => {
      if (socket !== connection) return;
      cancel(connectTimer);
      connectTimer = null;
      try {
        connection.send(JSON.stringify({
          mode: "accounts",
          manager_index: managerIndex,
          accounts: ids.map((id) => Number.isSafeInteger(Number(id)) ? Number(id) : id),
        }));
        publish({ byLogin: {}, connected: true, status: "connected" });
      } catch {
        disconnected();
      }
    };
    connection.onmessage = (event) => {
      if (socket !== connection) return;
      try {
        const message = JSON.parse(event.data);
        const mode = message.type ?? message.mode ?? message.event;
        if (mode && !["accounts", "live"].includes(String(mode).toLowerCase())) return;
        if (message.manager_index != null && Number(message.manager_index) !== managerIndex) return;
        const allowed = new Set(desiredIds());
        const updates = readAccountUpdates(message).filter((row) => allowed.has(row.Login));
        if (!updates.length) return;
        const byLogin = { ...snapshot.byLogin };
        for (const row of updates) byLogin[row.Login] = { ...byLogin[row.Login], ...row };
        retry = 0;
        publish({ byLogin, connected: true, status: "live" });
      } catch {
        // Ignore malformed frames without discarding the last valid update.
      }
    };
    connection.onerror = disconnected;
    connection.onclose = disconnected;
  };
  const reconcile = () => {
    queued = false;
    const nextKey = desiredIds().join(",");
    if (nextKey === activeKey) return;
    activeKey = nextKey;
    closeSocket();
    retry = 0;
    if (nextKey) connect();
    else publish({ byLogin: {}, connected: false, status: "idle" });
  };
  const queueReconcile = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(reconcile);
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    register(accounts) {
      const owner = Symbol("MT5 accounts consumer");
      owners.set(owner, normalizeAccountIds(accounts));
      queueReconcile();
      return () => {
        owners.delete(owner);
        // Invalidate removed accounts immediately, including logout/unmount.
        const remaining = new Set(desiredIds());
        const byLogin = Object.fromEntries(Object.entries(snapshot.byLogin).filter(([id]) => remaining.has(id)));
        if (!remaining.size) {
          closeSocket();
          activeKey = "";
          publish({ byLogin: {}, connected: false, status: "idle" });
        } else if (Object.keys(byLogin).length !== Object.keys(snapshot.byLogin).length) {
          publish({ ...snapshot, byLogin });
        }
        queueReconcile();
      };
    },
    isReady(account, fields = ACCOUNT_FIELDS) {
      const row = snapshot.byLogin[accountLogin(account)];
      return snapshot.connected && !!row && fields.every((field) => Number.isFinite(row[field]));
    },
    refresh() {
      closeSocket();
      retry = 0;
      if (desiredIds().length) connect();
      else publish({ byLogin: {}, connected: false, status: "idle" });
    },
    reset() {
      owners.clear();
      activeKey = "";
      retry = 0;
      closeSocket();
      publish({ byLogin: {}, connected: false, status: "idle" });
    },
  };
}

// Kept outside persisted Redux state: a saved balance is never live readiness.
export const mt5AccountsStore = createMt5AccountsStore({
  managerIndex: Number(import.meta.env?.VITE_MANAGER_INDEX),
});

if (import.meta.hot) import.meta.hot.dispose(() => mt5AccountsStore.reset());
