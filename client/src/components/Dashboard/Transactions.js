import React, { useState } from "react";
import axios from "axios";

const Transactions = ({ expenses, setExpenses }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // Added categories with icons/emoji representation
  const expenseCategories = [
    { value: "housing", label: "Housing 🏠" },
    { value: "transportation", label: "Transportation 🚗" },
    { value: "food", label: "Food 🍽️" },
    { value: "utilities", label: "Utilities 💡" },
    { value: "insurance", label: "Insurance 🛡️" },
    { value: "healthcare", label: "Healthcare ⚕️" },
    { value: "entertainment", label: "Entertainment 🎭" },
    { value: "shopping", label: "Shopping 🛍️" },
    { value: "education", label: "Education 🎓" },
    { value: "travel", label: "Travel ✈️" },
    { value: "general", label: "General 📝" },
  ];

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingExpense(null);
    setDescription("");
    setAmount("");
    setCategory("general");
  };

  // Add new expense to the database and update the UI
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description || !amount) {
      alert("Please provide both description and amount.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const newExpense = {
        description,
        amount: parseFloat(amount),
        category: category || "general",
      };

      let response;

      if (editingExpense) {
        // Update existing expense
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/expenses/${editingExpense._id}`,
          newExpense,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update the expenses array
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense._id === editingExpense._id ? response.data : expense
          )
        );

        setEditingExpense(null); // Clear editing state
      } else {
        // Add new expense
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/expenses`,
          newExpense,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update state with new expense
        setExpenses((prevExpenses) => [...prevExpenses, response.data]);
      }

      // Reset form fields
      setDescription("");
      setAmount("");
      setCategory("general");
    } catch (error) {
      console.error(
        "Error with expense operation:",
        error.response?.data || error.message
      );
    }
  };

  // Handle editing an expense
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
    setCategory(expense.category || "general");

    // Scroll to the form
    document.querySelector(".add-expense-form").scrollIntoView({
      behavior: "smooth",
    });
  };

  // Handle deleting an expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/expenses/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update state
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== id)
      );
    } catch (error) {
      console.error(
        "Error deleting expense:",
        error.response?.data || error.message
      );
    }
  };

  // Sort expenses
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort expenses
  const getFilteredAndSortedExpenses = () => {
    let filteredExpenses = [...expenses];

    // Apply search filter if there's a search term
    if (searchTerm) {
      filteredExpenses = filteredExpenses.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort expenses
    if (sortConfig.key) {
      filteredExpenses.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredExpenses;
  };

  // Get emoji for category
  const getCategoryEmoji = (categoryName) => {
    const category = expenseCategories.find(
      (cat) => cat.value === categoryName
    );
    return category ? category.label.split(" ")[1] : "📝";
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredExpenses = getFilteredAndSortedExpenses();

  return (
    <div className="transactions-container fade-in">
      <section className="add-expense-section">
        <div className="add-expense-form card">
          <h2>{editingExpense ? "Edit Expense" : "Record a New Expense"}</h2>
          <form onSubmit={handleAddExpense}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Dinner at Restaurant"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-accent">
                {editingExpense ? "Update Expense" : "Add Expense"}
              </button>

              {editingExpense && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="expense-list-section">
        <h2>Expense List</h2>
        <div className="expense-list-controls">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="sort-controls">
            <button
              className={sortConfig.key === "date" ? "active" : ""}
              onClick={() => requestSort("date")}
            >
              Sort by Date{" "}
              {sortConfig.key === "date" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </button>
            <button
              className={sortConfig.key === "amount" ? "active" : ""}
              onClick={() => requestSort("amount")}
            >
              Sort by Amount{" "}
              {sortConfig.key === "amount" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </button>
            <button
              className={sortConfig.key === "category" ? "active" : ""}
              onClick={() => requestSort("category")}
            >
              Sort by Category{" "}
              {sortConfig.key === "category" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="no-expenses-message">
            <p>No expenses found.</p>
            <p>Add some expenses to get started!</p>
          </div>
        ) : (
          <div className="expense-list">
            {filteredExpenses.map((expense) => (
              <div key={expense._id} className="expense-item card">
                <div className="expense-details">
                  <div className="expense-category-icon">
                    {getCategoryEmoji(expense.category)}
                  </div>
                  <div className="expense-main-info">
                    <h3>{expense.description}</h3>
                    <p className="expense-category">{expense.category}</p>
                  </div>
                  <div className="expense-meta">
                    <p className="expense-amount">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <p className="expense-date">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="expense-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(expense._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Transactions;
