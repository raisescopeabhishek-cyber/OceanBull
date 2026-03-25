import { useEffect, useState, useRef } from "react";

export function useSocketOpenTradesByAccounts(accountIds = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const URL = "wss://socket.infoapi.biz/ws/get-open-trades-by-accounts/";

  useEffect(() => {
    if (!accountIds || accountIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    ws.current = new WebSocket(URL);

    ws.current.onopen = () => {
      try {
        ws.current.send(
          JSON.stringify({
            action: "subscribe",
            Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
            MT5Accounts: accountIds,
            db: "api",
          })
        );
      } catch (err) {
        setError("Unable to send subscription. Please try again.");
        setLoading(false);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);
        if (Array.isArray(res.openTrades)) {
          setData(res.openTrades);
          setError(null);
          if (res.openTrades.length === 0) {
            setError("Looks like you have no open trades at the moment.");
          }
        } else {
          setError("Received unexpected data. Please refresh.");
        }
      } catch (err) {
        setError("Could not read server response. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    ws.current.onerror = () => {
      console.error("WebSocket error");
      setError(
        "Could not connect to server. Check your internet or try later."
      );
      setLoading(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [JSON.stringify(accountIds)]);

  return { data, loading, error };
}
