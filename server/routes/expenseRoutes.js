// server/routes/expenseRoutes.js
const express = require("express");
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Get all expenses
router.get("/", authMiddleware, getExpenses);

// Add a new expense
router.post("/", authMiddleware, addExpense);

// Update an expense
router.put("/:id", authMiddleware, updateExpense);

// Delete an expense
router.delete("/:id", authMiddleware, deleteExpense);

module.exports = router;
