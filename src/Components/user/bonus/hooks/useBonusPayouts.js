// Components/user/bonus/hooks/useBonusPayouts.js
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "@/utils/apiClients";

export const useBonusPayouts = (filters) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters || {}).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      const res = await userApi.get("/bonus/payouts", { params });
      setData(res?.data?.data || []);
      setPagination(res?.data?.pagination || null);
    } catch (error) {
      console.error("bonus payouts error", error);
      toast.error(error?.response?.data?.message || "Failed to load bonus payouts");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchDetails = useCallback(async (id) => {
    try {
      setDetailsLoading(true);
      const res = await userApi.get(`/bonus/payouts/${id}`);
      setSelected(res?.data?.data || null);
    } catch (error) {
      console.error("bonus payout details error", error);
      toast.error(
        error?.response?.data?.message || "Failed to load payout details"
      );
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    pagination,
    selected,
    setSelected,
    detailsLoading,
    fetchDetails,
    refetch: fetchData,
  };
};