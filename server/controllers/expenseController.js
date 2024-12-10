const Expense = require('../models/Expense');

//add expense controller
exports.getExpenses = async (req, res) => {
    try{
        const expenses = await Expense.find({userId: req.user.id})
        res.json(expenses);
    }
    catch(error){
        res.status(500).json({message:'Server error'});
    }
};


// Add a new expense
exports.addExpense = async (req, res) => {
    const { description, amount } = req.body;
    try {
        const newExpense = new Expense({
            userId: req.user.id,
            description,
            amount,
        });
        await newExpense.save();
        res.json(newExpense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};