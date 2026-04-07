// Components/user/bonus/hooks/useBonusLedger.js
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "@/utils/apiClients";

export const useBonusLedger = (filters) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters || {}).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      const res = await userApi.get("/bonus/ledger", { params });
      setData(res?.data?.data || []);
      setPagination(res?.data?.pagination || null);
    } catch (error) {
      console.error("bonus ledger error", error);
      toast.error(error?.response?.data?.message || "Failed to load bonus ledger");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, pagination, refetch: fetchData };
};