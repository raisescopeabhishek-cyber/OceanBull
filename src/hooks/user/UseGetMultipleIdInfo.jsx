import { useEffect, useState } from "react";
import { adminApi } from "@/utils/apiClients";

export function useGetMultipleIdInfo(accountIds = []) {
  const [dataMap, setDataMap] = useState({});

  useEffect(() => {
    if (!accountIds.length) return;

    let intervalId;

    const fetchData = async () => {
      const newMap = {};

      await Promise.all(
        accountIds.map(async (id) => {
          try {
            const res = await adminApi.get(
              `/server-logger-info`
            );

            if (res?.data?.data?.Equity) {
              newMap[id] = {
                balance: res.data?.data?.Balance || 0,
                equity: res.data?.data?.Equity || 0,
                pl: Number(res.data?.data?.Equity - res.data?.data?.Balance).toFixed(
                  2 || 0
                ),
              };
            } else {
              newMap[id] = null;
            }
          } catch (err) {
            newMap[id] = null;
          }
        })
      );

      setDataMap(newMap);
    };

    fetchData(); // initial
    intervalId = setInterval(fetchData, 2000); // poll every 3s

    return () => clearInterval(intervalId); // cleanup
  }, [accountIds.join(",")]);

  return dataMap;
}
