import assert from "node:assert/strict";
import test from "node:test";
import {
  MT5_SOCKET_URL,
  accountLogin,
  createMt5AccountsStore,
  normalizeAccountIds,
  readAccountUpdates,
} from "../src/services/mt5Accounts.js";

const flush = () => new Promise((resolve) => queueMicrotask(resolve));

function setup(managerIndex = 20) {
  const sockets = [];
  const tasks = new Map();
  let timerId = 0;
  const store = createMt5AccountsStore({
    managerIndex,
    schedule(callback, delay) {
      const id = ++timerId;
      tasks.set(id, { callback, delay });
      return id;
    },
    cancel(id) { tasks.delete(id); },
    createSocket(url) {
      const socket = {
        url,
        sent: [],
        closed: false,
        send(payload) { this.sent.push(JSON.parse(payload)); },
        close() { this.closed = true; },
        open() { this.onopen?.(); },
        message(message) { this.onmessage?.({ data: JSON.stringify(message) }); },
        disconnect() { this.onclose?.({ code: 1006 }); },
      };
      sockets.push(socket);
      return socket;
    },
  });
  const runNextTimer = () => {
    const [id, task] = [...tasks.entries()].sort((a, b) => a[1].delay - b[1].delay)[0] || [];
    assert.ok(task, "Expected a pending timer");
    tasks.delete(id);
    task.callback();
    return task.delay;
  };
  return { store, sockets, tasks, runNextTimer };
}

test("normalizes actual account logins without accepting database IDs or invalid accounts", () => {
  assert.equal(accountLogin({ accountNumber: "001001" }), "1001");
  assert.equal(accountLogin({ login: 1002 }), "1002");
  assert.equal(accountLogin({ _id: "database-record" }), null);
  assert.equal(accountLogin("0"), null);
  assert.deepEqual(normalizeAccountIds([1002, "001001", "1002", undefined, "not-an-account"]), ["1001", "1002"]);
});

test("accounts snapshot and live frames match login, preserve zero, and merge partial fields", async () => {
  const { store, sockets } = setup();
  store.register([1001, 1002]);
  await flush();
  const socket = sockets[0];
  assert.equal(socket.url, MT5_SOCKET_URL);
  socket.open();
  assert.deepEqual(socket.sent, [{ mode: "accounts", manager_index: 20, accounts: [1001, 1002] }]);
  assert.equal(store.isReady(1001), false);
  socket.message({ type: "accounts", manager_index: 20, data: [
    { Login: 1002, Balance: "42", Equity: "40", Credit: "2" },
    { Login: 1001, Balance: 0, Equity: 0, Credit: 0 },
  ] });
  assert.equal(store.isReady(1001), true);
  assert.equal(store.getSnapshot().byLogin[1001].Balance, 0);
  assert.equal(store.getSnapshot().byLogin[1002].Balance, 42);
  socket.message({ type: "live", data: { login: "1002", equity: "35.75" } });
  assert.equal(store.getSnapshot().byLogin[1002].Equity, 35.75);
  assert.equal(store.getSnapshot().byLogin[1002].Credit, 2);
  assert.equal(store.getSnapshot().byLogin[1002].Balance, 42);
  socket.message({ type: "live", data: { "1002": { balance: 0, equity: 0, credit: 0 } } });
  assert.equal(store.getSnapshot().byLogin[1002].Balance, 0);
  assert.equal(store.isReady(1002), true);
  store.reset();
});

test("multiple consumers share one connection and all observe the same live update", async () => {
  const { store, sockets } = setup();
  const seenFirst = [];
  const seenSecond = [];
  const unsubscribeFirst = store.subscribe(() => seenFirst.push(store.getSnapshot()));
  const unsubscribeSecond = store.subscribe(() => seenSecond.push(store.getSnapshot()));
  const first = store.register([1001]);
  const second = store.register([1001]);
  await flush();
  assert.equal(sockets.length, 1);
  sockets[0].open();
  sockets[0].message({ type: "live", data: { Login: 1001, Balance: 25, Equity: 24, Credit: 0 } });
  assert.equal(seenFirst.at(-1), seenSecond.at(-1));
  assert.equal(seenFirst.at(-1).byLogin[1001].Equity, 24);
  first();
  await flush();
  assert.equal(sockets[0].closed, false);
  assert.equal(store.isReady(1001), true);
  second();
  assert.equal(sockets[0].closed, true);
  assert.deepEqual(store.getSnapshot().byLogin, {});
  unsubscribeFirst();
  unsubscribeSecond();
  await flush();
});

test("switching accounts clears readiness and ignores messages from a closed connection", async () => {
  const { store, sockets } = setup();
  const oldAccount = store.register([1001]);
  await flush();
  const oldSocket = sockets[0];
  oldSocket.open();
  oldSocket.message({ type: "accounts", data: [{ Login: 1001, Balance: 50, Equity: 50, Credit: 0 }] });
  const lateMessage = oldSocket.onmessage;
  oldAccount();
  store.register([1002]);
  assert.equal(store.isReady(1001), false);
  await flush();
  const currentSocket = sockets[1];
  currentSocket.open();
  assert.deepEqual(currentSocket.sent[0].accounts, [1002]);
  lateMessage({ data: JSON.stringify({ type: "live", data: { Login: 1001, Equity: 999 } }) });
  assert.deepEqual(store.getSnapshot().byLogin, {});
  currentSocket.message({ type: "accounts", data: [{ Login: 1002, Balance: 0, Equity: 0, Credit: 0 }] });
  assert.equal(store.isReady(1002), true);
  assert.equal(store.isReady(1001), false);
  store.reset();
});

