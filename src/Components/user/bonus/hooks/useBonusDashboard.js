// Components/user/bonus/hooks/useBonusDashboard.js
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "@/utils/apiClients";

export const useBonusDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.get("/bonus/dashboard");
      setData(res?.data?.data || null);
    } catch (error) {
      console.error("bonus dashboard error", error);
      toast.error(
        error?.response?.data?.message || "Failed to load bonus dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    refetch: fetchDashboard,
  };
};