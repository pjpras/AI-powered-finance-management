// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Overview from "./Overview";
import Transactions from "./Transactions";
import Insights from "./Insights";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("month");
  const location = useLocation();

  useEffect(() => {
    // Fetch expenses data from backend API
    const fetchExpenses = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5000/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data);
      } catch (error) {
        console.error(
          "Error fetching expenses:",
          error.response?.data || error.message
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <div className="time-filter">
          <button
            className={timeFrame === "week" ? "active" : ""}
            onClick={() => setTimeFrame("week")}
          >
            Week
          </button>
          <button
            className={timeFrame === "month" ? "active" : ""}
            onClick={() => setTimeFrame("month")}
          >
            Month
          </button>
          <button
            className={timeFrame === "year" ? "active" : ""}
            onClick={() => setTimeFrame("year")}
          >
            Year
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <Link
          to="/dashboard/overview"
          className={
            location.pathname.includes("/overview") ? "active-tab" : ""
          }
        >
          Overview
        </Link>
        <Link
          to="/dashboard/transactions"
          className={
            location.pathname.includes("/transactions") ? "active-tab" : ""
          }
        >
          Transactions
        </Link>
        <Link
          to="/dashboard/insights"
          className={
            location.pathname.includes("/insights") ? "active-tab" : ""
          }
        >
          AI Insights
        </Link>
      </div>

      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading your financial data...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/overview" />} />
            <Route
              path="overview"
              element={<Overview expenses={expenses} timeFrame={timeFrame} />}
            />
            <Route
              path="transactions"
              element={
                <Transactions expenses={expenses} setExpenses={setExpenses} />
              }
            />
            <Route path="insights" element={<Insights expenses={expenses} />} />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
