import React, { useState, useEffect } from "react";

const Insights = ({ expenses }) => {
  const [aiInsights, setAiInsights] = useState({
    spending: null,
    saving: null,
    trends: null,
    forecast: null,
    isLoading: true,
  });

  // Add a state for custom user goals
  const [userGoals, setUserGoals] = useState({
    savingsGoal: localStorage.getItem("savingsGoal") || 0,
    targetBudget: localStorage.getItem("targetBudget") || 0,
    isEditing: false,
  });

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      generateAiInsights(expenses);
    } else {
      setAiInsights({
        spending: null,
        saving: null,
        trends: null,
        forecast: null,
        isLoading: false,
      });
    }
  }, [expenses]);

  // Save user goals to localStorage
  const saveUserGoals = () => {
    localStorage.setItem("savingsGoal", userGoals.savingsGoal);
    localStorage.setItem("targetBudget", userGoals.targetBudget);
    setUserGoals({ ...userGoals, isEditing: false });
  };

  // Generate AI insights based on expense data with enhanced analytics
  const generateAiInsights = async (expenses) => {
    setAiInsights((prev) => ({ ...prev, isLoading: true }));

    try {
      // Calculate total spending
      const totalSpent = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      // Calculate average daily spend
      const uniqueDates = new Set(
        expenses.map((e) => new Date(e.date).toDateString())
      );
      const avgDailySpend = totalSpent / (uniqueDates.size || 1);

      // Enhanced category analysis
      const categories = {};
      const categoryMonthTrends = {};

      expenses.forEach((expense) => {
        const category = expense.category || "general";
        const expenseDate = new Date(expense.date);
        const monthYear = `${expenseDate.getMonth()}-${expenseDate.getFullYear()}`;

        // Track total by category
        if (!categories[category]) categories[category] = 0;
        categories[category] += expense.amount;

        // Track monthly trends by category
        if (!categoryMonthTrends[category]) {
          categoryMonthTrends[category] = {};
        }
        if (!categoryMonthTrends[category][monthYear]) {
          categoryMonthTrends[category][monthYear] = 0;
        }
        categoryMonthTrends[category][monthYear] += expense.amount;
      });

      // Find categories with growing expenses
      const growingCategories = [];
      Object.keys(categoryMonthTrends).forEach((category) => {
        const months = Object.keys(categoryMonthTrends[category]).sort();
        if (months.length >= 2) {
          const lastMonth = months[months.length - 1];
          const secondLastMonth = months[months.length - 2];
          if (
            categoryMonthTrends[category][lastMonth] >
            categoryMonthTrends[category][secondLastMonth]
          ) {
            const growthRate =
              ((categoryMonthTrends[category][lastMonth] -
                categoryMonthTrends[category][secondLastMonth]) /
                categoryMonthTrends[category][secondLastMonth]) *
              100;

            growingCategories.push({
              category,
              growthRate: growthRate.toFixed(1),
            });
          }
        }
      });

      // Sort categories by expense amount
      const sortedCategories = Object.entries(categories).sort(
        (a, b) => b[1] - a[1]
      );
      const highestCategory = sortedCategories[0];

      // Calculate percentage of top three categories
      const topThreeCategories = sortedCategories.slice(0, 3);
      const topThreeTotal = topThreeCategories.reduce(
        (sum, cat) => sum + cat[1],
        0
      );
      const topThreePercentage = ((topThreeTotal / totalSpent) * 100).toFixed(
        1
      );

      // Daily spending patterns
      const expensesByDay = {};
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        const dayOfWeek = date.toLocaleString("en-US", { weekday: "long" });

        if (!expensesByDay[dayOfWeek]) expensesByDay[dayOfWeek] = 0;
        expensesByDay[dayOfWeek] += expense.amount;
      });

      // Find day with highest spending
      const sortedDays = Object.entries(expensesByDay).sort(
        (a, b) => b[1] - a[1]
      );
      const highestSpendingDay = sortedDays[0];

      // Find recurring expenses (items with similar amounts)
      const potentialRecurring = {};

      expenses.forEach((expense) => {
        const roundedAmount = Math.round(expense.amount);
        if (!potentialRecurring[roundedAmount]) {
          potentialRecurring[roundedAmount] = [];
        }
        potentialRecurring[roundedAmount].push(expense);
      });

      const recurringExpenses = Object.values(potentialRecurring)
        .filter((expArr) => expArr.length >= 2)
        .map((expArr) => ({
          amount: expArr[0].amount,
          description: expArr[0].description,
          category: expArr[0].category,
          occurrences: expArr.length,
        }))
        .sort((a, b) => b.occurrences - a.occurrences);

      // Income vs expense detection (if possible)
      // For the demo, we'll assume any positive inflow might be income
      // In a real app, this would come from income data or large deposits
      const estimatedMonthlyIncome = totalSpent * 1.3; // Assumption for demo purposes
      const spendingToIncomeRatio = (
        (totalSpent / estimatedMonthlyIncome) *
        100
      ).toFixed(1);

      // Calculate debt ratios and savings potential
      const currentSavingsRate = Math.max(
        (estimatedMonthlyIncome - totalSpent) / estimatedMonthlyIncome,
        0
      );

      // Calculate savings recommendations based on 50/30/20 rule
      // 50% needs, 30% wants, 20% savings
      const needsAllocation = estimatedMonthlyIncome * 0.5;
      const wantsAllocation = estimatedMonthlyIncome * 0.3;
      const savingsAllocation = estimatedMonthlyIncome * 0.2;

      // Calculate time to financial goal
      const emergencyFundTarget = avgDailySpend * 90; // 3 months of expenses
      const monthsToEmergencyFund = emergencyFundTarget / savingsAllocation;

      // Generate more personalized insights
      setTimeout(() => {
        setAiInsights({
          spending: {
            total: totalSpent.toFixed(2),
            insight: `You've spent $${totalSpent.toFixed(2)} ${
              uniqueDates.size > 0 ? `over ${uniqueDates.size} days` : ""
            }, averaging $${avgDailySpend.toFixed(2)} daily.`,
            advice: `Your ${
              highestCategory ? highestCategory[0] : "general"
            } spending accounts for ${
              highestCategory
                ? ((highestCategory[1] / totalSpent) * 100).toFixed(1)
                : 0
            }% of your total. ${
              highestCategory && highestCategory[1] / totalSpent > 0.4
                ? "This category is significantly higher than others and may present an opportunity to reduce expenses."
                : "Your spending appears relatively balanced across categories."
            }`,
            detailedAnalysis: `Your top 3 spending categories represent ${topThreePercentage}% of your expenses. ${
              growingCategories.length > 0
                ? `Note that ${growingCategories[0].category} expenses are increasing (up ${growingCategories[0].growthRate}% from last month).`
                : "No categories show significant month-over-month growth."
            }${
              recurringExpenses.length > 0
                ? ` You have ${
                    recurringExpenses.length
                  } potential recurring expenses, with the highest being $${recurringExpenses[0].amount.toFixed(
                    2
                  )} for ${recurringExpenses[0].description}.`
                : ""
            }`,
          },
          saving: {
            potential: savingsAllocation.toFixed(2),
            insight: `Based on the 50/30/20 rule, you should aim to save $${savingsAllocation.toFixed(
              2
            )} monthly (20% of estimated income).`,
            advice: `${
              currentSavingsRate < 0.1
                ? "Your current savings rate appears low. Consider setting up automatic transfers to a high-yield savings account immediately after receiving income."
                : `You're currently saving approximately ${(
                    currentSavingsRate * 100
                  ).toFixed(1)}% of your income, which is ${
                    currentSavingsRate >= 0.2
                      ? "excellent!"
                      : "a good start but could be improved."
                  }`
            }`,
            detailedAnalysis: `If you reduce spending in your highest category (${
              highestCategory ? highestCategory[0] : "general"
            }) by 15%, you could save an additional $${
              highestCategory ? (highestCategory[1] * 0.15).toFixed(2) : "0"
            } monthly ($${
              highestCategory
                ? (highestCategory[1] * 0.15 * 12).toFixed(2)
                : "0"
            } annually). At your current rate, it would take approximately ${monthsToEmergencyFund.toFixed(
              1
            )} months to build a 3-month emergency fund of $${emergencyFundTarget.toFixed(
              2
            )}.`,
          },
          trends: {
            insight: `Your spending pattern shows the highest expenses on ${
              highestSpendingDay ? highestSpendingDay[0] + "s" : "weekdays"
            } (${
              highestSpendingDay ? `$${highestSpendingDay[1].toFixed(2)}` : "$0"
            }).`,
            advice: `${
              spendingToIncomeRatio > 90
                ? "Your spending is very close to your estimated income. This leaves little room for savings and emergencies."
                : `You're spending approximately ${spendingToIncomeRatio}% of your estimated income, which ${
                    parseInt(spendingToIncomeRatio) < 80
                      ? "provides a good buffer for savings"
                      : "is approaching the upper limit of what financial experts recommend"
                  }.`
            }`,
            detailedAnalysis: `${
              sortedDays.length > 0
                ? `Your spending is ${
                    sortedDays.length > 1 &&
                    sortedDays[0][1] > sortedDays[1][1] * 1.5
                      ? "significantly"
                      : "somewhat"
                  } higher on ${
                    sortedDays[0][0]
                  }s compared to other days. Planning meals and activities in advance for these high-spending days could help reduce impulse purchases.`
                : "Your spending appears fairly consistent throughout the week."
            }${
              recurringExpenses.length > 0
                ? ` You may have subscription services or recurring bills totaling approximately $${recurringExpenses
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toFixed(
                      2
                    )} monthly. Review these for services you no longer use.`
                : ""
            }`,
          },
          forecast: {
            monthlyProjection: needsAllocation.toFixed(2),
            savingTarget: savingsAllocation.toFixed(2),
            insight: `Following the 50/30/20 rule, allocate $${needsAllocation.toFixed(
              2
            )} to needs, $${wantsAllocation.toFixed(
              2
            )} to wants, and $${savingsAllocation.toFixed(2)} to savings.`,
            advice: `Based on your spending patterns, focus on reducing expenses in the ${
              highestCategory ? highestCategory[0] : "general"
            } category, which would have the largest impact on your finances.`,
            detailedAnalysis: `If you maintain a ${savingsAllocation.toFixed(
              2
            )} monthly savings rate, you'll accumulate $${(
              savingsAllocation * 12
            ).toFixed(2)} in one year. This would cover ${(
              (savingsAllocation * 12) /
              avgDailySpend
            ).toFixed(0)} days of your current expenses, ${
              (savingsAllocation * 12) / avgDailySpend >= 90
                ? "meeting the recommended 3-month emergency fund."
                : "making progress toward a 3-month emergency fund."
            }`,
          },
          isLoading: false,
        });
      }, 1000);
    } catch (error) {
      console.error("Error generating insights:", error);
      setAiInsights({
        spending: null,
        saving: null,
        trends: null,
        forecast: null,
        isLoading: false,
        error: "Failed to generate insights. Please try again later.",
      });
    }
  };

  return (
    <div className="insights-container fade-in">
      <section className="insights-intro">
        <h2>Financial Intelligence Center</h2>
        <p className="insights-description">
          Our AI analyzes your spending patterns to provide personalized
          financial insights and recommendations.
        </p>

        {/* User goals component */}
        <div className="user-goals-card">
          <h3>Your Financial Goals</h3>
          {userGoals.isEditing ? (
            <div className="goals-edit-form">
              <div className="form-group">
                <label>Monthly Savings Target</label>
                <input
                  type="number"
                  value={userGoals.savingsGoal}
                  onChange={(e) =>
                    setUserGoals({ ...userGoals, savingsGoal: e.target.value })
                  }
                  placeholder="Monthly savings goal"
                />
              </div>
              <div className="form-group">
                <label>Monthly Budget Limit</label>
                <input
                  type="number"
                  value={userGoals.targetBudget}
                  onChange={(e) =>
                    setUserGoals({ ...userGoals, targetBudget: e.target.value })
                  }
                  placeholder="Monthly budget target"
                />
              </div>
              <div className="form-actions">
                <button className="btn-accent" onClick={saveUserGoals}>
                  Save Goals
                </button>
                <button
                  onClick={() =>
                    setUserGoals({ ...userGoals, isEditing: false })
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="goals-display">
              <p>
                Monthly Savings Target:{" "}
                <span className="accent">
                  ${parseFloat(userGoals.savingsGoal || 0).toFixed(2)}
                </span>
              </p>
              <p>
                Monthly Budget Limit:{" "}
                <span className="accent">
                  ${parseFloat(userGoals.targetBudget || 0).toFixed(2)}
                </span>
              </p>
              <button
                onClick={() => setUserGoals({ ...userGoals, isEditing: true })}
              >
                Set Goals
              </button>
            </div>
          )}
        </div>
      </section>

      {aiInsights.isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Analyzing your financial patterns...</p>
        </div>
      ) : !expenses.length ? (
        <div className="no-data-message">
          <h3>No expense data available</h3>
          <p>Add some transactions to receive AI-powered financial insights.</p>
        </div>
      ) : (
        <div className="insights-grid">
          <div className="insight-card">
            <h3>Spending Analysis</h3>
            <div className="insight-highlight">
              Total Spent:{" "}
              <span className="accent">${aiInsights.spending?.total}</span>
            </div>
            <p>{aiInsights.spending?.insight}</p>
            <div className="insight-detail">
              <h4>Detailed Analysis</h4>
              <p>{aiInsights.spending?.detailedAnalysis}</p>
            </div>
            <p className="advice">
              <span>Advice:</span> {aiInsights.spending?.advice}
            </p>
          </div>

          <div className="insight-card">
            <h3>Saving Opportunities</h3>
            <div className="insight-highlight">
              Recommended Monthly Savings:{" "}
              <span className="accent">${aiInsights.saving?.potential}</span>
            </div>
            <p>{aiInsights.saving?.insight}</p>
            <div className="insight-detail">
              <h4>Detailed Analysis</h4>
              <p>{aiInsights.saving?.detailedAnalysis}</p>
            </div>
            <p className="advice">
              <span>Advice:</span> {aiInsights.saving?.advice}
            </p>
          </div>

          <div className="insight-card">
            <h3>Spending Trends</h3>
            <p>{aiInsights.trends?.insight}</p>
            <div className="insight-detail">
              <h4>Detailed Analysis</h4>
              <p>{aiInsights.trends?.detailedAnalysis}</p>
            </div>
            <p className="advice">
              <span>Advice:</span> {aiInsights.trends?.advice}
            </p>
          </div>

          <div className="insight-card">
            <h3>Financial Forecast</h3>
            <div className="insight-highlight">
              Needs Budget (50%):{" "}
              <span className="accent">
                ${aiInsights.forecast?.monthlyProjection}
              </span>
            </div>
            <div className="insight-highlight">
              Recommended Savings (20%):{" "}
              <span className="accent">
                ${aiInsights.forecast?.savingTarget}
              </span>
            </div>
            <p>{aiInsights.forecast?.insight}</p>
            <div className="insight-detail">
              <h4>Detailed Analysis</h4>
              <p>{aiInsights.forecast?.detailedAnalysis}</p>
            </div>
            <p className="advice">
              <span>Advice:</span> {aiInsights.forecast?.advice}
            </p>
          </div>
        </div>
      )}

      {/* Add a new financial tips section */}
      {!aiInsights.isLoading && expenses.length > 0 && (
        <section className="financial-tips-section">
          <h2>Personalized Financial Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Debt Management</h4>
              <p>
                If you have high-interest debt, prioritize paying it off before
                increasing your savings rate. The interest saved will typically
                exceed what you could earn through investments.
              </p>
            </div>
            <div className="tip-card">
              <h4>Automated Savings</h4>
              <p>
                Set up automatic transfers to your savings account on payday.
                Treat savings as a non-negotiable expense to ensure consistent
                progress toward your financial goals.
              </p>
            </div>
            <div className="tip-card">
              <h4>Emergency Fund</h4>
              <p>
                Aim to build an emergency fund covering 3-6 months of essential
                expenses. Keep this money in a high-yield savings account that's
                easily accessible but separate from your checking account.
              </p>
            </div>
            <div className="tip-card">
              <h4>Retirement Planning</h4>
              <p>
                Take advantage of employer 401(k) matching if available.
                Consider contributing at least enough to get the full employer
                match, as this is essentially free money for your retirement.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Insights;
