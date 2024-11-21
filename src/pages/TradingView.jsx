import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";

const TradingViewDashboard = () => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [timeframe, setTimeframe] = useState("24h");
  const [loading, setLoading] = useState(true);
  const container = useRef(null);
  let widget = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = initWidget;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (widget.current) {
        try {
          widget.current.remove();
          widget.current = null;
        } catch (error) {
          console.error("Error removing widget:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (widget.current) {
      updateTimeframe();
    }
  }, [timeframe]);

  const fetchPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      setCurrentPrice(data.solana.usd);
      setPriceChange(data.solana.usd_24h_change);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching price:", error);
      setLoading(false);
    }
  };

  const initWidget = () => {
    if (typeof TradingView !== "undefined" && container.current) {
      widget.current = new TradingView.widget({
        container_id: "tradingview_chart",
        symbol: "BINANCE:SOLUSD",
        interval: getIntervalFromTimeframe(),
        theme: "light",
        style: "1",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false,
        save_image: false,
        height: "100%",
        width: "100%",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: "en",
        toolbar_bg: "#f1f3f6",
        hide_side_toolbar: false,
        studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
      });
    }
  };

  const getIntervalFromTimeframe = () => {
    switch (timeframe) {
      case "24h":
        return "15";
      case "7d":
        return "60";
      case "30d":
        return "240";
      default:
        return "15";
    }
  };

  const updateTimeframe = () => {
    if (widget.current && widget.current.chart && widget.current.chart()) {
      widget.current.chart().setResolution(getIntervalFromTimeframe());
    }
  };

  const timeframeButtons = [
    { label: "24H", value: "24h" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Clock className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Solana (SOL)</h1>
              <div className="flex items-center mt-2">
                <span className="text-3xl font-bold">
                  ${currentPrice?.toFixed(2)}
                </span>
                <span
                  className={`ml-2 flex items-center ${
                    priceChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {priceChange >= 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {Math.abs(priceChange)?.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              {timeframeButtons.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setTimeframe(value)}
                  className={`px-4 py-2 rounded-lg ${
                    timeframe === value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[calc(100vh-300px)]" ref={container}>
            <div
              id="tradingview_chart"
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewDashboard;
