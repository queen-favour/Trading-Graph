import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";

const CryptoDashboard = () => {
  const [priceData, setPriceData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [timeframe, setTimeframe] = useState("24h");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${
          timeframe === "24h" ? 1 : timeframe === "7d" ? 7 : 30
        }`
      );
      const data = await response.json();

      const formattedData = data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp).toLocaleString(),
        price: price.toFixed(2),
      }));

      setPriceData(formattedData);
      setCurrentPrice(formattedData[formattedData.length - 1].price);

      const startPrice = formattedData[0].price;
      const endPrice = formattedData[formattedData.length - 1].price;
      const change = ((endPrice - startPrice) / startPrice) * 100;
      setPriceChange(change);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [timeframe]);

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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Solana (SOL)</h1>
              <div className="flex items-center mt-2">
                <span className="text-3xl font-bold">${currentPrice}</span>
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
                  {Math.abs(priceChange).toFixed(2)}%
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

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return timeframe === "24h"
                      ? date.toLocaleTimeString()
                      : date.toLocaleDateString();
                  }}
                />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
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
        </div>
      </div>
    </div>
  );
};

export default CryptoDashboard;
