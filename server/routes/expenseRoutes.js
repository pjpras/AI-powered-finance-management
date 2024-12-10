// server/routes/expenseRoutes.js
const express = require('express');
const { getExpenses, addExpense } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all expenses
router.get('/', authMiddleware, getExpenses);

// Add a new expense
router.post('/', authMiddleware, addExpense);

module.exports = router;
