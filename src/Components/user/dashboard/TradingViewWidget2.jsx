// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';
// import './TradingViewWidget2.css';

function TradingViewWidget2() {
  const container = useRef();

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
      script.type = "text/javascript";
      script.async = true;
     script.innerHTML = `
{
  "colorTheme": "dark",
  "dateRange": "12M",
  "locale": "en",
  "largeChartUrl": "",
  "isTransparent": false,
  "showFloatingTooltip": false,
  "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
  "plotLineColorFalling": "rgba(41, 98, 255, 1)",
  "gridLineColor": "rgba(240, 243, 250, 0)",
  "scaleFontColor": "#DBDBDB",
  "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
  "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
  "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
  "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
  "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
  "tabs": [...],
  "support_host": "https://www.tradingview.com",
  "backgroundColor": "#0f0f0f",
  "showSymbolLogo": true,
  "showChart": true,
  "height": 600
}`;

      container.current.appendChild(script);
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      {/* <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Market data by TradingView</span></a></div> */}
    </div>
  );
}

export default memo(TradingViewWidget2);
