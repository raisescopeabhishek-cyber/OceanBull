import { useState, useEffect } from "react";
import { backendApi } from "@/utils/apiClients";

const useDashboardStats = () => {
  const [userStats, setUserStats] = useState(null);
  const [depositStats, setDepositStats] = useState(null);
  const [withdrawalStats, setWithdrawalStats] = useState(null);
  const [ibWithdrawalStats, setIbWithdrawalStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [userRes, depositRes, withdrawalRes, ibWithdrawalRes] =
          await Promise.all([
            backendApi.get(`/user-report`),
            backendApi.get(`/deposit-report`),
            backendApi.get(`/withdrawal-report`),
            backendApi.get(`/ib-withdrawal-report`),
          ]);

        setUserStats(userRes.data.data);
        setDepositStats(depositRes.data.data);
        setWithdrawalStats(withdrawalRes.data.data);
        setIbWithdrawalStats(ibWithdrawalRes.data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    userStats,
    depositStats,
    withdrawalStats,
    ibWithdrawalStats,
    isLoading,
    error,
  };
};

export default useDashboardStats;
