import {  userApi } from "@/utils/apiClients";
import { useState, useEffect, useMemo } from "react";

const useMT5Stats = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMT5Accounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userApi.get(
          `/server-userList`
        );
        setAccounts(response.data.data.lstUsers);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMT5Accounts();
  }, []);

  const mt5Stats = useMemo(() => {
    if (!accounts.length) return {};

    let total = accounts.length;
    let active = 0;
    let disabled = 0;
    let profitable = 0;
    let loss = 0;

    accounts.forEach((account) => {
      if (account.Enable == 1) active++;
      if (account.Enable == 0) disabled++;
      if (account.Profit > 0) profitable++;
      if (account.Profit < 0) loss++;
    });

    return { total, active, disabled, profitable, loss };
  }, [accounts]);

  return { mt5Stats, isLoading, error };
};

export default useMT5Stats;
