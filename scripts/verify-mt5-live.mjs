import { readFileSync } from "node:fs";
import { createMt5AccountsStore, normalizeAccountIds, readAccountUpdates } from "../src/services/mt5Accounts.js";

const Socket = globalThis.WebSocket ?? (await import("ws")).default;

// Supply an account you are authorized to inspect; no account or balance values
// are printed. On Node 20 pass --experimental-websocket to use its native client.
// Example: node --experimental-websocket scripts/verify-mt5-live.mjs <accountNumber>
const accounts = normalizeAccountIds(process.argv.slice(2));
if (!accounts.length) throw new Error("Pass at least one authorized MT5 account number.");
const envFile = readFileSync(new URL("../.env", import.meta.url), "utf8");
const managerIndex = Number(process.env.VITE_MANAGER_INDEX ?? envFile.match(/^VITE_MANAGER_INDEX\s*=\s*["']?(\d+)/m)?.[1]);
if (!Number.isInteger(managerIndex)) throw new Error("VITE_MANAGER_INDEX is required in .env or the process environment.");

let snapshots = 0;
let liveFrames = 0;
let readyFrames = 0;
let completed = false;
let store;
const timeout = setTimeout(() => finish("timeout"), 30000);

function finish(reason) {
  if (completed) return;
  completed = true;
  clearTimeout(timeout);
  const ready = accounts.every((account) => store.isReady(account));
  console.log(JSON.stringify({ result: reason, snapshots, liveFrames, readyFrames, allAccountsReady: ready }));
  store.reset();
  if (!snapshots || !liveFrames || !ready) process.exitCode = 1;
}

store = createMt5AccountsStore({
  managerIndex,
  createSocket(url) {
    const socket = new Socket(url);
    socket.addEventListener("open", () => console.log(JSON.stringify({ event: "open", managerIndex, accountCount: accounts.length })));
    socket.addEventListener("error", (error) => console.error(JSON.stringify({ event: "error", code: error.error?.code ?? "unknown", message: error.message })));
    socket.addEventListener("message", (event) => {
      let message;
      try { message = JSON.parse(event.data.toString()); } catch { return; }
      const type = message.type ?? message.mode ?? message.event ?? "unspecified";
      if (type === "accounts") snapshots += 1;
      if (type === "live") liveFrames += 1;
      const rows = readAccountUpdates(message);
      const data = message.data;
      console.log(JSON.stringify({
        event: "frame",
        type,
        envelopeKeys: Object.keys(message),
        dataShape: Array.isArray(data) ? "array" : typeof data,
        dataCount: Array.isArray(data) ? data.length : undefined,
        dataKeys: data && !Array.isArray(data) && typeof data === "object"
          ? Object.keys(data).map((key) => /^\d+$/.test(key) ? "<login>" : key)
          : undefined,
        firstDataRowKeys: Array.isArray(data) && data[0] && typeof data[0] === "object" ? Object.keys(data[0]) : undefined,
        rowKeys: rows[0] ? Object.keys(rows[0]) : [],
        parsedRows: rows.length,
      }));
      queueMicrotask(() => {
        if (accounts.every((account) => store.isReady(account))) readyFrames += 1;
        if (snapshots && liveFrames >= 2 && readyFrames) finish("verified");
      });
    });
    return socket;
  },
});

store.register(accounts);
