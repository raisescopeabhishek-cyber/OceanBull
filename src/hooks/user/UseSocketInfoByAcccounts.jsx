import { useEffect, useState, useRef } from "react";

export function useSocketInfoByAccounts(accountIds = []) {
  const [data, setData] = useState([]);
  const ws = useRef(null);
  const URL = "wss://socket.infoapi.biz/ws/get-user-by-accounts/";

  useEffect(() => {
    if (!accountIds || accountIds.length === 0) return;

    ws.current = new WebSocket(URL);

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          action: "subscribe",
          Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
          MT5Accounts: accountIds,
          db: "api",
        })
      );
    };

    ws.current.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);

        // console.log("socket res", res.data.users);
        if (Array.isArray(res.data.users)) {
          setData(res.data.users);
        }
      } catch (e) {
        console.error("Invalid data:", event.data);
      }
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    return () => {
      ws.current?.close();
    };
  }, [JSON.stringify(accountIds)]); // triggers on change in array content
  return data;
}
