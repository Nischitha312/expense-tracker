const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

// GET /api/expenses — with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(filter),
    ]);
    res.json({ expenses, total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/summary
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const y = parseInt(year || now.getFullYear());
    const m = parseInt(month || now.getMonth() + 1);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const [summary, byCategory] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const income = summary.find(s => s._id === 'income')?.total || 0;
    const expenses = summary.find(s => s._id === 'expense')?.total || 0;
    res.json({ income, expenses, balance: income - expenses, byCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;
    if (!title || !amount || !type) return res.status(400).json({ message: 'Title, amount and type are required' });
    const expense = await Expense.create({ user: req.user._id, title, amount, type, category, date, note });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    Object.assign(expense, req.body);
    const updated = await expense.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
