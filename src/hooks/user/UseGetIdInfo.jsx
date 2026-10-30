import { useMt5Account } from "../useMt5Accounts";

// Kept as an adapter for existing account detail consumers.
export function useGetIdInfo(id) {
  return useMt5Account(id);
}
