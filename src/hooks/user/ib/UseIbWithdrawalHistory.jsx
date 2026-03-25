import { backendApi } from "@/utils/apiClients";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

export default function UseIbWithdrawalHistory() {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);
  const [totalApprovedWithdrawal, setTotalApprovedWithdrawal] = useState(0);

  const fetchData = useCallback(async () => {
    // console.log("ib called");
    if (!loggedUser?._id) return;

    setIsLoading(true);
    try {
      const res = await backendApi.get(`/ib-withdrawals/${loggedUser._id}`);
      const resData = res.data.data.reverse();

      if (Array.isArray(resData)) {
        const totalSum = resData
          .filter((value) => value.status === "approved")
          .reduce((total, value) => total + value.amount, 0);
        setTotalApprovedWithdrawal(totalSum);
        setData(resData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [loggedUser?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totalApprovedWithdrawal,
    isLoading,
    isError,
    refresh: fetchData,
  };
}
