import { useMt5Accounts } from "../useMt5Accounts";

export function useSocketInfoByAccounts(accountIds = []) {
  return useMt5Accounts(accountIds).data;
}
