import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { accountLogin, mt5AccountsStore, normalizeAccountIds } from "../services/mt5Accounts";

export function useMt5Accounts(accountIds = []) {
  const accountKey = normalizeAccountIds(accountIds).join(",");
  const ids = useMemo(() => accountKey ? accountKey.split(",") : [], [accountKey]);
  const snapshot = useSyncExternalStore(mt5AccountsStore.subscribe, mt5AccountsStore.getSnapshot, mt5AccountsStore.getSnapshot);

  useEffect(() => mt5AccountsStore.register(ids), [ids]);

  const byLogin = useMemo(() => Object.fromEntries(ids.filter((id) => snapshot.byLogin[id]).map((id) => [id, snapshot.byLogin[id]])), [ids, snapshot]);
  const data = useMemo(() => ids.map((id) => byLogin[id]).filter(Boolean), [ids, byLogin]);
  const isReady = useCallback((account, fields) => ids.includes(accountLogin(account)) && mt5AccountsStore.isReady(account, fields), [ids]);

  return {
    data,
    byLogin,
    loading: ids.some((id) => !isReady(id)),
    connected: snapshot.connected,
    status: snapshot.status,
    isReady,
    refresh: mt5AccountsStore.refresh,
  };
}

export function useMt5Account(accountId) {
  const result = useMt5Accounts([accountId]);
  const login = accountLogin(accountId);
  return {
    info: result.byLogin[login] ?? null,
    loading: !!login && !result.isReady(login),
    connected: result.connected,
    ready: result.isReady(login),
    isReady: (fields) => result.isReady(login, fields),
    refresh: result.refresh,
  };
}
