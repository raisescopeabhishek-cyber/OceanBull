import { useMemo } from "react";
import { useMt5Accounts } from "../useMt5Accounts";

export function useGetMultipleIdInfo(accountIds = []) {
  const { byLogin } = useMt5Accounts(accountIds);

  return useMemo(() => Object.fromEntries(Object.entries(byLogin).map(([id, info]) => [
    id,
    {
      balance: info.Balance ?? null,
      equity: info.Equity ?? null,
      pl: Number.isFinite(info.Equity) && Number.isFinite(info.Balance)
        ? (info.Equity - info.Balance).toFixed(2)
        : null,
    },
  ])), [byLogin]);
}
