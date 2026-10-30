import { useMemo } from "react";
import { useMt5Accounts } from "../useMt5Accounts";

export function useGetInfoByAccounts(accountIds = []) {
  const live = useMt5Accounts(accountIds);
  const stats = useMemo(() => ({
    totalBalance: live.data.reduce((sum, account) => sum + (account.Balance ?? 0), 0),
    totalEquity: live.data.reduce((sum, account) => sum + (account.Equity ?? 0), 0),
    totalProfit: live.data.reduce((sum, account) => sum + (account.Profit ?? 0), 0),
  }), [live.data]);

  return { ...live, stats };
}
