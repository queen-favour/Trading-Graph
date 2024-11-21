import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  TrendingUp,
  BarChart2,
} from "lucide-react";

const CoinPage = () => {
  const { id } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [timeframe, setTimeframe] = useState("24h");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoinData();
    fetchPriceData();
    const interval = setInterval(() => {
      fetchCoinData();
      fetchPriceData();
    }, 60000);
    return () => clearInterval(interval);
  }, [id, timeframe]);

  const fetchCoinData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
      );
      const data = await response.json();
      setCoinData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coin data:", error);
      setLoading(false);
    }
  };

  const fetchPriceData = async () => {
    try {
      const days = timeframe === "24h" ? 1 : timeframe === "7d" ? 7 : 30;
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
      );
      const data = await response.json();
      const formattedData = data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp).toLocaleString(),
        price: price.toFixed(2),
      }));
      setPriceData(formattedData);
    } catch (error) {
      console.error("Error fetching price data:", error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  if (loading || !coinData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const marketData = [
    {
      title: "Market Cap",
      value: formatNumber(coinData.market_data.market_cap.usd),
      icon: <DollarSign className="w-5 h-5 text-blue-500" />,
      change: coinData.market_data.market_cap_change_percentage_24h,
    },
    {
      title: "24h Volume",
      value: formatNumber(coinData.market_data.total_volume.usd),
      icon: <BarChart2 className="w-5 h-5 text-green-500" />,
      change: coinData.market_data.volume_change_24h,
    },
    {
      title: "Circulating Supply",
      value: Math.round(
        coinData.market_data.circulating_supply
      ).toLocaleString(),
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      symbol: coinData.symbol.toUpperCase(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img
              src={coinData.image.large}
              alt={coinData.name}
              className="w-16 h-16 mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {coinData.name}
                <span className="text-gray-500 ml-2 text-lg">
                  {coinData.symbol.toUpperCase()}
                </span>
              </h1>
              <div className="flex items-center mt-2">
                <span className="text-4xl font-bold">
                  ${coinData.market_data.current_price.usd.toLocaleString()}
                </span>
                <span
                  className={`ml-3 flex items-center ${
                    coinData.market_data.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {coinData.market_data.price_change_percentage_24h >= 0 ? (
                    <ArrowUp className="w-5 h-5 mr-1" />
                  ) : (
                    <ArrowDown className="w-5 h-5 mr-1" />
                  )}
                  {Math.abs(
                    coinData.market_data.price_change_percentage_24h
                  ).toFixed(2)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {["24h", "7d", "30d"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeframe === tf
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-96 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timeframe === "24h"
                    ? date.toLocaleTimeString()
                    : date.toLocaleDateString();
                }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #ddd" }}
                formatter={(value) => [`$${value}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketData.map((stat, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-2">
                {stat.icon}
                <h3 className="text-gray-500 ml-2">{stat.title}</h3>
              </div>
              <p className="text-2xl font-bold">
                {stat.value}
                {stat.symbol && (
                  <span className="text-gray-500 text-lg ml-1">
                    {stat.symbol}
                  </span>
                )}
              </p>
              {stat.change && (
                <p
                  className={`flex items-center mt-1 ${
                    stat.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.change >= 0 ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(stat.change).toFixed(2)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoinPage;
