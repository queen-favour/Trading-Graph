import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CoinPage from "./pages/CoinPage";
import CryptoDashboard from "./pages/CryptoDashboard";
import TradingViewDashboard from "./pages/TradingView";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/coin/:id" element={<CoinPage />} />
          <Route path="/dashboard" element={<CryptoDashboard />} />
          <Route path="/trading-view" element={<TradingViewDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
