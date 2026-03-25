// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from "react";

function UserForexNews() {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "width": "100%",
        "height": "100%",
        "symbol": "FX_IDC:EURUSD",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "withdateranges": true,
        "allow_symbol_change": true,
        "save_image": false,
        "watchlist": [
          "FX_IDC:EURUSD",
          "FX_IDC:GBPUSD",
          "FX_IDC:USDJPY",
          "FX_IDC:USDCHF",
          "FX_IDC:AUDUSD",
          "FX_IDC:USDCAD"
        ],
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "calc(100% - 32px)", width: "100%" }}
      ></div>
    </div>
  );
}

export default memo(UserForexNews);