test("removed accounts cannot be revived by a late frame before subscription reconciliation", async () => {
  const { store, sockets } = setup();
  const removeFirst = store.register([1001]);
  store.register([1002]);
  await flush();
  sockets[0].open();
  sockets[0].message({ type: "accounts", data: [
    { Login: 1001, Balance: 1, Equity: 1, Credit: 0 },
    { Login: 1002, Balance: 2, Equity: 2, Credit: 0 },
  ] });
  removeFirst();
  sockets[0].message({ type: "live", data: { Login: 1001, Balance: 999, Equity: 999, Credit: 0 } });
  assert.equal(store.getSnapshot().byLogin[1001], undefined);
  assert.equal(store.isReady(1001), false);
  await flush();
  sockets[1].open();
  assert.deepEqual(sockets[1].sent[0].accounts, [1002]);
  store.reset();
});

test("disconnect invalidates readiness and reconnect sends the current subscription again", async () => {
  const { store, sockets, tasks, runNextTimer } = setup();
  store.register([1001]);
  await flush();
  sockets[0].open();
  sockets[0].message({ mode: "accounts", data: { Login: 1001, Balance: 15, Equity: 12, Credit: 2 } });
  assert.equal(store.isReady(1001), true);
  sockets[0].disconnect();
  assert.equal(store.isReady(1001), false);
  assert.deepEqual(store.getSnapshot().byLogin, {});
  assert.equal(store.getSnapshot().status, "reconnecting");
  assert.equal(tasks.size, 1);
  assert.equal(runNextTimer(), 1000);
  sockets[1].open();
  assert.deepEqual(sockets[1].sent[0], sockets[0].sent[0]);
  assert.equal(store.isReady(1001), false);
  sockets[1].message({ type: "accounts", data: { "1001": { Balance: 0, Equity: 0, Credit: 0 } } });
  assert.equal(store.isReady(1001), true);
  store.reset();
});

test("logout closes a live connection, clears state, and ignores captured late callbacks", async () => {
  const { store, sockets, tasks } = setup();
  store.register([1001]);
  await flush();
  sockets[0].open();
  sockets[0].message({ type: "live", data: { Login: 1001, Balance: 10, Equity: 9, Credit: 0 } });
  const lateMessage = sockets[0].onmessage;
  const lateClose = sockets[0].onclose;
  store.reset();
  assert.equal(sockets[0].closed, true);
  assert.deepEqual(store.getSnapshot(), { byLogin: {}, connected: false, status: "idle" });
  lateMessage({ data: JSON.stringify({ type: "live", data: { Login: 1001, Balance: 100 } }) });
  lateClose();
  await flush();
  assert.equal(tasks.size, 0);
  assert.equal(sockets.length, 1);
  assert.deepEqual(store.getSnapshot().byLogin, {});
});

test("logout cancels pending reconnect and queued initial registration", async () => {
  const { store, sockets, tasks } = setup();
  store.register([1001]);
  await flush();
  sockets[0].open();
  sockets[0].disconnect();
  assert.equal(tasks.size, 1);
  store.reset();
  assert.equal(tasks.size, 0);
  store.register([1002]);
  store.reset();
  await flush();
  assert.equal(sockets.length, 1);
  assert.equal(tasks.size, 0);
  assert.deepEqual(store.getSnapshot().byLogin, {});
});

test("malformed, wrong-manager, unrelated, and unidentified frames do not create balances", async () => {
  const { store, sockets } = setup();
  store.register([1001]);
  await flush();
  sockets[0].open();
  sockets[0].onmessage({ data: "invalid JSON" });
  for (const frame of [
    { type: "accounts", data: [] },
    { type: "live", Balance: 100, Equity: 100, Credit: 0 },
    { type: "heartbeat", data: { Login: 1001, Balance: 100, Equity: 100, Credit: 0 } },
    { type: "live", manager_index: 21, data: { Login: 1001, Balance: 100, Equity: 100, Credit: 0 } },
    { type: "live", data: { Login: 9999, Balance: 100, Equity: 100, Credit: 0 } },
    { type: "live", data: { Login: 1001, Balance: "", Equity: "invalid", Credit: null } },
  ]) sockets[0].message(frame);
  assert.deepEqual(store.getSnapshot().byLogin, {});
  assert.equal(store.isReady(1001), false);
  sockets[0].message({ type: "live", data: { Login: 1001, Equity: 0 } });
  assert.equal(store.isReady(1001, ["Equity"]), true);
  assert.equal(store.isReady(1001), false);
  sockets[0].message({ type: "live", data: { Login: 1001, Equity: null } });
  assert.equal(store.getSnapshot().byLogin[1001].Equity, 0);
  store.reset();
});

test("empty account sets do not connect and an invalid manager cannot subscribe", async () => {
  const empty = setup();
  empty.store.register([]);
  await flush();
  assert.equal(empty.sockets.length, 0);
  const invalid = setup(Number.NaN);
  invalid.store.register([1001]);
  await flush();
  assert.equal(invalid.sockets.length, 0);
  assert.equal(invalid.store.getSnapshot().status, "configuration-error");
  invalid.store.reset();
});

test("parser accepts nested and keyed snapshots while ignoring invalid numeric fields", () => {
  assert.deepEqual(readAccountUpdates({ mode: "accounts", data: { "1001": { balance: "0", equity: "12.5", credit: 0, margin: "bad" } } }), [
    { Balance: 0, Equity: 12.5, Credit: 0, Login: "1001", MT5Account: "1001", accountNumber: "1001" },
  ]);
  assert.deepEqual(readAccountUpdates({ type: "live", account: 1001, data: { Equity: 4 } }), [
    { Equity: 4, Login: "1001", MT5Account: "1001", accountNumber: "1001" },
  ]);
});
