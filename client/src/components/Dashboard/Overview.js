import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Overview = ({ expenses, timeFrame }) => {
  const [chartData, setChartData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    average: 0,
    highest: 0,
    highestCategory: "",
  });

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      generateChartData(expenses, timeFrame);
      generateCategoryData(expenses);
      calculateSummaryStats(expenses);
    }
  }, [expenses, timeFrame]);

  // Generate time series chart data
  const generateChartData = (expenses, period) => {
    let filteredExpenses = [...expenses];
    const now = new Date();

    if (period === "month") {
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      filteredExpenses = expenses.filter(
        (expense) => new Date(expense.date) >= lastMonth
      );
    } else if (period === "week") {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filteredExpenses = expenses.filter(
        (expense) => new Date(expense.date) >= lastWeek
      );
    } else if (period === "year") {
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      filteredExpenses = expenses.filter(
        (expense) => new Date(expense.date) >= lastYear
      );
    }

    // Group by date
    const expensesByDate = filteredExpenses.reduce((acc, expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += expense.amount;
      return acc;
    }, {});

    // Sort dates chronologically
    const sortedDates = Object.keys(expensesByDate).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // Get data in sorted order
    const sortedData = sortedDates.map((date) => expensesByDate[date]);

    setChartData({
      labels: sortedDates,
      datasets: [
        {
          label: "Expenses Over Time",
          data: sortedData,
          fill: false,
          backgroundColor: "rgba(74, 111, 165, 0.2)",
          borderColor: "rgba(74, 111, 165, 1)",
          tension: 0.3,
        },
      ],
    });
  };

  // Generate category distribution data
  const generateCategoryData = (expenses) => {
    const categories = {};

    expenses.forEach((expense) => {
      const category = expense.category || "general";
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += expense.amount;
    });

    const categoryLabels = Object.keys(categories);
    const categoryAmounts = Object.values(categories);
    const backgroundColors = [
      "#1f3a5f", // Deep blue
      "#4a6fa5", // Medium blue
      "#c8b273", // Gold
      "#e9deb0", // Light gold
      "#2e7d32", // Forest green
      "#e6a23c", // Amber
      "#c53030", // Deep red
      "#6c757d", // Medium gray
      "#4b6584", // Slate blue
      "#778ca3", // Bluish gray
      "#b2bec3", // Light gray
    ];

    setCategoryData({
      labels: categoryLabels,
      datasets: [
        {
          data: categoryAmounts,
          backgroundColor: backgroundColors.slice(0, categoryLabels.length),
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 2,
        },
      ],
    });
  };

  // Calculate summary statistics
  const calculateSummaryStats = (expenses) => {
    // Skip if no expenses
    if (!expenses.length) {
      setSummaryStats({
        total: 0,
        average: 0,
        highest: 0,
        highestCategory: "",
      });
      return;
    }

    // Calculate total amount
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate average per expense
    const average = total / expenses.length;

    // Find highest expense amount and category
    const highest = Math.max(...expenses.map((expense) => expense.amount));

    // Calculate category totals
    const categories = {};
    expenses.forEach((expense) => {
      const category = expense.category || "general";
      categories[category] = (categories[category] || 0) + expense.amount;
    });

    // Find category with highest total
    const highestCategory = Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    setSummaryStats({
      total: total.toFixed(2),
      average: average.toFixed(2),
      highest: highest.toFixed(2),
      highestCategory,
    });
  };

  return (
    <div className="overview-container fade-in">
      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-value">${summaryStats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Average Expense</h3>
          <p className="stat-value">${summaryStats.average}</p>
        </div>
        <div className="stat-card">
          <h3>Highest Expense</h3>
          <p className="stat-value">${summaryStats.highest}</p>
        </div>
        <div className="stat-card">
          <h3>Top Category</h3>
          <p className="stat-value">{summaryStats.highestCategory}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Expense Timeline</h2>
          {chartData && chartData.labels.length > 0 ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `$${context.parsed.y.toFixed(2)}`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return "$" + value;
                      },
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="no-data-message">
              <p>No expense data available for the selected time period.</p>
              <p>Add some expenses to see your spending over time.</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h2>Category Breakdown</h2>
          {categoryData && categoryData.labels.length > 0 ? (
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "right" },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: $${value.toFixed(
                          2
                        )} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="no-data-message">
              <p>No category data available.</p>
              <p>Add expenses with categories to see the breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
