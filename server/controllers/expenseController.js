const Expense = require('../models/Expense');

// Get all expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve expenses', error: error.message });
    }
};

// Add a new expense
exports.addExpense = async (req, res) => {
    const { description, amount, category, date } = req.body;

    // Input validation
    if (!description || !amount || typeof parseFloat(amount) !== 'number' || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const newExpense = new Expense({
            userId: req.user.id,
            description,
            amount: parseFloat(amount),
            category: category || 'general',
            date: date || Date.now(),
        });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add expense', error: error.message });
    }
};

// Update an expense
exports.updateExpense = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;
        
        // Find expense and check ownership
        const expense = await Expense.findById(req.params.id);
        
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to update this expense' });
        }
        
        // Update the expense
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { 
                description, 
                amount: parseFloat(amount), 
                category: category || 'general',
                date: date || expense.date 
            },
            { new: true }
        );
        
        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update expense', error: error.message });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        // Find expense and check ownership
        const expense = await Expense.findById(req.params.id);
        
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this expense' });
        }
        
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete expense', error: error.message });
    }
};
